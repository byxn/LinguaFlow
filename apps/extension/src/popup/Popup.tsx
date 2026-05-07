import { usePopupState } from "./usePopupState.ts";

export default function Popup() {
  const { pageStatus, settings, loading, error, toggleTranslation, toggleHover } =
    usePopupState();

  if (loading) {
    return (
      <div className="p-4 w-72">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 w-72">
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 w-72 font-sans bg-white">
      <h1 className="text-lg font-bold mb-4 text-gray-800">LinguaFlow</h1>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Page Language:</span>
          <span className="text-sm font-medium text-gray-800">
            {pageStatus?.language || "Unknown"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Translatable:</span>
          <span
            className={`text-sm ${
              pageStatus?.isTranslatable ? "text-green-600" : "text-gray-400"
            }`}
          >
            {pageStatus?.isTranslatable ? "Yes" : "No"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Translation:</span>
          <button
            onClick={toggleTranslation}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              pageStatus?.translationEnabled
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {pageStatus?.translationEnabled ? "ON" : "OFF"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Hover Mode:</span>
          <button
            onClick={toggleHover}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              settings?.autoTranslate
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {settings?.autoTranslate ? "ON" : "OFF"}
          </button>
        </div>

        <hr className="my-3 border-gray-200" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Target:</span>
          <select
            className="text-sm border border-gray-300 rounded px-2 py-1"
            defaultValue={settings?.targetLanguage || "zh-CN"}
          >
            <option value="zh-CN">中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Preserve Terms:</span>
          <span className="text-sm">
            {settings?.preserveTerms ? "Yes" : "No"}
          </span>
        </div>

        <hr className="my-3 border-gray-200" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <span
            className={`text-sm ${
              pageStatus?.translationEnabled
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            {pageStatus?.translationEnabled ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <button className="mt-4 w-full py-2 px-4 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors">
        Settings
      </button>
    </div>
  );
}
