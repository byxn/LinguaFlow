import { Hono } from "hono";
import { z } from "zod";

const userRoute = new Hono();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const UpdateSettingsSchema = z.object({
  targetLanguage: z.string().optional(),
  translationMode: z.enum(["bilingual", "replace", "hover"]).optional(),
  userEnglishLevel: z.string().optional(),
  autoTranslate: z.boolean().optional(),
  preserveTerms: z.boolean().optional(),
});

userRoute.post("/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    LoginSchema.parse(body);

    return c.json({
      token: "mock_jwt_token",
      user: {
        id: "user_123",
        email: body.email,
        name: "User",
        plan: "free",
      },
    });
  } catch (error) {
    return c.json(
      { error: { code: "INVALID_REQUEST", message: "Invalid credentials" } },
      400
    );
  }
});

userRoute.post("/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    RegisterSchema.parse(body);

    return c.json({
      token: "mock_jwt_token",
      user: {
        id: "user_123",
        email: body.email,
        name: body.name || "User",
        plan: "free",
      },
    });
  } catch (error) {
    return c.json(
      { error: { code: "INVALID_REQUEST", message: "Invalid data" } },
      400
    );
  }
});

userRoute.get("/user/me", async (c) => {
  return c.json({
    id: "user_123",
    email: "user@example.com",
    name: "User",
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
  return c.json({
    plan: "free",
    dailyLimit: 50000,
    dailyUsed: 0,
    resetAt: new Date(Date.now() + 86400000).toISOString(),
  });
});

export { userRoute };
