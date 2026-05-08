import { Hono } from "hono";
import { z } from "zod";
import { getQuotaInfo } from "../services/index.ts";

const userRoute = new Hono();

const UpdateSettingsSchema = z.object({
  targetLanguage: z.string().optional(),
  translationMode: z.enum(["bilingual", "replace", "hover"]).optional(),
  userEnglishLevel: z.string().optional(),
  autoTranslate: z.boolean().optional(),
  preserveTerms: z.boolean().optional(),
});

// 简化的匿名用户模式 - 暂不支持注册登录
userRoute.post("/auth/login", async (c) => {
  return c.json(
    { error: { code: "NOT_SUPPORTED", message: "Login is not available in anonymous mode. Please use API Key authentication." } },
    501
  );
});

userRoute.post("/auth/register", async (c) => {
  return c.json(
    { error: { code: "NOT_SUPPORTED", message: "Registration is not available in anonymous mode. Please use API Key authentication." } },
    501
  );
});

userRoute.get("/user/me", async (c) => {
  return c.json({
    id: "anonymous",
    email: "anonymous@readmind.app",
    name: "Anonymous User",
    plan: "free",
    createdAt: new Date().toISOString(),
  });
});

userRoute.patch("/user/settings", async (c) => {
  try {
    const body = await c.req.json();
    UpdateSettingsSchema.parse(body);
    return c.json({ success: true });
  } catch (error) {
    return c.json(
      { error: { code: "INVALID_REQUEST", message: "Invalid settings" } },
      400
    );
  }
});

userRoute.get("/user/quota", async (c) => {
  // 返回真实的今日使用量
  const quotaInfo = getQuotaInfo();
  return c.json(quotaInfo);
});

export { userRoute };
