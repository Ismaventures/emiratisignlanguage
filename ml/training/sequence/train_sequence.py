# Sequence Recognition Training Script
# Combines individual gesture predictions into meaningful sentences

import os
import json
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
import argparse
from pathlib import Path


# ─── Configuration ──────────────────────────────────────────

class Config:
    # Data
    data_path = "../datasets/processed/sequences.json"
    val_split = 0.15
    test_split = 0.15
    
    # Model
    max_seq_len = 50
    vocab_size = 1000  # gesture vocabulary
    d_model = 256
    nhead = 8
    num_layers = 4
    dim_feedforward = 512
    dropout = 0.1
    
    # Training
    batch_size = 16
    epochs = 50
    learning_rate = 0.0005
    weight_decay = 1e-4
    
    # Output
    output_dir = "../exports/sequence_recognizer"
    model_name = "sequence_recognizer_v1"


# ─── Dataset ────────────────────────────────────────────────

class SequenceDataset(Dataset):
    """Dataset for sequence recognition."""
    
    def __init__(self, sequences: np.ndarray, labels: np.ndarray):
        self.sequences = torch.LongTensor(sequences)
        self.labels = torch.LongTensor(labels)
        
    def __len__(self):
        return len(self.labels)
    
    def __getitem__(self, idx):
        return self.sequences[idx], self.labels[idx]


# ─── Model ──────────────────────────────────────────────────

class SequenceRecognizer(nn.Module):
    """
    LSTM-based sequence model for combining gestures into sentences.
    
    Input: sequence of gesture IDs
    Output: sentence embedding / translated text
    """
    
    def __init__(self, config: Config):
        super().__init__()
        
        self.embedding = nn.Embedding(config.vocab_size, config.d_model, padding_idx=0)
        self.pos_encoder = nn.Parameter(torch.randn(1, config.max_seq_len, config.d_model) * 0.1)
        
        self.lstm = nn.LSTM(
            input_size=config.d_model,
            hidden_size=config.d_model,
            num_layers=config.num_layers,
            dropout=config.dropout,
            batch_first=True,
            bidirectional=True,
        )
        
        self.attention = nn.MultiheadAttention(
            embed_dim=config.d_model * 2,
            num_heads=config.nhead,
            dropout=config.dropout,
            batch_first=True,
        )
        
        self.output_proj = nn.Sequential(
            nn.Linear(config.d_model * 2, config.d_model),
            nn.ReLU(),
            nn.Dropout(config.dropout),
            nn.Linear(config.d_model, config.d_model // 2),
        )
        
    def forward(self, x):
        # x: (batch, seq_len)
        mask = (x == 0)
        
        x = self.embedding(x) + self.pos_encoder[:, :x.size(1), :]
        
        lstm_out, (hidden, cell) = self.lstm(x)
        
        # Concatenate bidirectional states
        hidden = torch.cat([hidden[-2], hidden[-1]], dim=1)
        
        return self.output_proj(hidden)


# ─── Training ───────────────────────────────────────────────

class Trainer:
    """Training loop for sequence recognition."""
    
    def __init__(self, config: Config):
        self.config = config
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self.device}")
        
    def load_data(self):
        """Load sequence data."""
        with open(self.config.data_path, "r") as f:
            data = json.load(f)
        
        sequences = np.array(data["sequences"], dtype=np.int64)
        labels = np.array(data["labels"], dtype=np.int64)
        
        # Pad sequences
        sequences = sequences[:, :self.config.max_seq_len]
        if sequences.shape[1] < self.config.max_seq_len:
            pad_width = self.config.max_seq_len - sequences.shape[1]
            sequences = np.pad(sequences, ((0, 0), (0, pad_width)), mode="constant")
        
        # Split
        X_temp, X_test, y_temp, y_test = train_test_split(
            sequences, labels,
            test_size=self.config.test_split,
            random_state=42,
        )
        
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp,
            test_size=self.config.val_split / (1 - self.config.test_split),
            random_state=42,
        )
        
        print(f"Training: {len(X_train)}, Validation: {len(X_val)}, Test: {len(X_test)}")
        
        return (
            SequenceDataset(X_train, y_train),
            SequenceDataset(X_val, y_val),
            SequenceDataset(X_test, y_test),
        )
        
    def train(self):
        """Run training."""
        train_dataset, val_dataset, test_dataset = self.load_data()
        
        train_loader = DataLoader(train_dataset, batch_size=self.config.batch_size, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=self.config.batch_size, shuffle=False)
        
        model = SequenceRecognizer(self.config).to(self.device)
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.AdamW(
            model.parameters(),
            lr=self.config.learning_rate,
            weight_decay=self.config.weight_decay,
        )
        scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=self.config.epochs)
        
        best_val_loss = float("inf")
        
        for epoch in range(self.config.epochs):
            model.train()
            train_loss = 0.0
            
            for sequences, labels in train_loader:
                sequences, labels = sequences.to(self.device), labels.to(self.device)
                
                optimizer.zero_grad()
                outputs = model(sequences)
                loss = criterion(outputs, labels)
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                optimizer.step()
                
                train_loss += loss.item()
            
            scheduler.step()
            
            # Validation
            model.eval()
            val_loss = 0.0
            val_correct = 0
            val_total = 0
            
            with torch.no_grad():
                for sequences, labels in val_loader:
                    sequences, labels = sequences.to(self.device), labels.to(self.device)
                    outputs = model(sequences)
                    loss = criterion(outputs, labels)
                    
                    val_loss += loss.item()
                    _, predicted = outputs.max(1)
                    val_total += labels.size(0)
                    val_correct += predicted.eq(labels).sum().item()
            
            val_acc = 100.0 * val_correct / val_total
            
            print(
                f"Epoch {epoch+1}/{self.config.epochs} | "
                f"Train Loss: {train_loss/len(train_loader):.4f} | "
                f"Val Loss: {val_loss/len(val_loader):.4f} | "
                f"Val Acc: {val_acc:.2f}%"
            )
            
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                self.save_model(model, epoch, val_acc)
        
        print(f"\nTraining complete!")
        
    def save_model(self, model: nn.Module, epoch: int, accuracy: float):
        output_path = Path(self.config.output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        path = output_path / f"{self.config.model_name}_epoch_{epoch+1}.pt"
        torch.save({
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "accuracy": accuracy,
        }, path)
        print(f"Saved: {path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train sequence recognizer")
    parser.add_argument("--data", type=str, default=Config.data_path)
    parser.add_argument("--epochs", type=int, default=Config.epochs)
    parser.add_argument("--batch-size", type=int, default=Config.batch_size)
    
    args = parser.parse_args()
    
    config = Config()
    config.data_path = args.data
    config.epochs = args.epochs
    config.batch_size = args.batch_size
    
    trainer = Trainer(config)
    trainer.train()
