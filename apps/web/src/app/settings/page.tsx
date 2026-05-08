"use client";

import { useState, useEffect } from "react";

const PROVIDERS = [
  { id: "deepseek", name: "DeepSeek", icon: "🔮", placeholder: "sk-xxxxxxxxxxxxxxxx" },
  { id: "openai", name: "OpenAI", icon: "🤖", placeholder: "sk-xxxxxxxxxxxxxxxx" },
  { id: "deepl", name: "DeepL", icon: "🌐", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
  { id: "google", name: "Google", icon: "🌍", placeholder: "不需要 API Key" },
] as const;

type ProviderId = typeof PROVIDERS[number]["id"];

interface Settings {
  provider: ProviderId;
  apiKeys: Record<ProviderId, string>;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    provider: "deepseek",
    apiKeys: { deepseek: "", openai: "", deepl: "", google: "" },
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("linguaflow_settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  async function handleSave() {
    try {
      localStorage.setItem("linguaflow_settings", JSON.stringify(settings));

      // 同步到 API（扩展会从 API 读取）
      await fetch("http://localhost:3002/api/extension/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  const currentProvider = PROVIDERS.find((p) => p.id === settings.provider)!;
  const needsApiKey = settings.provider !== "google";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
        ⚙️ 设置
      </h1>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
        {/* Provider 选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">选择翻译引擎</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PROVIDERS.map((p) => {
              const isActive = settings.provider === p.id;
              const hasKey = Boolean(settings.apiKeys[p.id]);
              return (
                <button
                  key={p.id}
                  onClick={() => setSettings({ ...settings, provider: p.id })}
                  className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    isActive
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl mb-1">{p.icon}</span>
                  <span className="text-sm font-medium">{p.name}</span>
                  {hasKey && <span className="absolute top-1 right-1 text-emerald-500 text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 当前 Provider API Key */}
        {needsApiKey ? (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {currentProvider.name} API Key
            </label>
            <input
              type="password"
              value={settings.apiKeys[settings.provider] || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  apiKeys: { ...settings.apiKeys, [settings.provider]: e.target.value },
                })
              }
              placeholder={currentProvider.placeholder}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">
              用于调用 {currentProvider.name} API，请从{" "}
              <a
                href={
                  settings.provider === "deepseek"
                    ? "https://platform.deepseek.com/api_keys"
                    : settings.provider === "openai"
                    ? "https://platform.openai.com/api-keys"
                    : "https://www.deepl.com/pro-api"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                {currentProvider.name} 平台
              </a>{" "}
              获取
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700">
              <span className="text-lg">✓</span>
              <span className="font-medium">{currentProvider.name} 不需要 API Key</span>
            </div>
            <p className="text-sm text-emerald-600 mt-1">
              可以直接使用 {currentProvider.name} 进行翻译
            </p>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30"
        >
          保存设置
        </button>

        {saved && (
          <div className="text-center text-emerald-600 text-sm mt-4 py-2 px-4 bg-emerald-50 rounded-lg">
            ✓ 设置保存成功！
          </div>
        )}
      </div>

      {/* 扩展使用说明 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">📦 扩展使用</h2>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li>在此页面配置好 API Key</li>
          <li>刷新 Chrome 扩展页面使设置生效</li>
          <li>在扩展 Popup 中选择要使用的翻译引擎</li>
        </ol>
      </div>
    </div>
  );
}
