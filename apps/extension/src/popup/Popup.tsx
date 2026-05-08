import { usePopupState } from "./usePopupState.ts";
import { useState } from "react";

// Web 应用地址 - 开发环境默认 localhost:3000
// 生产环境需要修改为实际部署的地址
const WEB_APP_URL = "http://localhost:3000";

export default function Popup() {
  const { pageStatus, settings, loading, error, toggleTranslation, toggleHover, apiKey, saveApiKey } =
    usePopupState();
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  if (loading) {
    return (
      <div className="popup-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popup-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  const handleSaveApiKey = () => {
    saveApiKey(tempApiKey);
    setShowApiKeyInput(false);
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <h1>ReadMind</h1>
        <div className="subtitle">AI 阅读翻译助手</div>
      </div>

      {!apiKey && !showApiKeyInput && (
        <div className="api-key-warning">
          ⚠️ 请先配置 DeepSeek API Key
          <button onClick={() => setShowApiKeyInput(true)}>去配置</button>
        </div>
      )}

      {showApiKeyInput && (
        <div className="api-key-section">
          <input
            type="password"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            placeholder="sk-xxxxxxxxxxxxxxxx"
            className="api-key-input"
          />
          <button onClick={handleSaveApiKey} className="api-key-save">保存</button>
          <button onClick={() => setShowApiKeyInput(false)} className="api-key-cancel">取消</button>
        </div>
      )}

      <div className="status-card">
        <div className="status-row">
          <span className="status-label">API Key</span>
          <span className={`status-value ${apiKey ? "active" : "inactive"}`}>
            {apiKey ? "✓ 已配置" : "✗ 未配置"}
          </span>
        </div>

        <div className="status-row">
          <span className="status-label">页面语言</span>
          <span className="status-value">{pageStatus?.language || "Unknown"}</span>
        </div>

        <div className="status-row">
          <span className="status-label">翻译</span>
          <button
            onClick={toggleTranslation}
            className={`toggle-btn ${pageStatus?.translationEnabled ? "on" : "off"}`}
            disabled={!apiKey}
          >
            {pageStatus?.translationEnabled ? "ON" : "OFF"}
          </button>
        </div>

        <div className="status-row">
          <span className="status-label">悬停翻译</span>
          <button
            onClick={toggleHover}
            className={`toggle-btn ${pageStatus?.hoverEnabled ? "on" : "off"}`}
            disabled={!apiKey}
          >
            {pageStatus?.hoverEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="settings-section">
        <button className="settings-btn" onClick={() => setShowApiKeyInput(true)}>
          🔑 API Key {apiKey ? "✓" : ""}
        </button>
        <button className="nav-btn" onClick={() => chrome.tabs.create({ url: `${WEB_APP_URL}/vocabulary` })}>
          📚 生词本
        </button>
        <button className="nav-btn" onClick={() => chrome.tabs.create({ url: `${WEB_APP_URL}/billing` })}>
          💳 订阅
        </button>
      </div>

      <div className="footer">
        v0.1.0 • 点击开关启用功能
      </div>
    </div>
  );
}
