# DATABASE.md - AI 阅读翻译助手数据库设计

## 1. ER 图

```text
┌─────────────┐       ┌─────────────────┐
│   User     │──────<│  UserSettings   │
└─────┬───────┘       └─────────────────┘
      │
      │
      ├──────┌─────────────┐
      │      │             │
      ▼      ▼             ▼
┌───────────┐  ┌───────────────┐  ┌──────────────┐
│Vocabulary │  │ UsageRecord   │  │TranslationCache
└───────────┘  └───────────────┘  └──────────────┘
                     │
                     ▼
              ┌───────────────┐
              │ Subscription │
              └───────────────┘
```

---

## 2. 表结构

### 2.1 users

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 用户 ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 邮箱 |
| name | VARCHAR(100) | | 用户名 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希 |
| plan | ENUM('free', 'pro', 'team') | DEFAULT 'free' | 订阅计划 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

### 2.2 user_settings

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 设置 ID |
| user_id | UUID | FK -> users, UNIQUE | 用户 ID |
| target_language | VARCHAR(10) | DEFAULT 'zh-CN' | 目标语言 |
| translation_mode | ENUM('bilingual', 'replace', 'hover') | DEFAULT 'bilingual' | 翻译模式 |
| user_english_level | VARCHAR(5) | | 英语水平 |
| auto_translate | BOOLEAN | DEFAULT false | 自动翻译 |
| preserve_terms | BOOLEAN | DEFAULT true | 保留术语 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

### 2.3 vocabulary

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 生词 ID |
| user_id | UUID | FK -> users | 用户 ID |
| word | VARCHAR(255) | NOT NULL | 单词 |
| translation | VARCHAR(255) | NOT NULL | 翻译 |
| phonetic | VARCHAR(255) | | 音标 |
| source_sentence | TEXT | | 来源句子 |
| source_url | TEXT | | 来源 URL |
| source_title | VARCHAR(500) | | 来源标题 |
| status | ENUM('new', 'learning', 'mastered') | DEFAULT 'new' | 状态 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_vocabulary_user_id` on (user_id)
- `idx_vocabulary_user_status` on (user_id, status)

### 2.4 usage_records

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 记录 ID |
| user_id | UUID | FK -> users | 用户 ID |
| type | ENUM('translate', 'explain', 'summarize', 'subtitle') | NOT NULL | 类型 |
| input_chars | INTEGER | NOT NULL | 输入字符数 |
| output_chars | INTEGER | NOT NULL | 输出字符数 |
| model | VARCHAR(50) | NOT NULL | 使用的模型 |
| cost | DECIMAL(10, 6) | | 成本 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

**索引：**
- `idx_usage_user_created` on (user_id, created_at)

### 2.5 translation_cache

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 缓存 ID |
| source_hash | VARCHAR(64) | UNIQUE, NOT NULL | 原文哈希 |
| source_text | TEXT | NOT NULL | 原文 |
| source_language | VARCHAR(10) | NOT NULL | 源语言 |
| target_language | VARCHAR(10) | NOT NULL | 目标语言 |
| translated_text | TEXT | NOT NULL | 译文 |
| model | VARCHAR(50) | NOT NULL | 使用的模型 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| expires_at | TIMESTAMP | | 过期时间 |

**索引：**
- `idx_cache_source_hash` on (source_hash)
- `idx_cache_expires_at` on (expires_at)

### 2.6 subscriptions

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 订阅 ID |
| user_id | UUID | FK -> users, UNIQUE | 用户 ID |
| stripe_customer_id | VARCHAR(255) | | Stripe 客户 ID |
| stripe_subscription_id | VARCHAR(255) | | Stripe 订阅 ID |
| plan | ENUM('free', 'pro', 'team') | NOT NULL | 计划 |
| status | VARCHAR(50) | NOT NULL | 状态 |
| current_period_start | TIMESTAMP | | 当前周期开始 |
| current_period_end | TIMESTAMP | | 当前周期结束 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

---

## 3. 索引设计

| 表 | 索引名 | 字段 | 类型 | 用途 |
|------|--------|------|------|------|
| vocabulary | idx_vocabulary_user_id | user_id | B-tree | 用户生词查询 |
| vocabulary | idx_vocabulary_user_status | user_id, status | B-tree | 状态筛选 |
| usage_records | idx_usage_user_created | user_id, created_at | B-tree | 用量统计 |
| translation_cache | idx_cache_source_hash | source_hash | Hash | 缓存查找 |
| translation_cache | idx_cache_expires_at | expires_at | B-tree | 过期清理 |

---

## 4. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Plan {
  free
  pro
  team
}

enum TranslationMode {
  bilingual
  replace
  hover
}

enum VocabularyStatus {
  new
  learning
  mastered
}

enum UsageType {
  translate
  explain
  summarize
  subtitle
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String?
  passwordHash String   @map("password_hash")
  plan         Plan     @default(free)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  settings     UserSettings?
  vocabulary   Vocabulary[]
  usageRecords UsageRecord[]
  subscription Subscription?

  @@map("users")
}

model UserSettings {
  id               String           @id @default(uuid())
  userId           String           @unique @map("user_id")
  targetLanguage   String           @default("zh-CN") @map("target_language")
  translationMode  TranslationMode  @default(bilingual) @map("translation_mode")
  userEnglishLevel String?          @map("user_english_level")
  autoTranslate    Boolean          @default(false) @map("auto_translate")
  preserveTerms    Boolean          @default(true) @map("preserve_terms")
  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}

model Vocabulary {
  id            String            @id @default(uuid())
  userId        String            @map("user_id")
  word          String
  translation   String
  phonetic      String?
  sourceSentence String?           @map("source_sentence")
  sourceUrl     String?           @map("source_url")
  sourceTitle   String?           @map("source_title")
  status        VocabularyStatus @default(new)
  createdAt     DateTime          @default(now()) @map("created_at")
  updatedAt     DateTime          @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId], name: "idx_vocabulary_user_id")
  @@index([userId, status], name: "idx_vocabulary_user_status")
  @@map("vocabulary")
}

model UsageRecord {
  id         String    @id @default(uuid())
  userId     String    @map("user_id")
  type       UsageType
  inputChars Int       @map("input_chars")
  outputChars Int      @map("output_chars")
  model      String
  cost       Decimal? @db.Decimal(10, 6)
  createdAt  DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt], name: "idx_usage_user_created")
  @@map("usage_records")
}

model TranslationCache {
  id               String   @id @default(uuid())
  sourceHash       String   @unique @map("source_hash")
  sourceText       String   @db.Text @map("source_text")
  sourceLanguage   String   @map("source_language")
  targetLanguage   String   @map("target_language")
  translatedText   String   @db.Text @map("translated_text")
  model            String
  createdAt        DateTime @default(now()) @map("created_at")
  expiresAt        DateTime? @map("expires_at")

  @@index([sourceHash], name: "idx_cache_source_hash")
  @@index([expiresAt], name: "idx_cache_expires_at")
  @@map("translation_cache")
}

model Subscription {
  id                   String   @id @default(uuid())
  userId               String   @unique @map("user_id")
  stripeCustomerId     String?  @map("stripe_customer_id")
  stripeSubscriptionId String?  @map("stripe_subscription_id")
  plan                 Plan
  status               String
  currentPeriodStart   DateTime? @map("current_period_start")
  currentPeriodEnd     DateTime? @map("current_period_end")
  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("subscriptions")
}
```

---

## 5. 迁移脚本

### Initial Migration

```sql
-- Run with: npx prisma migrate dev --name init

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_language VARCHAR(10) DEFAULT 'zh-CN',
  translation_mode VARCHAR(20) DEFAULT 'bilingual' CHECK (translation_mode IN ('bilingual', 'replace', 'hover')),
  user_english_level VARCHAR(5),
  auto_translate BOOLEAN DEFAULT false,
  preserve_terms BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word VARCHAR(255) NOT NULL,
  translation VARCHAR(255) NOT NULL,
  phonetic VARCHAR(255),
  source_sentence TEXT,
  source_url TEXT,
  source_title VARCHAR(500),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'learning', 'mastered')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vocabulary_user_id ON vocabulary(user_id);
CREATE INDEX idx_vocabulary_user_status ON vocabulary(user_id, status);

CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('translate', 'explain', 'summarize', 'subtitle')),
  input_chars INTEGER NOT NULL,
  output_chars INTEGER NOT NULL,
  model VARCHAR(50) NOT NULL,
  cost DECIMAL(10, 6),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_user_created ON usage_records(user_id, created_at);

CREATE TABLE translation_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_hash VARCHAR(64) UNIQUE NOT NULL,
  source_text TEXT NOT NULL,
  source_language VARCHAR(10) NOT NULL,
  target_language VARCHAR(10) NOT NULL,
  translated_text TEXT NOT NULL,
  model VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_cache_source_hash ON translation_cache(source_hash);
CREATE INDEX idx_cache_expires_at ON translation_cache(expires_at);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'pro', 'team')),
  status VARCHAR(50) NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
