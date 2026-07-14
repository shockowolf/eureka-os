import { useEffect, useMemo, useState } from 'react';
import {
  createUnconfiguredProvider,
  providerNames,
  visibleProviderIds,
  type ProviderBalanceView,
  type ProviderId,
  type UsageRange,
  type UsageSummaryView,
} from './types';
import { createIdempotencyKey, getProviders, getSummary, refreshProvider } from './usageApi';

const ranges: Array<{ id: UsageRange; label: string }> = [
  { id: 'today', label: '오늘' },
  { id: '7d', label: '7일' },
  { id: '30d', label: '30일' },
];

const emptySummary = (range: UsageRange): UsageSummaryView => ({
  range,
  inputTokens: null,
  outputTokens: null,
  totalTokens: null,
  eventCount: null,
  costMicros: null,
  currency: null,
  models: [],
});

const defaultProviders = (): Record<(typeof visibleProviderIds)[number], ProviderBalanceView> => Object.fromEntries(
  visibleProviderIds.map((provider) => [provider, createUnconfiguredProvider(provider)]),
) as Record<(typeof visibleProviderIds)[number], ProviderBalanceView>;

function number(value: number | null): string {
  return value === null ? '—' : new Intl.NumberFormat('ko-KR').format(value);
}

function dateTime(value: string | null): string {
  if (!value) return '아직 확인하지 않음';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '확인 시각 형식 오류' : date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
}

function sourceLabel(provider: ProviderBalanceView): string {
  if (provider.sourceKind === 'official_api') return '공식 API';
  if (provider.sourceKind === 'manual') return '수동 기록';
  if (provider.sourceKind === 'unsupported') return '공식 조회 경로 없음';
  return '연결 안 됨';
}

function primaryBalance(provider: ProviderBalanceView): string {
  if (provider.balanceKind === 'percent' && provider.remainingPercent !== null) return `${provider.remainingPercent}% 남음`;
  if ((provider.balanceKind === 'currency' || provider.balanceKind === 'credits') && provider.remainingAmountMicros !== null) {
    const amount = provider.remainingAmountMicros / 1_000_000;
    return `${provider.currency || ''} ${new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(amount)}`.trim();
  }
  return provider.status === 'unsupported' ? '확인 불가' : '연결 안 됨';
}

function tokenValue(value: number | null): string {
  return value === null ? '기록 없음' : number(value);
}

export function UsageConsoleApp() {
  const [range, setRange] = useState<UsageRange>('today');
  const [summary, setSummary] = useState<UsageSummaryView>(() => emptySummary('today'));
  const [providers, setProviders] = useState(defaultProviders);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<ProviderId | null>(null);
  const [notice, setNotice] = useState('저장된 사용량과 마지막 확인값을 불러오는 중입니다.');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setNotice('저장된 사용량과 마지막 확인값을 불러오는 중입니다. 업체 잔여량은 자동으로 조회하지 않습니다.');

    void Promise.allSettled([getSummary(range, controller.signal), getProviders(controller.signal)]).then(([summaryResult, providersResult]) => {
      if (controller.signal.aborted) return;
      if (summaryResult.status === 'fulfilled') setSummary(summaryResult.value);
      else setSummary(emptySummary(range));

      if (providersResult.status === 'fulfilled') {
        setProviders((current) => {
          const next = { ...current };
          for (const provider of providersResult.value) {
            if (provider.provider in next) next[provider.provider as keyof typeof next] = provider;
          }
          return next;
        });
      }

      const cacheAvailable = summaryResult.status === 'fulfilled' || providersResult.status === 'fulfilled';
      setNotice(cacheAvailable
        ? '저장된 값만 표시하고 있습니다. 업체 잔여량은 각 카드의 “지금 조회”를 눌렀을 때만 확인합니다.'
        : '아직 연결된 사용량 수집기가 없습니다. 업체 잔여량은 자동 조회하지 않습니다.');
      setLoading(false);
    });

    return () => controller.abort();
  }, [range]);

  const providerList = useMemo(() => visibleProviderIds.map((provider) => providers[provider]), [providers]);

  const requestRefresh = async (provider: (typeof visibleProviderIds)[number]) => {
    setRefreshing(provider);
    setNotice(`${providerNames[provider]} 잔여량을 요청 중입니다. 이 요청은 지금 누른 카드에만 적용됩니다.`);
    try {
      const next = await refreshProvider(provider, createIdempotencyKey(provider));
      setProviders((current) => ({ ...current, [provider]: next }));
      setNotice(`${providerNames[provider]}의 마지막 확인값을 갱신했습니다.`);
    } catch {
      setNotice(`${providerNames[provider]} 조회에 실패했습니다. 마지막 성공 확인값은 유지합니다.`);
    } finally {
      setRefreshing(null);
    }
  };

  return <div className="content usage-console">
    <header className="usage-hero">
      <div>
        <p className="eyebrow">AI USAGE CONTROL</p>
        <h2>AI 사용량 관제</h2>
        <p>모델 사용량은 기록으로 보고, 업체 잔여량은 필요할 때만 확인합니다.</p>
      </div>
      <div className="usage-range" aria-label="사용량 기간 선택">
        {ranges.map((item) => <button key={item.id} className={range === item.id ? 'active' : ''} aria-pressed={range === item.id} onClick={() => setRange(item.id)}>{item.label}</button>)}
      </div>
    </header>

    <p className="usage-live" aria-live="polite">{notice}</p>

    <section className="usage-overview" aria-label="저장된 모델 사용량">
      <article><span>입력 토큰</span><strong>{tokenValue(summary.inputTokens)}</strong><small>저장된 기록 기준</small></article>
      <article><span>출력 토큰</span><strong>{tokenValue(summary.outputTokens)}</strong><small>저장된 기록 기준</small></article>
      <article><span>총 호출</span><strong>{summary.eventCount === null ? '기록 없음' : number(summary.eventCount)}</strong><small>현재 기간</small></article>
      <article><span>알려진 비용</span><strong>{summary.costMicros === null ? '기록 없음' : `${summary.currency || ''} ${(summary.costMicros / 1_000_000).toFixed(2)}`.trim()}</strong><small>수집 가능한 API만</small></article>
    </section>

    <section className="usage-section" aria-labelledby="provider-balance-title">
      <div className="usage-section-heading">
        <div><p className="eyebrow">ON-DEMAND</p><h3 id="provider-balance-title">업체 잔여량</h3></div>
        <small>자동 새로고침 없음</small>
      </div>
      <div className="provider-grid">
        {providerList.map((provider) => {
          const providerId = provider.provider as (typeof visibleProviderIds)[number];
          const isRefreshing = refreshing === providerId;
          return <article className={`provider-card ${provider.status}`} key={provider.provider}>
            <header><strong>{providerNames[providerId]}</strong><span>{sourceLabel(provider)}</span></header>
            <p className="provider-balance">{primaryBalance(provider)}</p>
            <dl>
              <div><dt>마지막 확인</dt><dd>{dateTime(provider.checkedAt)}</dd></div>
              <div><dt>초기화</dt><dd>{provider.resetsAt ? dateTime(provider.resetsAt) : '정보 없음'}</dd></div>
              <div><dt>쿠폰</dt><dd>{provider.remainingCouponCount === null ? '정보 없음' : `${number(provider.remainingCouponCount)}장`}</dd></div>
            </dl>
            <p className="provider-message">{provider.message || '공식 API가 연결되기 전까지 수치나 초기화 시각을 추정하지 않습니다.'}</p>
            <div className="provider-actions">
              <button onClick={() => void requestRefresh(providerId)} disabled={isRefreshing}>{isRefreshing ? '조회 중…' : '지금 조회'}</button>
              {provider.sourceUrl ? <a href={provider.sourceUrl} target="_blank" rel="noreferrer">출처 보기</a> : null}
            </div>
          </article>;
        })}
      </div>
    </section>

    <section className="usage-section" aria-labelledby="model-ledger-title">
      <div className="usage-section-heading"><div><p className="eyebrow">LOCAL LEDGER</p><h3 id="model-ledger-title">모델별 기록</h3></div><small>{loading ? '불러오는 중' : `${summary.models.length}개 모델`}</small></div>
      {summary.models.length === 0 ? <div className="usage-empty"><strong>아직 저장된 모델 기록이 없습니다.</strong><p>Hermes·Codex·API 호출을 안전한 collector에 연결하면 이곳에 입력·출력 토큰과 알려진 비용이 쌓입니다.</p></div> : <div className="usage-table-wrap"><table><thead><tr><th>모델</th><th>입력</th><th>출력</th><th>캐시</th><th>마지막 기록</th></tr></thead><tbody>{summary.models.map((model) => <tr key={`${model.provider}-${model.model}`}><td><strong>{model.model}</strong><small>{model.provider}</small></td><td>{number(model.inputTokens)}</td><td>{number(model.outputTokens)}</td><td>{number(model.cachedInputTokens)}</td><td>{dateTime(model.lastEvent)}</td></tr>)}</tbody></table></div>}
    </section>

    <aside className="usage-trust"><strong>표시 원칙</strong><span>브라우저에는 업체 키·쿠키·계정 정보를 저장하지 않습니다. 공식 조회 경로가 없는 구독 사용량은 “확인 불가”로 남기며, 수동 기록과 추정값을 공식 잔여량처럼 섞지 않습니다.</span></aside>
  </div>;
}
