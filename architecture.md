# `architecture.md` 系统架构文档

```md id="ddc4jj"
# AI Reading Assistant - Architecture Document

## 1. 文档目标

本文档描述系统级架构设计。

包含：

- 系统模块划分
- 服务边界
- 数据流
- 插件架构
- AI 调用架构
- 缓存架构
- 扩展性设计
- 安全设计

---

# 2. 架构原则

系统设计原则：

1. MVP 优先
2. AI 成本可控
3. 插件性能优先
4. 可扩展
5. Provider 可替换
6. 前后端解耦
7. 浏览器兼容性优先

---

# 3. 整体架构

```text id="2ef0h8"
┌──────────────────────────────────┐
│ Browser Extension                │
│                                  │
│  ┌──────────────┐                │
│  │ Popup UI     │                │
│  └──────┬───────┘                │
│         │                        │
│  ┌──────▼───────┐                │
│  │ Content      │                │
│  │ Script       │                │
│  └──────┬───────┘                │
│         │                        │
│  ┌──────▼───────┐                │
│  │ Overlay UI   │                │
│  └──────┬───────┘                │
│         │                        │
│  ┌──────▼───────┐                │
│  │ Background   │                │
│  │ Service SW   │                │
│  └──────┬───────┘                │
└─────────┼────────────────────────┘
          │ HTTPS
          ▼
┌──────────────────────────────────┐
│ API Gateway                      │
└─────────┬────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ Application Services             │
│                                  │
│ - Translation Service            │
│ - Explain Service                │
│ - Vocabulary Service             │
│ - User Service                   │
│ - Quota Service                  │
└─────────┬────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ AI Orchestrator                  │
│                                  │
│ - Model Routing                  │
│ - Prompt Layer                   │
│ - Retry Logic                    │
│ - Structured Output              │
└─────────┬────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ AI Providers                     │
│                                  │
│ - OpenAI                         │
│ - Claude                         │
│ - Gemini                         │
│ - DeepSeek                       │
└─────────┬────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ Storage Layer                    │
│                                  │
│ - PostgreSQL                     │
│ - Redis                          │
│ - Blob Storage                   │
└──────────────────────────────────┘
````

---

# 4. 插件架构

# 4.1 模块划分

```text id="n88ccj"
extension/
  background/
  content/
  popup/
  options/
  overlay/
  shared/
```

---

# 4.2 Content Script

职责：

* DOM 扫描
* 文本提取
* 页面注入
* MutationObserver
* 文本选择监听

不负责：

* AI 请求
* Token 管理
* 用户鉴权

---

# 4.3 Background Service Worker

职责：

* API 请求
* Token 管理
* 消息中转
* 缓存
* Context Menu

核心原因：

```text
避免 API Key 暴露
```

---

# 4.4 Overlay UI

采用：

```text
Shadow DOM
```

原因：

* 隔离样式
* 不污染网页
* 避免 CSS 冲突

用于：

* Tooltip
* Explain Card
* Vocabulary Card

---

# 5. DOM 架构

这是核心。

---

# 5.1 DOM Pipeline

```text id="7jmx2v"
DOM
 ↓
Main Content Detection
 ↓
TreeWalker
 ↓
Text Node Filter
 ↓
Chunk Builder
 ↓
Translation Queue
 ↓
DOM Injection
```

---

# 5.2 Main Content Detection

优先：

```text
article
main
.markdown-body
```

Fallback：

```text
Mozilla Readability
```

---

# 5.3 TreeWalker

使用：

```js
document.createTreeWalker()
```

原因：

* 高性能
* 精确
* 可过滤

---

# 5.4 Skip Rules

跳过：

```text
script
style
code
pre
textarea
input
```

避免：

* 翻译代码
* 翻译输入框
* 页面异常

---

# 5.5 Dynamic DOM

现代网页：

* React
* Vue
* Next.js

必须：

```js
MutationObserver
```

监听：

* 新节点
* SPA 路由
* Infinite Scroll

---

# 5.6 Translation Marking

所有翻译节点：

```html
data-ai-translated="true"
```

避免：

* 重复翻译
* observer 死循环

---

# 6. Translation Architecture

# 6.1 Translation Pipeline

```text id="t5s4wa"
Text
 ↓
Normalize
 ↓
Chunk
 ↓
Language Detect
 ↓
Glossary Protect
 ↓
Cache Lookup
 ↓
AI Translate
 ↓
Cache Save
 ↓
Inject Translation
```

---

# 6.2 Chunk Strategy

推荐：

```text
500~1500 chars
```

原因：

* 响应速度
* Token 成本
* AI 稳定性

---

# 6.3 Glossary Protection

技术术语：

```text
hydration
middleware
reconciliation
```

流程：

```text
term replace
 ↓
AI translate
 ↓
term restore
```

---

# 6.4 Translation Cache

缓存 key：

```text
sha256(
  sourceText +
  targetLanguage +
  model
)
```

存储：

Redis

---

# 6.5 Translation Queue

避免：

```text
1000 个请求同时发送
```

采用：

```text
request batching
queue
concurrency control
```

---

# 7. AI Orchestrator

# 7.1 为什么需要

不能：

```text
业务代码直接调用模型
```

否则：

* Prompt 混乱
* 难切模型
* 难控成本

---

# 7.2 架构

```text id="b7hdbt"
Request
 ↓
Intent Detection
 ↓
Provider Routing
 ↓
Prompt Builder
 ↓
Model Call
 ↓
Structured Parse
 ↓
Response
```

---

# 7.3 Model Routing

| 场景    | 模型       |
| ----- | -------- |
| 普通翻译  | DeepSeek |
| 高质量解释 | GPT-5    |
| 长文总结  | Claude   |
| 超长上下文 | Gemini   |

---

# 7.4 Structured Output

必须 JSON。

不要：

```text
自然语言乱输出
```

推荐：

```json
{
  "translation": "",
  "terms": [],
  "grammar": []
}
```

---

# 8. 用户架构

# 8.1 User Service

负责：

* 登录
* 用户资料
* 订阅
* 配置

---

# 8.2 User Settings

包含：

* target language
* translation mode
* AI level
* glossary

---

# 8.3 Auth

推荐：

* Clerk
  或
* Auth.js

支持：

* Google
* GitHub

---

# 9. Vocabulary Architecture

# 9.1 数据流

```text id="kib1wr"
Click Word
 ↓
Vocabulary Card
 ↓
Save API
 ↓
Database
```

---

# 9.2 Vocabulary Schema

```ts
type VocabularyItem = {
  word: string
  translation: string
  sentence: string
  sourceUrl: string
}
```

---

# 10. YouTube 架构

# 10.1 MVP

读取：

```text
subtitle DOM
```

---

# 10.2 Subtitle Flow

```text id="87v9yw"
Subtitle Change
 ↓
Extract Text
 ↓
Cache Lookup
 ↓
Translate
 ↓
Overlay Render
```

---

# 10.3 Sync

字幕必须：

* 低延迟
* 高缓存命中

否则体验很差。

---

# 11. Storage Architecture

# 11.1 PostgreSQL

存：

* users
* settings
* vocabulary
* subscriptions
* usage_records

---

# 11.2 Redis

存：

* translation cache
* rate limit
* session cache

---

# 11.3 Blob Storage

后续：

* PDF
* subtitle files
* OCR images

---

# 12. API Gateway

职责：

* Auth
* Rate limit
* Request validate
* Logging

不要：

```text
插件直接调用 AI Provider
```

---

# 13. 安全架构

# 13.1 数据上传控制

禁止自动上传：

* password
* textarea
* payment info

---

# 13.2 CSP

插件需要：

```text
严格 CSP
```

---

# 13.3 API Security

必须：

* HTTPS
* JWT
* Rate limit

---

# 14. 性能架构

# 14.1 Lazy Translate

只翻译：

```text
viewport nearby
```

---

# 14.2 Incremental Translate

不要：

```text
整页一次翻译
```

---

# 14.3 Debounce

MutationObserver 必须：

```text
debounce
```

否则页面会卡。

---

# 15. 可扩展架构

未来支持：

* PDF
* EPUB
* OCR
* Mobile App
* Team Workspace
* AI Agent

所以：

必须：

```text
Provider abstraction
Service abstraction
Prompt abstraction
```

---

# 16. 监控架构

推荐：

| 工具            | 用途      |
| ------------- | ------- |
| Sentry        | 错误监控    |
| PostHog       | 用户行为    |
| OpenTelemetry | tracing |

---

# 17. 部署架构

# 17.1 Frontend

推荐：

```text
Vercel
```

---

# 17.2 API

推荐：

```text
Railway
Render
Fly.io
```

---

# 17.3 Redis

推荐：

```text
Upstash
```

---

# 17.4 PostgreSQL

推荐：

```text
Neon
Supabase
```

---

# 18. MVP 技术边界

MVP 不做：

* PDF
* OCR
* Agent Browser
* Multi-browser
* Native App
* Complex Memory Graph

---

# 19. 核心技术风险

| 风险           | 描述        |
| ------------ | --------- |
| DOM 兼容性      | 最大风险      |
| AI 成本        | 长页面       |
| 字幕同步         | YouTube   |
| 样式污染         | overlay   |
| SPA rerender | React/Vue |

---

# 20. 关键成功因素

真正难点：

```text
不是 AI
而是：
浏览器兼容性 + DOM 工程能力
```

真正壁垒：

```text
复杂网站稳定工作
```

不是：

```text
调用 GPT API
```

```
```
