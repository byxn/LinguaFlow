# AI 阅读翻译助手需求文档

## 1. 文档信息

| 项目   | 内容                                                   |
| ---- | ---------------------------------------------------- |
| 产品名称 | 暂定：LinguaFlow / AI 阅读翻译助手                            |
| 产品类型 | 浏览器插件 + Web App，后续可扩展移动端 App                         |
| 竞品参考 | Trancy、沉浸式翻译、DeepL、Language Reactor、Google Translate |
| 文档类型 | Spec-Driven Requirements Document                    |
| 当前版本 | v0.1                                                 |
| 目标阶段 | MVP 需求定义                                             |

---

## 2. 产品愿景

构建一个 AI 驱动的跨语言阅读与学习工具，让用户在浏览网页、观看视频、阅读技术文档、论文、博客时，可以获得沉浸式双语翻译、上下文解释、术语理解、单词学习和 AI 陪读能力。

产品不只是“翻译器”，而是一个覆盖网页内容理解、语言学习和知识吸收的 AI 阅读层。

---

## 3. 背景与问题

### 3.1 用户痛点

当前用户在阅读外语内容时常见问题：

1. 机器翻译可以解决字面意思，但不能解释上下文。
2. 技术文档、论文、博客中有大量术语，普通翻译容易误译。
3. 视频字幕学习时，用户需要反复暂停、查词、记录生词，流程割裂。
4. 学习型用户不只是想知道中文意思，还想理解语法、表达方式和用法。
5. 程序员、产品、研究人员经常阅读英文资料，但阅读效率低。
6. 现有翻译插件偏工具化，缺少长期学习闭环。

### 3.2 机会点

AI 大模型使产品可以从“翻译文本”升级为“理解内容”：

* 自动识别上下文
* 解释复杂句子
* 保留专业术语
* 根据用户水平改写内容
* 生成摘要和知识点
* 记录用户学习行为
* 主动辅助阅读和复习

---

## 4. 产品定位

### 4.1 一句话定位

一个面向外语阅读和技术资料学习的 AI 沉浸式翻译与阅读助手。

### 4.2 目标用户

#### 核心用户

1. 程序员

   * 阅读 GitHub、英文技术文档、Stack Overflow、技术博客、RFC、论文。

2. 英语学习者

   * 通过 YouTube、Netflix、播客字幕、英文网页学习语言。

3. 产品/运营/研究人员

   * 阅读海外竞品资料、市场报告、英文文章。

4. 学生和研究人员

   * 阅读论文、教材、课程资料。

### 4.3 MVP 优先用户

MVP 阶段优先面向：

> 经常阅读英文技术内容的中文程序员。

原因：

* 场景高频
* 付费意愿相对较强
* 对 AI 解释、术语保留、代码理解有明确需求
* 更容易接受浏览器插件形态

---

## 5. 产品范围

### 5.1 MVP 范围

MVP 只做浏览器插件和基础 Web 控制台。

核心功能：

1. 网页双语翻译
2. 段落级 Hover 翻译
3. 句子 AI 解释
4. 技术术语识别与保留
5. YouTube 双语字幕
6. 生词本
7. 用户配置中心
8. 翻译缓存
9. 基础订阅/额度系统

### 5.2 暂不做范围

MVP 暂不实现：

1. PDF 翻译
2. EPUB 翻译
3. 移动端 App
4. OCR 图片翻译
5. 全平台视频网站适配
6. 离线翻译
7. 团队协作空间
8. 复杂记忆系统
9. AI Agent 自动浏览网页
10. Chrome 以外的浏览器深度适配

---

## 6. 核心场景

### 场景 1：阅读英文技术博客

用户打开一篇英文技术博客，希望快速理解内容。

系统行为：

1. 自动检测页面语言。
2. 提供“开启双语阅读”按钮。
3. 将正文段落翻译为中文。
4. 保留关键技术术语。
5. 用户点击某一句话时，弹出 AI 解释。
6. 用户点击术语时，展示术语定义和上下文解释。

### 场景 2：阅读 GitHub README

用户打开 GitHub 项目 README，希望理解项目用途和架构。

系统行为：

1. 识别 GitHub 页面。
2. 翻译 README 正文。
3. 保留代码块、命令行、API 名称不翻译。
4. 生成项目摘要。
5. 提取安装方式、核心功能、使用示例。

### 场景 3：观看 YouTube 英文视频

用户观看英文技术视频，希望显示双语字幕并学习生词。

系统行为：

1. 识别 YouTube 字幕。
2. 获取当前字幕文本。
3. 翻译当前字幕。
4. 显示双语字幕。
5. 用户点击单词，加入生词本。
6. 用户点击一句字幕，查看 AI 解释。

### 场景 4：英语学习

用户想通过真实内容学习英语。

系统行为：

1. 支持点击单词查看含义。
2. 支持收藏单词。
3. 支持句子语法解释。
4. 支持生成例句。
5. 支持查看学习记录。

---

## 7. 用户故事

### 7.1 网页翻译

#### US-001：开启网页双语翻译

作为用户，我希望在英文网页上点击按钮后看到双语内容，以便快速理解原文。

验收标准：

* Given 用户打开英文网页
* When 用户点击插件按钮“开启双语翻译”
* Then 系统应在原文下方展示中文翻译
* And 不应破坏页面原有布局
* And 代码块、链接、按钮文字应尽量保持可用

#### US-002：关闭网页翻译

作为用户，我希望可以一键关闭翻译，以恢复原网页状态。

验收标准：

* Given 页面已开启双语翻译
* When 用户点击“关闭翻译”
* Then 系统应移除所有插入的翻译内容
* And 页面应恢复到开启前状态

#### US-003：只翻译正文区域

作为用户，我希望系统优先翻译正文，而不是导航栏、广告和页脚。

验收标准：

* Given 用户打开文章页
* When 用户开启翻译
* Then 系统应优先识别 article、main、markdown-body 等正文区域
* And 避免大规模翻译导航栏、菜单、广告、页脚

---

### 7.2 Hover 翻译

#### US-004：段落 Hover 翻译

作为用户，我希望鼠标悬停在段落上时查看翻译，以便保持原文阅读体验。

验收标准：

* Given 用户开启 Hover 模式
* When 鼠标悬停在一段英文文本上
* Then 系统展示浮层翻译
* And 鼠标移开后浮层消失
* And 浮层不遮挡主要阅读区域

---

### 7.3 AI 解释

#### US-005：解释一句话

作为用户，我希望点击一句英文后获得 AI 解释，以理解复杂句子。

验收标准：

* Given 用户选中一句英文
* When 用户点击“解释这句话”
* Then 系统展示中文解释
* And 包含句子含义、关键词、必要语法说明
* And 响应时间应在合理范围内

#### US-006：技术术语解释

作为程序员用户，我希望点击技术术语后获得准确解释，而不是简单翻译。

验收标准：

* Given 页面包含技术术语，例如 reconciliation、middleware、hydration
* When 用户点击术语
* Then 系统展示术语定义、中文解释和上下文含义
* And 不应把专有名词强行翻译成奇怪中文

---

### 7.4 YouTube 字幕

#### US-007：YouTube 双语字幕

作为用户，我希望观看 YouTube 视频时显示双语字幕，以便边看边理解。

验收标准：

* Given 用户打开带字幕的 YouTube 视频
* When 用户开启双语字幕
* Then 系统显示原文字幕和中文翻译
* And 字幕应跟随视频播放实时更新
* And 字幕不能明显遮挡视频关键区域

#### US-008：字幕点击解释

作为用户，我希望点击字幕中的一句话查看解释。

验收标准：

* Given 双语字幕正在显示
* When 用户点击某一句字幕
* Then 系统暂停视频或保持播放，按用户设置执行
* And 展示句子解释、关键词、生词

---

### 7.5 生词本

#### US-009：添加生词

作为英语学习者，我希望点击单词后加入生词本，以便后续复习。

验收标准：

* Given 用户点击某个英文单词
* When 用户点击“加入生词本”
* Then 系统保存单词、原句、来源页面、时间
* And 用户可以在 Web 控制台查看该单词

#### US-010：查看生词本

作为用户，我希望查看已经收藏的单词。

验收标准：

* Given 用户已经收藏多个单词
* When 用户打开生词本页面
* Then 系统展示单词列表
* And 包含释义、原句、来源、收藏时间

---

## 8. 功能规格

## 8.1 浏览器插件

### 8.1.1 插件入口

插件需要提供以下入口：

1. 浏览器工具栏 Popup
2. 页面右侧悬浮按钮
3. 文本选中后的快捷菜单
4. 右键菜单

### 8.1.2 Popup 面板

Popup 面板包含：

* 当前页面语言
* 翻译开关
* Hover 模式开关
* AI 解释开关
* 字幕翻译开关
* 当前额度
* 登录状态
* 设置入口

### 8.1.3 页面注入层

页面注入层负责：

* 展示段落翻译
* 展示 Hover 浮层
* 展示 AI 解释浮窗
* 展示术语解释卡片
* 展示 YouTube 双语字幕

### 8.1.4 右键菜单

右键菜单包含：

* 翻译选中文本
* 解释选中文本
* 总结当前页面
* 加入生词本

---

## 8.2 翻译能力

### 8.2.1 翻译模式

系统支持三种翻译模式：

1. 双语模式

   * 原文下方显示译文。

2. 替换模式

   * 直接用译文替换原文。

3. Hover 模式

   * 不改变页面结构，悬停显示译文。

MVP 默认使用双语模式。

### 8.2.2 翻译粒度

支持：

* 段落级翻译
* 句子级翻译
* 选中文本翻译
* 字幕级翻译

MVP 优先实现段落级和字幕级。

### 8.2.3 术语保留

系统需要识别以下内容并尽量避免误翻：

* 代码块
* 命令行
* API 名称
* 类名
* 函数名
* 文件路径
* URL
* 产品名
* 技术术语

示例：

```text
React hydration should not be translated as “水合作用” in technical context.
```

应翻译为：

```text
React hydration 指的是服务端渲染页面在客户端恢复交互能力的过程。
```

---

## 8.3 AI 解释能力

### 8.3.1 句子解释

输入：

* 原句
* 上下文段落
* 页面标题
* 用户目标语言
* 用户水平

输出：

* 中文含义
* 关键词解释
* 语法点
* 更自然的中文表达
* 简单英文改写，可选

### 8.3.2 技术内容解释

输入：

* 选中文本
* 当前页面上下文
* 页面 URL
* 技术领域推断

输出：

* 这段话在讲什么
* 涉及哪些概念
* 对程序员有什么意义
* 是否有代码/API/架构含义

### 8.3.3 页面摘要

输入：

* 页面正文
* 页面标题
* URL

输出：

* 100 字摘要
* 核心观点
* 关键术语
* 适合继续阅读的问题

MVP 可以放在 Phase 2。

---

## 8.4 YouTube 字幕能力

### 8.4.1 字幕获取

系统优先使用：

1. YouTube 页面已有字幕 DOM
2. YouTube caption track
3. 用户上传字幕，后续版本

### 8.4.2 字幕展示

字幕样式要求：

* 原文在上，译文在下
* 字号可调
* 位置可调
* 背景透明度可调
* 支持暂停时点击解释

### 8.4.3 字幕缓存

同一视频同一字幕内容不应重复请求翻译。

缓存 key：

```text
videoId + language + subtitleSegmentHash
```

---

## 8.5 生词本

### 8.5.1 单词数据

每个生词记录包含：

* word
* translation
* phonetic
* source_sentence
* source_url
* source_title
* created_at
* review_count
* last_reviewed_at

### 8.5.2 生词操作

支持：

* 添加
* 删除
* 搜索
* 标记已掌握
* 查看来源句子

MVP 不做复杂记忆曲线，只做基础收藏。

---

## 9. 非功能需求

## 9.1 性能

1. 插件注入后不应明显拖慢页面加载。
2. 翻译应采用懒加载策略，只翻译可见区域附近内容。
3. 长页面应分块处理，避免一次性请求过多文本。
4. 用户滚动时应增量翻译。
5. 页面 DOM 变化时应防抖处理。

目标指标：

| 指标         | 目标            |
| ---------- | ------------- |
| 插件初始化时间    | < 500ms       |
| 首段翻译返回     | < 3s          |
| Hover 翻译响应 | < 2s          |
| 字幕翻译延迟     | < 1.5s，优先使用缓存 |

---

## 9.2 稳定性

1. 插件不能破坏目标网页核心交互。
2. 翻译失败时应展示错误提示，不应导致页面异常。
3. AI API 超时后应自动降级或重试。
4. 对 SPA 页面切换应重新识别内容。
5. 对 Shadow DOM、iframe、动态内容应逐步兼容。

---

## 9.3 安全与隐私

1. 用户网页内容只有在用户开启翻译或主动操作时才发送到服务端。
2. 不上传密码框、支付信息、隐私表单内容。
3. 对 input、textarea、contenteditable 内容默认不自动翻译。
4. 用户可关闭数据记录。
5. API Key 不应暴露在前端代码中。
6. 登录 token 存储需要使用安全机制。

---

## 9.4 成本控制

1. 对文本做 hash 缓存。
2. 对长文本做切块和去重。
3. 对短句可以使用便宜模型。
4. 对 AI 解释使用高级模型。
5. 免费用户限制每日字符数。
6. 付费用户按月提供额度。

---

## 10. 系统架构

## 10.1 总体架构

```text
Browser Extension
  ├─ Content Script
  ├─ Background Service Worker
  ├─ Popup UI
  └─ Injected UI Layer

Backend API
  ├─ Auth Service
  ├─ Translation Service
  ├─ AI Explanation Service
  ├─ Cache Service
  ├─ User Profile Service
  └─ Billing/Quota Service

Data Layer
  ├─ PostgreSQL
  ├─ Redis
  └─ Object Storage, optional

AI Providers
  ├─ OpenAI
  ├─ Anthropic
  ├─ Gemini
  ├─ DeepSeek
  └─ Other translation APIs
```

---

## 10.2 前端插件模块

### Content Script

职责：

* 扫描 DOM 文本节点
* 判断可翻译节点
* 提取正文
* 注入译文
* 监听 DOM 变化
* 处理用户选择文本
* 注入浮层 UI

### Background Service Worker

职责：

* 管理请求
* 与后端通信
* 管理缓存
* 处理右键菜单
* 管理插件状态

### Popup UI

职责：

* 展示当前页面状态
* 控制翻译模式
* 进入设置页
* 展示用户额度

---

## 10.3 后端模块

### Auth Service

功能：

* 用户注册
* 用户登录
* OAuth 登录，后续支持
* Token 校验

### Translation Service

功能：

* 文本切块
* 语言检测
* 调用模型翻译
* 术语保护
* 返回结构化结果

### AI Explanation Service

功能：

* 句子解释
* 语法解释
* 术语解释
* 页面摘要

### Cache Service

功能：

* 文本 hash
* 查询缓存
* 写入缓存
* 设置过期策略

### Quota Service

功能：

* 用户额度计算
* 免费额度限制
* 付费用户额度
* 请求计量

---

## 11. 数据模型

## 11.1 User

```ts
interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'free' | 'pro' | 'team';
  createdAt: string;
  updatedAt: string;
}
```

## 11.2 UserSettings

```ts
interface UserSettings {
  userId: string;
  targetLanguage: 'zh-CN' | 'en' | 'ja' | 'ko';
  translationMode: 'bilingual' | 'replace' | 'hover';
  userEnglishLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  autoTranslate: boolean;
  preserveTerms: boolean;
}
```

## 11.3 TranslationCache

```ts
interface TranslationCache {
  id: string;
  sourceHash: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  model: string;
  createdAt: string;
  expiresAt?: string;
}
```

## 11.4 VocabularyItem

```ts
interface VocabularyItem {
  id: string;
  userId: string;
  word: string;
  translation: string;
  phonetic?: string;
  sourceSentence?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  status: 'new' | 'learning' | 'mastered';
  createdAt: string;
  updatedAt: string;
}
```

## 11.5 UsageRecord

```ts
interface UsageRecord {
  id: string;
  userId: string;
  type: 'translate' | 'explain' | 'summarize' | 'subtitle';
  inputChars: number;
  outputChars: number;
  model: string;
  cost?: number;
  createdAt: string;
}
```

---

## 12. API 规格

## 12.1 翻译 API

### POST /api/translate

请求：

```json
{
  "texts": ["React hydration is the process..."],
  "sourceLanguage": "en",
  "targetLanguage": "zh-CN",
  "context": {
    "url": "https://example.com/article",
    "title": "React SSR Guide",
    "domain": "technical"
  },
  "options": {
    "preserveTerms": true,
    "mode": "paragraph"
  }
}
```

响应：

```json
{
  "items": [
    {
      "sourceText": "React hydration is the process...",
      "translatedText": "React hydration 指的是...",
      "terms": [
        {
          "term": "hydration",
          "explanation": "服务端渲染页面在客户端恢复交互能力的过程"
        }
      ],
      "cached": false
    }
  ]
}
```

---

## 12.2 句子解释 API

### POST /api/explain

请求：

```json
{
  "text": "Not until recently had developers started to adopt this pattern.",
  "context": "Full paragraph text here...",
  "targetLanguage": "zh-CN",
  "userLevel": "B1"
}
```

响应：

```json
{
  "meaning": "直到最近，开发者才开始采用这种模式。",
  "grammar": [
    {
      "point": "倒装结构",
      "explanation": "Not until 放在句首时，主句需要部分倒装。"
    }
  ],
  "keywords": [
    {
      "word": "adopt",
      "translation": "采用",
      "example": "Many teams adopted this approach."
    }
  ],
  "simplifiedEnglish": "Developers only recently started using this pattern."
}
```

---

## 12.3 添加生词 API

### POST /api/vocabulary

请求：

```json
{
  "word": "adopt",
  "translation": "采用",
  "sourceSentence": "Developers started to adopt this pattern.",
  "sourceUrl": "https://example.com/article",
  "sourceTitle": "Example Article"
}
```

响应：

```json
{
  "id": "voc_123",
  "word": "adopt",
  "status": "new"
}
```

---

## 13. DOM 处理规格

## 13.1 文本节点识别

系统应通过 TreeWalker 扫描文本节点。

需要跳过：

* script
* style
* code
* pre
* textarea
* input
* select
* button，默认跳过
* nav，默认低优先级
* footer，默认低优先级

## 13.2 正文识别优先级

优先识别以下容器：

1. article
2. main
3. [role="main"]
4. .markdown-body
5. .post-content
6. .entry-content
7. .article-content

## 13.3 动态内容监听

使用 MutationObserver 监听：

* 新增节点
* SPA 路由变化
* 无限滚动内容
* YouTube 字幕变化

需要防止：

* 重复翻译
* 重复注入
* 无限触发
* 页面卡顿

---

## 14. AI Prompt 规格

## 14.1 翻译 Prompt

目标：

* 准确翻译
* 保留技术术语
* 保留 Markdown/代码/命令
* 不增加无关解释

示例 Prompt：

```text
你是一个专业的技术文档翻译助手。
请将下面文本翻译成简体中文。
要求：
1. 保留代码、命令、API 名称、类名、函数名。
2. 技术术语如果没有自然中文译法，可以保留英文并补充中文解释。
3. 不要添加原文不存在的信息。
4. 输出只包含译文。

上下文标题：{{title}}
网页 URL：{{url}}
文本：{{text}}
```

## 14.2 解释 Prompt

```text
你是一个面向中文程序员的英文技术内容讲解助手。
请解释下面这句话。
要求：
1. 先给出自然中文含义。
2. 再解释关键词和技术术语。
3. 如果有语法难点，简要说明。
4. 如果原句很复杂，给出简单英文改写。

用户英语水平：{{level}}
页面标题：{{title}}
上下文：{{context}}
句子：{{sentence}}
```

---

## 15. 付费与额度设计

## 15.1 免费版

* 每日翻译字符数限制
* 每日 AI 解释次数限制
* 支持网页翻译
* 支持基础生词本
* 不支持高级模型

## 15.2 Pro 版

* 更高字符额度
* 支持高级 AI 解释
* 支持 YouTube 字幕翻译
* 支持页面摘要
* 支持术语库
* 更快响应

## 15.3 Team 版，后续

* 团队术语库
* 团队共享配置
* 管理员后台
* 发票与组织账单

---

## 16. MVP 里程碑

## Phase 0：技术验证

目标：验证浏览器插件核心能力。

范围：

* Chrome MV3 插件初始化
* Content Script 注入
* DOM 扫描
* 简单文本翻译
* 页面插入译文

成功标准：

* 能在普通英文博客页面展示双语翻译
* 不破坏页面布局

---

## Phase 1：基础翻译 MVP

范围：

* 用户登录
* 网页双语翻译
* Hover 翻译
* 翻译缓存
* 用户设置
* 用量统计

成功标准：

* 10 个常见网站可用
* 翻译体验稳定
* 可区分免费/付费额度

---

## Phase 2：AI 阅读增强

范围：

* 句子解释
* 技术术语解释
* 页面摘要
* 生词本
* GitHub README 优化

成功标准：

* 程序员用户可以用它阅读 GitHub 和技术博客
* AI 解释明显优于普通翻译

---

## Phase 3：视频字幕

范围：

* YouTube 字幕识别
* 双语字幕展示
* 字幕点击解释
* 字幕生词收藏

成功标准：

* YouTube 主流视频页面可用
* 字幕延迟可接受

---

## 17. 验收测试清单

## 17.1 网页翻译测试

| 测试项           | 期望结果            |
| ------------- | --------------- |
| 普通博客页面        | 能正确插入双语翻译       |
| GitHub README | Markdown 结构基本保持 |
| 代码块页面         | 代码不被翻译          |
| SPA 页面        | 路由切换后可重新翻译      |
| 无限滚动页面        | 新内容可增量翻译        |
| 翻译关闭          | 页面恢复原状          |

## 17.2 AI 解释测试

| 测试项    | 期望结果         |
| ------ | ------------ |
| 普通英文句子 | 给出准确中文解释     |
| 复杂语法句  | 能指出关键语法点     |
| 技术术语   | 能结合上下文解释     |
| 代码相关文本 | 不胡乱翻译 API 名称 |

## 17.3 字幕测试

| 测试项           | 期望结果    |
| ------------- | ------- |
| YouTube 有字幕视频 | 显示双语字幕  |
| 暂停视频          | 字幕保持可点击 |
| 快进视频          | 字幕能同步更新 |
| 无字幕视频         | 给出明确提示  |

---

## 18. 风险分析

## 18.1 技术风险

### DOM 兼容性复杂

风险：不同网站结构不同，翻译注入可能破坏页面。

应对：

* 从有限网站开始适配
* 建立网站适配规则
* 保守注入，不强行翻译所有节点

### YouTube 字幕变化

风险：YouTube DOM 经常变化。

应对：

* 设计独立字幕解析层
* 优先使用字幕 track 数据
* 建立自动化回归测试

### LLM 成本高

风险：用户长网页翻译导致成本不可控。

应对：

* 缓存
* 分层模型
* 字符额度
* 懒加载
* 限制免费用户

---

## 18.2 产品风险

### 同质化严重

风险：普通翻译插件已经很多。

应对：

* 聚焦技术阅读场景
* 强化 AI 解释和术语理解
* 做学习闭环

### 用户留存不足

风险：用户只在偶尔需要翻译时使用。

应对：

* 生词本
* 阅读记录
* 每日复习
* 个人术语库
* 技术阅读摘要

---

## 19. 差异化设计

## 19.1 程序员专属阅读模式

针对以下网站做深度优化：

* GitHub
* MDN
* React Docs
* Vue Docs
* Next.js Docs
* Stack Overflow
* Hacker News
* arXiv
* Medium 技术文章

能力：

* 保留代码
* 解释 API
* 生成架构摘要
* 识别安装命令
* 提取核心概念

## 19.2 AI 技术术语库

用户可以建立自己的术语偏好：

```text
hydration = 客户端激活 / 注水，不使用“水合作用”
reconciliation = React 协调过程
middleware = 中间件
```

## 19.3 阅读难度调节

用户可以选择：

* 直接翻译
* 简单中文解释
* 面向初学者解释
* 面向程序员解释
* 保留英文术语解释

---

## 20. 开发建议技术栈

## 20.1 插件端

* Plasmo
* React
* TypeScript
* Tailwind CSS
* Zustand
* Chrome Extension Manifest V3

## 20.2 Web 后台

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

## 20.3 后端

可选方案：

方案 A：Next.js API Routes

适合 MVP，开发快。

方案 B：Hono + Node.js

轻量，适合 API 服务。

方案 C：NestJS

适合后续复杂业务。

## 20.4 数据库

* PostgreSQL：用户、设置、生词、订阅
* Redis：翻译缓存、额度计数、限流

## 20.5 AI Provider

* OpenAI：高质量解释和总结
* DeepSeek：低成本翻译
* Gemini：长上下文场景
* Anthropic Claude：复杂解释和长文分析

---

## 21. MVP 开发任务拆解

## 21.1 插件端任务

1. 初始化 Plasmo 项目
2. 实现 Popup UI
3. 实现 Content Script 注入
4. 实现 DOM 文本扫描
5. 实现正文区域识别
6. 实现译文插入
7. 实现关闭翻译恢复页面
8. 实现 Hover 浮层
9. 实现右键菜单
10. 实现 YouTube 字幕监听，Phase 3

## 21.2 后端任务

1. 用户认证
2. 翻译 API
3. AI 解释 API
4. 缓存服务
5. 用量统计
6. 生词本 API
7. 订阅/额度接口

## 21.3 Web 控制台任务

1. 登录页
2. 用户设置页
3. 生词本页面
4. 用量页面
5. 订阅页面

---

## 22. 第一版成功标准

MVP 成功不以功能数量衡量，而以核心体验衡量。

第一版必须满足：

1. 用户可以在英文技术博客上稳定开启双语翻译。
2. 代码块、命令、API 名称不会被乱翻译。
3. 用户可以点击句子获得比普通翻译更有价值的解释。
4. 用户可以收藏生词。
5. 用户可以清楚知道自己的额度。
6. 成本可控，不会因为长网页翻译失控。

---

## 23. 后续演进方向

## 23.1 PDF / EPUB 阅读

支持论文、电子书、白皮书。

## 23.2 AI 阅读 Agent

用户可以问：

* 这篇文章讲了什么？
* 这段代码什么意思？
* 这个库适合我的项目吗？
* 帮我提取所有关键概念。

## 23.3 学习闭环

* 生词复习
* 句子收藏
* 每日学习报告
* 阅读能力分析

## 23.4 团队知识层

面向团队：

* 共享术语库
* 技术文档翻译规范
* 团队阅读记录
* 内部知识摘要

---

## 24. 最小可行版本定义

最小可行版本只需要证明一件事：

> 用户在阅读英文技术资料时，使用本产品比直接复制到翻译软件更快、更舒服、更能理解。

MVP 推荐最小功能组合：

1. Chrome 插件
2. 网页双语翻译
3. Hover 翻译
4. 句子 AI 解释
5. 技术术语保留
6. 生词收藏
7. 基础登录与额度

不要一开始追求大而全。

---

## 25. 下一步建议

下一步可以继续拆成三份工程文档：

1. `architecture.md`：系统架构设计
2. `tasks.md`：开发任务清单
3. `api.md`：接口定义

如果采用 GitHub Spec Kit 风格，可以进一步拆成：

```text
/specs/ai-reading-assistant/spec.md
/specs/ai-reading-assistant/plan.md
/specs/ai-reading-assistant/tasks.md
```
