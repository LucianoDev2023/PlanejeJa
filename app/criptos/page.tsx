"use client";

import { useState, useEffect } from "react";
import Navbar from "../_components/navbar";
import { tokens } from "../_components/data/binanceToken";
import { Transaction } from "../_components/hooks/TradeForm";
import TransactionList from "../_components/hooks/TransactionList";

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokenPrices, setTokenPrices] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  // Buscar transações ao carregar
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
        setLoading(false); // <- marca o fim do carregamento
      }
    };

    fetchTransactions();
  }, []);

  // Buscar preços dos tokens
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
    <div className="flex h-full flex-col justify-between">
      <Navbar />
      <div className="flex min-h-screen w-full flex-col overflow-auto bg-gradient-to-b from-[#0D141A] to-[#080b14] md:mt-0">
        <TransactionList
          transactions={transactions}
          tokenPrices={tokenPrices}
          setTransactions={setTransactions}
          tokens={tokens}
          loading={loading}
        />
      </div>
    </div>
  );
}
