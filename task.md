# `tasks.md` 开发任务拆解

````md id="jlwmtt"
# AI Reading Assistant - Development Tasks

## 1. 文档目标

本文档用于：

- 拆解 MVP 开发任务
- 定义任务优先级
- 明确模块边界
- 明确交付标准
- 支持多人协作开发

开发模式：

```text
Spec → Plan → Tasks → Implementation
````

---

# 2. 项目结构

推荐 Monorepo：

```text id="qjlwm1"
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

---

# 3. 开发阶段

| 阶段      | 目标         |
| ------- | ---------- |
| Phase 0 | 技术验证       |
| Phase 1 | 网页双语 MVP   |
| Phase 2 | AI 阅读增强    |
| Phase 3 | YouTube 字幕 |
| Phase 4 | 商业化能力      |

---

# 4. Phase 0 - 技术验证

目标：

验证：

* 插件可注入
* DOM 可扫描
* 可插入翻译
* 不破坏页面

---

# 4.1 初始化 Monorepo

优先级：P0

任务：

* [ ] 初始化 pnpm workspace
* [ ] 初始化 Turborepo
* [ ] 创建 apps/extension
* [ ] 创建 apps/web
* [ ] 创建 apps/api
* [ ] 创建 packages/shared
* [ ] 创建 packages/types

验收标准：

* 项目可运行
* workspace link 正常
* TS path alias 正常

---

# 4.2 初始化 Chrome 插件

优先级：P0

任务：

* [ ] 初始化 Plasmo
* [ ] 配置 Manifest V3
* [ ] 创建 popup 页面
* [ ] 创建 content script
* [ ] 创建 background service worker
* [ ] 支持开发热更新

验收标准：

* 插件可加载
* popup 可打开
* content script 可执行

---

# 4.3 DOM 扫描能力

优先级：P0

任务：

* [ ] 实现 TreeWalker 扫描
* [ ] 跳过 code/pre/script/style
* [ ] 过滤短文本
* [ ] 输出文本节点列表

验收标准：

* 能扫描正文文本
* 不扫描代码块
* 页面不卡顿

---

# 4.4 正文识别

优先级：P0

任务：

* [ ] 接入 Readability
* [ ] article 优先识别
* [ ] GitHub README 适配
* [ ] fallback 策略

验收标准：

* Medium 页面正常
* GitHub README 正常
* 博客页面正文准确率较高

---

# 4.5 Mock 翻译

优先级：P0

任务：

* [ ] 创建 mock translate function
* [ ] 返回假翻译
* [ ] 插入 DOM

验收标准：

* 页面出现双语
* 布局不明显错乱

---

# 5. Phase 1 - 网页双语 MVP

目标：

完成最小可用翻译体验。

---

# 5.1 API 服务初始化

优先级：P0

任务：

* [ ] 初始化 Hono/Next API
* [ ] 创建 REST API
* [ ] 配置 CORS
* [ ] 配置环境变量
* [ ] 配置日志

验收标准：

* API 可访问
* Extension 可请求

---

# 5.2 Translate API

优先级：P0

任务：

* [ ] POST /translate
* [ ] 请求 schema 校验
* [ ] 文本切块
* [ ] 调用 AI Provider
* [ ] 返回结构化结果

验收标准：

* 返回翻译结果
* 错误处理正常

---

# 5.3 AI Provider 抽象层

优先级：P0

任务：

* [ ] 创建 provider interface
* [ ] 接入 OpenAI
* [ ] 接入 DeepSeek
* [ ] provider 配置切换

目录：

```text
providers/
  openai.ts
  deepseek.ts
```

验收标准：

* 能切换模型
* 接口统一

---

# 5.4 Translation Pipeline

优先级：P0

任务：

* [ ] 文本清洗
* [ ] chunk split
* [ ] language detect
* [ ] term protect
* [ ] translate
* [ ] result merge

验收标准：

* 长文本可翻译
* chunk 不错乱

---

# 5.5 译文注入

优先级：P0

任务：

* [ ] paragraph translation UI
* [ ] DOM insertion
* [ ] 保持原文
* [ ] remove translation

验收标准：

* 页面可恢复
* 不重复插入

---

# 5.6 Hover 翻译

优先级：P1

任务：

* [ ] hover listener
* [ ] tooltip UI
* [ ] selection handling
* [ ] translate selected text

验收标准：

* hover 出现 tooltip
* tooltip 不闪烁

---

# 5.7 Popup 控制面板

优先级：P1

任务：

* [ ] 翻译开关
* [ ] Hover 开关
* [ ] 当前语言
* [ ] 当前网站状态
* [ ] 登录状态

验收标准：

* popup 可控制页面行为

---

# 5.8 动态 DOM 监听

优先级：P1

任务：

* [ ] MutationObserver
* [ ] debounce
* [ ] detect SPA route change
* [ ] avoid infinite loop

验收标准：

* React/Vue 页面可工作

---

# 5.9 缓存系统

优先级：P1

任务：

* [ ] Redis 初始化
* [ ] text hash
* [ ] cache lookup
* [ ] cache write
* [ ] cache TTL

验收标准：

* 重复文本不重复请求

---

# 5.10 术语保护

优先级：P1

任务：

* [ ] code block protect
* [ ] API name protect
* [ ] glossary
* [ ] regex rules

验收标准：

* hydration 不翻译成“水合作用”

---

# 6. Phase 2 - AI 阅读增强

目标：

区别于普通翻译插件。

---

# 6.1 Explain API

优先级：P0

任务：

* [ ] POST /explain
* [ ] explain prompt
* [ ] structured response
* [ ] grammar extraction
* [ ] keyword extraction

验收标准：

* 返回结构化解释

---

# 6.2 Explain Tooltip

优先级：P0

任务：

* [ ] sentence selection
* [ ] explain modal
* [ ] loading state
* [ ] retry state

验收标准：

* 可点击句子解释

---

# 6.3 技术术语系统

优先级：P1

任务：

* [ ] glossary DB
* [ ] custom glossary
* [ ] domain detect
* [ ] technical prompt

验收标准：

* 技术术语解释更准确

---

# 6.4 页面摘要

优先级：P1

任务：

* [ ] summarize API
* [ ] article extraction
* [ ] summary card

验收标准：

* 可生成摘要

---

# 6.5 生词本

优先级：P1

任务：

* [ ] vocabulary schema
* [ ] add vocabulary
* [ ] vocabulary page
* [ ] delete vocabulary

验收标准：

* 可收藏生词

---

# 6.6 用户系统

优先级：P1

任务：

* [ ] login
* [ ] logout
* [ ] token refresh
* [ ] auth middleware

验收标准：

* 用户状态稳定

---

# 6.7 用户设置

优先级：P1

任务：

* [ ] target language
* [ ] translation mode
* [ ] AI level
* [ ] glossary settings

验收标准：

* 设置持久化

---

# 7. Phase 3 - YouTube 字幕

目标：

实现视频学习能力。

---

# 7.1 YouTube 识别

优先级：P0

任务：

* [ ] detect YouTube
* [ ] subtitle DOM detect
* [ ] subtitle observer

验收标准：

* 可获取字幕文本

---

# 7.2 双语字幕

优先级：P0

任务：

* [ ] subtitle translation
* [ ] subtitle overlay
* [ ] sync update

验收标准：

* 字幕同步

---

# 7.3 字幕点击解释

优先级：P1

任务：

* [ ] click subtitle
* [ ] explain subtitle
* [ ] add vocabulary

验收标准：

* 可解释字幕

---

# 7.4 字幕缓存

优先级：P1

任务：

* [ ] subtitle segment hash
* [ ] cache layer

验收标准：

* 重复字幕不重复翻译

---

# 8. Phase 4 - 商业化

---

# 8.1 用量统计

优先级：P0

任务：

* [ ] usage record
* [ ] token estimate
* [ ] daily quota

验收标准：

* 能限制免费用户

---

# 8.2 订阅系统

优先级：P1

任务：

* [ ] Stripe
* [ ] webhook
* [ ] subscription sync

验收标准：

* 可升级 Pro

---

# 8.3 Billing UI

优先级：P1

任务：

* [ ] pricing page
* [ ] usage page
* [ ] billing page

---

# 9. 数据库任务

# 9.1 Prisma

优先级：P0

任务：

* [ ] init prisma
* [ ] user schema
* [ ] vocabulary schema
* [ ] translation cache schema
* [ ] usage schema

---

# 9.2 Migration

优先级：P0

任务：

* [ ] initial migration
* [ ] seed script

---

# 10. DevOps

# 10.1 CI/CD

优先级：P1

任务：

* [ ] GitHub Actions
* [ ] lint
* [ ] typecheck
* [ ] build

---

# 10.2 Deploy

优先级：P1

任务：

* [ ] Vercel deploy
* [ ] API deploy
* [ ] Redis deploy

---

# 10.3 Monitoring

优先级：P1

任务：

* [ ] Sentry
* [ ] PostHog
* [ ] logs

---

# 11. 测试

# 11.1 单元测试

任务：

* [ ] text split
* [ ] hash
* [ ] cache
* [ ] glossary

---

# 11.2 E2E

任务：

* [ ] GitHub page
* [ ] Medium page
* [ ] YouTube page

推荐：

```text
Playwright
```

---

# 12. Bug 风险清单

| 风险             | 描述              |
| -------------- | --------------- |
| DOM 破坏         | 插件影响页面          |
| 无限翻译           | observer 死循环    |
| React rerender | 翻译节点丢失          |
| 样式污染           | overlay CSS 冲突  |
| API 成本         | 长页面爆 token      |
| 字幕延迟           | YouTube sync 问题 |

---

# 13. MVP Definition of Done

MVP 完成标准：

* GitHub README 可稳定双语翻译
* 技术博客可稳定翻译
* Hover 翻译可用
* Explain 可用
* 生词本可用
* 登录与额度可用
* YouTube 双语字幕可用
* 页面不会明显卡顿
* 成本可控

---

# 14. 推荐开发顺序

推荐：

```text
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

不要：

```text
一开始做复杂 Agent
一开始做 PDF
一开始做移动端
```

````

---

