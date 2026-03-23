"use client";

import { useEffect, useState } from "react";
import Navbar from "../_components/navbar";
import PatrimonioChart from "./_components/PatrimonioChart";
import { Loader2, TrendingUp, Wallet, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/app/_utils/currency";

export default function PatrimonioPage() {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        const res = await fetch("/api/snapshots");
        if (res.ok) {
          const data = await res.json();
          setSnapshots(data);
        }
      } catch (error) {
        console.error("Erro ao buscar snapshots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshots();
  }, []);

  const lastSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#020617]">
      <Navbar />
      
      <main className="flex-1 p-4 sm:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Header Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white hover:neon-text-blue transition-all">
                Meu <span className="text-primary">Patrimônio</span>
              </h1>
              <p className="text-slate-400">Acompanhe a evolução histórica dos seus ativos e investimentos.</p>
            </div>

            {lastSnapshot && (
              <div className="glass-card flex items-center gap-6 rounded-3xl p-6 ring-1 ring-white/10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Último Saldo</span>
                  <span className="text-2xl font-black text-white">{formatCurrency(lastSnapshot.totalValue)}</span>
                </div>
                <div className={`flex flex-col ${lastSnapshot.profitValue >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lucro Total</span>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight size={14} className={lastSnapshot.profitValue < 0 ? "rotate-90" : ""} />
                    <span className="text-lg font-bold">{formatCurrency(lastSnapshot.profitValue)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chart Section */}
          {loading ? (
            <div className="flex h-[400px] items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02]">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : snapshots.length > 0 ? (
            <PatrimonioChart data={snapshots} />
          ) : (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] text-center p-8">
              <TrendingUp className="mb-4 text-slate-600" size={64} />
              <h3 className="text-xl font-bold text-white">Sem dados históricos ainda</h3>
              <p className="max-w-md text-slate-400 mt-2">
                Os snapshots de patrimônio são gerados automaticamente todos os dias às 20:59. 
                Continue operando para ver o gráfico de evolução aqui.
              </p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid gap-6 sm:grid-cols-3">
             <div className="glass-card group rounded-3xl p-6 ring-1 ring-white/10 hover:bg-white/5 transition-all">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
                  <TrendingUp size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Estratégia</h4>
                <p className="mt-1 text-slate-200 text-sm">Acompanhamento diário para decisões baseadas em tendências históricas.</p>
             </div>

             <div className="glass-card group rounded-3xl p-6 ring-1 ring-white/10 hover:bg-white/5 transition-all">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <Wallet size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Consistência</h4>
                <p className="mt-1 text-slate-200 text-sm">O valor é capturado no fechamento do dia (20:59) para manter um log fiel.</p>
             </div>

             <div className="glass-card group rounded-3xl p-6 ring-1 ring-white/10 hover:bg-white/5 transition-all">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                  <History size={24} title="History" />
                </div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Histórico</h4>
                <p className="mt-1 text-slate-200 text-sm">Visualize o crescimento do seu capital investido vs valorização de mercado.</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function History({ size, title }: { size: number, title?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="m12 7v5l4 2"/>
    </svg>
  );
}
