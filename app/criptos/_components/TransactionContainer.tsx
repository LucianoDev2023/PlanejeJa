"use client";

import { tokens } from "@/app/_components/data/binanceToken";
import { Transaction } from "@/app/_components/hooks/TradeForm";
import TransactionList from "@/app/_components/hooks/TransactionList";
import { useState, useEffect } from "react";

export default function TransactionContainer() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokenPrices, setTokenPrices] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions");
        if (!response.ok) throw new Error("Erro ao buscar transações");

        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchTokenPrices = async () => {
      try {
        const response = await fetch("/api/prices", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Erro ao buscar preços");

        const data = await response.json();
        if (isMounted) setTokenPrices(data);
      } catch (error) {
        console.error("Erro ao buscar preços:", error);
      }
    };

    fetchTokenPrices();
    const interval = setInterval(fetchTokenPrices, 10000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <TransactionList
      transactions={transactions}
      tokenPrices={tokenPrices}
      setTransactions={setTransactions}
      tokens={tokens}
      loading={loading}
    />
  );
}
