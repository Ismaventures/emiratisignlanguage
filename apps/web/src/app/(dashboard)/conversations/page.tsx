'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Conversation {
  id: string;
  title: string;
  languagePair: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: '1', title: 'Doctor Visit', languagePair: 'esl-ar', status: 'ACTIVE', createdAt: '2025-06-01T10:00:00Z', updatedAt: '2025-06-01T10:30:00Z', messageCount: 15 },
  { id: '2', title: 'Airport Assistance', languagePair: 'esl-en', status: 'ACTIVE', createdAt: '2025-05-30T14:00:00Z', updatedAt: '2025-05-30T14:45:00Z', messageCount: 8 },
  { id: '3', title: 'School Meeting', languagePair: 'esl-ar', status: 'ACTIVE', createdAt: '2025-05-28T09:00:00Z', updatedAt: '2025-05-28T10:00:00Z', messageCount: 22 },
  { id: '4', title: 'Bank Inquiries', languagePair: 'esl-ar', status: 'ARCHIVED', createdAt: '2025-05-25T11:00:00Z', updatedAt: '2025-05-25T11:20:00Z', messageCount: 5 },
  { id: '5', title: 'GP Registration', languagePair: 'esl-en', status: 'ACTIVE', createdAt: '2025-05-20T16:00:00Z', updatedAt: '2025-05-20T16:30:00Z', messageCount: 12 },
];

export default function ConversationsPage() {
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [showNewModal, setShowNewModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
          <p className="text-gray-500">Your translation sessions</p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>New Conversation</Button>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mb-4 text-4xl">💬</div>
            <h3 className="mb-2 text-lg font-semibold">No conversations yet</h3>
            <p className="mb-4 text-gray-500">Start a new conversation to begin translating</p>
            <Button onClick={() => setShowNewModal(true)}>Start First Conversation</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {conversations.map((conv) => (
            <Card key={conv.id} className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{conv.title}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      conv.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {conv.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>
                    <span className="font-medium">Language:</span>{' '}
                    {conv.languagePair.toUpperCase().replace('-', ' → ')}
                  </p>
                  <p>
                    <span className="font-medium">Messages:</span> {conv.messageCount}
                  </p>
                  <p>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="text-lg font-semibold">New Conversation</h3>
            </CardHeader>
            <CardContent>
              <p className="py-4 text-center text-gray-500">
                Mock mode — creating conversations is disabled.
              </p>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowNewModal(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
