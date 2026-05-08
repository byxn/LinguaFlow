# ReadMind - AI 阅读翻译助手

一个面向外语阅读和技术资料学习的 AI 沉浸式翻译与阅读助手。

## 产品愿景

构建一个 AI 驱动的跨语言阅读与学习工具，让用户在浏览网页、观看视频、阅读技术文档、论文、博客时，可以获得沉浸式双语翻译、上下文解释、术语理解、单词学习和 AI 陪读能力。

## 目标用户

- **程序员**：阅读 GitHub、技术文档、Stack Overflow、RFC、论文
- **英语学习者**：YouTube、Netflix、播客字幕
- **产品/运营/研究人员**：海外竞品、市场报告
- **学生和研究人员**：论文、教材、课程资料

## MVP 优先用户

> 经常阅读英文技术内容的中文程序员

## 核心功能

- [x] 网页双语翻译
- [x] Hover 翻译
- [x] 句子 AI 解释
- [x] 技术术语保留
- [x] YouTube 双语字幕
- [x] 生词本
- [x] 用户登录与额度系统
- [x] 翻译缓存
- [x] 术语保护系统

---

## 项目结构

```
readmind/
├── apps/
│   ├── extension/          # Chrome 插件 (Plasmo)
│   │   └── src/
│   │       ├── content/   # DOM 扫描、翻译注入、ExplainModal
│   │       ├── background/ # 消息处理、右键菜单
│   │       ├── popup/      # 弹窗控制面板
│   │       ├── overlay/    # Tooltip 浮层
│   │       └── youtube/    # YouTube 字幕检测和双字幕
│   ├── api/               # Hono API 服务
│   │   └── src/
│   │       ├── routes/     # API 路由
│   │       ├── providers/   # AI Provider 抽象
│   │       ├── pipeline/   # 翻译处理管道
│   │       ├── orchestrator/# AI 路由编排
│   │       ├── services/    # 缓存、术语、额度、订阅
│   │       └── prisma/      # 数据库 Schema
│   └── web/               # Next.js Web 控制台
│       └── src/app/
│           ├── vocabulary/  # 生词本页面
│           ├── settings/    # 设置页面
│           └── billing/    # 订阅页面
├── packages/
│   ├── types/             # 共享类型定义
│   ├── shared/             # 共享工具
│   ├── prompts/            # AI Prompt
│   └── ui/                # 共享 UI 组件
├── docs/                  # 开发文档
├── .github/workflows/      # GitHub Actions CI/CD
└── README.md
```

---

## 技术栈

### 插件端

| 技术 | 说明 |
|------|------|
| Plasmo | Chrome 插件开发框架 |
| React | UI 开发 |
| TypeScript | 类型安全 |
| Tailwind CSS | 快速 UI |
| Zustand | 轻量状态管理 |
| Chrome MV3 | 浏览器扩展清单 v3 |

### 后端

| 技术 | 说明 |
|------|------|
| Hono | 轻量 API 框架 |
| Next.js | Web 控制台 |
| TypeScript | 类型安全 |
| Prisma | ORM |
| PostgreSQL | 主数据库 |
| Redis | 缓存/限流 |

### AI

| 技术 | 说明 |
|------|------|
| OpenAI | 高质量解释 |
| DeepSeek | 低成本翻译 |
| Claude | 长文分析 |
| Gemini | 长上下文 |

---

## 核心模块

### DOM Scanner (`apps/extension/src/content/domScanner.ts`)

- TreeWalker DOM 扫描
- Readability 正文识别
- 正文区域优先级：article > main > .markdown-body

### Translation Pipeline (`apps/api/src/pipeline/`)

- 文本规范化 (normalize)
- Chunk 分割 (500~1500 chars)
- 语言检测
- 术语保护
- 结果合并

### AI Provider (`apps/api/src/providers/`)

- BaseProvider 抽象基类
- DeepSeekProvider / OpenAIProvider
- 术语自动保护与恢复

### AI Orchestrator (`apps/api/src/orchestrator/`)

- 翻译请求 → DeepSeek
- 解释请求 → OpenAI
- 可配置路由策略

### Services (`apps/api/src/services/`)

| 服务 | 说明 |
|------|------|
| CacheService | 内存缓存，SHA256 key，30天 TTL |
| GlossaryService | 术语保护，支持自定义术语 |
| QuotaService | 额度控制，日限额 |
| SubscriptionService | 订阅管理 |
| SubtitleCacheService | YouTube 字幕缓存 |

---

## 扩展消息架构

### 3 层消息传递

扩展采用 **Popup → Background → Content Script** 的消息路由架构：

```
┌─────────────┐     chrome.runtime.sendMessage      ┌──────────────────┐
│   Popup     │ ──────────────────────────────────► │   Background     │
│  (弹窗 UI)  │                                     │  (Service Worker)│
└─────────────┘                                     └────────┬─────────┘
                                                             │
                                                    chrome.tabs.sendMessage
                                                             │
                                                             ▼
                                                    ┌──────────────────┐
                                                    │  Content Script  │
                                                    │   (注入到网页)    │
                                                    └──────────────────┘
```

### 消息类型定义

所有消息类型在 [apps/extension/src/types.ts](apps/extension/src/types.ts) 中定义：

```typescript
export interface ExtensionMessage {
  type:
    | "TRANSLATE"           // 翻译文本
    | "EXPLAIN"            // AI 解释
    | "TOGGLE_TRANSLATION"  // 开关翻译模式
    | "TOGGLE_HOVER"       // 开关悬停翻译
    | "SHOW_HOVER"         // 显示悬停翻译
    | "GET_SETTINGS"       // 获取设置
    | "UPDATE_SETTINGS"    // 更新设置
    | "GET_STATUS";        // 获取状态
  payload?: unknown;
}
```

### Background 消息路由

[background.ts](apps/extension/src/background/background.ts) 是消息路由中心：

| 消息类型 | 处理逻辑 |
|---------|---------|
| `TRANSLATE` | 转发给 API `/api/translate` |
| `SHOW_HOVER` | 转发给 API `/api/translate`，返回翻译结果 |
| `TOGGLE_TRANSLATION` | 转发给 Content Script 切换翻译模式 |
| `TOGGLE_HOVER` | 更新 hoverModeMap 状态，转发给 Content Script |
| `GET_STATUS` | 返回当前 tab 的翻译/悬停状态 |

### Content Script 状态管理

[content.ts](apps/extension/src/content.ts) 管理页面翻译状态：

```typescript
let translationEnabled = false;  // 翻译模式
let isHoverMode = false;        // 悬停模式
const translatedNodes = new Map<Text, TranslationState>();  // 已翻译节点
```

---

## 开发指南

### 目录结构

```
apps/extension/src/
├── background/      # Service Worker (后台消息路由)
├── content.ts       # Content Script (注入到网页)
├── popup/           # 弹窗 UI
│   ├── Popup.tsx    # 主组件
│   ├── usePopupState.ts  # 状态管理
│   └── style.css    # Tailwind 样式
├── inject/          # 页面注入组件
│   ├── domScanner.ts # DOM 扫描
│   └── ExplainModal.tsx # 解释弹窗
├── overlay/         # 悬浮窗组件
├── youtube/         # YouTube 字幕处理
└── types.ts         # 类型定义
```

### 添加新功能

#### 1. 添加新的消息类型

**Step 1:** 在 `types.ts` 添加消息类型
```typescript
// apps/extension/src/types.ts
type: "TRANSLATE" | "NEW_FEATURE" | ...;
```

**Step 2:** 在 `background.ts` 添加处理逻辑
```typescript
case "NEW_FEATURE": {
  const { data } = message.payload as { data: any };
  // 处理逻辑
  return { success: true, data: result };
}
```

**Step 3:** 在 `content.ts` 的 `handleMessage` 添加对应处理

#### 2. 添加新的 API 端点

**Step 1:** 在 `apps/api/src/routes/` 创建新路由文件
```typescript
// apps/api/src/routes/myfeature.ts
const myfeatureRoute = new Hono();
myfeatureRoute.post("/myfeature", async (c) => {
  // 处理逻辑
});
export { myfeatureRoute };
```

**Step 2:** 在 `apps/api/src/index.ts` 注册路由
```typescript
import { myfeatureRoute } from "./routes/myfeature.ts";
app.route("/api", myfeatureRoute);
```

#### 3. 添加新的 Web 页面

在 `apps/web/src/app/` 创建新页面目录：
```
apps/web/src/app/newpage/page.tsx
```
### 项目启动

```bash
# 安装依赖
pnpm install

# 开发所有应用
pnpm dev

# 单独启动
cd apps/api && pnpm dev      # API: http://localhost:3002
cd apps/web && pnpm dev      # Web: http://localhost:3000
```

### 添加新的 AI Provider

**Step 1:** 在 `providers/types.ts` 添加新类型
```typescript
type ModelType = "deepseek" | "openai" | "claude" | "gemini";
```

**Step 2:** 创建 Provider 文件
```typescript
// apps/api/src/providers/claude.ts
export class ClaudeProvider extends BaseProvider {
  name = "claude";
  async doTranslate(text, options) { ... }
}
```

**Step 3:** 在 `providers/index.ts` 注册
```typescript
const PROVIDERS: Record<ModelType, new () => AIProvider> = {
  claude: ClaudeProvider,
  // ...
};
```

---

## 已完成任务

| 阶段 | 任务 | 状态 |
|------|------|------|
| **Phase 0** | T-001 Monorepo | ✅ |
| | T-002 Chrome 插件 | ✅ |
| **Phase 1** | T-006 API 服务 | ✅ |
| | T-007 Translate API | ✅ |
| | T-008 AI Provider | ✅ |
| | T-009 Translation Pipeline | ✅ |
| | T-010 译文注入 | ✅ |
| | T-011 Hover 翻译 | ✅ |
| | T-012 Popup 控制面板 | ✅ |
| | T-013 动态 DOM 监听 | ✅ |
| | T-014 缓存系统 | ✅ |
| | T-015 术语保护 | ✅ |
| **Phase 2** | T-016 Explain API | ✅ |
| | T-017 Explain Tooltip | ✅ |
| | T-018 技术术语系统 | ✅ |
| | T-019 页面摘要 | ✅ |
| | T-020 生词本 | ✅ |
| | T-021 用户系统 | ✅ |
| | T-022 用户设置 | ✅ |
| **Phase 3** | T-023 YouTube 识别 | ✅ |
| | T-024 双语字幕 | ✅ |
| | T-025 字幕点击解释 | ✅ |
| | T-026 字幕缓存 | ✅ |
| **Phase 4** | T-027 用量统计 | ✅ |
| | T-028 订阅系统 | ✅ |
| | T-029 Billing UI | ✅ |
| **数据库** | T-030 Prisma Schema | ✅ |
| | T-031 Migration | ✅ |
| **DevOps** | T-032 CI/CD | ✅ |
| | T-033 Deploy | ✅ |
| | T-034 Monitoring | ✅ |

---

## 开发

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 开发所有应用
pnpm dev

# 开发特定应用
pnpm --filter @readmind/extension dev
pnpm --filter @readmind/api dev
pnpm --filter @readmind/web dev
```

### 构建

```bash
pnpm build
```

### 类型检查

```bash
pnpm typecheck
```

---

## 环境变量

```env
# API
PORT=3001
DATABASE_URL=postgresql://localhost:5432/linguaflow
REDIS_URL=redis://localhost:6379

# AI Providers
OPENAI_API_KEY=sk-...
DEEPSEEK_API_KEY=sk-...
```

---

## 架构设计原则

1. **MVP 优先** - 先解决"用户阅读英文技术内容更轻松"
2. **AI 成本可控** - 缓存 + 分层模型 + 额度控制
3. **插件性能优先** - 懒加载 + 防抖 + 增量翻译
4. **可扩展** - Provider/Service/Prompt 抽象
5. **前后端解耦** - API Gateway 统一入口
6. **浏览器兼容性优先** - DOM 工程能力是核心壁垒

---

## 文档

开发文档放在 `docs/` 目录：

| 文档 | 说明 |
|------|------|
| [docs/SPEC.md](./docs/SPEC.md) | 产品需求规格 |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 系统架构设计 |
| [docs/TASKS.md](./docs/TASKS.md) | 开发任务拆解 |
| [docs/API.md](./docs/API.md) | API 接口文档 |
| [docs/DATABASE.md](./docs/DATABASE.md) | 数据库设计 |

---

## License

MIT
