'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSpeechRecognition } from '@/lib/use-speech-recognition';
import { useTextToSpeech } from '@/lib/use-text-to-speech';
import { AudioVisualizer } from '@/components/ui/audio-visualizer';
import { ProCamera, type DetectedGesture } from '@/components/camera/pro-camera';
import { GlbAvatarViewer } from '@/components/avatar/glb-avatar-viewer';
import { useToast } from '@/components/ui/toast';
import { translateText } from '@/lib/ml-service';

type TranslationMode = 'sign-to-text' | 'text-to-sign' | 'speech-to-text';

interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  translation: string;
  timestamp: Date;
  confidence?: number;
}

export default function TranslatePage() {
  const [mode, setMode] = useState<TranslationMode>('speech-to-text');
  const [targetLang, setTargetLang] = useState<'ar' | 'en'>('ar');
  const [translatedText, setTranslatedText] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  const [signText, setSignText] = useState('');
  const [translatedOutput, setTranslatedOutput] = useState('');
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
  } = useSpeechRecognition(targetLang === 'ar' ? 'ar-AE' : 'en-US');

  const {
    isSpeaking,
    isSupported: ttsSupported,
    speak,
    cancel: cancelSpeech,
  } = useTextToSpeech();

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle speech transcript as it comes
  useEffect(() => {
    if (speechTranscript) {
      setTranslatedText(speechTranscript);
    }
  }, [speechTranscript]);

  const addMessage = useCallback(
    (content: string, translation: string, confidence?: number) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: 'user',
          content,
          translation,
          timestamp: new Date(),
          confidence,
        },
      ]);
    },
    [],
  );

  const handleGesture = useCallback(
    async (gesture: DetectedGesture | null) => {
      if (gesture && gesture.name !== lastGesture) {
        setLastGesture(gesture.name);
        setTranslatedText((prev) =>
          prev ? `${prev} ${gesture.name}` : gesture.name,
        );
        addMessage(gesture.name, gesture.arabicName, gesture.confidence);
        try {
          const result = await translateText(gesture.name, 'en', targetLang);
          if (result?.translatedText) {
            setTranslatedOutput(result.translatedText);
          }
        } catch {
          setTranslatedOutput(gesture.arabicName);
        }
      }
    },
    [lastGesture, addMessage, targetLang],
  );

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, [cancelSpeech]);

  const handleSpeakTranslation = (text: string) => {
    if (isSpeaking) {
      cancelSpeech();
    } else {
      speak(text, targetLang === 'ar' ? 'ar-AE' : 'en-US');
    }
  };

  const handleListeningToggle = async () => {
    if (!speechSupported) {
      addToast('Speech recognition is not supported in this browser. Try Chrome or Edge.', 'warning');
      return;
    }
    if (!isListening) {
      setTranslatedText('');
      toggleListening();
    } else {
      stopListening();
      if (speechTranscript.trim()) {
        setTranslating(true);
        try {
          const result = await translateText(speechTranscript, targetLang === 'ar' ? 'ar' : 'en', targetLang === 'ar' ? 'en' : 'ar');
          const translated = result?.translatedText || speechTranscript;
          setTranslatedOutput(translated);
          addMessage(speechTranscript, translated, 0.92);
        } catch {
          setTranslatedOutput(speechTranscript);
          addMessage(speechTranscript, speechTranscript, 0.92);
        } finally {
          setTranslating(false);
        }
      }
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setSignText(inputText);
    setTranslating(true);
    try {
      const result = await translateText(inputText, 'en', targetLang);
      const translated = result?.translatedText || inputText;
      setTranslatedOutput(translated);
      addMessage(inputText, translated);
    } catch {
      setTranslatedOutput(inputText);
      addMessage(inputText, inputText);
    } finally {
      setTranslating(false);
    }
    setInputText('');
  };

  const clearAll = () => {
    setTranslatedText('');
    setMessages([]);
    setLastGesture(null);
    cancelSpeech();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Translate</h1>
          <p className="text-sm text-gray-500">Real-time Emirati Sign Language translation</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Target:</span>
          <div className="flex rounded-xl border border-gray-200 p-0.5 bg-gray-50">
            <button
              onClick={() => setTargetLang('ar')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${targetLang === 'ar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              العربية
            </button>
            <button
              onClick={() => setTargetLang('en')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${targetLang === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
        {[
          { id: 'sign-to-text' as const, label: '🤟  Sign to Text', desc: 'Camera-based recognition' },
          { id: 'text-to-sign' as const, label: '📝  Text to Sign', desc: 'Type or speak' },
          { id: 'speech-to-text' as const, label: '🎤  Speech to Text', desc: 'Voice recognition' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              mode === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.id === 'sign-to-text' ? '🤟' : tab.id === 'text-to-sign' ? '📝' : '🎤'}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Input */}
        <div className="space-y-4">
          {mode === 'sign-to-text' ? (
            <ProCamera onGesture={handleGesture} />
          ) : mode === 'speech-to-text' ? (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Speech waveform + controls */}
              <div className="p-8">
                <div className="flex flex-col items-center gap-6">
                  <button
                    onClick={handleListeningToggle}
                    className={`flex h-24 w-24 items-center justify-center rounded-full transition-all ${
                      isListening
                        ? 'bg-red-100 text-red-600 scale-110 shadow-lg shadow-red-500/25'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900">
                      {isListening ? 'Listening...' : 'Click to speak'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isListening ? 'Speak clearly into your microphone' : 'Arabic and English supported'}
                    </p>
                  </div>

                  {/* Live waveform */}
                  <div className="w-full max-w-sm flex justify-center">
                    <AudioVisualizer isActive={isListening} color="#16a34a" barCount={48} height={48} />
                  </div>

                  {/* Interim transcript */}
                  {interimTranscript && (
                    <div className="w-full max-w-md text-center">
                      <p className="text-sm text-gray-400 italic">{interimTranscript}</p>
                    </div>
                  )}

                  {/* Speech not supported warning */}
                  {!speechSupported && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                      ⚠ Speech recognition not available. Use Chrome or Edge.
                    </div>
                  )}

                  {speechError && (
                    <p className="text-sm text-red-500">{speechError}</p>
                  )}

                  {isListening && (
                    <button
                      onClick={handleListeningToggle}
                      className="rounded-xl bg-red-500 px-6 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                    >
                      Stop & Send
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Text Input (for text-to-sign mode) */}
          {mode === 'text-to-sign' && (
            <>
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <form onSubmit={handleTextSubmit} className="flex gap-3">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={targetLang === 'ar' ? 'اكتب النص هنا...' : 'Type your text here...'}
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
                  >
                    Translate
                  </button>
                  <button
                    type="button"
                    onClick={handleListeningToggle}
                    className={`rounded-xl border px-4 py-2.5 transition-colors ${
                      isListening ? 'bg-red-50 border-red-300 text-red-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {isListening ? '🔴' : '🎤'}
                  </button>
                </form>
                {interimTranscript && (
                  <p className="mt-2 text-xs text-gray-400">{interimTranscript}</p>
                )}
              </div>

              {/* Avatar Signing Engine */}
              <GlbAvatarViewer text={signText} />
            </>
          )}
        </div>

        {/* Right Panel - Output */}
        <div className="space-y-4">
          {/* Translation Output */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {targetLang === 'ar' ? 'الترجمة' : 'Translation'}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => translatedText && handleSpeakTranslation(translatedText)}
                    disabled={!translatedText}
                    className={`rounded-lg p-2 transition-colors disabled:opacity-50 ${
                      isSpeaking ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                    title={isSpeaking ? 'Stop' : 'Speak'}
                  >
                    {isSpeaking ? '🔊' : '🔈'}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(translatedText);
                      addToast('Copied to clipboard!', 'success');
                    }}
                    disabled={!translatedText}
                    className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="Copy"
                  >
                    📋
                  </button>
                  <button
                    onClick={clearAll}
                    disabled={!translatedText && messages.length === 0}
                    className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="Clear"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {isSpeaking && (
                <div className="mt-2">
                  <AudioVisualizer isActive={true} color="#2563eb" barCount={24} height={20} />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="min-h-[120px]">
                {translating ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <span className="mb-3 text-4xl text-gray-300 animate-pulse">🌐</span>
                    <p className="text-sm text-gray-400">Translating...</p>
                  </div>
                ) : translatedOutput ? (
                  <div>
                    <p className="text-lg font-medium text-gray-900">{translatedOutput}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <span className="mb-3 text-4xl text-gray-300">🌐</span>
                    <p className="text-sm text-gray-400">
                      {mode === 'sign-to-text' ? 'Start signing to see translation...' :
                       mode === 'speech-to-text' ? 'Start speaking to see transcription...' :
                       'Type text and press translate...'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conversation */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="font-semibold text-gray-900">Conversation</h3>
            </div>
            <div className="max-h-[320px] overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="mb-3 text-3xl text-gray-300">💬</span>
                  <p className="text-sm text-gray-400">Messages will appear here</p>
                </div>
              ) : (
                messages.slice(-10).map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gray-100 text-gray-900 rounded-bl-sm'
                          : 'bg-primary-50 text-primary-900 rounded-br-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      {msg.translation && (
                        <p className="mt-1 text-xs opacity-60" dir={targetLang === 'ar' ? 'rtl' : 'ltr'}>
                          → {msg.translation}
                        </p>
                      )}
                      {msg.confidence && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-primary-500" style={{ width: `${msg.confidence * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-400">{(msg.confidence * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            {['Hello', 'Thank you', 'Yes', 'No', 'Help'].map((phrase) => (
              <button
                key={phrase}
                onClick={() => {
                  setTranslatedText((prev) => (prev ? `${prev} ${phrase}` : phrase));
                  addMessage(phrase, phrase, 0.9);
                }}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
