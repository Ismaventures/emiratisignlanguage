'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSpeechRecognition } from '@/lib/use-speech-recognition';
import { AudioVisualizer } from '@/components/ui/audio-visualizer';
import { GlbAvatarViewer } from '@/components/avatar/glb-avatar-viewer';
import { useToast } from '@/components/ui/toast';

export default function TranslatePage() {
  const [inputText, setInputText] = useState('');
  const [translatedOutput, setTranslatedOutput] = useState('');
  const [avatarText, setAvatarText] = useState('');
  const [translating, setTranslating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const {
    isListening,
    isSupported: speechSupported,
    transcript: speechTranscript,
    interimTranscript,
    error: speechError,
    toggle: toggleListening,
    stop: stopListening,
  } = useSpeechRecognition('en-US');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (speechTranscript) {
      setInputText(speechTranscript);
      setAvatarText(speechTranscript);
    }
  }, [speechTranscript]);

  const handleListeningToggle = async () => {
    if (!speechSupported) {
      addToast('Speech recognition not supported. Try Chrome or Edge.', 'warning');
      return;
    }
    if (!isListening) {
      toggleListening();
    } else {
      stopListening();
      if (speechTranscript.trim()) {
        setTranslating(true);
        setAvatarText(speechTranscript);
        setTranslatedOutput(speechTranscript);
        setTranslating(false);
      }
    }
  };

  const clearAll = () => {
    setInputText('');
    setTranslatedOutput('');
    setAvatarText('');
  };

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Left: Avatar */}
      <div className="flex-1 min-w-0">
        <GlbAvatarViewer text={avatarText} />
      </div>

      {/* Right: Controls & Output */}
      <div className="w-[380px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Translate</h1>
            <p className="text-xs text-gray-500">Text to Emirati Sign Language</p>
          </div>
          <button
            onClick={clearAll}
            className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Clear"
          >
            🗑️
          </button>
        </div>

        {/* Speech Input */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleListeningToggle}
              className={`flex h-16 w-16 items-center justify-center rounded-full transition-all ${
                isListening
                  ? 'bg-red-100 text-red-600 scale-110 shadow-lg shadow-red-500/25'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <p className="text-sm font-medium text-gray-900">
              {isListening ? 'Listening...' : 'Click to speak'}
            </p>
            {interimTranscript && (
              <p className="text-xs text-gray-400 italic">{interimTranscript}</p>
            )}
            {isListening && (
              <div className="w-full max-w-[200px]">
                <AudioVisualizer isActive={true} color="#16a34a" barCount={24} height={24} />
              </div>
            )}
            {isListening && (
              <button
                onClick={handleListeningToggle}
                className="rounded-xl bg-red-500 px-5 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors"
              >
                Stop & Send
              </button>
            )}
          </div>
        </div>

        {/* Translation Output */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="font-semibold text-gray-900 text-sm">Translation</h3>
          </div>
          <div className="p-4 min-h-[80px]">
            {translating ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
              </div>
            ) : translatedOutput ? (
              <p className="text-base font-medium text-gray-900">{translatedOutput}</p>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">
                Type or speak to see translation
              </p>
            )}
          </div>
        </div>

        {/* Quick phrases */}
        <div className="flex flex-wrap gap-1.5">
          {['Hello', 'Thank you', 'Yes', 'No', 'Help', 'Goodbye', 'Please'].map((phrase) => (
            <button
              key={phrase}
              onClick={() => {
                setInputText(phrase);
                setAvatarText(phrase);
                setTranslatedOutput(phrase);
              }}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
