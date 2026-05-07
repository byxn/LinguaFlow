# SPEC.md - AI 阅读翻译助手产品需求规格

## 1. 产品愿景

### 1.1 一句话定位

面向外语阅读和技术资料学习的 AI 沉浸式翻译与阅读助手。

### 1.2 目标用户

| 用户类型 | 场景 |
|----------|------|
| 程序员 | GitHub、技术文档、Stack Overflow、RFC、论文 |
| 英语学习者 | YouTube、Netflix、播客字幕 |
| 产品/运营/研究人员 | 海外竞品、市场报告 |
| 学生和研究人员 | 论文、教材、课程资料 |

### 1.3 MVP 优先用户

> 经常阅读英文技术内容的中文程序员。

原因：场景高频、付费意愿较强、对 AI 解释和术语保留有明确需求。

---

## 2. 用户故事

### 2.1 网页翻译

#### US-001：开启网页双语翻译

作为用户，我希望在英文网页上点击按钮后看到双语内容，以便快速理解原文。

**验收标准：**
- Given 用户打开英文网页
- When 用户点击插件按钮"开启双语翻译"
- Then 系统应在原文下方展示中文翻译
- And 不应破坏页面原有布局
- And 代码块、链接、按钮文字应尽量保持可用

#### US-002：关闭网页翻译

作为用户，我希望可以一键关闭翻译，以恢复原网页状态。

**验收标准：**
- Given 页面已开启双语翻译
- When 用户点击"关闭翻译"
- Then 系统应移除所有插入的翻译内容
- And 页面应恢复到开启前状态

#### US-003：只翻译正文区域

作为用户，我希望系统优先翻译正文，而不是导航栏、广告和页脚。

**验收标准：**
- Given 用户打开文章页
- When 用户开启翻译
- Then 系统应优先识别 article、main、markdown-body 等正文区域
- And 避免大规模翻译导航栏、菜单、广告、页脚

### 2.2 Hover 翻译

#### US-004：段落 Hover 翻译

作为用户，我希望鼠标悬停在段落上时查看翻译，以便保持原文阅读体验。

**验收标准：**
- Given 用户开启 Hover 模式
- When 鼠标悬停在一段英文文本上
- Then 系统展示浮层翻译
- And 鼠标移开后浮层消失
- And 浮层不遮挡主要阅读区域

### 2.3 AI 解释

#### US-005：解释一句话

作为用户，我希望点击一句英文后获得 AI 解释，以理解复杂句子。

**验收标准：**
- Given 用户选中一句英文
- When 用户点击"解释这句话"
- Then 系统展示中文解释
- And 包含句子含义、关键词、必要语法说明
- And 响应时间应在合理范围内

#### US-006：技术术语解释

作为程序员用户，我希望点击技术术语后获得准确解释，而不是简单翻译。

**验收标准：**
- Given 页面包含技术术语，例如 reconciliation、middleware、hydration
- When 用户点击术语
- Then 系统展示术语定义、中文解释和上下文含义
- And 不应把专有名词强行翻译成奇怪中文

### 2.4 YouTube 字幕

#### US-007：YouTube 双语字幕

作为用户，我希望观看 YouTube 视频时显示双语字幕，以便边看边理解。

**验收标准：**
- Given 用户打开带字幕的 YouTube 视频
- When 用户开启双语字幕
- Then 系统显示原文字幕和中文翻译
- And 字幕应跟随视频播放实时更新
- And 字幕不能明显遮挡视频关键区域

#### US-008：字幕点击解释

作为用户，我希望点击字幕中的一句话查看解释。

**验收标准：**
- Given 双语字幕正在显示
- When 用户点击某一句字幕
- Then 系统暂停视频或保持播放，按用户设置执行
- And 展示句子解释、关键词、生词

### 2.5 生词本

#### US-009：添加生词

作为英语学习者，我希望点击单词后加入生词本，以便后续复习。

**验收标准：**
- Given 用户点击某个英文单词
- When 用户点击"加入生词本"
- Then 系统保存单词、原句、来源页面、时间
- And 用户可以在 Web 控制台查看该单词

#### US-010：查看生词本

作为用户，我希望查看已经收藏的单词。

**验收标准：**
- Given 用户已经收藏多个单词
- When 用户打开生词本页面
- Then 系统展示单词列表
- And 包含释义、原句、来源、收藏时间

---

## 3. 功能范围

### 3.1 MVP 功能清单

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 网页双语翻译 | P0 | 段落级翻译，保留原文 |
| Hover 翻译 | P0 | 悬停显示译文 |
| 句子 AI 解释 | P0 | 点击句子获取解释 |
| 技术术语保留 | P0 | 避免专业术语误翻 |
| YouTube 双语字幕 | P1 | 字幕同步 |
| 生词本 | P1 | 收藏和查看 |
| 用户登录 | P0 | 基础认证 |
| 翻译缓存 | P1 | 避免重复翻译 |
| 额度系统 | P1 | 字符计量 |

### 3.2 暂不做范围

MVP 暂不实现：

- PDF 翻译 / EPUB 翻译
- 移动端 App
- OCR 图片翻译
- 全平台视频网站适配
- 离线翻译
- 团队协作空间
- 复杂记忆系统
- AI Agent 自动浏览网页
- Chrome 以外的浏览器深度适配

---

## 4. 非功能需求

### 4.1 性能指标

| 指标 | 目标 |
|------|------|
| 插件初始化时间 | < 500ms |
| 首段翻译返回 | < 3s |
| Hover 翻译响应 | < 2s |
| 字幕翻译延迟 | < 1.5s，优先使用缓存 |

### 4.2 稳定性

1. 插件不能破坏目标网页核心交互
2. 翻译失败时应展示错误提示，不应导致页面异常
3. AI API 超时后应自动降级或重试
4. 对 SPA 页面切换应重新识别内容
5. 对 Shadow DOM、iframe、动态内容应逐步兼容

### 4.3 安全与隐私

1. 用户网页内容只有在用户开启翻译或主动操作时才发送到服务端
2. 不上传密码框、支付信息、隐私表单内容
3. 对 input、textarea、contenteditable 内容默认不自动翻译
4. 用户可关闭数据记录
5. API Key 不应暴露在前端代码中
6. 登录 token 存储需要使用安全机制

### 4.4 成本控制

1. 对文本做 hash 缓存
2. 对长文本做切块和去重
3. 对短句可以使用便宜模型
4. 对 AI 解释使用高级模型
5. 免费用户限制每日字符数
6. 付费用户按月提供额度

---

## 5. 数据模型

### 5.1 User

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

### 5.2 UserSettings

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

### 5.3 TranslationCache

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

### 5.4 VocabularyItem

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

### 5.5 UsageRecord

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

## 6. MVP 里程碑

### Phase 0：技术验证

**目标：** 验证浏览器插件核心能力

**范围：**
- Chrome MV3 插件初始化
- Content Script 注入
- DOM 扫描
- 简单文本翻译
- 页面插入译文

**成功标准：** 能在普通英文博客页面展示双语翻译，不破坏页面布局

### Phase 1：基础翻译 MVP

**范围：**
- 用户登录
- 网页双语翻译
- Hover 翻译
- 翻译缓存
- 用户设置
- 用量统计

**成功标准：** 10 个常见网站可用，翻译体验稳定

### Phase 2：AI 阅读增强

**范围：**
- 句子解释
- 技术术语解释
- 页面摘要
- 生词本
- GitHub README 优化

**成功标准：** 程序员用户可以用它阅读 GitHub 和技术博客

### Phase 3：视频字幕

**范围：**
- YouTube 字幕识别
- 双语字幕展示
- 字幕点击解释
- 字幕生词收藏

**成功标准：** YouTube 主流视频页面可用

---

## 7. 第一版成功标准

MVP 成功不以功能数量衡量，而以核心体验衡量。

第一版必须满足：
1. 用户可以在英文技术博客上稳定开启双语翻译
2. 代码块、命令、 API 名称不会被乱翻译
3. 用户可以点击句子获得比普通翻译更有价值的解释
4. 用户可以收藏生词
5. 用户可以清楚知道自己的额度
6. 成本可控，不会因为长网页翻译失控
