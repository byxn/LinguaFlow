# ARCHITECTURE.md - AI 阅读翻译助手系统架构

## 1. 架构原则

1. MVP 优先
2. AI 成本可控
3. 插件性能优先
4. 可扩展
5. Provider 可替换
6. 前后端解耦
7. 浏览器兼容性优先

---

## 2. 技术选型

### 2.1 插件端

| 技术 | 原因 |
|------|------|
| Plasmo | Chrome 插件开发体验最佳 |
| React | UI 开发效率高 |
| TypeScript | 类型安全 |
| Tailwind | 快速 UI |
| Zustand | 轻量状态管理 |
| Chrome Extension MV3 | 主流浏览器支持 |

### 2.2 后端

| 技术 | 原因 |
|------|------|
| Next.js + Hono | 开发速度快，TS 全栈统一，部署简单，AI SDK 生态成熟 |
| Turborepo / pnpm workspace | Monorepo 管理 |

**推荐项目结构：**

```text
apps/
  extension/
  web/
  api/

packages/
  shared/
  prompts/
  ui/
  types/
```

### 2.3 数据库

| 技术 | 用途 |
|------|------|
| PostgreSQL | 用户、配置、生词 |
| Redis | 缓存、限流 |
| S3/R2 | 可选，存储文件 |

### 2.4 AI SDK

推荐 `AI SDK`（如 Vercel AI SDK 或 OpenAI SDK），原因：
- Provider 抽象统一
- 支持流式
- 支持多模型切换

### 2.5 AI Provider 分层

| 场景 | 模型 |
|------|------|
| 普通翻译 | DeepSeek |
| 高质量解释 | GPT-5 |
| 长文总结 | Claude |
| 长上下文 | Gemini |

---

## 3. 整体架构

```text
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
│  - Auth                           │
│  - Rate Limit                     │
│  - Request Validate               │
└─────────┬────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ Application Services             │
│  - Translation Service            │
│  - Explain Service                │
│  - Vocabulary Service             │
│  - User Service                   │
│  - Quota Service                  │
└─────────┬────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ AI Orchestrator                  │
│  - Model Routing                  │
│  - Prompt Layer                   │
│  - Retry Logic                    │
│  - Structured Output             │
└─────────┬────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ AI Providers                     │
│  - OpenAI                         │
│  - Claude                         │
│  - Gemini                         │
│  - DeepSeek                       │
└─────────┬────────────────────────┘
          ▼
┌──────────────────────────────────┐
│ Storage Layer                    │
│  - PostgreSQL                     │
│  - Redis                          │
│  - Blob Storage                   │
└──────────────────────────────────┘
```

---

## 4. 插件架构

### 4.1 模块划分

```text
extension/
  background/
  content/
  popup/
  options/
  overlay/
  shared/
```

### 4.2 Content Script

**职责：**
- DOM 扫描（TreeWalker）
- 文本提取
- 正文识别（Readability）
- 页面注入
- MutationObserver 监听
- 文本选择监听

**不负责：**
- AI 请求
- Token 管理
- 用户鉴权

### 4.3 Background Service Worker

**职责：**
- API 请求转发
- Token 管理
- 消息中转
- 缓存
- Context Menu

**核心原因：** 避免 API Key 暴露

### 4.4 Overlay UI

采用 **Shadow DOM**，原因：
- 隔离样式
- 不污染网页
- 避免 CSS 冲突

用于：Tooltip、Explain Card、Vocabulary Card

---

## 5. DOM Pipeline

### 5.1 流程

```text
DOM
 ↓
Main Content Detection
 ↓
TreeWalker Text Scan
 ↓
Text Node Filter
 ↓
Chunk Builder
 ↓
Translation Queue
 ↓
DOM Injection
```

### 5.2 正文识别优先级

1. `article`
2. `main`
3. `[role="main"]`
4. `.markdown-body`
5. `.post-content`
6. `.entry-content`
7. `.article-content`

Fallback：`Mozilla Readability`

### 5.3 TreeWalker 扫描

使用 `document.createTreeWalker()` 配合 `NodeFilter.SHOW_TEXT`

**跳过节点：**
- script、style、code、pre
- textarea、input、select
- button（默认跳过）
- nav、footer（默认低优先级）

### 5.4 动态内容监听

必须使用 `MutationObserver` 监听：
- 新增节点
- SPA 路由变化
- 无限滚动内容
- YouTube 字幕变化

**必须防抖（debounce）**，否则页面会卡。

### 5.5 翻译标记

所有翻译节点标记 `data-ai-translated="true"`，避免重复翻译和 observer 死循环。

---

## 6. Translation Pipeline

### 6.1 流程

```text
Text
 ↓
Normalize
 ↓
Chunk (500~1500 chars)
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

### 6.2 Chunk 策略

推荐 **500~1500 chars**，原因：
- 响应速度
- Token 成本
- AI 稳定性

### 6.3 术语保护

流程：`term replace → AI translate → term restore`

### 6.4 缓存设计

缓存 key：`sha256(sourceText + targetLanguage + model)`

存储：Redis，TTL = 30 days

### 6.5 请求队列

避免同时发送 1000 个请求，采用：
- Request batching
- Queue
- Concurrency control

---

## 7. AI Orchestrator

### 7.1 为什么需要

业务代码不能直接调用模型，否则：
- Prompt 混乱
- 难切模型
- 难控成本

### 7.2 流程

```text
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

### 7.3 Structured Output

必须返回 JSON 结构：

```json
{
  "translation": "",
  "terms": [],
  "grammar": []
}
```

---

## 8. API Gateway

**职责：**
- Auth（JWT 验证）
- Rate limit（Redis sliding window）
- Request validate
- Logging

**禁止：** 插件直接调用 AI Provider

---

## 9. 存储架构

### 9.1 PostgreSQL

存：users、settings、vocabulary、subscriptions、usage_records

### 9.2 Redis

存：translation cache、rate limit、session cache

### 9.3 Blob Storage

后续：PDF、subtitle files、OCR images

---

## 10. 安全设计

### 10.1 数据上传控制

**禁止自动上传：**
- password
- textarea
- payment info

### 10.2 CSP

插件需要严格 CSP

### 10.3 API Security

必须：HTTPS、JWT、Rate limit

---

## 11. 性能设计

### 11.1 懒翻译

只翻译 viewport 附近内容，不是整页。

### 11.2 增量翻译

长页面分批处理，不要整页一次翻译。

### 11.3 防抖

MutationObserver 必须 debounce。

---

## 12. 部署架构

| 组件 | 推荐 |
|------|------|
| 前端 | Vercel |
| API | Railway / Render / Fly.io |
| Redis | Upstash |
| PostgreSQL | Neon / Supabase |

---

## 13. 监控架构

| 工具 | 用途 |
|------|------|
| Sentry | 前端错误 |
| PostHog | 用户行为 |
| OpenTelemetry | API tracing |

---

## 14. MVP 技术边界

**MVP 不做：**
- PDF
- OCR
- Agent Browser
- Multi-browser
- Native App
- Complex Memory Graph

---

## 15. 核心技术风险

| 风险 | 描述 |
|------|------|
| DOM 兼容性 | 最大风险，不同网站结构不同 |
| AI 成本 | 长页面翻译成本高 |
| 字幕同步 | YouTube DOM 变化 |
| 样式污染 | overlay CSS 冲突 |
| SPA rerender | React/Vue DOM 变化 |

---

## 16. 关键成功因素

真正难点：**不是 AI，而是浏览器兼容性 + DOM 工程能力**

真正壁垒：**复杂网站稳定工作**，不是调用 GPT API
