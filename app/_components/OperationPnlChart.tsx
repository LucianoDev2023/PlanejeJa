"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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
} from "lightweight-charts";
import { formatInTimeZone } from "date-fns-tz";

interface PnlPoint {
  time: string;
  timeLabel: string;
  price: number;
  profit: number;
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
  symbol: string; // "BTC", "ETH" etc.
  operationId?: string; // opcional: filtro por operação específica
  autoRefreshMs?: number; // 🔹 NOVO: intervalo em ms (ex: 60000)
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

export function OperationPnlChart({
  symbol,
  operationId,
  autoRefreshMs = 60_000, // 🔹 1 minuto por padrão
}: OperationPnlChartProps) {
  const [data, setData] = useState<PnlPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // ================== FETCH DOS DADOS (COM POLLING) ==================
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
          const price = Number(p.price);
          const profit = Number(p.profit);
          const delta = Number(p.delta);

          return {
            time: p.time,
            timeLabel: formatInTimeZone(p.time, TIMEZONE, TIME_LABEL_FORMAT),
            price: Number.isFinite(price) ? price : 0,
            profit: Number.isFinite(profit) ? profit : 0,
            delta: Number.isFinite(delta) ? delta : 0,
          };
        });

        setData(formatted);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // fetch cancelado no cleanup → ignora
          return;
        }
        if (err instanceof Error) setError(err.message);
        else setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    // 🔹 Busca imediata ao montar / mudar deps
    fetchData();

    // 🔹 Polling a cada X ms, se configurado
    if (autoRefreshMs && autoRefreshMs > 0) {
      intervalId = window.setInterval(() => {
        // cancela eventual requisição anterior
        abortController.abort();
        abortController = new AbortController();
        fetchData();
      }, autoRefreshMs);
    }

    // 🔹 cleanup ao desmontar / mudar deps
    return () => {
      abortController.abort();
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [symbol, operationId, autoRefreshMs]);

  // ================== CÁLCULO DE LUCRO MÁXIMO / MÍNIMO ==================
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

  // ================== CRIA / ATUALIZA GRÁFICO ==================
  useEffect(() => {
    if (!containerRef.current) return;
    if (!data.length) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const { clientWidth, clientHeight } = containerRef.current;

    const chart = createChart(containerRef.current, {
      width: clientWidth,
      height: clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "#020617" },
        textColor: "#e5e7eb",
      },
      grid: {
        vertLines: { color: "rgba(55, 65, 81, 0.4)" },
        horzLines: { color: "rgba(31, 41, 55, 0.7)" },
      },
      rightPriceScale: {
        visible: true,
        borderColor: "rgba(75, 85, 99, 0.8)",
      },
      leftPriceScale: {
        visible: true,
        borderColor: "rgba(75, 85, 99, 0.8)",
      },
      timeScale: {
        borderColor: "rgba(75, 85, 99, 0.8)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: "rgba(148, 163, 184, 0.8)",
          width: 1,
          style: 0,
        },
        horzLine: {
          color: "rgba(148, 163, 184, 0.8)",
          width: 1,
          style: 0,
        },
      },
    });

    chartRef.current = chart;

    chart.priceScale("left").applyOptions({
      visible: true,
      autoScale: true,
    });

    chart.priceScale("right").applyOptions({
      visible: true,
      autoScale: true,
    });

    const lastProfit = data[data.length - 1].profit;
    const isProfitPositive = lastProfit >= 0;

    const profitLineColor = isProfitPositive ? "#22c55e" : "#ef4444";
    const profitTopColor = isProfitPositive
      ? "rgba(34,197,94,0.35)"
      : "rgba(239,68,68,0.35)";
    const profitBottomColor = isProfitPositive
      ? "rgba(34,197,94,0.02)"
      : "rgba(239,68,68,0.02)";

    const profitSeries = chart.addSeries(AreaSeries, {
      priceScaleId: "left",
      lineColor: profitLineColor,
      topColor: profitTopColor,
      bottomColor: profitBottomColor,
      lineWidth: 3,
    }) as ISeriesApi<"Area">;

    const priceSeries = chart.addSeries(LineSeries, {
      priceScaleId: "right",
      color: "#3b82f6",
      lineWidth: 2,
    }) as ISeriesApi<"Line">;

    const profitData: LineData[] = data.map((p) => ({
      time: Math.floor(new Date(p.time).getTime() / 1000) as UTCTimestamp,
      value: p.profit,
    }));

    const priceData: LineData[] = data.map((p) => ({
      time: Math.floor(new Date(p.time).getTime() / 1000) as UTCTimestamp,
      value: p.price,
    }));

    profitSeries.setData(profitData);
    priceSeries.setData(priceData);

    chart.timeScale().fitContent();

    const crosshairHandler = (param: MouseEventParams): void => {
      if (param.time === undefined) {
        setHoverInfo(null);
        return;
      }

      const timestamp = param.time as UTCTimestamp;

      const profitPoint = param.seriesData.get(profitSeries);
      const pricePoint = param.seriesData.get(priceSeries);

      const profitValue =
        profitPoint && "value" in profitPoint
          ? Number(profitPoint.value)
          : null;

      const priceValue =
        pricePoint && "value" in pricePoint ? Number(pricePoint.value) : null;

      setHoverInfo({
        timeLabel: formatInTimeZone(
          timestamp * 1000,
          TIMEZONE,
          TIME_LABEL_FORMAT,
        ),
        price: priceValue,
        profit: profitValue,
      });
    };

    chart.subscribeCrosshairMove(crosshairHandler);

    const ro = new ResizeObserver(() => {
      if (!containerRef.current || !chartRef.current) return;
      const { clientWidth: w, clientHeight: h } = containerRef.current;
      chartRef.current.applyOptions({
        width: w,
        height: h,
      });
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

  // ================== ESTADOS DE CARREGAMENTO / ERRO / EMPTY ==================
  if (loading && !data.length) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-slate-300">
        Carregando gráfico de PnL...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center rounded-xl border border-red-700 bg-slate-900/60 text-sm text-red-300">
        Erro: {error}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-slate-400">
        Sem dados de PnL para esse período.
      </div>
    );
  }

  return (
    <div className="relative flex h-[70vh] w-full flex-col rounded-xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">
          {symbol} — Lucro x Preço (últimas horas)
        </h3>
        <span className="text-[11px] text-slate-400">
          Eixo esquerdo: lucro • Eixo direito: preço • Horário: Brasília (BRT)
        </span>
      </div>

      {hoverInfo && (
        <div className="pointer-events-none absolute right-4 top-9 z-10 rounded-md border border-slate-700 bg-slate-900/95 px-2 py-1 text-[10px] text-slate-100 shadow-lg">
          <div className="mb-1 text-[9px] text-slate-400">
            {hoverInfo.timeLabel}
          </div>
          {hoverInfo.price !== null && (
            <div>
              Preço:{" "}
              <span className="font-semibold">
                {formatCurrency(hoverInfo.price)}
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

      <div ref={containerRef} className="mt-1 h-full w-full" />

      {profitExtrema && (
        <div className="mt-3 grid gap-2 text-[11px] text-slate-300 sm:grid-cols-2">
          <div>
            <span className="font-semibold text-emerald-400">
              Lucro máximo:{" "}
            </span>
            <span>{formatCurrency(profitExtrema.max.value)} </span>
            <span className="text-slate-400">
              em {profitExtrema.max.timeLabel}
            </span>
          </div>
          <div>
            <span className="font-semibold text-red-400">Lucro mínimo: </span>
            <span>{formatCurrency(profitExtrema.min.value)} </span>
            <span className="text-slate-400">
              em {profitExtrema.min.timeLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
