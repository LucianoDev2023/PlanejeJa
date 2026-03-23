"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  AreaSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
  type DeepPartial,
  type ChartOptions,
} from "lightweight-charts";
import { formatCurrency } from "@/app/_utils/currency";

interface Snapshot {
  dateKey: string;
  totalValue: number;
  investedValue: number;
  profitValue: number;
  timestamp: string;
}

interface PatrimonioChartProps {
  data: Snapshot[];
}

export default function PatrimonioChart({ data }: PatrimonioChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const totalSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const investedSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [hoverData, setHoverData] = useState<Snapshot | null>(null);

  const chartData = useMemo(() => {
    return data.map((d) => ({
      time: d.dateKey as any,
      total: d.totalValue,
      invested: d.investedValue,
      profit: d.profitValue,
    })).sort((a, b) => (a.time > b.time ? 1 : -1));
  }, [data]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chartOptions: DeepPartial<ChartOptions> = {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255, 255, 255, 0.7)",
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.2, bottom: 0.2 },
      },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        vertLine: { color: "rgba(255, 255, 255, 0.2)", width: 1, style: 2 },
        horzLine: { color: "rgba(255, 255, 255, 0.2)", width: 1, style: 2 },
      },
      handleScroll: true,
      handleScale: true,
    };

    const chart = createChart(chartContainerRef.current, {
      ...chartOptions,
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });
    chartRef.current = chart;

    const totalSeries = chart.addSeries(AreaSeries, {
      lineColor: "#3b82f6", // Blue
      topColor: "rgba(59, 130, 246, 0.3)",
      bottomColor: "rgba(59, 130, 246, 0.0)",
      lineWidth: 2,
    });
    totalSeriesRef.current = totalSeries;

    const investedSeries = chart.addSeries(LineSeries, {
      color: "rgba(148, 163, 184, 0.5)", // Slate
      lineWidth: 1,
      lineStyle: 2, // Dashed
      lastValueVisible: false,
      priceLineVisible: false,
    });
    investedSeriesRef.current = investedSeries;

    // Handle Resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    // Initial Data
    totalSeries.setData(chartData.map(d => ({ time: d.time, value: d.total })));
    investedSeries.setData(chartData.map(d => ({ time: d.time, value: d.invested })));

    chart.timeScale().fitContent();

    // Crosshair move for tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!param.time) {
        setHoverData(null);
        return;
      }
      const item = data.find(d => d.dateKey === param.time);
      if (item) setHoverData(item);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [chartData, data]);

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Evolução do Patrimônio</h3>
          <p className="text-xs text-slate-400">Dados capturados diariamente às 20:59</p>
        </div>

        {hoverData && (
          <div className="flex flex-wrap gap-4 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Data</p>
              <p className="text-sm font-bold text-white">{new Date(hoverData.dateKey + 'T00:00:00').toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Patrimônio</p>
              <p className="text-sm font-bold text-sky-400">{formatCurrency(hoverData.totalValue)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Investimento</p>
              <p className="text-sm font-bold text-slate-400">{formatCurrency(hoverData.investedValue)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">PnL</p>
              <p className={`text-sm font-bold ${hoverData.profitValue >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {formatCurrency(hoverData.profitValue)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div ref={chartContainerRef} className="w-full" />
      
      <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-6 bg-blue-500" />
          Patrimônio Total
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-6 border-b border-dashed border-slate-500" />
          Capital Investido
        </div>
      </div>
    </div>
  );
}
