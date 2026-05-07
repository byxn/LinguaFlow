# TASKS.md - AI 阅读翻译助手开发任务

## 1. 开发阶段

| 阶段 | 目标 |
|------|------|
| Phase 0 | 技术验证 |
| Phase 1 | 网页双语 MVP |
| Phase 2 | AI 阅读增强 |
| Phase 3 | YouTube 字幕 |
| Phase 4 | 商业化能力 |

---

## 2. Phase 0 - 技术验证

**目标：** 验证浏览器插件核心能力

### T-001：初始化 Monorepo

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | - |
| 验收标准 | 项目可运行，workspace link 正常，TS path alias 正常 |

**任务：**
- [ ] 初始化 pnpm workspace
- [ ] 初始化 Turborepo
- [ ] 创建 apps/extension
- [ ] 创建 apps/web
- [ ] 创建 apps/api
- [ ] 创建 packages/shared
- [ ] 创建 packages/types

### T-002：初始化 Chrome 插件

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-001 |
| 验收标准 | 插件可加载，popup 可打开，content script 可执行 |

**任务：**
- [ ] 初始化 Plasmo
- [ ] 配置 Manifest V3
- [ ] 创建 popup 页面
- [ ] 创建 content script
- [ ] 创建 background service worker
- [ ] 支持开发热更新

### T-003：DOM 扫描能力

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-002 |
| 验收标准 | 能扫描正文文本，不扫描代码块，页面不卡顿 |

**任务：**
- [ ] 实现 TreeWalker 扫描
- [ ] 跳过 code/pre/script/style
- [ ] 过滤短文本
- [ ] 输出文本节点列表

### T-004：正文识别

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-002 |
| 验收标准 | Medium 页面正常，GitHub README 正常，博客页面正文准确率较高 |

**任务：**
- [ ] 接入 Readability
- [ ] article 优先识别
- [ ] GitHub README 适配
- [ ] fallback 策略

### T-005：Mock 翻译

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-003 |
| 验收标准 | 页面出现双语，布局不明显错乱 |

**任务：**
- [ ] 创建 mock translate function
- [ ] 返回假翻译
- [ ] 插入 DOM

---

## 3. Phase 1 - 网页双语 MVP

**目标：** 完成最小可用翻译体验

### T-006：API 服务初始化

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-001 |
| 验收标准 | API 可访问，Extension 可请求 |

**任务：**
- [ ] 初始化 Hono/Next API
- [ ] 创建 REST API
- [ ] 配置 CORS
- [ ] 配置环境变量
- [ ] 配置日志

### T-007：Translate API

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-006 |
| 验收标准 | 返回翻译结果，错误处理正常 |

**任务：**
- [ ] POST /api/translate
- [ ] 请求 schema 校验
- [ ] 文本切块
- [ ] 调用 AI Provider
- [ ] 返回结构化结果

### T-008：AI Provider 抽象层

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-006 |
| 验收标准 | 能切换模型，接口统一 |

**任务：**
- [ ] 创建 provider interface
- [ ] 接入 OpenAI
- [ ] 接入 DeepSeek
- [ ] provider 配置切换

### T-009：Translation Pipeline

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-007, T-008 |
| 验收标准 | 长文本可翻译，chunk 不错乱 |

**任务：**
- [ ] 文本清洗
- [ ] chunk split
- [ ] language detect
- [ ] term protect
- [ ] translate
- [ ] result merge

### T-010：译文注入

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-005 |
| 验收标准 | 页面可恢复，不重复插入 |

**任务：**
- [ ] paragraph translation UI
- [ ] DOM insertion
- [ ] 保持原文
- [ ] remove translation

### T-011：Hover 翻译

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-010 |
| 验收标准 | hover 出现 tooltip，tooltip 不闪烁 |

**任务：**
- [ ] hover listener
- [ ] tooltip UI
- [ ] selection handling
- [ ] translate selected text

### T-012：Popup 控制面板

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-002 |
| 验收标准 | popup 可控制页面行为 |

**任务：**
- [ ] 翻译开关
- [ ] Hover 开关
- [ ] 当前语言
- [ ] 当前网站状态
- [ ] 登录状态

### T-013：动态 DOM 监听

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-003 |
| 验收标准 | React/Vue 页面可工作 |

**任务：**
- [ ] MutationObserver
- [ ] debounce
- [ ] detect SPA route change
- [ ] avoid infinite loop

### T-014：缓存系统

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-007 |
| 验收标准 | 重复文本不重复请求 |

**任务：**
- [ ] Redis 初始化
- [ ] text hash
- [ ] cache lookup
- [ ] cache write
- [ ] cache TTL

### T-015：术语保护

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-009 |
| 验收标准 | hydration 不翻译成"水合作用" |

**任务：**
- [ ] code block protect
- [ ] API name protect
- [ ] glossary
- [ ] regex rules

---

## 4. Phase 2 - AI 阅读增强

**目标：** 区别于普通翻译插件

### T-016：Explain API

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-008 |
| 验收标准 | 返回结构化解释 |

**任务：**
- [ ] POST /api/explain
- [ ] explain prompt
- [ ] structured response
- [ ] grammar extraction
- [ ] keyword extraction

### T-017：Explain Tooltip

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-016 |
| 验收标准 | 可点击句子解释 |

**任务：**
- [ ] sentence selection
- [ ] explain modal
- [ ] loading state
- [ ] retry state

### T-018：技术术语系统

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-016 |
| 验收标准 | 技术术语解释更准确 |

**任务：**
- [ ] glossary DB
- [ ] custom glossary
- [ ] domain detect
- [ ] technical prompt

### T-019：页面摘要

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-016 |
| 验收标准 | 可生成摘要 |

**任务：**
- [ ] summarize API
- [ ] article extraction
- [ ] summary card

### T-020：生词本

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-006 |
| 验收标准 | 可收藏生词 |

**任务：**
- [ ] vocabulary schema
- [ ] add vocabulary
- [ ] vocabulary page
- [ ] delete vocabulary

### T-021：用户系统

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-006 |
| 验收标准 | 用户状态稳定 |

**任务：**
- [ ] login
- [ ] logout
- [ ] token refresh
- [ ] auth middleware

### T-022：用户设置

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-021 |
| 验收标准 | 设置持久化 |

**任务：**
- [ ] target language
- [ ] translation mode
- [ ] AI level
- [ ] glossary settings

---

## 5. Phase 3 - YouTube 字幕

**目标：** 实现视频学习能力

### T-023：YouTube 识别

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-003 |
| 验收标准 | 可获取字幕文本 |

**任务：**
- [ ] detect YouTube
- [ ] subtitle DOM detect
- [ ] subtitle observer

### T-024：双语字幕

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-023 |
| 验收标准 | 字幕同步 |

**任务：**
- [ ] subtitle translation
- [ ] subtitle overlay
- [ ] sync update

### T-025：字幕点击解释

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-024 |
| 验收标准 | 可解释字幕 |

**任务：**
- [ ] click subtitle
- [ ] explain subtitle
- [ ] add vocabulary

### T-026：字幕缓存

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-024 |
| 验收标准 | 重复字幕不重复翻译 |

**任务：**
- [ ] subtitle segment hash
- [ ] cache layer

---

## 6. Phase 4 - 商业化

### T-027：用量统计

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-021 |
| 验收标准 | 能限制免费用户 |

**任务：**
- [ ] usage record
- [ ] token estimate
- [ ] daily quota

### T-028：订阅系统

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-027 |
| 验收标准 | 可升级 Pro |

**任务：**
- [ ] Stripe
- [ ] webhook
- [ ] subscription sync

### T-029：Billing UI

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-028 |
| 验收标准 | 用户可查看用量和升级 |

**任务：**
- [ ] pricing page
- [ ] usage page
- [ ] billing page

---

## 7. 数据库任务

### T-030：Prisma

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | - |
| 验收标准 | schema 定义完整 |

**任务：**
- [ ] init prisma
- [ ] user schema
- [ ] vocabulary schema
- [ ] translation cache schema
- [ ] usage schema

### T-031：Migration

| 项目 | 内容 |
|------|------|
| 优先级 | P0 |
| blockedBy | T-030 |
| 验收标准 | 可正常迁移 |

**任务：**
- [ ] initial migration
- [ ] seed script

---

## 8. DevOps

### T-032：CI/CD

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-001 |
| 验收标准 | GitHub Actions 正常 |

**任务：**
- [ ] GitHub Actions
- [ ] lint
- [ ] typecheck
- [ ] build

### T-033：Deploy

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-032 |
| 验收标准 | 可部署到生产环境 |

**任务：**
- [ ] Vercel deploy
- [ ] API deploy
- [ ] Redis deploy

### T-034：Monitoring

| 项目 | 内容 |
|------|------|
| 优先级 | P1 |
| blockedBy | T-033 |
| 验收标准 | 监控可用 |

**任务：**
- [ ] Sentry
- [ ] PostHog
- [ ] logs

---

## 9. MVP Definition of Done

MVP 完成标准：

- [ ] GitHub README 可稳定双语翻译
- [ ] 技术博客可稳定翻译
- [ ] Hover 翻译可用
- [ ] Explain 可用
- [ ] 生词本可用
- [ ] 登录与额度可用
- [ ] YouTube 双语字幕可用
- [ ] 页面不会明显卡顿
- [ ] 成本可控

---

## 10. 推荐开发顺序

```
1. 插件注入
2. DOM 扫描
3. Mock 翻译
4. 真正 AI 翻译
5. 缓存
6. Explain
7. 用户系统
8. 生词本
9. YouTube
10. 订阅
```

**不要：**
- 一开始做复杂 Agent
- 一开始做 PDF
- 一开始做移动端

---

## 11. 风险清单

| 风险 | 描述 | 应对 |
|------|------|------|
| DOM 破坏 | 插件影响页面 | 从有限网站开始适配 |
| 无限翻译 | observer 死循环 | data-ai-translated 标记 |
| React rerender | 翻译节点丢失 | MutationObserver 优化 |
| 样式污染 | overlay CSS 冲突 | Shadow DOM |
| API 成本 | 长页面爆 token | 缓存 + 限流 |
| 字幕延迟 | YouTube sync 问题 | 字幕 track 优先 |
