"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  type IChartApi,
  type LineData,
  type UTCTimestamp,
  type MouseEventParams,
} from "lightweight-charts";

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
  symbol: string; // "BTC", "BNB", etc.
  hours?: number; // padrão 24
  operationId?: string; // opcional: gráfico só de uma operação específica
}

interface HoverInfo {
  timeLabel: string;
  price: number | null; // valor REAL
  profit: number | null; // valor REAL
}

export function OperationPnlChart({
  symbol,
  hours = 24,
  operationId,
}: OperationPnlChartProps) {
  const [data, setData] = useState<PnlPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // ================== FETCH DOS DADOS ==================
  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("hours", String(hours));
        if (operationId) params.set("operationId", operationId);

        const res = await fetch(
          `/api/coins/${symbol}/pnl-series?` + params.toString(),
          { cache: "no-store" },
        );

        if (!res.ok) {
          const body = await res.json().catch(() => undefined);
          throw new Error(body?.error || "Erro ao buscar dados de PnL");
        }

        const json = (await res.json()) as PnlSeriesResponse;

        // ordena por tempo crescente (obrigatório pro lightweight-charts)
        const sorted = [...json.data].sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
        );

        const formatted: PnlPoint[] = sorted.map((p) => {
          const date = new Date(p.time);

          const price = Number(p.price);
          const profit = Number(p.profit);
          const delta = Number(p.delta);

          return {
            time: p.time,
            timeLabel: date.toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            price: Number.isFinite(price) ? price : 0,
            profit: Number.isFinite(profit) ? profit : 0,
            delta: Number.isFinite(delta) ? delta : 0,
          };
        });

        setData(formatted);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, hours, operationId]);

  // ================== CRIA / ATUALIZA GRÁFICO ==================
  useEffect(() => {
    if (!containerRef.current) return;
    if (!data.length) return;

    // destrói gráfico anterior pra evitar leak
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
      // dois price scales visíveis
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

    // força os dois eixos a ficarem visíveis
    chart.priceScale("left").applyOptions({
      visible: true,
      autoScale: true,
    });

    chart.priceScale("right").applyOptions({
      visible: true,
      autoScale: true,
    });

    // série de LUCRO (lado esquerdo, com escala visual x100)
    const profitSeries = chart.addSeries(LineSeries, {
      priceScaleId: "left",
      color: "#22c55e",
      lineWidth: 3,
    });

    // série de PREÇO (lado direito, valor real)
    const priceSeries = chart.addSeries(LineSeries, {
      priceScaleId: "right",
      color: "#3b82f6",
      lineWidth: 2,
    });

    const profitData: LineData[] = data.map((p) => ({
      time: Math.floor(new Date(p.time).getTime() / 1000) as UTCTimestamp,
      // aplica multiplicador visual para o gráfico
      value: Number(p.profit) || 0,
    }));

    const priceData: LineData[] = data.map((p) => ({
      time: Math.floor(new Date(p.time).getTime() / 1000) as UTCTimestamp,
      value: Number(p.price) || 0,
    }));

    profitSeries.setData(profitData);
    priceSeries.setData(priceData);

    chart.timeScale().fitContent();

    // --------- Tooltip customizado (lucro real + preço) ---------
    const crosshairHandler = (param: MouseEventParams): void => {
      if (param.time === undefined) {
        setHoverInfo(null);
        return;
      }

      const timestamp = param.time as UTCTimestamp;
      const date = new Date(timestamp * 1000);

      const profitPoint = param.seriesData.get(profitSeries);
      const pricePoint = param.seriesData.get(priceSeries);

      // valor ESCALADO que está no gráfico
      const scaledProfit =
        profitPoint && "value" in profitPoint
          ? Number(profitPoint.value)
          : null;

      // valor REAL (sem multiplicador)
      const rawProfit = scaledProfit !== null ? scaledProfit : null;

      const price =
        pricePoint && "value" in pricePoint ? Number(pricePoint.value) : null;

      setHoverInfo({
        timeLabel: date.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        price,
        profit: rawProfit,
      });
    };

    chart.subscribeCrosshairMove(crosshairHandler);

    // --------- Resize responsivo com ResizeObserver ---------
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

  // ================== ESTADOS DE CARREGAMENTO / ERRO ==================

  if (loading) {
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

  // ================== LAYOUT DO CARD + TOOLTIP ==================

  return (
    <div className="relative flex h-[70vh] w-full flex-col rounded-xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">
          {symbol} — Lucro x Preço (últimas {hours}h)
        </h3>
        <span className="text-[11px] text-slate-400">
          Eixo esquerdo: lucro • Eixo direito: preço
        </span>
      </div>

      {/* Tooltip customizado, com valores reais */}
      {hoverInfo && (
        <div className="pointer-events-none absolute right-4 top-9 z-10 rounded-md border border-slate-700 bg-slate-900/95 px-2 py-1 text-[10px] text-slate-100 shadow-lg">
          <div className="mb-1 text-[9px] text-slate-400">
            {hoverInfo.timeLabel}
          </div>
          {hoverInfo.price !== null && (
            <div>
              Preço:{" "}
              <span className="font-semibold">
                ${hoverInfo.price.toFixed(2)}
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
                {hoverInfo.profit >= 0 ? "+" : ""}${hoverInfo.profit.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Essa div ocupa TODO o espaço restante do card */}
      <div ref={containerRef} className="mt-1 h-full w-full" />
    </div>
  );
}
