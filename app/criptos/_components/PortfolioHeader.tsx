import { useEffect, useMemo, useState } from "react";
import { Transaction } from "@/app/_components/transactions/TradeForm";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { formatCurrency } from "@/app/_utils/currency";
import WalletCard from "./WalletCard";

interface PortfolioHeaderProps {
  transactions: Transaction[];
  tokenPrices: { [key: string]: string };
  walletBalance: number;
}

export default function PortfolioHeader({ 
  transactions, 
  tokenPrices,
  walletBalance 
}: PortfolioHeaderProps) {
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [loadingTotal, setLoadingTotal] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoadingTotal(true);
        const res = await fetch("/api/portfolio/summary");
        if (res.ok) {
          const data = await res.json();
          setTotalBalance(data.totalPortfolioValue);
        }
      } catch (error) {
        console.error("Erro ao buscar resumo do portfolio:", error);
      } finally {
        setLoadingTotal(false);
      }
    };

    fetchSummary();
    
    // Escuta por eventos de atualização para sincronizar
    window.addEventListener("transaction-updated", fetchSummary);
    return () => window.removeEventListener("transaction-updated", fetchSummary);
  }, []);

  // 🔄 Sempre que os preços mudarem, atualizamos o resumo do servidor para garantir consistência total
  useEffect(() => {
    const refreshSummary = async () => {
        try {
          const res = await fetch("/api/portfolio/summary");
          if (res.ok) {
            const data = await res.json();
            setTotalBalance(data.totalPortfolioValue);
          }
        } catch (error) {
          console.error("Erro ao sincronizar resumo:", error);
        }
      };
      
      if (tokenPrices && Object.keys(tokenPrices).length > 0) {
        refreshSummary();
      }
  }, [tokenPrices]);

  const stats = useMemo(() => {
    let totalInvested = 0;
    let currentTotalValue = 0;
    let totalSoldReturn = 0;
    let totalSoldCost = 0;

    transactions.forEach((t) => {
      const amount = parseFloat(t.amount || "0");
      const investedValue = parseFloat(t.usdValue || "0");
      const currentPrice = parseFloat(tokenPrices[t.token] || "0");

      if (t.type === "buy") {
        if (t.profitSell === null || t.profitSell === undefined) {
          // Ativo em hold
          totalInvested += investedValue;
          currentTotalValue += amount * currentPrice;
        } else {
          // Já foi vendido (o lucro está no profitSell)
          // Mas para o cálculo de "Investido vs Retorno", precisamos do custo
          totalSoldCost += investedValue;
          totalSoldReturn += investedValue + parseFloat(t.profitSell || "0");
        }
      } else if (t.type === "sell") {
        // As vendas já estão computadas nos profitSell das compras correspondentes
        // no modelo atual de dados simplificado. 
      }
    });

    const totalCost = totalInvested + totalSoldCost;
    const totalProfit = (currentTotalValue + totalSoldReturn) - totalCost;
    const profitPercentage = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    const safeWalletBalance = Number(walletBalance || 0);

    return {
      investedAssetsValue: currentTotalValue,
      totalPortfolioValue: currentTotalValue + safeWalletBalance,
      totalProfit,
      profitPercentage,
      totalInvested
    };


  }, [transactions, tokenPrices, walletBalance]);

  const isPositive = stats.totalProfit >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. SALDO TOTAL (CARTEIRA + CRIPTOS) */}
      <div className="glass-card glass-card-hover relative overflow-hidden rounded-3xl p-6 ring-1 ring-white/10 transition-all">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-lg shadow-primary/20">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Saldo Total (Caixa + Hold)</p>
            <h2 className="text-2xl font-black tracking-tight text-white neon-text-blue flex items-center gap-2">
            {loadingTotal && totalBalance === null ? (
                <Loader2 size={24} className="animate-spin text-primary/50" />
              ) : (
                // Prioriza o cálculo em tempo real do frontend para ser instantâneo
                formatCurrency(stats.totalPortfolioValue)
              )}
            </h2>
          </div>
        </div>
      </div>

      {/* 2. WALLET / AVAILABLE BALANCE */}
      <WalletCard initialBalance={walletBalance} />

      {/* 3. SALDO EM CRIPTOS (HOLD) */}
      <div className="glass-card glass-card-hover relative overflow-hidden rounded-3xl p-6 ring-1 ring-white/10 transition-all">
        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Patrimônio em Criptos</p>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {formatCurrency(stats.investedAssetsValue)}
            </h2>
          </div>
        </div>
      </div>

      {/* 4. PROFIT/LOSS CARD */}
      <div className="glass-card glass-card-hover relative overflow-hidden rounded-3xl p-6 ring-1 ring-white/10 transition-all">
        <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl pointer-events-none ${isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`} />
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {isPositive ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Lucro/Prejuízo Total</p>
            <div className="flex items-baseline gap-2">
              <h2 className={`text-2xl font-extrabold tracking-tight ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? "+" : ""}{formatCurrency(stats.totalProfit)}
              </h2>
              <span className={`text-xs font-black ${isPositive ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                {isPositive ? "+" : ""}{stats.profitPercentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
