"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "../_components/navbar";
import { CoinAnalyticsClient } from "../criptos/_components/CoinAnalyticsClient";
import { Transaction } from "../_components/transactions/TradeForm";
import { Loader2, LineChart, Info } from "lucide-react";

export default function EvolucaoPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokenPrices, setTokenPrices] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const PRICE_UPDATE_INTERVAL = 30000;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await fetch("/api/transactions");
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchTokenPrices = async () => {
      try {
        const response = await fetch("/api/prices");
        if (response.ok) {
          const data = await response.json();
          setTokenPrices(data);
        }
      } catch (error) {
        console.error("Erro ao buscar preços:", error);
      }
    };

    fetchTokenPrices();
    const interval = setInterval(fetchTokenPrices, PRICE_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const availableSymbols = useMemo(() => {
    const set = new Set<string>();
    for (const t of transactions) {
      if (t.type === "buy" && t.token) set.add(t.token.trim().toUpperCase());
    }
    return Array.from(set).sort();
  }, [transactions]);

  const [selectedSymbol, setSelectedSymbol] = useState<string>("");

  useEffect(() => {
    if (availableSymbols.length > 0 && !selectedSymbol) {
      setSelectedSymbol(availableSymbols[0]);
    }
  }, [availableSymbols, selectedSymbol]);

  const totalInvestedActiveUsd = useMemo(() => {
    if (!selectedSymbol) return 0;
    return transactions
      .filter((t) => t.type === "buy" && (t.profitSell === null || t.profitSell === undefined))
      .filter((t) => t.token?.trim().toUpperCase() === selectedSymbol)
      .reduce((sum, t) => sum + (Number(t.usdValue) || 0), 0);
  }, [transactions, selectedSymbol]);

  return (
    <div className="flex min-h-screen flex-col bg-[#020617]">
      <Navbar />
      
      <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header Section */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <LineChart className="text-primary" size={32} />
              Evolução das <span className="text-primary">Moedas</span>
            </h1>
            <p className="text-slate-400">Análise técnica detalhada e histórico de PnL por ativo.</p>
          </div>

          {loading ? (
            <div className="flex h-[500px] items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-slate-500 font-medium">Carregando dados da Binance...</p>
              </div>
            </div>
          ) : availableSymbols.length > 0 ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card rounded-3xl p-6 ring-1 ring-white/10 relative overflow-hidden group">
                   <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lucro Acumulado (Hold)</p>
                   <h2 className={`text-3xl font-black mt-2 ${totalInvestedActiveUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalInvestedActiveUsd)}
                   </h2>
                   <p className="text-[10px] text-slate-500 mt-1 font-medium italic">* Baseado apenas nas moedas selecionadas que estão em HOLD.</p>
                </div>

                <div className="glass-card rounded-3xl p-6 ring-1 ring-white/10 relative overflow-hidden group">
                   <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-all" />
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Moedas em Carteira</p>
                   <h2 className="text-3xl font-black text-white mt-2">
                     {availableSymbols.length} <span className="text-sm font-bold text-slate-500 tracking-normal uppercase">Ativos</span>
                   </h2>
                   <p className="text-[10px] text-slate-500 mt-1 font-medium">Diversificação atual do seu portfólio de hold.</p>
                </div>
              </div>

              <div className="glass-card rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl">
                <CoinAnalyticsClient
                  availableSymbols={availableSymbols}
                  initialSymbol={selectedSymbol || availableSymbols[0]}
                  totalInvestedActiveBuys={totalInvestedActiveUsd}
                  onSymbolChange={(sym) => setSelectedSymbol(sym)}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] text-center p-8">
              <Info className="mb-4 text-slate-600" size={64} />
              <h3 className="text-xl font-bold text-white">Nenhuma operação ativa</h3>
              <p className="max-w-md text-slate-400 mt-2">
                Você precisa ter transações de compra (Hold) para visualizar a evolução das moedas aqui.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
