"use client";

import { useState } from "react";
import { Transaction } from "./TradeForm";
import TransactionCard from "./TransactionCard";
import TradeForm from "./TradeForm";
import TransactionFilterToggle from "@/app/criptos/_components/TransactionFilterToggle";

interface TransactionListProps {
  tokenPrices: { [key: string]: string };
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  tokens: string[];
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

  const [filter, setFilter] = useState<
    "all" | "buy" | "sell" | "positive" | "negative"
  >("all");

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

    return true; // "all"
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

      // 🧹 Se a transação deletada era a que estava sendo editada, limpa o formulário
      if (transactionBeingEdited?.id === id) {
        clearEditing();
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    console.log("🟡 Recebido para edição:", transaction);
    setTransactionBeingEdited(transaction);
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
  };

  const clearEditing = () => setTransactionBeingEdited(null);

  return (
    <div className="flex w-full flex-col">
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

      {/* Apenas o filtro será fixo no topo */}
      <div className="sticky top-0 z-10 flex border-b border-gray-800 bg-[#060D13]">
        <TransactionFilterToggle value={filter} onChange={setFilter} />
      </div>

      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="mx-2 mt-4 flex h-20 animate-pulse rounded-lg bg-gradient-to-b from-[#131d276e] to-[#0f273d6b] sm:h-10"
          ></div>
        ))
      ) : transactions.length === 0 ? (
        <p className="pl-4 text-gray-400">Nenhuma transação encontrada.</p>
      ) : (
        filteredTransactions.map((transaction, index) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            currentPrice={tokenPrices[transaction.token] || "0"}
            onDelete={handleDelete}
            onEdit={handleEdit}
            number={index + 1} // aqui passamos o número (começando do 1)
          />
        ))
      )}
    </div>
  );
}
