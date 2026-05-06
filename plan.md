# `plan.md` 技术实现方案

````md
# AI Reading Assistant - Technical Implementation Plan

## 1. 文档目标

本文档描述 AI Reading Assistant 的技术实现方案。

目标：

1. 定义整体系统架构
2. 定义前后端模块边界
3. 定义插件实现方式
4. 定义 AI 调用链路
5. 定义缓存与成本控制方案
6. 定义 MVP 开发顺序
7. 降低后续扩展成本

---

# 2. 技术目标

MVP 阶段核心目标：

- 快速上线
- Chrome 插件稳定
- 翻译体验流畅
- AI 成本可控
- 适配主流技术网站
- 可持续扩展

非目标：

- 一开始支持所有网站
- 一开始支持所有浏览器
- 一开始做复杂 AI Agent
- 一开始做移动端

---

# 3. 总体架构

系统采用：

```text
Browser Extension
    ↓
API Gateway
    ↓
Application Services
    ↓
AI Providers
    ↓
Storage Layer
````

完整结构：

```text
┌────────────────────┐
│ Chrome Extension   │
│                    │
│ - Content Script   │
│ - Popup UI         │
│ - Overlay UI       │
│ - Background SW    │
└─────────┬──────────┘
          │ HTTPS
          ▼
┌────────────────────┐
│ API Gateway        │
│                    │
│ - Auth             │
│ - Rate Limit       │
│ - Request Validate │
└─────────┬──────────┘
          ▼
┌────────────────────┐
│ Application Layer  │
│                    │
│ - Translation      │
│ - Explain Service  │
│ - Vocabulary       │
│ - Quota            │
│ - User Settings    │
└─────────┬──────────┘
          ▼
┌────────────────────┐
│ AI Provider Layer  │
│                    │
│ - OpenAI           │
│ - Claude           │
│ - DeepSeek         │
│ - Gemini           │
└─────────┬──────────┘
          ▼
┌────────────────────┐
│ Storage            │
│                    │
│ - PostgreSQL       │
│ - Redis            │
│ - Blob Storage     │
└────────────────────┘
```

---

# 4. 技术选型

# 4.1 插件端

推荐：

| 技术         | 原因              |
| ---------- | --------------- |
| Plasmo     | Chrome 插件开发体验最佳 |
| React      | UI 开发效率高        |
| TypeScript | 类型安全            |
| Tailwind   | 快速 UI           |
| Zustand    | 轻量状态管理          |

---

# 4.2 后端

MVP 推荐：

```text
Next.js + Hono
```

原因：

* 开发速度快
* TS 全栈统一
* 部署简单
* AI SDK 生态成熟

推荐结构：

```text
apps/
  extension/
  web/
  api/

packages/
  shared/
  ui/
  prompts/
  types/
```

Monorepo：

推荐：

* Turborepo
  或
* pnpm workspace

---

# 4.3 数据库

| 技术         | 用途       |
| ---------- | -------- |
| PostgreSQL | 用户、配置、生词 |
| Redis      | 缓存、限流    |
| S3/R2      | 可选，存储文件  |

---

# 4.4 AI SDK

推荐：

```ts
AI SDK
```

例如：

* Vercel AI SDK
* OpenAI SDK

原因：

* Provider 抽象统一
* 支持流式
* 支持多模型切换

---

# 5. 插件架构

Chrome Extension MV3：

```text
extension/
  background/
  content/
  popup/
  options/
  injected/
```

---

# 5.1 Content Script

职责：

* 扫描 DOM
* 提取正文
* 注入翻译
* 监听动态变化
* 注入浮层

核心逻辑：

```text
页面加载
    ↓
正文识别
    ↓
提取文本节点
    ↓
发送翻译请求
    ↓
插入译文
```

---

# 5.2 Background Service Worker

职责：

* 请求转发
* Token 管理
* 缓存
* 右键菜单
* 消息通信

不建议：

```text
Content Script 直接请求 AI API
```

原因：

* API Key 泄漏
* 安全问题
* 难做限流

---

# 5.3 Overlay UI

用于：

* Hover 翻译
* AI 解释
* Tooltip
* 单词卡片

实现：

推荐：

```text
Shadow DOM
```

避免污染原网页 CSS。

---

# 6. DOM 解析方案

这是最关键模块。

---

# 6.1 文本节点扫描

使用：

```js
TreeWalker
```

扫描：

```js
NodeFilter.SHOW_TEXT
```

跳过：

* script
* style
* code
* pre
* textarea

---

# 6.2 正文识别

优先：

```text
article
main
.markdown-body
.post-content
```

否则：

采用：

```text
Readability
```

类似 Firefox Reader Mode。

推荐库：

```text
@mozilla/readability
```

---

# 6.3 动态页面处理

现代网站：

* React
* Vue
* Next.js

很多内容动态生成。

必须：

```js
MutationObserver
```

监听：

* 新节点
* 无限滚动
* SPA 路由变化

---

# 6.4 避免重复翻译

节点需要：

```html
data-ai-translated="true"
```

避免：

* 无限翻译
* 重复插入
* DOM 死循环

---

# 7. 翻译 Pipeline

# 7.1 流程

```text
DOM Text
    ↓
Clean
    ↓
Chunk
    ↓
Language Detect
    ↓
Term Protect
    ↓
Cache Lookup
    ↓
AI Translate
    ↓
Cache Write
    ↓
Inject DOM
```

---

# 7.2 文本清洗

移除：

* 多余空格
* 重复换行
* 无意义节点

避免：

```text
单个字符
极短文本
按钮文字
```

---

# 7.3 Chunk 策略

不能整页翻译。

推荐：

```text
500~1500 chars
```

原因：

* 成本
* 响应速度
* Token 限制

---

# 7.4 术语保护

非常重要。

例如：

```text
hydration
reconciliation
middleware
```

不要直接翻译。

方案：

```text
术语字典
+ Prompt
+ 正则保护
```

流程：

```text
原文
↓
替换特殊 token
↓
翻译
↓
恢复 token
```

---

# 7.5 缓存

缓存 key：

```text
sha256(text + targetLanguage)
```

Redis：

```text
TTL = 30 days
```

---

# 8. AI 调用策略

# 8.1 模型分层

不要所有请求都走 GPT-5。

推荐：

| 场景    | 模型       |
| ----- | -------- |
| 普通翻译  | DeepSeek |
| 高质量解释 | GPT-5    |
| 长文总结  | Claude   |
| 长上下文  | Gemini   |

---

# 8.2 Prompt 模块化

目录：

```text
packages/prompts/
  translate.ts
  explain.ts
  summarize.ts
```

不要：

```text
Prompt 写死在业务代码
```

---

# 8.3 AI 响应格式

必须结构化：

```json
{
  "translation": "",
  "terms": [],
  "grammar": []
}
```

避免：

```text
纯自然语言
```

否则：

前端难解析。

---

# 9. YouTube 字幕方案

# 9.1 MVP

直接读取：

```text
YouTube Subtitle DOM
```

优点：

* 简单
* 快速

缺点：

* DOM 容易变化

---

# 9.2 后续优化

读取：

```text
caption track
```

更稳定。

---

# 9.3 字幕更新

监听：

```js
MutationObserver
```

检测：

```text
字幕节点变化
```

---

# 10. 生词本方案

# 10.1 数据结构

```ts
type VocabularyItem = {
  word: string
  translation: string
  sentence: string
  sourceUrl: string
}
```

---

# 10.2 收藏方式

用户：

```text
点击单词
↓
Tooltip
↓
加入生词本
```

---

# 11. 用户系统

MVP：

推荐：

```text
Clerk
```

或：

```text
Auth.js
```

支持：

* Google 登录
* GitHub 登录

---

# 12. 额度系统

# 12.1 计量单位

按：

```text
字符数
```

统计。

---

# 12.2 免费版

例如：

| 功能         | 限制            |
| ---------- | ------------- |
| 翻译         | 50k chars/day |
| AI Explain | 20/day        |

---

# 12.3 限流

Redis：

```text
sliding window
```

---

# 13. API 设计

# 13.1 Translate

```http
POST /translate
```

---

# 13.2 Explain

```http
POST /explain
```

---

# 13.3 Vocabulary

```http
POST /vocabulary
GET /vocabulary
```

---

# 14. 数据库设计

# 14.1 Tables

```text
users
user_settings
translation_cache
vocabulary
usage_records
subscriptions
```

---

# 14.2 索引

重点：

```sql
translation_cache(source_hash)
usage_records(user_id, created_at)
```

---

# 15. 安全设计

# 15.1 Content Security

禁止：

```text
任意页面执行危险脚本
```

---

# 15.2 敏感内容过滤

不要上传：

* password
* credit card
* textarea

---

# 15.3 API Key

必须：

```text
只保存在服务端
```

---

# 16. 性能优化

# 16.1 懒翻译

只翻译：

```text
viewport 附近
```

不是整页。

---

# 16.2 虚拟滚动

长页面：

分批处理。

---

# 16.3 批量请求

不要：

```text
一句一句请求
```

应该：

```text
batch translate
```

---

# 17. 监控

推荐：

| 工具            | 用途          |
| ------------- | ----------- |
| Sentry        | 前端错误        |
| PostHog       | 行为分析        |
| OpenTelemetry | API tracing |

---

# 18. 部署

# 18.1 前端

推荐：

```text
Vercel
```

---

# 18.2 API

推荐：

```text
Railway
Render
Fly.io
```

---

# 18.3 Redis

推荐：

```text
Upstash
```

---

# 18.4 PostgreSQL

推荐：

```text
Neon
Supabase
```

---

# 19. MVP 开发顺序

# Week 1

* 插件初始化
* Content Script
* DOM 扫描

---

# Week 2

* 翻译 API
* 双语注入

---

# Week 3

* Hover 翻译
* AI Explain

---

# Week 4

* 登录
* 额度系统
* 生词本

---

# Week 5

* YouTube 字幕
* 缓存优化

---

# 20. 最大技术难点

# 20.1 DOM 兼容性

最难。

不是 AI。

---

# 20.2 动态网站

React/Vue：

DOM constantly changes。

---

# 20.3 成本控制

AI 请求量巨大。

必须：

* 缓存
* 限流
* Chunk
* 懒加载

---

# 21. 推荐 MVP 原则

必须记住：

```text
先解决：
“用户阅读英文技术内容更轻松”
而不是：
“做一个超级 AI 平台”
```

MVP 不追求：

* 全平台
* 全浏览器
* 全视频网站
* 超复杂 Agent

先把：

```text
技术博客 + GitHub
```

做到极致。

---

# 22. 后续架构演进

未来可以增加：

* PDF Parser
* OCR
* Agent Workflow
* Multi-tab Context
* Personal Knowledge Graph
* Team Workspace
* AI Research Assistant

但都不属于 MVP。

```
```
