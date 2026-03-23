"use client";

import { tokens } from "@/app/_components/data/binanceToken";
import { Transaction } from "@/app/_components/transactions/TradeForm";
import TransactionList from "@/app/_components/transactions/TransactionList";
import PortfolioHeader from "./PortfolioHeader";
import PortfolioHistChart from "./PortfolioHistChart";


import { useState, useEffect } from "react";

export default function TransactionContainer() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokenPrices, setTokenPrices] = useState<{ [key: string]: string }>({});
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const PRICE_UPDATE_INTERVAL = 30000;

  const fetchWalletBalance = async () => {
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(parseFloat(data.availableBalance));
      }
    } catch (error) {
      console.error("Erro ao buscar saldo da carteira:", error);
    }
  };


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [txRes, walletRes] = await Promise.all([
          fetch("/api/transactions"),
          fetch("/api/wallet")
        ]);

        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData);
        }

        if (walletRes.ok) {
          const wData = await walletRes.json();
          if (wData && wData.availableBalance !== undefined) {
            setWalletBalance(Number(wData.availableBalance));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };

    fetchInitialData();

    const handleSync = () => {
      fetchInitialData();
    };

    window.addEventListener("transaction-updated", handleSync);
    return () => window.removeEventListener("transaction-updated", handleSync);
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
    <div className="flex w-full flex-col gap-2">
      <PortfolioHeader 
        transactions={transactions} 
        tokenPrices={tokenPrices} 
        walletBalance={walletBalance} 
      />

      <TransactionList
        transactions={transactions}
        tokenPrices={tokenPrices}
        setTransactions={setTransactions}
        tokens={tokens}
        loading={loading}
      />
    </div>
  );
}
