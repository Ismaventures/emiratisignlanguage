'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    defaultLanguage: 'ar',
    autoTranslate: true,
    soundEnabled: true,
    hapticFeedback: true,
    darkMode: false,
    showConfidence: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  const SettingRow = ({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      {children}
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Customize your EmirSign AI experience</p>
      </div>

      {saved && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <span>✅</span> Settings saved successfully
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold text-gray-900">Translation</h3>
        </div>
        <div className="space-y-3 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Default Target Language</label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            >
              <option value="ar">Arabic (العربية)</option>
              <option value="en">English</option>
            </select>
          </div>
          <SettingRow label="Auto-translate" desc="Automatically translate detected signs">
            <Toggle checked={settings.autoTranslate} onChange={() => setSettings({ ...settings, autoTranslate: !settings.autoTranslate })} />
          </SettingRow>
          <SettingRow label="Show Confidence" desc="Display confidence scores for translations">
            <Toggle checked={settings.showConfidence} onChange={() => setSettings({ ...settings, showConfidence: !settings.showConfidence })} />
          </SettingRow>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold text-gray-900">Accessibility</h3>
        </div>
        <div className="space-y-3 p-6">
          <SettingRow label="Sound Effects" desc="Play sounds for notifications and events">
            <Toggle checked={settings.soundEnabled} onChange={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })} />
          </SettingRow>
          <SettingRow label="Haptic Feedback" desc="Vibrate on gesture detection">
            <Toggle checked={settings.hapticFeedback} onChange={() => setSettings({ ...settings, hapticFeedback: !settings.hapticFeedback })} />
          </SettingRow>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold text-gray-900">Appearance</h3>
        </div>
        <div className="space-y-3 p-6">
          <SettingRow label="Dark Mode" desc="Use dark theme (coming soon)">
            <Toggle checked={settings.darkMode} onChange={() => setSettings({ ...settings, darkMode: !settings.darkMode })} />
          </SettingRow>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="font-semibold text-gray-900">About</h3>
        </div>
        <div className="space-y-3 p-6">
          {[
            { label: 'Version', value: '0.1.0' },
            { label: 'Build', value: 'MVP Preview' },
            { label: 'Status', value: 'Development' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-xl bg-gradient-to-r from-primary-600 to-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
