"use client";

import { useEffect, useMemo, useState } from "react";
import { OperationPnlChart } from "@/app/_components/OperationPnlChart";

interface CoinAnalyticsClientProps {
  availableSymbols: string[];
  initialSymbol: string;
  totalInvestedActiveBuys?: number;
  onSymbolChange?: (symbol: string) => void;
}

type PeriodOption = "1h" | "1d" | "7d" | "30d";

const PERIOD_TO_HOURS: Record<PeriodOption, number> = {
  "1h": 1,
  "1d": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};

const STORAGE_KEY = "planejeja:coinAnalytics:selectedSymbol";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function CoinAnalyticsClient({
  availableSymbols,
  initialSymbol,
  totalInvestedActiveBuys,
  onSymbolChange,
}: CoinAnalyticsClientProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [period, setPeriod] = useState<PeriodOption>("7d");

  const symbols = useMemo(() => {
    return [...availableSymbols].sort((a, b) => a.localeCompare(b));
  }, [availableSymbols]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved && symbols.includes(saved)) {
      setSelectedSymbol(saved);
      onSymbolChange?.(saved);
      return;
    }

    setSelectedSymbol(initialSymbol);
    onSymbolChange?.(initialSymbol);
  }, [initialSymbol, onSymbolChange, symbols]);

  const invested = totalInvestedActiveBuys ?? 0;

  return (
    <section className="mx-auto w-full max-w-full overflow-x-hidden px-3 py-3 text-slate-100 sm:px-4 sm:py-4 lg:px-6 lg:py-5">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* HEADER */}
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-semibold tracking-tight sm:text-lg">
            Operações abertas — Dashboard
          </h1>

          {invested > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-200/90 backdrop-blur-xl">
                <span className="text-slate-300">Investido:</span>
                <span className="font-semibold text-slate-100">
                  {formatUsd(invested)}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* TOOLBAR (uma linha) */}
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1">
          {/* Select compacto */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="symbol-select"
              className="text-[10px] font-medium text-slate-400"
            >
              Moeda
            </label>

            <select
              id="symbol-select"
              value={selectedSymbol}
              onChange={(e) => {
                const sym = e.target.value;
                setSelectedSymbol(sym);
                localStorage.setItem(STORAGE_KEY, sym);
                onSymbolChange?.(sym);
              }}
              className="h-8 min-w-[96px] rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-slate-100 outline-none backdrop-blur-xl focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/20"
            >
              {symbols.map((sym) => (
                <option key={sym} value={sym}>
                  {sym}
                </option>
              ))}
            </select>
          </div>

          {/* Períodos pequenos (inline) */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-400">
              Período
            </span>

            <div className="flex items-center gap-2">
              {(["1h", "1d", "7d", "30d"] as PeriodOption[]).map((p) => {
                const isActive = period === p;

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`h-8 min-w-[44px] whitespace-nowrap rounded-lg border px-2 text-[11px] font-semibold uppercase transition-all ${
                      isActive
                        ? "border-cyan-400/30 bg-cyan-500/15 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.18)]"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-slate-100"
                    } `}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CHART */}
        <div className="w-full max-w-full">
          <OperationPnlChart
            symbol={selectedSymbol}
            autoRefreshMs={60_000}
            totalInvestedActiveUsd={invested}
            hours={PERIOD_TO_HOURS[period]}
          />
        </div>
      </div>
    </section>
  );
}
