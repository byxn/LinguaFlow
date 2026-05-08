"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    targetLanguage: "zh-CN",
    translationMode: "bilingual",
    userEnglishLevel: "B1",
    autoTranslate: false,
    preserveTerms: true,
  });
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  // 客户端渲染后加载 API Key
  useEffect(() => {
    setApiKey(localStorage.getItem("deepseekApiKey") || "");
  }, []);

  async function handleSave() {
    try {
      // 保存 API Key 到 localStorage
      localStorage.setItem("deepseekApiKey", apiKey);

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
    <div className="page-container">
      <h1 className="page-header">⚙️ 设置</h1>

      <div className="card">
        <div className="mb-6">
          <label className="form-label">目标语言</label>
          <select
            value={settings.targetLanguage}
            onChange={(e) =>
              setSettings({ ...settings, targetLanguage: e.target.value })
            }
            className="form-select"
          >
            <option value="zh-CN">中文 (Chinese)</option>
            <option value="en">English</option>
            <option value="ja">日本語 (Japanese)</option>
            <option value="ko">한국어 (Korean)</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="form-label">翻译模式</label>
          <div className="space-y-3">
            {[
              { value: "bilingual", label: "双语对照", desc: "同时显示原文和译文" },
              { value: "replace", label: "仅译文", desc: "只显示翻译结果" },
              { value: "hover", label: "悬停翻译", desc: "鼠标悬停时显示翻译" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center p-4 bg-white/50 rounded-xl cursor-pointer hover:bg-white/80 transition-all border border-gray-100"
              >
                <input
                  type="radio"
                  name="translationMode"
                  value={option.value}
                  checked={settings.translationMode === option.value}
                  onChange={(e) =>
                    setSettings({ ...settings, translationMode: e.target.value })
                  }
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-800">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="form-label">英语水平</label>
          <select
            value={settings.userEnglishLevel}
            onChange={(e) =>
              setSettings({ ...settings, userEnglishLevel: e.target.value })
            }
            className="form-select"
          >
            <option value="A1">A1 - 入门</option>
            <option value="A2">A2 - 基础</option>
            <option value="B1">B1 - 中级</option>
            <option value="B2">B2 - 中高级</option>
            <option value="C1">C1 - 高级</option>
            <option value="C2">C2 - 精通</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl mb-4">
          <div>
            <div className="font-medium text-gray-800">自动翻译</div>
            <div className="text-sm text-gray-500">
              页面加载时自动翻译
            </div>
          </div>
          <button
            onClick={() =>
              setSettings({ ...settings, autoTranslate: !settings.autoTranslate })
            }
            className={`toggle-track ${settings.autoTranslate ? "on" : "off"}`}
          >
            <div
              className={`toggle-thumb ${
                settings.autoTranslate ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl mb-6">
          <div>
            <div className="font-medium text-gray-800">保留技术术语</div>
            <div className="text-sm text-gray-500">
              如 API、HTTP 等专业术语保持原文
            </div>
          </div>
          <button
            onClick={() =>
              setSettings({ ...settings, preserveTerms: !settings.preserveTerms })
            }
            className={`toggle-track ${settings.preserveTerms ? "on" : "off"}`}
          >
            <div
              className={`toggle-thumb ${
                settings.preserveTerms ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="mb-6">
          <label className="form-label">DeepSeek API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
            className="form-input"
          />
          <p className="text-xs text-gray-500 mt-2">
            用于调用 DeepSeek API 进行翻译，请从{" "}
            <a
              href="https://platform.deepseek.com/api_keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              DeepSeek 平台
            </a>{" "}
            获取
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn-primary"
        >
          保存设置
        </button>

        {saved && (
          <div className="text-center text-emerald-600 text-sm mt-4 py-2 px-4 bg-emerald-50 rounded-lg">
            ✓ 设置保存成功！
          </div>
        )}
      </div>
    </div>
  );
}
