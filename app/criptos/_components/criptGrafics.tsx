"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Clock, Globe } from "lucide-react";
import { formatTokenPrice } from "@/app/_utils/currency";


interface TokenPrices {
  [key: string]: string;
}

interface TokenPriceChartProps {
  selectedToken: string;
}

const TokenPriceChart: React.FC<TokenPriceChartProps> = ({ selectedToken }) => {
  const [prices, setPrices] = useState<TokenPrices | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/getAverages?symbol=${token}`);
      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      const data: TokenPrices = await response.json();
      if (data && Object.keys(data).length > 0) {
        setPrices(data);
      } else {
        setError("Sem dados");
      }
    } catch (error: unknown) {
      setError("Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedToken) fetchPrices(selectedToken);
  }, [selectedToken, fetchPrices]);

  if (loading) return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 animate-pulse">
      <div className="h-2 w-20 bg-white/10 rounded" />
    </div>
  );
  
  if (error || !prices) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <TrendingUp size={12} className="text-primary" /> Médias
      </div>
      
      <div className="h-3 w-[1px] bg-white/10" />

      <div className="flex items-center gap-4">
        {[
          { label: "15m", value: prices["15m"], color: "text-cyan-400" },
          { label: "1h", value: prices["1h"], color: "text-yellow-400" },
          { label: "4h", value: prices["4h"], color: "text-emerald-400" },
          { label: "1d", value: prices["1d"], color: "text-fuchsia-400" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase">{item.label}</span>
            <span className={`text-[10px] font-bold ${item.color}`}>
              {formatTokenPrice(item.value)}
            </span>

          </div>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1.5 text-[9px] font-medium text-slate-600">
        <Globe size={10} />
        Binance API
      </div>
    </div>
  );
};

export default TokenPriceChart;
