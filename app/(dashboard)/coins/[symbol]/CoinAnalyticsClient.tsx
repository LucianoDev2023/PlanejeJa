"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OperationPnlChart } from "@/app/_components/OperationPnlChart";

interface CoinAnalyticsClientProps {
  availableSymbols: string[];
  initialSymbol: string;
}

export function CoinAnalyticsClient({
  availableSymbols,
  initialSymbol,
}: CoinAnalyticsClientProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-[1700px] flex-col gap-4 p-4 text-slate-100">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h1 className="text-xl font-bold">Análise de Criptomoedas</h1>

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
              router.push(`/coins/${sym}`);
            }}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100 shadow-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            {availableSymbols.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>
        </div>
      </div>

      <OperationPnlChart symbol={selectedSymbol} hours={24} />
    </main>
  );
}
