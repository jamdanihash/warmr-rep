import { useState, useEffect } from 'react';
import { Bell, Mail, Volume2, Eye, Globe, Clock, DollarSign, Moon, Sun, Monitor, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { CURRENCIES } from '@/lib/constants/locations';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  currency: string;
  email_notifications: {
    messages: boolean;
    connections: boolean;
    opportunities: boolean;
    system: boolean;
    marketing: boolean;
  };
  push_notifications: {
    messages: boolean;
    connections: boolean;
    opportunities: boolean;
    system: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'connections' | 'private';
    show_email: boolean;
    show_phone: boolean;
    allow_messages: boolean;
  };
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  date_format: 'MM/DD/YYYY',
  time_format: '12h',
  currency: 'USD',
  email_notifications: {
    messages: true,
    connections: true,
    opportunities: true,
    system: true,
    marketing: false
  },
  push_notifications: {
    messages: true,
    connections: true,
    opportunities: true,
    system: true
  },
  privacy: {
    profile_visibility: 'public',
    show_email: true,
    show_phone: true,
    allow_messages: true
  }
};

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' }
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userSettings, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no settings exist, create them with defaults
      if (!userSettings) {
        const { error: insertError } = await supabase
          .from('settings')
          .insert({
            user_id: user.id,
            ...DEFAULT_SETTINGS
          });

        if (insertError) throw insertError;
        setSettings(DEFAULT_SETTINGS);
      } else {
        setSettings(userSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Settings
            </h2>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 rounded-md bg-green-50 border border-green-200">
            <p className="text-sm text-green-600">Settings saved successfully</p>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {/* Appearance */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
              <div className="mt-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Theme</label>
                  <div className="mt-2 flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, theme: 'light' })}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        settings.theme === 'light'
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Sun className="h-5 w-5 mr-2" />
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, theme: 'dark' })}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        settings.theme === 'dark'
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Moon className="h-5 w-5 mr-2" />
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, theme: 'system' })}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        settings.theme === 'system'
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <Monitor className="h-5 w-5 mr-2" />
                      System
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Language
                  </label>
                  <select
                    id="language"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Regional */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Regional</h3>
              <div className="mt-6 space-y-6">
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="date_format" className="block text-sm font-medium text-gray-700">
                    Date Format
                  </label>
                  <select
                    id="date_format"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={settings.date_format}
                    onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="time_format" className="block text-sm font-medium text-gray-700">
                    Time Format
                  </label>
                  <select
                    id="time_format"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={settings.time_format}
                    onChange={(e) => setSettings({ ...settings, time_format: e.target.value as '12h' | '24h' })}
                  >
                    <option value="12h">12-hour (1:00 PM)</option>
                    <option value="24h">24-hour (13:00)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <select
                    id="currency"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <div className="mt-4 space-y-4">
                    {Object.entries(settings.email_notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`email-${key}`}
                          checked={value}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              email_notifications: {
                                ...settings.email_notifications,
                                [key]: e.target.checked
                              }
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <label htmlFor={`email-${key}`} className="ml-3 text-sm text-gray-700">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                  <div className="mt-4 space-y-4">
                    {Object.entries(settings.push_notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`push-${key}`}
                          checked={value}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              push_notifications: {
                                ...settings.push_notifications,
                                [key]: e.target.checked
                              }
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <label htmlFor={`push-${key}`} className="ml-3 text-sm text-gray-700">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Privacy</h3>
              <div className="mt-6 space-y-6">
                <div>
                  <label htmlFor="profile_visibility" className="block text-sm font-medium text-gray-700">
                    Profile Visibility
                  </label>
                  <select
                    id="profile_visibility"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
                    value={settings.privacy.profile_visibility}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        privacy: {
                          ...settings.privacy,
                          profile_visibility: e.target.value as 'public' | 'connections' | 'private'
                        }
                      })
                    }
                  >
                    <option value="public">Public</option>
                    <option value="connections">Connections Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="show_email"
                      checked={settings.privacy.show_email}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          privacy: {
                            ...settings.privacy,
                            show_email: e.target.checked
                          }
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <label htmlFor="show_email" className="ml-3 text-sm text-gray-700">
                      Show email address to other users
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="show_phone"
                      checked={settings.privacy.show_phone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          privacy: {
                            ...settings.privacy,
                            show_phone: e.target.checked
                          }
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <label htmlFor="show_phone" className="ml-3 text-sm text-gray-700">
                      Show phone number to other users
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allow_messages"
                      checked={settings.privacy.allow_messages}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          privacy: {
                            ...settings.privacy,
                            allow_messages: e.target.checked
                          }
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <label htmlFor="allow_messages" className="ml-3 text-sm text-gray-700">
                      Allow messages from non-connections
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}