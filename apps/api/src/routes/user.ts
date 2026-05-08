import { Hono } from "hono";
import { z } from "zod";
import { getQuotaInfo } from "../services/index.ts";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const userRoute = new Hono();

// 扩展设置文件路径
const SETTINGS_FILE = join(process.cwd(), "data", "extension-settings.json");

interface ExtensionSettings {
  provider?: "deepseek" | "openai" | "deepl" | "google";
  apiKeys?: Record<string, string>;
}

// 确保 data 目录存在
function ensureDataDir() {
  const dataDir = join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    import("fs").then((fs) => fs.mkdirSync(dataDir, { recursive: true }));
  }
}

// 从文件加载设置
function loadExtensionSettings(): ExtensionSettings {
  try {
    ensureDataDir();
    if (existsSync(SETTINGS_FILE)) {
      const data = readFileSync(SETTINGS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load extension settings:", error);
  }
  return {};
}

// 保存设置到文件
function saveExtensionSettings(settings: ExtensionSettings): void {
  try {
    ensureDataDir();
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error("Failed to save extension settings:", error);
  }
}

// 初始化加载
const extensionSettings = loadExtensionSettings();

const ExtensionSettingsSchema = z.object({
  provider: z.enum(["deepseek", "openai", "deepl", "google"]).optional(),
  apiKeys: z.record(z.string()).optional(),
});

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
  const quotaInfo = getQuotaInfo();
  return c.json(quotaInfo);
});

// 扩展设置 - 保存
userRoute.post("/extension/settings", async (c) => {
  try {
    const body = await c.req.json();
    ExtensionSettingsSchema.parse(body);

    // 合并保存
    const newSettings = { ...extensionSettings, ...body };
    saveExtensionSettings(newSettings);

    return c.json({ success: true });
  } catch (error) {
    return c.json(
      { error: { code: "INVALID_REQUEST", message: "Invalid settings" } },
      400
    );
  }
});

// 扩展设置 - 获取
userRoute.get("/extension/settings", async (c) => {
  return c.json(extensionSettings);
});

export { userRoute };
