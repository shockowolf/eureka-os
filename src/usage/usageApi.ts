import type {
  BalanceKind,
  ModelUsageRow,
  ProviderBalanceView,
  ProviderId,
  ProviderStatus,
  SourceKind,
  UsageRange,
  UsageSummaryView,
} from './types';

const providerIds = new Set<ProviderId>([
  'openai_api',
  'openai_chatgpt',
  'anthropic_api',
  'anthropic_claude',
  'deepseek',
  'google_vertex',
  'google_gemini',
]);
const sourceKinds = new Set<SourceKind>(['official_api', 'manual', 'unsupported', 'unconfigured']);
const balanceKinds = new Set<BalanceKind>(['percent', 'currency', 'credits', 'unknown']);
const providerStatuses = new Set<ProviderStatus>(['available', 'stale', 'unsupported', 'unconfigured', 'error']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

function safeSourceUrl(value: unknown): string | null {
  const sourceUrl = nullableString(value);
  if (!sourceUrl) return null;
  try {
    const url = new URL(sourceUrl);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizeModelRow(value: unknown): ModelUsageRow | null {
  if (!isRecord(value) || typeof value.model !== 'string' || !value.model.trim() || !providerIds.has(value.provider as ProviderId)) return null;
  return {
    provider: value.provider as ProviderId,
    model: value.model,
    inputTokens: nullableNumber(value.inputTokens),
    outputTokens: nullableNumber(value.outputTokens),
    cachedInputTokens: nullableNumber(value.cachedInputTokens),
    costMicros: nullableNumber(value.costMicros),
    currency: nullableString(value.currency),
    lastEvent: nullableString(value.lastEvent),
  };
}

function normalizeSummary(value: unknown, range: UsageRange): UsageSummaryView {
  if (!isRecord(value)) throw new Error('사용량 요약 응답 형식이 올바르지 않습니다.');
  const rows = Array.isArray(value.models) ? value.models.map(normalizeModelRow).filter((row): row is ModelUsageRow => row !== null) : [];
  return {
    range,
    inputTokens: nullableNumber(value.inputTokens),
    outputTokens: nullableNumber(value.outputTokens),
    totalTokens: nullableNumber(value.totalTokens),
    eventCount: nullableNumber(value.eventCount),
    costMicros: nullableNumber(value.costMicros),
    currency: nullableString(value.currency),
    models: rows,
  };
}

function normalizeProvider(value: unknown): ProviderBalanceView | null {
  if (!isRecord(value) || !providerIds.has(value.provider as ProviderId)) return null;

  const sourceKind = sourceKinds.has(value.sourceKind as SourceKind) ? value.sourceKind as SourceKind : 'unconfigured';
  const balanceKind = balanceKinds.has(value.balanceKind as BalanceKind) ? value.balanceKind as BalanceKind : 'unknown';
  const status = providerStatuses.has(value.status as ProviderStatus) ? value.status as ProviderStatus : 'unconfigured';
  const remainingPercent = nullableNumber(value.remainingPercent);

  return {
    provider: value.provider as ProviderId,
    sourceKind,
    balanceKind,
    remainingPercent: remainingPercent !== null && remainingPercent <= 100 ? remainingPercent : null,
    remainingAmountMicros: nullableNumber(value.remainingAmountMicros),
    currency: nullableString(value.currency),
    remainingCouponCount: nullableNumber(value.remainingCouponCount),
    resetsAt: nullableString(value.resetsAt),
    checkedAt: nullableString(value.checkedAt),
    expiresAt: nullableString(value.expiresAt),
    sourceUrl: safeSourceUrl(value.sourceUrl),
    status,
    message: nullableString(value.message),
  };
}

async function getJson(response: Response): Promise<unknown> {
  if (!response.ok) throw new Error(`사용량 API 요청 실패 (${response.status})`);
  return response.json() as Promise<unknown>;
}

export async function getSummary(range: UsageRange, signal?: AbortSignal): Promise<UsageSummaryView> {
  const response = await fetch(`/api/ai-usage/summary?range=${encodeURIComponent(range)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });
  return normalizeSummary(await getJson(response), range);
}

export async function getProviders(signal?: AbortSignal): Promise<ProviderBalanceView[]> {
  const response = await fetch('/api/ai-usage/providers', {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = await getJson(response);
  const values = Array.isArray(payload) ? payload : isRecord(payload) && Array.isArray(payload.providers) ? payload.providers : null;
  if (!values) throw new Error('공급자 응답 형식이 올바르지 않습니다.');
  return values.map(normalizeProvider).filter((provider): provider is ProviderBalanceView => provider !== null);
}

export function createIdempotencyKey(provider: ProviderId): string {
  const randomId = globalThis.crypto.randomUUID();
  return `usage-${provider}-${randomId}`;
}

export async function refreshProvider(provider: ProviderId, idempotencyKey: string): Promise<ProviderBalanceView> {
  const response = await fetch(`/api/ai-usage/providers/${encodeURIComponent(provider)}/refresh`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
  });
  const payload = await getJson(response);
  const value = isRecord(payload) && 'provider' in payload && isRecord(payload.provider) ? payload.provider : payload;
  const normalized = normalizeProvider(value);
  if (!normalized || normalized.provider !== provider) throw new Error('공급자 새로고침 응답 형식이 올바르지 않습니다.');
  return normalized;
}
