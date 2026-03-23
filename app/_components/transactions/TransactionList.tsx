"use client";

import { useMemo, useState } from "react";
import { Transaction } from "./TradeForm";
import TransactionCard from "./TransactionCard";
import TradeForm from "./TradeForm";
import { TransactionFilterValue } from "../../criptos/_components/TransactionFilterToggle";
import TransactionFilterToggle from "../../criptos/_components/TransactionFilterToggle";
import { LayoutGrid, List, Search, ArrowUpDown, Filter, History, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../_components/ui/alert-dialog";




interface TransactionListProps {
  tokenPrices: { [key: string]: string };
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  tokens: string[];
  loading: boolean;
}

type SortOption = "date-desc" | "date-asc" | "profit-desc" | "profit-asc" | "value-desc";

export default function TransactionList({
  transactions,
  tokenPrices,
  setTransactions,
  tokens,
  loading,
}: TransactionListProps) {
  const [transactionBeingEdited, setTransactionBeingEdited] = useState<Transaction | null>(null);
  const [selectedToken, setSelectedToken] = useState<string>(tokens?.[0] || "BTC");
  const [filter, setFilter] = useState<TransactionFilterValue>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/user/reset", { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao resetar dados");
      toast.success("Todos os dados foram apagados!");
      window.dispatchEvent(new Event("transaction-updated"));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsResetting(false);
    }
  };



  const selectedSymbol = useMemo(() => {
    return (transactionBeingEdited?.token || selectedToken).trim().toUpperCase();
  }, [transactionBeingEdited, selectedToken]);

  const totalInvestedActiveUsd = useMemo(() => {
    return transactions
      .filter((t) => t.type === "buy")
      .filter((t) => t.profitSell === null)
      .filter((t) => t.token?.trim().toUpperCase() === selectedSymbol)
      .reduce((sum, t) => sum + (Number(t.usdValue) || 0), 0);
  }, [transactions, selectedSymbol]);

  const filteredAndSortedTransactions = useMemo(() => {
    const result = transactions.filter((t) => {
      const amount = parseFloat(t.amount);
      const priceNow = parseFloat(tokenPrices[t.token] || "0");
      const profitBuy = amount * priceNow - parseFloat(t.usdValue);
      const profitSell = parseFloat(t.profitSell ?? "0");
      const profit = t.type === "buy" ? profitBuy : profitSell;

      const matchesSearch = t.token.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === "positive") return profit > 0;
      if (filter === "negative") return profit < 0;
      if (filter === "buy") return t.type === "buy";
      if (filter === "sell") return t.type === "sell";
      return true;
    });

    return result.sort((a, b) => {
      const amountA = parseFloat(a.amount);
      const amountB = parseFloat(b.amount);
      const priceNowA = parseFloat(tokenPrices[a.token] || "0");
      const priceNowB = parseFloat(tokenPrices[b.token] || "0");
      const profitA = a.type === "buy" ? amountA * priceNowA - parseFloat(a.usdValue) : parseFloat(a.profitSell ?? "0");
      const profitB = b.type === "buy" ? amountB * priceNowB - parseFloat(b.usdValue) : parseFloat(b.profitSell ?? "0");

      switch (sortBy) {
        case "date-desc": return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc": return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "profit-desc": return profitB - profitA;
        case "profit-asc": return profitA - profitB;
        case "value-desc": return parseFloat(b.usdValue) - parseFloat(a.usdValue);
        default: return 0;
      }
    });
  }, [transactions, filter, searchTerm, sortBy, tokenPrices]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao deletar transação");
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (transactionBeingEdited?.id === id) clearEditing();
      
      // 🔄 Notifica o WalletCard para atualizar o saldo
      window.dispatchEvent(new Event("transaction-updated"));

    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const handleEdit = (transaction: Transaction) => setTransactionBeingEdited(transaction);
  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };
  const clearEditing = () => setTransactionBeingEdited(null);

  const availableSymbols = useMemo(() => {
    const set = new Set<string>();
    for (const t of transactions) {
      if (t.type === "buy" && t.token) set.add(t.token.trim().toUpperCase());
    }
    return Array.from(set);
  }, [transactions]);

  const initialSymbol = useMemo(() => {
    const selUpper = (transactionBeingEdited?.token || selectedToken).trim().toUpperCase();
    return availableSymbols.includes(selUpper) ? selUpper : (availableSymbols[0] ?? "BTC");
  }, [availableSymbols, selectedToken, transactionBeingEdited]);

  return (
    <div className="flex w-full flex-col gap-6 p-4">
      {/* Top Section with Form */}
      {filter !== "chart" && (
        <div className="glass-card rounded-3xl p-6 ring-1 ring-white/10 transition-all">
          <TradeForm
            onAddTransaction={(newTransaction) => setTransactions((prev) => [...prev, newTransaction])}
            onUpdateTransaction={handleUpdateTransaction}
            transactionBeingEdited={transactionBeingEdited}
            clearEditing={clearEditing}
            tokenPrices={tokenPrices}
            selectedToken={transactionBeingEdited?.token || selectedToken}
            setSelectedToken={setSelectedToken}
            tokens={tokens}
          />
        </div>
      )}

      {/* Toolbar Section */}
      <div className="glass-card sticky top-4 z-30 flex flex-col gap-4 rounded-2xl p-4 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <TransactionFilterToggle value={filter} onChange={setFilter} />
          

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={isResetting}
                className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition-colors"
              >
                {isResetting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Limpar Tudo
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-white/10 text-white rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold">Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Esta ação não pode ser desfeita. Isso apagará permanentemente todas as suas transações
                  e resetará seu saldo de caixa para zero.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleResetData}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl"
                >
                  Sim, apagar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>



        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar moeda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Sort Menu */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 outline-none hover:bg-white/10"
          >
            <option value="date-desc">Mais recentes</option>
            <option value="date-asc">Mais antigas</option>
            <option value="profit-desc">Maior Lucro</option>
            <option value="profit-asc">Menor Lucro</option>
            <option value="value-desc">Maior Valor</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-white/5 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card h-40 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredAndSortedTransactions.length === 0 ? (
          <div className="glass-card flex h-64 flex-col items-center justify-center rounded-3xl p-8 text-center">
            <div className="mb-4 rounded-full bg-slate-500/10 p-4 text-slate-500">
                <Filter size={32} />
            </div>
            <h3 className="text-lg font-bold text-white">Nenhuma transação encontrada</h3>
            <p className="text-sm text-slate-400">Tente ajustar seus filtros ou termos de pesquisa.</p>
          </div>
        ) : (
          <div className={`animate-slow-fade grid gap-4 transition-all duration-500 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredAndSortedTransactions.map((transaction, index) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                currentPrice={tokenPrices[transaction.token] || "0"}
                onDelete={handleDelete}
                onEdit={handleEdit}
                number={index + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
