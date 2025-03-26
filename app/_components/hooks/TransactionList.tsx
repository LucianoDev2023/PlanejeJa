"use client";

import { useState } from "react";
import { Transaction } from "./TradeForm";
import TransactionCard from "./TransactionCard";
import TradeForm from "./TradeForm";

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
    <div className="flex w-full flex-col gap-1">
      <div className="sticky top-0 z-10 bg-[#060D13]">
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
        transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            currentPrice={tokenPrices[transaction.token] || "0"}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))
      )}
    </div>
  );
}
