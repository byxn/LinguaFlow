import { useState, useEffect } from "react";

const WEB_APP_URL = "http://localhost:3000";
const SETTINGS_URL = `${WEB_APP_URL}/settings`;

const PROVIDERS = [
  { id: "deepseek", name: "DeepSeek", icon: "🔮" },
  { id: "openai", name: "OpenAI", icon: "🤖" },
  { id: "deepl", name: "DeepL", icon: "🌐" },
  { id: "google", name: "Google", icon: "🌍" },
] as const;

type ProviderId = typeof PROVIDERS[number]["id"];

interface Settings {
  provider: ProviderId;
  apiKeys: Record<ProviderId, string>;
}

export default function Popup() {
  const [settings, setSettings] = useState<Settings>({
    provider: "deepseek",
    apiKeys: { deepseek: "", openai: "", deepl: "", google: "" },
  });
  const [hoverEnabled, setHoverEnabled] = useState(false);
  const [selectionEnabled, setSelectionEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从 API 读取设置（与 Web 设置页面同步）
    fetch("http://localhost:3002/api/extension/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.provider && data.apiKeys) {
          setSettings(data);
        }
      })
      .catch(() => {
        // 回退到 chrome.storage.local
        chrome.storage.local.get(["settings"], (result) => {
          if (result.settings) {
            setSettings(result.settings);
          }
        });
      })
      .finally(() => setLoading(false));

    chrome.storage.local.get(["hoverEnabled"], (result) => {
      setHoverEnabled(result.hoverEnabled ?? false);
    });
    chrome.storage.local.get(["selectionEnabled"], (result) => {
      setSelectionEnabled(result.selectionEnabled ?? false);
    });
  }, []);

  const handleProviderChange = async (newProvider: ProviderId) => {
    const newSettings = { ...settings, provider: newProvider };
    setSettings(newSettings);
    chrome.storage.local.set({ settings: newSettings });

    // 同时同步到 API
    try {
      await fetch("http://localhost:3002/api/extension/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
    } catch (e) {
      console.error("Failed to sync provider to API:", e);
    }
  };

  const toggleHover = () => {
    const newState = !hoverEnabled;
    setHoverEnabled(newState);
    chrome.storage.local.set({ hoverEnabled: newState });
    chrome.runtime.sendMessage({ type: "TOGGLE_HOVER" });
  };

  const toggleSelection = () => {
    const newState = !selectionEnabled;
    setSelectionEnabled(newState);
    chrome.storage.local.set({ selectionEnabled: newState });
    chrome.runtime.sendMessage({ type: "TOGGLE_SELECTION" });
  };

  const openSettings = () => {
    chrome.tabs.create({ url: SETTINGS_URL });
  };

  const hasApiKey = (pId: ProviderId) => {
    return Boolean(settings.apiKeys[pId]);
  };

  const currentProvider = PROVIDERS.find((p) => p.id === settings.provider)!;

  if (loading) {
    return (
      <div className="popup-container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1>ReadMind</h1>
        <div className="subtitle">AI 阅读翻译助手</div>
      </div>

      {/* Provider 选择 */}
      <div className="provider-card">
        <div className="provider-label">选择翻译引擎</div>
        <div className="provider-grid">
          {PROVIDERS.map((p) => {
            const configured = hasApiKey(p.id);
            return (
              <button
                key={p.id}
                onClick={() => handleProviderChange(p.id)}
                className={`provider-btn ${settings.provider === p.id ? "active" : ""}`}
              >
                <span className="provider-icon">{p.icon}</span>
                <span className="provider-name">{p.name}</span>
                {!configured && <span className="provider-dot"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 功能开关 */}
      <div className="feature-card">
        <div className="feature-row">
          <div className="feature-info">
            <span className="feature-icon">📖</span>
            <span className="feature-name">沉浸翻译</span>
          </div>
          <button
            onClick={() => {
              chrome.runtime.sendMessage({ type: "TOGGLE_TRANSLATION" });
            }}
            className="action-btn"
          >
            开始翻译
          </button>
        </div>
        <div className="feature-row">
          <div className="feature-info">
            <span className="feature-icon">👆</span>
            <span className="feature-name">悬停翻译</span>
          </div>
          <button
            onClick={toggleHover}
            className={`toggle-btn ${hoverEnabled ? "on" : "off"}`}
          >
            {hoverEnabled ? "ON" : "OFF"}
          </button>
        </div>
        <div className="feature-row">
          <div className="feature-info">
            <span className="feature-icon">✍️</span>
            <span className="feature-name">划词翻译</span>
          </div>
          <button
            onClick={toggleSelection}
            className={`toggle-btn ${selectionEnabled ? "on" : "off"}`}
          >
            {selectionEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="nav-section">
        <button className="nav-btn" onClick={openSettings}>
          ⚙️ API 设置
        </button>
        <button className="nav-btn" onClick={() => chrome.tabs.create({ url: `${WEB_APP_URL}/vocabulary` })}>
          📚 生词本
        </button>
      </div>

      <div className="footer">
        {currentProvider.icon} {currentProvider.name}
      </div>
    </div>
  );
}
