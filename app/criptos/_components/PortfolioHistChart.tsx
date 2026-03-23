"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  AreaSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { formatCurrency } from "@/app/_utils/currency";
import { format } from "date-fns";

export default function PortfolioHistChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        const response = await fetch("/api/snapshots");
        if (!response.ok) throw new Error("Erro ao buscar snapshots");
        const json = await response.json();
        
        const formattedData = json.map((s: any) => ({
          time: Math.floor(new Date(s.timestamp).getTime() / 1000) as UTCTimestamp,
          value: parseFloat(s.totalValue),
          dateLabel: format(new Date(s.timestamp), "dd/MM/yyyy"),
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshots();
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "rgba(255, 255, 255, 0.5)",
        },
        grid: {
          vertLines: { color: "rgba(255, 255, 255, 0.05)" },
          horzLines: { color: "rgba(255, 255, 255, 0.05)" },
        },
        timeScale: {
          borderVisible: false,
        },
        rightPriceScale: {
          borderVisible: false,
        },
        handleScroll: false,
        handleScale: false,
        width: chartContainerRef.current.clientWidth,
        height: 200,
      });

      const series = chart.addSeries(AreaSeries, {
        lineColor: "#22c55e",
        topColor: "rgba(34, 197, 94, 0.3)",
        bottomColor: "rgba(34, 197, 94, 0.0)",
        lineWidth: 2,
      });

      chartRef.current = chart;
      seriesRef.current = series;

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }

    if (seriesRef.current) {
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  if (loading) {
    return (
      <div className="mx-4 mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl animate-pulse">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-white/10" />
            <div className="h-3 w-48 rounded bg-white/10" />
          </div>
          <div className="space-y-2 text-right">
            <div className="h-3 w-20 rounded bg-white/10 ml-auto" />
            <div className="h-4 w-24 rounded bg-white/10 ml-auto" />
          </div>
        </div>
        <div className="h-[200px] w-full rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (data.length < 2) return null;


  return (
    <div className="mx-4 mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Evolução do Patrimônio</h3>
          <p className="text-[10px] text-slate-400">Total Investido + Lucro Atual ao longo do tempo</p>
        </div>
        <div className="text-right">
            <p className="text-[10px] text-slate-400">Patrimônio Atual</p>
            <p className="text-sm font-bold text-emerald-400">{formatCurrency(data[data.length - 1].value)}</p>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
