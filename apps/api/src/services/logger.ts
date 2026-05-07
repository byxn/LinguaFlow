import { Request, Variables } from "hono";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  context?: Record<string, unknown>;
}

const logs: LogEntry[] = [];
const MAX_LOGS = 1000;

export function logInfo(message: string, context?: Record<string, unknown>) {
  logs.push({
    timestamp: new Date().toISOString(),
    level: "info",
    message,
    context,
  });
  trimLogs();
  console.log(`[INFO] ${message}`, context || "");
}

export function logWarn(message: string, context?: Record<string, unknown>) {
  logs.push({
    timestamp: new Date().toISOString(),
    level: "warn",
    message,
    context,
  });
  trimLogs();
  console.warn(`[WARN] ${message}`, context || "");
}

export function logError(message: string, context?: Record<string, unknown>) {
  logs.push({
    timestamp: new Date().toISOString(),
    level: "error",
    message,
    context,
  });
  trimLogs();
  console.error(`[ERROR] ${message}`, context || "");
}

function trimLogs() {
  while (logs.length > MAX_LOGS) {
    logs.shift();
  }
}

export function getLogs(level?: "info" | "warn" | "error"): LogEntry[] {
  if (!level) return [...logs];
  return logs.filter((l) => l.level === level);
}

export function clearLogs() {
  logs.length = 0;
}
