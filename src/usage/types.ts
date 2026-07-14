export type UsageRange = 'today' | '7d' | '30d';

export type ProviderId =
  | 'openai_api'
  | 'openai_chatgpt'
  | 'anthropic_api'
  | 'anthropic_claude'
  | 'deepseek'
  | 'google_vertex'
  | 'google_gemini';

export type SourceKind = 'official_api' | 'manual' | 'unsupported' | 'unconfigured';
export type BalanceKind = 'percent' | 'currency' | 'credits' | 'unknown';
export type ProviderStatus = 'available' | 'stale' | 'unsupported' | 'unconfigured' | 'error';

export type ModelUsageRow = {
  provider: ProviderId;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  cachedInputTokens: number | null;
  costMicros: number | null;
  currency: string | null;
  lastEvent: string | null;
};

export type UsageSummaryView = {
  range: UsageRange;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  eventCount: number | null;
  costMicros: number | null;
  currency: string | null;
  models: ModelUsageRow[];
};

export type ProviderBalanceView = {
  provider: ProviderId;
  sourceKind: SourceKind;
  balanceKind: BalanceKind;
  remainingPercent: number | null;
  remainingAmountMicros: number | null;
  currency: string | null;
  remainingCouponCount: number | null;
  resetsAt: string | null;
  checkedAt: string | null;
  expiresAt: string | null;
  sourceUrl: string | null;
  status: ProviderStatus;
  message: string | null;
};

export const visibleProviderIds = ['openai_api', 'anthropic_api', 'deepseek', 'google_vertex'] as const satisfies readonly ProviderId[];

export const providerNames: Record<(typeof visibleProviderIds)[number], string> = {
  openai_api: 'OpenAI',
  anthropic_api: 'Anthropic',
  deepseek: 'DeepSeek',
  google_vertex: 'Google',
};

export function createUnconfiguredProvider(provider: (typeof visibleProviderIds)[number]): ProviderBalanceView {
  return {
    provider,
    sourceKind: 'unconfigured',
    balanceKind: 'unknown',
    remainingPercent: null,
    remainingAmountMicros: null,
    currency: null,
    remainingCouponCount: null,
    resetsAt: null,
    checkedAt: null,
    expiresAt: null,
    sourceUrl: null,
    status: 'unconfigured',
    message: '연결 정보 없음 — 업체 계정 정보는 이 브라우저에 저장하지 않습니다.',
  };
}
