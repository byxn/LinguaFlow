# API.md - AI 阅读翻译助手接口文档

## 1. 认证

### 1.1 JWT Token

所有 API 请求需要在 Header 中携带 JWT Token：

```
Authorization: Bearer <token>
```

### 1.2 Token 结构

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "plan": "free | pro | team",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 1.3 错误响应

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

---

## 2. Translate API

### POST /api/translate

翻译文本

**请求：**

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

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| texts | string[] | 是 | 要翻译的文本数组 |
| sourceLanguage | string | 是 | 源语言，如 "en" |
| targetLanguage | string | 是 | 目标语言，如 "zh-CN" |
| context.url | string | 否 | 来源 URL |
| context.title | string | 否 | 页面标题 |
| context.domain | string | 否 | 领域，如 "technical" |
| options.preserveTerms | boolean | 否 | 保留术语，默认 true |
| options.mode | string | 否 | 翻译模式："paragraph" \| "sentence" |

**响应（200）：**

```json
{
  "items": [
    {
      "sourceText": "React hydration is the process...",
      "translatedText": "React hydration 指的是服务端渲染页面在客户端恢复交互能力的过程。",
      "terms": [
        {
          "term": "hydration",
          "explanation": "服务端渲染页面在客户端恢复交互能力的过程"
        }
      ],
      "cached": false
    }
  ],
  "usage": {
    "inputChars": 45,
    "outputChars": 35
  }
}
```

**错误响应：**

| code | 说明 |
|------|------|
| INVALID_REQUEST | 请求参数错误 |
| QUOTA_EXCEEDED | 额度不足 |
| RATE_LIMITED | 请求过于频繁 |
| INTERNAL_ERROR | 服务器内部错误 |

---

## 3. Explain API

### POST /api/explain

解释句子或文本

**请求：**

```json
{
  "text": "Not until recently had developers started to adopt this pattern.",
  "context": "Full paragraph text here...",
  "targetLanguage": "zh-CN",
  "userLevel": "B1"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | 是 | 要解释的文本 |
| context | string | 否 | 上下文段落 |
| targetLanguage | string | 是 | 目标语言 |
| userLevel | string | 否 | 用户英语水平：A1~C2 |

**响应（200）：**

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

## 4. Vocabulary API

### POST /api/vocabulary

添加生词

**请求：**

```json
{
  "word": "adopt",
  "translation": "采用",
  "sourceSentence": "Developers started to adopt this pattern.",
  "sourceUrl": "https://example.com/article",
  "sourceTitle": "Example Article"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| word | string | 是 | 单词 |
| translation | string | 是 | 翻译 |
| sourceSentence | string | 否 | 来源句子 |
| sourceUrl | string | 否 | 来源 URL |
| sourceTitle | string | 否 | 来源标题 |

**响应（200）：**

```json
{
  "id": "voc_123",
  "word": "adopt",
  "status": "new"
}
```

---

### GET /api/vocabulary

获取生词列表

**Query 参数：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页数量，默认 20 |
| status | string | 否 | 状态筛选：new, learning, mastered |

**响应（200）：**

```json
{
  "items": [
    {
      "id": "voc_123",
      "word": "adopt",
      "translation": "采用",
      "sourceSentence": "Developers started to adopt this pattern.",
      "sourceUrl": "https://example.com/article",
      "sourceTitle": "Example Article",
      "status": "new",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### DELETE /api/vocabulary/:id

删除生词

**响应（200）：**

```json
{
  "success": true
}
```

---

## 5. User API

### POST /api/auth/login

登录

**请求：**

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**响应（200）：**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "User Name",
    "plan": "free"
  }
}
```

---

### POST /api/auth/register

注册

**请求：**

```json
{
  "email": "user@example.com",
  "password": "password",
  "name": "User Name"
}
```

**响应（200）：**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "User Name",
    "plan": "free"
  }
}
```

---

### GET /api/user/me

获取当前用户

**响应（200）：**

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "User Name",
  "plan": "free",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### PATCH /api/user/settings

更新用户设置

**请求：**

```json
{
  "targetLanguage": "zh-CN",
  "translationMode": "bilingual",
  "userEnglishLevel": "B1",
  "autoTranslate": true,
  "preserveTerms": true
}
```

**响应（200）：**

```json
{
  "success": true
}
```

---

### GET /api/user/quota

获取用户额度

**响应（200）：**

```json
{
  "plan": "free",
  "dailyLimit": 50000,
  "dailyUsed": 12345,
  "resetAt": "2024-01-02T00:00:00Z"
}
```

---

## 6. 错误码

| code | HTTP 状态码 | 说明 |
|------|-------------|------|
| INVALID_REQUEST | 400 | 请求参数错误 |
| UNAUTHORIZED | 401 | 未认证或 Token 过期 |
| FORBIDDEN | 403 | 无权限 |
| NOT_FOUND | 404 | 资源不存在 |
| QUOTA_EXCEEDED | 429 | 额度不足 |
| RATE_LIMITED | 429 | 请求过于频繁 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |
