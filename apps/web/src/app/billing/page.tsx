"use client";

import { useState, useEffect } from "react";

interface QuotaInfo {
  plan: "free" | "pro" | "team";
  dailyLimit: number;
  dailyUsed: number;
  resetAt: string;
}

interface PlanInfo {
  name: string;
  nameCn: string;
  price: string;
  features: string[];
  popular?: boolean;
}

const PLANS: PlanInfo[] = [
  {
    name: "Free",
    nameCn: "免费版",
    price: "¥0",
    features: [
      "50,000 字符/天",
      "基础翻译功能",
      "生词本存储",
    ],
  },
  {
    name: "Pro",
    nameCn: "专业版",
    price: "¥49/月",
    popular: true,
    features: [
      "500,000 字符/天",
      "高级 AI 解释",
      "YouTube 字幕翻译",
      "优先客服支持",
      "自定义术语表",
    ],
  },
  {
    name: "Team",
    nameCn: "团队版",
    price: "¥199/月",
    features: [
      "无限字符",
      "专业版全部功能",
      "团队共享术语表",
      "管理后台",
      "账单与发票",
    ],
  },
];

export default function BillingPage() {
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState("free");

  useEffect(() => {
    fetchQuota();
  }, []);

  async function fetchQuota() {
    try {
      const response = await fetch("/api/user/quota");
      if (!response.ok) {
        throw new Error("Failed to fetch quota");
      }
      const data = await response.json() as QuotaInfo;
      setQuota(data);
      setCurrentPlan(data.plan);
    } catch (error) {
      console.error("Failed to fetch quota:", error);
      // API 不可用时显示错误
      setQuota(null);
    } finally {
      setLoading(false);
    }
  }

  function getUsagePercentage(): number {
    if (!quota) return 0;
    return Math.round((quota.dailyUsed / quota.dailyLimit) * 100);
  }

  function getProgressClass(): string {
    const pct = getUsagePercentage();
    if (pct > 80) return "danger";
    if (pct > 60) return "warning";
    return "normal";
  }

  return (
    <div className="page-container">
      <h1 className="page-header">💳 订阅与套餐</h1>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !quota ? (
        <div className="card bg-red-50 border border-red-200">
          <div className="text-center py-4">
            <p className="text-red-600 mb-2">无法加载用量信息</p>
            <p className="text-sm text-gray-500">请确保 API 服务正在运行</p>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="card-title">📊 当前用量</h2>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">今日翻译</span>
                <span className="font-medium text-gray-800">
                  {quota?.dailyUsed.toLocaleString()} /{" "}
                  {quota?.dailyLimit.toLocaleString()} 字符
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-bar-fill ${getProgressClass()}`}
                  style={{ width: `${getUsagePercentage()}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {quota?.resetAt && `重置时间: ${new Date(quota.resetAt).toLocaleString()}`}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <span className="text-gray-600">当前套餐</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                {currentPlan === "free" ? "免费版" : currentPlan === "pro" ? "专业版" : "团队版"}
              </span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">选择您的套餐</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`plan-card ${currentPlan === plan.name.toLowerCase() ? "current" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg">
                      ⭐ 最受欢迎
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="plan-name">{plan.nameCn}</h3>
                  <p className="text-sm text-gray-500">{plan.name}</p>
                  <p className="plan-price mt-2">{plan.price}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start">
                      <span className="text-emerald-500 mr-2 flex-shrink-0">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    currentPlan === plan.name.toLowerCase()
                      ? "bg-gray-100 text-gray-400 cursor-default"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
                  }`}
                  disabled={currentPlan === plan.name.toLowerCase()}
                >
                  {currentPlan === plan.name.toLowerCase()
                    ? "当前套餐"
                    : plan.name === "Free"
                    ? "选择免费版"
                    : "立即升级"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
