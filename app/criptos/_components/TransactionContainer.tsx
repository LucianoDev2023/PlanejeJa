"use client";

import { tokens } from "@/app/_components/data/binanceToken";
import { Transaction } from "@/app/_components/transactions/TradeForm";
import TransactionList from "@/app/_components/transactions/TransactionList";

import { useState, useEffect } from "react";

export default function TransactionContainer() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokenPrices, setTokenPrices] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const PRICE_UPDATE_INTERVAL = 3000;
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
        // Aguarda 2 segundos antes de finalizar o carregamento
        setTimeout(() => {
          setLoading(false);
        }, 1000);
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
    const interval = setInterval(fetchTokenPrices, PRICE_UPDATE_INTERVAL);

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
