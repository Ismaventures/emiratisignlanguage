'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiGet } from '@/lib/api';

interface HistoryItem {
  id: string;
  contentType: string;
  content: string;
  translationAr: string | null;
  translationEn: string | null;
  confidence: number | null;
  createdAt: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sign' | 'speech'>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiGet<{ items: HistoryItem[] }>('/conversations/history');
        setHistory(data.items || []);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'sign') return item.contentType === 'SIGN';
    if (filter === 'speech') return item.contentType === 'SPEECH' || item.contentType === 'TEXT';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <p className="text-gray-500">Your translation history</p>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('all')}>
            All
          </Button>
          <Button variant={filter === 'sign' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('sign')}>
            🤟 Sign
          </Button>
          <Button variant={filter === 'speech' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('speech')}>
            🎤 Speech
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-400">Loading history...</p>
          </CardContent>
        </Card>
      ) : filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mb-4 text-4xl">📜</div>
            <h3 className="mb-2 text-lg font-semibold">No history yet</h3>
            <p className="text-gray-500">Your translations will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {filteredHistory.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 hover:bg-gray-50">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    {item.contentType === 'SIGN' ? '🤟' : '🎤'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.content}</p>
                    {(item.translationAr || item.translationEn) && (
                      <p className="mt-1 text-sm text-gray-500">→ {item.translationAr || item.translationEn}</p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                      {item.confidence && <span>Confidence: {(item.confidence * 100).toFixed(0)}%</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
