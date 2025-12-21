"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  AreaSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type MouseEventParams,
  type UTCTimestamp,
  type Time,
  type DeepPartial,
  type ChartOptions,
} from "lightweight-charts";
import { formatInTimeZone } from "date-fns-tz";

interface ApiReturnPoint {
  time: string; // ISO UTC
  price: number;
  profit: number; // USD
  delta: number;
}

interface PnlSeriesResponse {
  data: ApiReturnPoint[];
}

interface OperationPnlChartProps {
  symbol: string;
  operationId?: string; // ✅ agora existe
  autoRefreshMs?: number;
  totalInvestedActiveUsd?: number;
  hours?: number; // ✅ agora existe
}

interface PnlPoint {
  time: string;
  unixTime: UTCTimestamp;
  timeLabel: string;
  price: number;
  profit: number;
  delta: number;
}

interface HoverInfo {
  timeLabel: string;
  price: number | null;
  profit: number | null;
}

const TIMEZONE = "America/Sao_Paulo";
const TIME_LABEL_FORMAT = "dd/MM HH:mm";
const SUMMARY_TIME_FORMAT = "dd/MM/yyyy HH:mm";

function safeNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatTokenPrice = (value: number): string => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return num < 1 ? num.toFixed(6) : num.toFixed(2);
};

// ========================== UI bits ==========================
function KpiPill({
  label,
  value,
  valueClass = "text-slate-100",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className={`text-sm font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-200/80 backdrop-blur-xl">
      {children}
    </span>
  );
}

function createNeonChartOptions(): DeepPartial<ChartOptions> {
  return {
    layout: {
      background: { type: ColorType.Solid, color: "transparent" },
      textColor: "rgba(255,255,255,0.78)",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
      fontSize: 11,
    },
    grid: {
      vertLines: { color: "rgba(255,255,255,0.04)" },
      horzLines: { color: "rgba(255,255,255,0.04)" },
    },
    crosshair: {
      mode: 1,
      vertLine: { color: "rgba(255,255,255,0.18)", width: 1, style: 2 },
      horzLine: { color: "rgba(255,255,255,0.18)", width: 1, style: 2 },
    },
    timeScale: {
      borderVisible: false,
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 2,
      barSpacing: 7,
      fixLeftEdge: true,
      lockVisibleTimeRangeOnResize: false,
    },
    rightPriceScale: {
      borderVisible: false,
      scaleMargins: { top: 0.25, bottom: 0.18 },
    },
  };
}

// ============================================================

export function OperationPnlChart({
  symbol,
  operationId,
  autoRefreshMs = 60_000,
  totalInvestedActiveUsd = 0,
  hours,
}: OperationPnlChartProps) {
  const [data, setData] = useState<PnlPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  // toggles (produto)
  const [showEquityPanel, setShowEquityPanel] = useState(true);

  // DOM refs
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const equityContainerRef = useRef<HTMLDivElement | null>(null);

  // Chart refs
  const mainChartRef = useRef<IChartApi | null>(null);
  const equityChartRef = useRef<IChartApi | null>(null);

  // Series refs (pra não recriar chart a cada update)
  const profitSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const priceSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const investedSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const equitySeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // Map O(1) p/ tooltip
  const pointByTime = useMemo(() => {
    const m = new Map<number, PnlPoint>();
    for (const p of data) m.set(p.unixTime as number, p);
    return m;
  }, [data]);

  // ================== FETCH + POLLING ==================
  useEffect(() => {
    if (!symbol) return;

    let abortController = new AbortController();
    let intervalId: number | undefined;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        if (operationId) params.set("operationId", operationId);
        if (hours) params.set("hours", String(hours));

        const res = await fetch(
          `/api/coins/${symbol}/pnl-series?${params.toString()}`,
          { cache: "no-store", signal: abortController.signal },
        );

        const json = (await res.json().catch(() => undefined)) as
          | (PnlSeriesResponse & { error?: string })
          | undefined;

        if (!res.ok || !json) {
          throw new Error(json?.error || "Erro ao buscar dados de PnL");
        }

        const sorted = [...json.data].sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
        );

        const formatted: PnlPoint[] = sorted.map((p) => {
          const unixTime = Math.floor(
            new Date(p.time).getTime() / 1000,
          ) as UTCTimestamp;

          return {
            time: p.time,
            unixTime,
            timeLabel: formatInTimeZone(p.time, TIMEZONE, TIME_LABEL_FORMAT),
            price: safeNumber(p.price),
            profit: safeNumber(p.profit),
            delta: safeNumber(p.delta),
          };
        });

        setData(formatted);
        setLastUpdatedAt(new Date());
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (autoRefreshMs && autoRefreshMs > 0) {
      intervalId = window.setInterval(() => {
        abortController.abort();
        abortController = new AbortController();
        fetchData();
      }, autoRefreshMs);
    }

    return () => {
      abortController.abort();
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [symbol, operationId, autoRefreshMs, hours]);

  // ================== DERIVADOS (KPIs) ==================
  const lastPoint = data.length ? data[data.length - 1] : null;

  const invested = useMemo(
    () => safeNumber(totalInvestedActiveUsd),
    [totalInvestedActiveUsd],
  );
  const lastProfit = useMemo(() => safeNumber(lastPoint?.profit), [lastPoint]);
  const lastPrice = useMemo(() => safeNumber(lastPoint?.price), [lastPoint]);

  const equityNow = useMemo(() => {
    if (!Number.isFinite(invested) || !Number.isFinite(lastProfit)) {
      return invested;
    }
    return invested + lastProfit;
  }, [invested, lastProfit]);

  const roiPct = invested > 0 ? (lastProfit / invested) * 100 : 0;

  const profitExtrema = useMemo(() => {
    if (!data.length) return null;

    let maxPoint = data[0];
    let minPoint = data[0];

    for (const p of data) {
      if (p.profit > maxPoint.profit) maxPoint = p;
      if (p.profit < minPoint.profit) minPoint = p;
    }

    return {
      max: {
        value: maxPoint.profit,
        timeLabel: formatInTimeZone(
          maxPoint.time,
          TIMEZONE,
          SUMMARY_TIME_FORMAT,
        ),
      },
      min: {
        value: minPoint.profit,
        timeLabel: formatInTimeZone(
          minPoint.time,
          TIMEZONE,
          SUMMARY_TIME_FORMAT,
        ),
      },
    };
  }, [data]);

  const profitColor = lastProfit >= 0 ? "text-emerald-300" : "text-red-300";
  const equityColor =
    equityNow >= invested ? "text-emerald-300" : "text-red-300";
  const roiColor = roiPct >= 0 ? "text-emerald-300" : "text-red-300";

  // ================== INIT Chart Principal (uma vez) ==================
  useEffect(() => {
    if (!mainContainerRef.current) return;
    if (mainChartRef.current) return;

    const el = mainContainerRef.current;
    const base = createNeonChartOptions();

    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight || 420,
      ...base,
      rightPriceScale: { ...(base.rightPriceScale ?? {}), visible: true },
      leftPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: { top: 0.26, bottom: 0.16 },
      },
      localization: {
        timeFormatter: (time: Time): string => {
          if (typeof time === "number") {
            const ts = time as UTCTimestamp;
            const p = pointByTime.get(ts as number);
            if (p) return p.timeLabel;
            return formatInTimeZone((ts as number) * 1000, TIMEZONE, "HH:mm");
          }
          return String(time);
        },
      },
    });

    mainChartRef.current = chart;

    // Séries
    const profitSeries = chart.addSeries(AreaSeries, {
      priceScaleId: "left",
      lineWidth: 1,
      lineColor: "#22c55e",
      topColor: "rgba(34,197,94,0.25)",
      bottomColor: "rgba(2,6,23,0.02)",
    }) as ISeriesApi<"Area">;

    const priceSeries = chart.addSeries(LineSeries, {
      priceScaleId: "right",
      lineWidth: 1,
      color: "rgba(96,165,250,0.95)",
      lastValueVisible: true,
      priceLineVisible: true,
      crosshairMarkerVisible: true,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    }) as ISeriesApi<"Line">;

    profitSeriesRef.current = profitSeries;
    priceSeriesRef.current = priceSeries;

    // Resize
    const ro = new ResizeObserver(() => {
      if (!mainContainerRef.current || !mainChartRef.current) return;
      mainChartRef.current.applyOptions({
        width: mainContainerRef.current.clientWidth,
        height: mainContainerRef.current.clientHeight || 420,
      });
    });

    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      mainChartRef.current = null;
      profitSeriesRef.current = null;
      priceSeriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointByTime]);

  // ================== UPDATE Chart Principal (quando data muda) ==================
  useEffect(() => {
    if (
      !mainChartRef.current ||
      !profitSeriesRef.current ||
      !priceSeriesRef.current
    )
      return;
    if (!data.length) return;

    // Profit color dinâmica
    const isProfitPositive = data[data.length - 1].profit >= 0;

    profitSeriesRef.current.applyOptions({
      lineColor: isProfitPositive ? "#22c55e" : "#ef4444",
      topColor: isProfitPositive
        ? "rgba(34,197,94,0.25)"
        : "rgba(239,68,68,0.25)",
      bottomColor: "rgba(2,6,23,0.02)",
    });

    // Preço com precision dinâmica
    const lp = data[data.length - 1].price;
    const precision = lp < 1 ? 6 : 2;
    const minMove = lp < 1 ? 0.000001 : 0.01;

    priceSeriesRef.current.applyOptions({
      priceFormat: { type: "price", precision, minMove },
    });

    const profitData: LineData[] = data.map((p) => ({
      time: p.unixTime,
      value: p.profit,
    }));
    const priceData: LineData[] = data.map((p) => ({
      time: p.unixTime,
      value: p.price,
    }));

    profitSeriesRef.current.setData(profitData);
    priceSeriesRef.current.setData(priceData);

    mainChartRef.current.timeScale().fitContent();
  }, [data]);

  // ================== Tooltip premium ==================
  const onCrosshairMove = useCallback(
    (param: MouseEventParams) => {
      if (!param.time || !profitSeriesRef.current || !priceSeriesRef.current) {
        setHoverInfo(null);
        return;
      }

      const ts = param.time as UTCTimestamp;
      const point = pointByTime.get(ts as number);

      const profitPoint = param.seriesData.get(profitSeriesRef.current);
      const pricePoint = param.seriesData.get(priceSeriesRef.current);

      const profitValue =
        profitPoint && "value" in profitPoint
          ? Number(profitPoint.value)
          : null;
      const priceValue =
        pricePoint && "value" in pricePoint ? Number(pricePoint.value) : null;

      setHoverInfo({
        timeLabel:
          point?.timeLabel ??
          formatInTimeZone((ts as number) * 1000, TIMEZONE, TIME_LABEL_FORMAT),
        price: priceValue,
        profit: profitValue,
      });
    },
    [pointByTime],
  );

  useEffect(() => {
    if (!mainChartRef.current) return;
    const chart = mainChartRef.current;

    chart.subscribeCrosshairMove(onCrosshairMove);
    return () => chart.unsubscribeCrosshairMove(onCrosshairMove);
  }, [onCrosshairMove]);

  // ================== INIT Equity chart (uma vez) ==================
  useEffect(() => {
    if (!equityContainerRef.current) return;
    if (equityChartRef.current) return;

    const el = equityContainerRef.current;
    const base = createNeonChartOptions();

    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight || 170,
      ...base,
      rightPriceScale: {
        ...(base.rightPriceScale ?? {}),
        visible: true,
        scaleMargins: { top: 0.25, bottom: 0.18 },
      },
    });

    equityChartRef.current = chart;

    const investedSeries = chart.addSeries(LineSeries, {
      lineWidth: 1,
      color: "rgba(148,163,184,0.70)",
      lineStyle: 2,
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    }) as ISeriesApi<"Line">;

    const equitySeries = chart.addSeries(LineSeries, {
      lineWidth: 1,
      color: "#22c55e",
      lastValueVisible: true,
      priceLineVisible: true,
      crosshairMarkerVisible: true,
    }) as ISeriesApi<"Line">;

    investedSeriesRef.current = investedSeries;
    equitySeriesRef.current = equitySeries;

    const ro = new ResizeObserver(() => {
      if (!equityContainerRef.current || !equityChartRef.current) return;
      equityChartRef.current.applyOptions({
        width: equityContainerRef.current.clientWidth,
        height: equityContainerRef.current.clientHeight || 170,
      });
    });

    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      equityChartRef.current = null;
      investedSeriesRef.current = null;
      equitySeriesRef.current = null;
    };
  }, []);

  // ================== UPDATE Equity chart ==================
  useEffect(() => {
    if (
      !equityChartRef.current ||
      !investedSeriesRef.current ||
      !equitySeriesRef.current
    )
      return;
    if (!data.length) return;

    const equityPositive =
      invested + (data[data.length - 1]?.profit ?? 0) >= invested;

    equitySeriesRef.current.applyOptions({
      color: equityPositive ? "#22c55e" : "#ef4444",
    });

    const investedData: LineData[] = data.map((p) => ({
      time: p.unixTime,
      value: invested,
    }));
    const equityData: LineData[] = data.map((p) => ({
      time: p.unixTime,
      value: invested + p.profit,
    }));

    investedSeriesRef.current.setData(investedData);
    equitySeriesRef.current.setData(equityData);

    equityChartRef.current.timeScale().fitContent();
  }, [data, invested]);

  // ================== States ==================
  if (loading && !data.length) {
    return (
      <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-40 rounded bg-white/10" />
          <div className="h-3 w-72 rounded bg-white/10" />
          <div className="mt-4 h-[420px] rounded-2xl bg-white/5" />
          <div className="h-3 w-56 rounded bg-white/10" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-500/10 to-white/[0.02] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="text-sm text-red-200">Erro: {error}</div>
        <button
          className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 hover:bg-white/10"
          onClick={() => {
            setError(null);
            setData([]);
          }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="text-sm text-slate-300">
          Sem dados para esse período.
        </div>
      </div>
    );
  }

  const tooltipProfit = hoverInfo?.profit ?? null;
  const tooltipPrice = hoverInfo?.price ?? null;

  return (
    <div className="from-white/6 relative w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b to-white/[0.02] shadow-[0_20px_70px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
      {/* Neon glows */}
      <div className="bg-emerald-500/12 pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full blur-3xl" />
      <div className="bg-sky-500/12 pointer-events-none absolute -bottom-36 -left-32 h-80 w-80 rounded-full blur-3xl" />
      <div className="bg-fuchsia-500/8 pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl" />

      <div className="relative p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Chip>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {symbol}
              </Chip>

              <Chip>PnL x Price</Chip>

              {lastUpdatedAt && (
                <Chip>
                  Atualizado{" "}
                  {formatInTimeZone(lastUpdatedAt, TIMEZONE, "HH:mm:ss")}
                </Chip>
              )}
            </div>

            <h3 className="text-base font-semibold tracking-tight text-slate-100">
              Operações abertas — Dashboard
            </h3>

            <div className="text-xs text-slate-400">
              Preço atual:{" "}
              <span className="font-semibold text-slate-200">
                ${formatTokenPrice(lastPrice)}
              </span>{" "}
              • Lucro atual:{" "}
              <span className={`font-semibold ${profitColor}`}>
                {formatCurrency(lastProfit)}
              </span>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid w-full gap-2 sm:grid-cols-3 md:w-auto">
            <KpiPill label="Investido" value={formatCurrency(invested)} />
            <KpiPill
              label="Valor atual"
              value={formatCurrency(equityNow)}
              valueClass={equityColor}
            />
            <KpiPill
              label="ROI"
              value={invested > 0 ? `${roiPct.toFixed(2)}%` : "-"}
              valueClass={roiColor}
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="inline-flex items-center gap-2">
              <span className="h-[2px] w-5 rounded bg-emerald-400/80" />
              PnL
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-[2px] w-5 rounded bg-sky-400/80" />
              Preço
            </span>
          </div>

          <button
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 hover:bg-white/10"
            onClick={() => setShowEquityPanel((v) => !v)}
          >
            {showEquityPanel ? "Ocultar Equity" : "Mostrar Equity"}
          </button>
        </div>

        {/* Tooltip premium */}
        {hoverInfo && (
          <div className="pointer-events-none absolute right-5 top-5 z-10 w-[200px] rounded-2xl border border-white/10 bg-black/40 p-3 text-[11px] text-slate-100 shadow-xl backdrop-blur-2xl">
            <div className="mb-2 text-[10px] text-slate-300">
              {hoverInfo.timeLabel}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Preço</span>
              <span className="font-semibold">
                {tooltipPrice == null
                  ? "-"
                  : `$${formatTokenPrice(tooltipPrice)}`}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between">
              <span className="text-slate-400">Lucro</span>
              <span
                className={`font-semibold ${
                  (tooltipProfit ?? 0) >= 0
                    ? "text-emerald-300"
                    : "text-red-300"
                }`}
              >
                {tooltipProfit == null ? "-" : formatCurrency(tooltipProfit)}
              </span>
            </div>
          </div>
        )}

        {/* Chart principal */}
        <div className="mt-4 rounded-3xl border border-white/10 bg-black/25 p-2 sm:p-3">
          <div
            ref={mainContainerRef}
            className="h-[420px] w-full rounded-2xl"
          />
        </div>

        {/* Extremos */}
        {profitExtrema && (
          <div className="mt-4 grid gap-2 text-xs text-slate-200 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">
                Máximo (PnL)
              </div>
              <div className="mt-1 font-semibold text-emerald-300">
                {formatCurrency(profitExtrema.max.value)}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {profitExtrema.max.timeLabel}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">
                Mínimo (PnL)
              </div>
              <div className="mt-1 font-semibold text-red-300">
                {formatCurrency(profitExtrema.min.value)}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {profitExtrema.min.timeLabel}
              </div>
            </div>
          </div>
        )}

        {/* Equity mini panel */}
        {showEquityPanel && (
          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_240px]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-100">Equity</p>
                <span className="text-[10px] text-slate-400">
                  investido vs atual
                </span>
              </div>
              <div
                ref={equityContainerRef}
                className="h-[170px] w-full rounded-2xl"
              />
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-3">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">
                Resumo
              </div>

              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Investido</span>
                  <span className="font-semibold text-slate-100">
                    {formatCurrency(invested)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Atual</span>
                  <span className={`font-semibold ${equityColor}`}>
                    {formatCurrency(equityNow)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">PnL</span>
                  <span className={`font-semibold ${profitColor}`}>
                    {formatCurrency(lastProfit)}
                  </span>
                </div>

                <div className="pt-2 text-[11px] text-slate-400">
                  Linha tracejada = investido • linha sólida = equity
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer mini */}
        {/* <div className="mt-5 text-[11px] text-slate-500">
          Dica: use o crosshair pra ver preço e lucro no tempo.
          {loading && <span className="ml-2 text-slate-300">Atualizando…</span>}
        </div> */}
      </div>
    </div>
  );
}
