"use client";

import { useMemo, useState } from "react";
import { Transaction } from "./TradeForm";
import TransactionCard from "./TransactionCard";
import TradeForm from "./TradeForm";
import TransactionFilterToggle, {
  TransactionFilterValue,
} from "@/app/criptos/_components/TransactionFilterToggle";
import { CoinAnalyticsClient } from "@/app/(dashboard)/coins/[symbol]/CoinAnalyticsClient";

interface TransactionListProps {
  tokenPrices: { [key: string]: string };
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  tokens: string[]; // pode continuar existindo, mas não vamos usar para o select de gráfico
  loading: boolean;
}

export default function TransactionList({
  transactions,
  tokenPrices,
  setTransactions,
  tokens,
  loading,
}: TransactionListProps) {
  const [transactionBeingEdited, setTransactionBeingEdited] =
    useState<Transaction | null>(null);

  const [selectedToken, setSelectedToken] = useState<string>(
    tokens?.[0] || "BTC",
  );

  const [filter, setFilter] = useState<TransactionFilterValue>("all");

  const filteredTransactions = transactions.filter((t) => {
    const amount = parseFloat(t.amount);
    const invested = parseFloat(t.usdValue);
    const priceNow = parseFloat(tokenPrices[t.token] || "0");

    const profitBuy = amount * priceNow - invested;
    const profitSell = parseFloat(t.profitSell ?? "0");
    const profit = t.type === "buy" ? profitBuy : profitSell;

    if (filter === "positive") return profit > 0;
    if (filter === "negative") return profit < 0;
    if (filter === "buy") return t.type === "buy";
    if (filter === "sell") return t.type === "sell";

    return true; // "all" e "chart"
  });

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar transação");
      }

      setTransactions((prev) => prev.filter((t) => t.id !== id));

      if (transactionBeingEdited?.id === id) {
        clearEditing();
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setTransactionBeingEdited(transaction);
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
  };

  const clearEditing = () => setTransactionBeingEdited(null);

  const handleFilterChange = (newFilter: TransactionFilterValue) => {
    setFilter(newFilter);
  };

  // 🔹 AQUI: só tokens com pelo menos UMA transação de COMPRA
  const availableSymbols = useMemo(() => {
    const set = new Set<string>();

    for (const t of transactions) {
      if (t.type === "buy" && t.token) {
        set.add(t.token.trim().toUpperCase());
      }
    }

    return Array.from(set);
  }, [transactions]);

  const initialSymbol = useMemo(() => {
    const selUpper = (transactionBeingEdited?.token || selectedToken)
      .trim()
      .toUpperCase();

    if (availableSymbols.includes(selUpper)) return selUpper;

    return availableSymbols[0] ?? "BTC";
  }, [availableSymbols, selectedToken, transactionBeingEdited]);

  return (
    <div className="flex w-full flex-col">
      {filter !== "chart" && (
        <div className="bg-[#060D13]">
          <TradeForm
            onAddTransaction={(newTransaction) =>
              setTransactions((prev) => [...prev, newTransaction])
            }
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

      <div className="sticky top-0 z-10 flex border-b border-gray-800 bg-[#060D13]">
        <TransactionFilterToggle value={filter} onChange={handleFilterChange} />
      </div>

      {filter === "chart" ? (
        <div className="w-full">
          <CoinAnalyticsClient
            availableSymbols={availableSymbols}
            initialSymbol={initialSymbol}
          />
        </div>
      ) : loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="mx-2 mt-4 flex h-20 animate-pulse rounded-lg bg-gradient-to-b from-[#131d276e] to-[#0f273d6b] sm:h-10"
          />
        ))
      ) : filteredTransactions.length === 0 ? (
        <p className="pl-4 text-gray-400">Nenhuma transação encontrada.</p>
      ) : (
        filteredTransactions.map((transaction, index) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            currentPrice={tokenPrices[transaction.token] || "0"}
            onDelete={handleDelete}
            onEdit={handleEdit}
            number={index + 1}
          />
        ))
      )}
    </div>
  );
}
