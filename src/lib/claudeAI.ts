// Client-side usage tracking for Claude AI calls.
// Actual API calls happen server-side in claude.functions.ts.

const STORAGE_KEY = "pilot-ai-usage";

type PlanId = "free" | "starter" | "pro" | "founder" | "enterprise";

const PLAN_LIMITS: Record<string, number> = {
  free: 10,
  starter: 100,
  pro: 300,
  founder: 999999,
  enterprise: 999999,
};

type UsageRecord = {
  count: number;
  month: string; // "YYYY-MM"
};

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function readUsage(): UsageRecord {
  if (typeof window === "undefined") return { count: 0, month: currentMonth() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, month: currentMonth() };
    const parsed = JSON.parse(raw) as UsageRecord;
    // Reset on new month
    if (parsed.month !== currentMonth()) return { count: 0, month: currentMonth() };
    return parsed;
  } catch {
    return { count: 0, month: currentMonth() };
  }
}

function writeUsage(record: UsageRecord): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function checkUsageLimit(plan: PlanId | string): { allowed: boolean; remaining: number; used: number; limit: number } {
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const record = readUsage();
  const remaining = Math.max(0, limit - record.count);
  return { allowed: remaining > 0, remaining, used: record.count, limit };
}

export function incrementUsage(): void {
  const record = readUsage();
  writeUsage({ ...record, count: record.count + 1 });
}
