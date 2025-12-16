"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

interface PnlPoint {
  time: string; // ISO UTC
  unixTime: UTCTimestamp;
  timeLabel: string; // BRT label
  price: number;
  profit: number; // lucro em USD (mesma unidade do investido)
  delta: number;
}

interface ApiReturnPoint {
  time: string;
  price: number;
  profit: number;
  delta: number;
}

interface PnlSeriesResponse {
  data: ApiReturnPoint[];
}

interface OperationPnlChartProps {
  symbol: string;
  operationId?: string;
  autoRefreshMs?: number;
  totalInvestedActiveUsd?: number;
}

interface HoverInfo {
  timeLabel: string;
  price: number | null;
  profit: number | null;
}

const TIMEZONE = "America/Sao_Paulo";
const TIME_LABEL_FORMAT = "dd/MM HH:mm";
const SUMMARY_TIME_FORMAT = "dd/MM/yyyy HH:mm";

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

function createBaseChartOptions(): DeepPartial<ChartOptions> {
  return {
    layout: {
      background: { type: ColorType.Solid, color: "transparent" },
      textColor: "rgba(226,232,240,0.85)",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
      fontSize: 12,
    },
    grid: {
      vertLines: { color: "rgba(148,163,184,0.06)" },
      horzLines: { color: "rgba(148,163,184,0.06)" },
    },
    crosshair: {
      mode: 1,
      vertLine: { color: "rgba(148,163,184,0.25)", width: 1, style: 2 },
      horzLine: { color: "rgba(148,163,184,0.25)", width: 1, style: 2 },
    },
    timeScale: {
      borderVisible: false,
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 3,
      barSpacing: 10,
      fixLeftEdge: true,
      lockVisibleTimeRangeOnResize: true,
    },
    rightPriceScale: {
      borderVisible: false,
      scaleMargins: {
        top: 0.25,
        bottom: 0.18,
      },
    },
  };
}

function safeNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function OperationPnlChart({
  symbol,
  operationId,
  autoRefreshMs = 60_000,
  totalInvestedActiveUsd = 0,
}: OperationPnlChartProps) {
  const [data, setData] = useState<PnlPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const investedContainerRef = useRef<HTMLDivElement | null>(null);
  const investedChartRef = useRef<IChartApi | null>(null);

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

        const res = await fetch(
          `/api/coins/${symbol}/pnl-series?${params.toString()}`,
          {
            cache: "no-store",
            signal: abortController.signal,
          },
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
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof Error) setError(err.message);
        else setError("Erro ao carregar dados");
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
  }, [symbol, operationId, autoRefreshMs]);

  // ================== DERIVADOS (KPIs) ==================
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

  const lastPoint = data.length ? data[data.length - 1] : null;

  const invested = useMemo(
    () => safeNumber(totalInvestedActiveUsd),
    [totalInvestedActiveUsd],
  );
  const lastProfit = useMemo(() => safeNumber(lastPoint?.profit), [lastPoint]);
  const equityNow = invested + lastProfit;
  const roiPct = invested > 0 ? (lastProfit / invested) * 100 : 0;

  // ================== CHART PRINCIPAL (Lucro x Preço) ==================
  useEffect(() => {
    if (!containerRef.current) return;
    if (!data.length) return;

    // cleanup anterior
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const el = containerRef.current;
    const { clientWidth, clientHeight } = el;

    const base = createBaseChartOptions();

    const chart = createChart(el, {
      width: clientWidth,
      height: clientHeight,
      ...base,
      // dois eixos (lucro à esquerda, preço à direita)
      rightPriceScale: {
        ...(base.rightPriceScale ?? {}),
        visible: true,
      },
      leftPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: { top: 0.25, bottom: 0.18 },
      },
      localization: {
        timeFormatter: (time: Time): string => {
          if (typeof time === "number") {
            const ts = time as UTCTimestamp;
            const point = data.find((p) => p.unixTime === ts);
            if (point) return point.timeLabel;
            return formatInTimeZone(ts * 1000, TIMEZONE, "HH:mm");
          }
          return String(time);
        },
      },
    });

    chartRef.current = chart;

    const lastProfitLocal = data[data.length - 1].profit;
    const isProfitPositive = lastProfitLocal >= 0;

    const lastPrice = data[data.length - 1].price;
    const pricePrecision = lastPrice < 1 ? 6 : 2;
    const priceMinMove = lastPrice < 1 ? 0.000001 : 0.01;

    const profitLineColor = isProfitPositive ? "#22c55e" : "#ef4444";
    const profitTopColor = isProfitPositive
      ? "rgba(34,197,94,0.28)"
      : "rgba(239,68,68,0.28)";
    const profitBottomColor = "rgba(2,6,23,0.02)";

    const profitSeries = chart.addSeries(AreaSeries, {
      priceScaleId: "left",
      lineColor: profitLineColor,
      topColor: profitTopColor,
      bottomColor: profitBottomColor,
      lineWidth: 1,
    }) as ISeriesApi<"Area">;

    const priceSeries = chart.addSeries(LineSeries, {
      priceScaleId: "right",
      color: "#60a5fa",
      lineWidth: 1,
      lastValueVisible: true,
      priceLineVisible: true,
      crosshairMarkerVisible: true,
      priceFormat: {
        type: "price",
        precision: pricePrecision,
        minMove: priceMinMove,
      },
    }) as ISeriesApi<"Line">;

    const profitData: LineData[] = data.map((p) => ({
      time: p.unixTime,
      value: p.profit,
    }));

    const priceData: LineData[] = data.map((p) => ({
      time: p.unixTime,
      value: p.price,
    }));

    profitSeries.setData(profitData);
    priceSeries.setData(priceData);

    chart.timeScale().fitContent();

    // Tooltip (crosshair)
    const crosshairHandler = (param: MouseEventParams): void => {
      if (param.time === undefined) {
        setHoverInfo(null);
        return;
      }

      const logicalTime = param.time as UTCTimestamp;
      const hoveredPoint = data.find((p) => p.unixTime === logicalTime);

      const profitPoint = param.seriesData.get(profitSeries);
      const pricePoint = param.seriesData.get(priceSeries);

      const profitValue =
        profitPoint && "value" in profitPoint
          ? Number(profitPoint.value)
          : null;

      const priceValue =
        pricePoint && "value" in pricePoint ? Number(pricePoint.value) : null;

      setHoverInfo({
        timeLabel:
          hoveredPoint?.timeLabel ??
          formatInTimeZone(logicalTime * 1000, TIMEZONE, TIME_LABEL_FORMAT),
        price: priceValue,
        profit: profitValue,
      });
    };

    chart.subscribeCrosshairMove(crosshairHandler);

    // resize
    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      const { clientWidth: w, clientHeight: h } = containerRef.current;
      chartRef.current.applyOptions({ width: w, height: h });
    });

    ro.observe(containerRef.current);

    return () => {
      chart.unsubscribeCrosshairMove(crosshairHandler);
      ro.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data]);

  // ================== CHART 2 (Investido x Valor Atual) ==================
  useEffect(() => {
    if (!investedContainerRef.current) return;
    if (!data.length) return;

    if (investedChartRef.current) {
      investedChartRef.current.remove();
      investedChartRef.current = null;
    }

    const el = investedContainerRef.current;
    const { clientWidth } = el;

    const base = createBaseChartOptions();

    const chart = createChart(el, {
      width: clientWidth,
      height: 220,
      ...base,
      rightPriceScale: {
        ...(base.rightPriceScale ?? {}),
        visible: true,
        scaleMargins: { top: 0.22, bottom: 0.14 },
      },
      // este chart não precisa do eixo esquerdo
    });

    investedChartRef.current = chart;

    const investedSeries = chart.addSeries(LineSeries, {
      lineWidth: 1,
      color: "rgba(148,163,184,0.65)",
      lineStyle: 2, // dashed
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
    }) as ISeriesApi<"Line">;

    const equityPositive = invested + (data.at(-1)?.profit ?? 0) >= invested;

    const equitySeries = chart.addSeries(LineSeries, {
      lineWidth: 1,
      color: equityPositive ? "#22c55e" : "#ef4444",
      lastValueVisible: true,
      priceLineVisible: true,
      crosshairMarkerVisible: true,
    }) as ISeriesApi<"Line">;

    const investedData: LineData[] = data.map((p) => ({
      time: p.unixTime,
      value: invested,
    }));

    const equityData: LineData[] = data.map((p) => ({
      time: p.unixTime,
      value: invested + p.profit,
    }));

    investedSeries.setData(investedData);
    equitySeries.setData(equityData);

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (!investedContainerRef.current || !investedChartRef.current) return;
      investedChartRef.current.applyOptions({
        width: investedContainerRef.current.clientWidth,
        height: 220,
      });
    });

    ro.observe(investedContainerRef.current);

    return () => {
      ro.disconnect();
      if (investedChartRef.current) {
        investedChartRef.current.remove();
        investedChartRef.current = null;
      }
    };
  }, [data, invested]);

  // ================== ESTADOS ==================
  if (loading && !data.length) {
    return (
      <div className="flex h-[50vh] w-[50vh] items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-300">
        Carregando gráfico...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center rounded-2xl border border-red-900/60 bg-slate-950/60 p-6 text-sm text-red-300">
        Erro: {error}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-400">
        Sem dados para esse período.
      </div>
    );
  }

  const profitColorClass =
    lastProfit >= 0 ? "text-emerald-400" : "text-red-400";
  const equityColorClass =
    equityNow >= invested ? "text-emerald-400" : "text-red-400";
  const roiColorClass = roiPct >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div className="relative w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      {/* Header */}
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            {symbol} — Lucro x Preço
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Crosshair para detalhes • Horário em {TIMEZONE}
          </p>
        </div>

        {/* KPIs */}
        <div className="grid w-full gap-2 sm:grid-cols-3 md:w-auto">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
            <div className="text-[10px] text-slate-400">Investido (ativo)</div>
            <div className="text-sm font-semibold text-slate-100">
              {formatCurrency(invested)}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
            <div className="text-[10px] text-slate-400">
              Valor atual (estimado)
            </div>
            <div className={`text-sm font-semibold ${equityColorClass}`}>
              {formatCurrency(equityNow)}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
            <div className="text-[10px] text-slate-400">ROI (atual)</div>
            <div className={`text-sm font-semibold ${roiColorClass}`}>
              {invested > 0 ? `${roiPct.toFixed(2)}%` : "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoverInfo && (
        <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-[11px] text-slate-100 shadow-lg backdrop-blur">
          <div className="mb-1 text-[10px] text-slate-400">
            {hoverInfo.timeLabel}
          </div>
          {hoverInfo.price !== null && (
            <div>
              Preço:{" "}
              <span className="font-semibold text-slate-100">
                ${formatTokenPrice(hoverInfo.price)}
              </span>
            </div>
          )}
          {hoverInfo.profit !== null && (
            <div>
              Lucro:{" "}
              <span
                className={
                  hoverInfo.profit >= 0 ? "text-emerald-400" : "text-red-400"
                }
              >
                {formatCurrency(hoverInfo.profit)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Chart 1 */}
      <div
        ref={containerRef}
        className="mt-2 w-full overflow-hidden rounded-xl px-2 sm:px-4 lg:px-6"
        style={{
          height: "min(560px, calc(100vh - 420px))",
        }}
      />

      {/* Extremos */}
      {profitExtrema && (
        <div className="mt-3 grid gap-2 text-[11px] text-slate-300 sm:grid-cols-2">
          <div>
            <span className="font-semibold text-emerald-400">
              Lucro máximo:
            </span>{" "}
            <span>{formatCurrency(profitExtrema.max.value)}</span>{" "}
            <span className="text-slate-500">
              em {profitExtrema.max.timeLabel}
            </span>
          </div>
          <div>
            <span className="font-semibold text-red-400">Lucro mínimo:</span>{" "}
            <span>{formatCurrency(profitExtrema.min.value)}</span>{" "}
            <span className="text-slate-500">
              em {profitExtrema.min.timeLabel}
            </span>
          </div>
        </div>
      )}

      {/* Chart 2 */}
      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/30 p-3">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-100">
              Investido x Valor atual (estimado)
            </div>
            <div className="mt-0.5 text-[11px] text-slate-400">
              Linha tracejada: investido • Linha sólida: valor atual
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
            <span className="inline-flex items-center gap-2">
              <span className="h-[2px] w-5 rounded bg-slate-400/60" />
              Investido
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className={`h-[2px] w-5 rounded ${
                  equityNow >= invested ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              Valor atual
            </span>
          </div>
        </div>

        <div
          ref={investedContainerRef}
          className="w-full overflow-hidden rounded-xl"
          style={{ height: 220 }}
        />
      </div>

      {/* Footer mini */}
      <div className="mt-4 text-[11px] text-slate-500">
        Lucro atual:{" "}
        <span className={`font-semibold ${profitColorClass}`}>
          {formatCurrency(lastProfit)}
        </span>
      </div>
    </div>
  );
}
