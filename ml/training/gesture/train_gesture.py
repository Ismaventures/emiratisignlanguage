# Gesture Classifier Training Script
# Trains a Transformer-based model to classify ESL gestures from MediaPipe landmarks

import os
import json
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import argparse
from pathlib import Path


# ─── Configuration ──────────────────────────────────────────

class Config:
    # Data
    data_path = "../datasets/processed/landmarks.json"
    val_split = 0.15
    test_split = 0.15
    
    # Model
    num_landmarks = 21  # MediaPipe hand landmarks
    num_coords = 3       # x, y, z
    num_hands = 2
    seq_length = 30      # temporal window
    d_model = 128
    nhead = 4
    num_layers = 3
    dim_feedforward = 256
    dropout = 0.1
    
    # Training
    batch_size = 32
    epochs = 100
    learning_rate = 0.001
    weight_decay = 1e-4
    
    # Output
    output_dir = "../exports/gesture_classifier"
    model_name = "gesture_classifier_v1"
    num_classes = 50  # Will be set from data


# ─── Dataset ────────────────────────────────────────────────

class GestureDataset(Dataset):
    """Dataset for gesture classification from landmark sequences."""
    
    def __init__(self, landmarks: np.ndarray, labels: np.ndarray):
        self.landmarks = torch.FloatTensor(landmarks)
        self.labels = torch.LongTensor(labels)
        
    def __len__(self):
        return len(self.labels)
    
    def __getitem__(self, idx):
        return self.landmarks[idx], self.labels[idx]


# ─── Model Architecture ─────────────────────────────────────

class GestureClassifier(nn.Module):
    """
    Transformer-based gesture classifier.
    
    Input: (batch, seq_len, num_landmarks * num_coords * num_hands)
    Output: (batch, num_classes)
    """
    
    def __init__(self, input_dim: int, num_classes: int, config: Config):
        super().__init__()
        
        self.input_projection = nn.Linear(input_dim, config.d_model)
        self.pos_encoder = nn.Parameter(torch.randn(1, config.seq_length, config.d_model) * 0.1)
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=config.d_model,
            nhead=config.nhead,
            dim_feedforward=config.dim_feedforward,
            dropout=config.dropout,
            batch_first=True,
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=config.num_layers)
        
        self.classifier = nn.Sequential(
            nn.Linear(config.d_model, config.d_model // 2),
            nn.ReLU(),
            nn.Dropout(config.dropout),
            nn.Linear(config.d_model // 2, num_classes),
        )
        
    def forward(self, x):
        # x: (batch, seq_len, input_dim)
        x = self.input_projection(x) + self.pos_encoder
        x = self.transformer(x)
        x = x.mean(dim=1)  # Global average pooling
        x = self.classifier(x)
        return x


# ─── Temporal Convolution Network ──────────────────────────

class TCNBlock(nn.Module):
    """Temporal Convolutional Network block."""
    
    def __init__(self, in_channels: int, out_channels: int, kernel_size: int = 3, dilation: int = 1):
        super().__init__()
        self.conv = nn.Conv1d(
            in_channels, out_channels,
            kernel_size=kernel_size,
            padding=(kernel_size - 1) * dilation // 2,
            dilation=dilation,
        )
        self.bn = nn.BatchNorm1d(out_channels)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.1)
        
    def forward(self, x):
        return self.relu(self.bn(self.conv(x)))


class TCN(nn.Module):
    """Multi-layer TCN for sequence modeling."""
    
    def __init__(self, input_dim: int, num_channels: list[int], kernel_size: int = 3):
        super().__init__()
        
        layers = []
        in_ch = input_dim
        for i, out_ch in enumerate(num_channels):
            layers.append(TCNBlock(in_ch, out_ch, kernel_size, dilation=2**i))
            in_ch = out_ch
            
        self.network = nn.Sequential(*layers)
        self.final = nn.Linear(num_channels[-1], num_channels[-1])
        
    def forward(self, x):
        # x: (batch, channels, seq_len)
        x = self.network(x)
        x = x.mean(dim=2)  # Global average pooling
        x = self.final(x)
        return x


# ─── Combined Model ─────────────────────────────────────────

class HybridGestureModel(nn.Module):
    """Combines Transformer + TCN for robust gesture recognition."""
    
    def __init__(self, input_dim: int, num_classes: int, config: Config):
        super().__init__()
        
        self.transformer = GestureClassifier(input_dim, num_classes, config)
        
        self.tcn = TCN(
            input_dim=input_dim,
            num_channels=[64, 128, 128, 64],
            kernel_size=3,
        )
        
        # Combine features
        combined_dim = config.d_model + 64
        self.final_classifier = nn.Linear(combined_dim, num_classes)
        
    def forward(self, x):
        transformer_out = self.transformer.classifier[:-1](
            self.transformer.input_projection(x) + self.transformer.pos_encoder
        ).mean(dim=1)
        
        # TCN expects (batch, channels, seq_len)
        tcn_input = x.transpose(1, 2)
        tcn_out = self.tcn(tcn_input)
        
        combined = torch.cat([transformer_out, tcn_out], dim=1)
        return self.final_classifier(combined)


# ─── Training ───────────────────────────────────────────────

class Trainer:
    """Training loop for gesture classification."""
    
    def __init__(self, config: Config):
        self.config = config
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self.device}")
        
    def load_data(self):
        """Load and preprocess landmark data."""
        with open(self.config.data_path, "r") as f:
            data = json.load(f)
            
        landmarks = np.array(data["landmarks"], dtype=np.float32)
        labels = np.array(data["labels"], dtype=np.int64)
        
        # Normalize landmarks
        mean = landmarks.mean(axis=(0, 1), keepdims=True)
        std = landmarks.std(axis=(0, 1), keepdims=True) + 1e-8
        landmarks = (landmarks - mean) / std
        
        # Split data
        X_temp, X_test, y_temp, y_test = train_test_split(
            landmarks, labels,
            test_size=self.config.test_split,
            random_state=42,
            stratify=labels,
        )
        
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp,
            test_size=self.config.val_split / (1 - self.config.test_split),
            random_state=42,
            stratify=y_temp,
        )
        
        self.num_classes = len(np.unique(labels))
        self.input_dim = X_train.shape[2]
        
        print(f"Training: {len(X_train)}, Validation: {len(X_val)}, Test: {len(X_test)}")
        print(f"Input dim: {self.input_dim}, Classes: {self.num_classes}")
        
        return (
            GestureDataset(X_train, y_train),
            GestureDataset(X_val, y_val),
            GestureDataset(X_test, y_test),
        )
        
    def train(self):
        """Run training loop."""
        train_dataset, val_dataset, test_dataset = self.load_data()
        
        train_loader = DataLoader(
            train_dataset,
            batch_size=self.config.batch_size,
            shuffle=True,
            num_workers=4,
        )
        val_loader = DataLoader(
            val_dataset,
            batch_size=self.config.batch_size,
            shuffle=False,
            num_workers=4,
        )
        
        # Initialize model
        model = HybridGestureModel(
            input_dim=self.input_dim,
            num_classes=self.num_classes,
            self.config,
        ).to(self.device)
        
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.AdamW(
            model.parameters(),
            lr=self.config.learning_rate,
            weight_decay=self.config.weight_decay,
        )
        scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=self.config.epochs)
        
        best_val_acc = 0.0
        
        for epoch in range(self.config.epochs):
            # Training
            model.train()
            train_loss = 0.0
            train_correct = 0
            train_total = 0
            
            for landmarks, labels in train_loader:
                landmarks, labels = landmarks.to(self.device), labels.to(self.device)
                
                optimizer.zero_grad()
                outputs = model(landmarks)
                loss = criterion(outputs, labels)
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
                optimizer.step()
                
                train_loss += loss.item()
                _, predicted = outputs.max(1)
                train_total += labels.size(0)
                train_correct += predicted.eq(labels).sum().item()
            
            scheduler.step()
            
            # Validation
            model.eval()
            val_loss = 0.0
            val_correct = 0
            val_total = 0
            
            with torch.no_grad():
                for landmarks, labels in val_loader:
                    landmarks, labels = landmarks.to(self.device), labels.to(self.device)
                    outputs = model(landmarks)
                    loss = criterion(outputs, labels)
                    
                    val_loss += loss.item()
                    _, predicted = outputs.max(1)
                    val_total += labels.size(0)
                    val_correct += predicted.eq(labels).sum().item()
            
            train_acc = 100.0 * train_correct / train_total
            val_acc = 100.0 * val_correct / val_total
            
            print(
                f"Epoch {epoch+1}/{self.config.epochs} | "
                f"Train Loss: {train_loss/len(train_loader):.4f} | "
                f"Train Acc: {train_acc:.2f}% | "
                f"Val Loss: {val_loss/len(val_loader):.4f} | "
                f"Val Acc: {val_acc:.2f}%"
            )
            
            # Save best model
            if val_acc > best_val_acc:
                best_val_acc = val_acc
                self.save_model(model, epoch, val_acc)
                
        print(f"\nTraining complete! Best validation accuracy: {best_val_acc:.2f}%")
        
    def save_model(self, model: nn.Module, epoch: int, accuracy: float):
        """Save model checkpoint and export to ONNX."""
        output_path = Path(self.config.output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # PyTorch checkpoint
        checkpoint_path = output_path / f"{self.config.model_name}_epoch_{epoch+1}.pt"
        torch.save({
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "accuracy": accuracy,
            "config": self.config.__dict__,
        }, checkpoint_path)
        print(f"Saved checkpoint: {checkpoint_path}")
        
        # Export to ONNX
        self.export_onnx(model, output_path)
        
    def export_onnx(self, model: nn.Module, output_path: Path):
        """Export model to ONNX format for inference."""
        model.eval()
        dummy_input = torch.randn(1, self.config.seq_length, self.input_dim).to(self.device)
        
        onnx_path = output_path / f"{self.config.model_name}.onnx"
        torch.onnx.export(
            model,
            dummy_input,
            onnx_path,
            export_params=True,
            opset_version=17,
            input_names=["input"],
            output_names=["output"],
            dynamic_axes={
                "input": {0: "batch_size"},
                "output": {0: "batch_size"},
            },
        )
        print(f"Exported ONNX: {onnx_path}")


# ─── Main ───────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train gesture classifier")
    parser.add_argument("--data", type=str, default=Config.data_path, help="Path to landmarks JSON")
    parser.add_argument("--epochs", type=int, default=Config.epochs, help="Number of epochs")
    parser.add_argument("--batch-size", type=int, default=Config.batch_size, help="Batch size")
    parser.add_argument("--lr", type=float, default=Config.learning_rate, help="Learning rate")
    parser.add_argument("--output", type=str, default=Config.output_dir, help="Output directory")
    
    args = parser.parse_args()
    
    config = Config()
    config.data_path = args.data
    config.epochs = args.epochs
    config.batch_size = args.batch_size
    config.learning_rate = args.lr
    config.output_dir = args.output_dir
    
    trainer = Trainer(config)
    trainer.train()
