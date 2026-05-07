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
  price: string;
  features: string[];
}

const PLANS: PlanInfo[] = [
  {
    name: "Free",
    price: "$0",
    features: [
      "50,000 characters/day",
      "Basic translation",
      "Vocabulary storage",
    ],
  },
  {
    name: "Pro",
    price: "$9.99/month",
    features: [
      "500,000 characters/day",
      "Advanced AI explanations",
      "YouTube subtitle translation",
      "Priority support",
      "Custom glossary",
    ],
  },
  {
    name: "Team",
    price: "$29.99/month",
    features: [
      "Unlimited characters",
      "All Pro features",
      "Team shared glossary",
      "Admin dashboard",
      "Invoice & billing",
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
      const data = await response.json() as QuotaInfo;
      setQuota(data);
      setCurrentPlan(data.plan);
    } catch (error) {
      console.error("Failed to fetch quota:", error);
    } finally {
      setLoading(false);
    }
  }

  function getUsagePercentage(): number {
    if (!quota) return 0;
    return Math.round((quota.dailyUsed / quota.dailyLimit) * 100);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Billing & Plans</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Current Usage</h2>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Daily Translation</span>
                <span>
                  {quota?.dailyUsed.toLocaleString()} /{" "}
                  {quota?.dailyLimit.toLocaleString()} chars
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    getUsagePercentage() > 80 ? "bg-red-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${getUsagePercentage()}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Resets at {quota?.resetAt && new Date(quota.resetAt).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Plan:</span>
              <span className="font-semibold capitalize">{quota?.plan}</span>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Available Plans</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-lg shadow-sm border ${
                  currentPlan === plan.name.toLowerCase()
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : "border-gray-100"
                } p-6`}
              >
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-2xl font-bold text-gray-800 mb-4">
                  {plan.price}
                </p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    currentPlan === plan.name.toLowerCase()
                      ? "bg-gray-100 text-gray-400 cursor-default"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  disabled={currentPlan === plan.name.toLowerCase()}
                >
                  {currentPlan === plan.name.toLowerCase()
                    ? "Current Plan"
                    : plan.name === "Free"
                    ? "Downgrade"
                    : "Upgrade"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
