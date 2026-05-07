"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    targetLanguage: "zh-CN",
    translationMode: "bilingual",
    userEnglishLevel: "B1",
    autoTranslate: false,
    preserveTerms: true,
  });
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Language
          </label>
          <select
            value={settings.targetLanguage}
            onChange={(e) =>
              setSettings({ ...settings, targetLanguage: e.target.value })
            }
            className="w-full border border-gray-200 rounded-lg px-4 py-2"
          >
            <option value="zh-CN">中文 (Chinese)</option>
            <option value="en">English</option>
            <option value="ja">日本語 (Japanese)</option>
            <option value="ko">한국어 (Korean)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Translation Mode
          </label>
          <div className="space-y-2">
            {[
              { value: "bilingual", label: "Bilingual", desc: "Show original and translation" },
              { value: "replace", label: "Replace", desc: "Show only translation" },
              { value: "hover", label: "Hover", desc: "Show on mouse hover" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="translationMode"
                  value={option.value}
                  checked={settings.translationMode === option.value}
                  onChange={(e) =>
                    setSettings({ ...settings, translationMode: e.target.value })
                  }
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            English Level
          </label>
          <select
            value={settings.userEnglishLevel}
            onChange={(e) =>
              setSettings({ ...settings, userEnglishLevel: e.target.value })
            }
            className="w-full border border-gray-200 rounded-lg px-4 py-2"
          >
            <option value="A1">A1 - Beginner</option>
            <option value="A2">A2 - Elementary</option>
            <option value="B1">B1 - Intermediate</option>
            <option value="B2">B2 - Upper Intermediate</option>
            <option value="C1">C1 - Advanced</option>
            <option value="C2">C2 - Proficient</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Auto Translate</div>
            <div className="text-sm text-gray-500">
              Automatically translate pages on load
            </div>
          </div>
          <button
            onClick={() =>
              setSettings({ ...settings, autoTranslate: !settings.autoTranslate })
            }
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.autoTranslate ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.autoTranslate ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Preserve Technical Terms</div>
            <div className="text-sm text-gray-500">
              Keep technical terms in original language
            </div>
          </div>
          <button
            onClick={() =>
              setSettings({ ...settings, preserveTerms: !settings.preserveTerms })
            }
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.preserveTerms ? "bg-blue-500" : "bg-gray-200"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.preserveTerms ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Save Settings
        </button>

        {saved && (
          <div className="text-center text-green-600 text-sm">
            Settings saved successfully!
          </div>
        )}
      </div>
    </div>
  );
}
