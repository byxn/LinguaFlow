// 内存使用量追踪（按日期）

interface DailyUsage {
  date: string;
  inputChars: number;
  outputChars: number;
  requestCount: number;
}

const dailyUsageMap = new Map<string, DailyUsage>();

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function recordUsage(inputChars: number, outputChars: number = 0): void {
  const today = getToday();
  const existing = dailyUsageMap.get(today);

  if (existing) {
    existing.inputChars += inputChars;
    existing.outputChars += outputChars;
    existing.requestCount += 1;
  } else {
    dailyUsageMap.set(today, {
      date: today,
      inputChars,
      outputChars,
      requestCount: 1,
    });
  }
}

export function getTodayUsage(): DailyUsage {
  const today = getToday();
  return dailyUsageMap.get(today) || {
    date: today,
    inputChars: 0,
    outputChars: 0,
    requestCount: 0,
  };
}

export function getQuotaInfo(): {
  plan: "free";
  dailyLimit: number;
  dailyUsed: number;
  resetAt: string;
} {
  const usage = getTodayUsage();

  // Free plan: 50,000 字符/天
  const dailyLimit = 50000;

  // 计算重置时间（明天 UTC 0点）
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  return {
    plan: "free",
    dailyLimit,
    dailyUsed: usage.inputChars,
    resetAt: tomorrow.toISOString(),
  };
}

// 定期清理旧数据（保留7天）
export function cleanupOldData(): void {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoffDate = sevenDaysAgo.toISOString().split("T")[0];

  for (const [date] of dailyUsageMap) {
    if (date < cutoffDate) {
      dailyUsageMap.delete(date);
    }
  }
}

// 定时清理
setInterval(cleanupOldData, 60 * 60 * 1000); // 每小时清理一次
