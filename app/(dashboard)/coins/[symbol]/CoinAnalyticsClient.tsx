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

  // ✅ opcional: lista ordenada (fica mais “produto”)
  const symbols = useMemo(() => {
    return [...availableSymbols].sort((a, b) => a.localeCompare(b));
  }, [availableSymbols]);

  // ✅ Ao abrir a página: tenta carregar o último símbolo salvo
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved && symbols.includes(saved)) {
      setSelectedSymbol(saved);
      onSymbolChange?.(saved);
      return;
    }

    // se não tiver salvo, usa o initialSymbol mesmo
    setSelectedSymbol(initialSymbol);
    onSymbolChange?.(initialSymbol);
  }, [initialSymbol, onSymbolChange, symbols]);

  const invested = totalInvestedActiveBuys ?? 0;

  const [period, setPeriod] = useState<PeriodOption>("7d");

  return (
    <section className="mx-auto flex w-full max-w-full flex-col gap-4 overflow-x-hidden p-4 text-slate-100">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-xs font-bold">
            Análise de gráfica de operações abertas
          </h1>

          {/* ✅ Badge simples mostrando investido */}
          {invested > 0 && (
            <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-1 text-[10px] text-slate-300">
              Investido:{" "}
              <span className="font-semibold">{formatUsd(invested)}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="symbol-select"
            className="text-xs font-medium text-slate-300"
          >
            Selecionar moeda:
          </label>

          <select
            id="symbol-select"
            value={selectedSymbol}
            onChange={(e) => {
              const sym = e.target.value;

              setSelectedSymbol(sym);

              // ✅ salva no navegador
              localStorage.setItem(STORAGE_KEY, sym);

              // ✅ avisa o pai (TransactionList etc)
              onSymbolChange?.(sym);
            }}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 shadow-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            {symbols.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(["1h", "1d", "7d", "30d"] as PeriodOption[]).map((p) => {
          const isActive = period === p;

          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? "border border-cyan-400/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-slate-200"
              }`}
            >
              {p.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div className="w-full max-w-full">
        <OperationPnlChart
          symbol={selectedSymbol}
          autoRefreshMs={60_000}
          totalInvestedActiveUsd={invested}
          hours={PERIOD_TO_HOURS[period]}
        />
      </div>
    </section>
  );
}
