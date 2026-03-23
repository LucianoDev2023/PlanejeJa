"use client";

import { useState } from "react";
import { Transaction } from "./TradeForm";
import { Trash2, Pencil, Loader2, ArrowUpRight, ArrowDownRight, Calendar, Coins, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, formatTokenPrice } from "@/app/_utils/currency";


interface TransactionCardProps {
  transaction: Transaction;
  currentPrice: string;
  onDelete: (id: string) => void | Promise<void>;
  onEdit: (transaction: Transaction) => void;
  number: number;
}

export default function TransactionCard({
  transaction,
  currentPrice,
  onDelete,
  onEdit,
  number,
}: TransactionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const amount = parseFloat(transaction.amount);
  const priceNow = parseFloat(currentPrice);
  const investedValue = parseFloat(transaction.usdValue);
  const priceAtSell = transaction.sellTokenPrice
    ? parseFloat(transaction.sellTokenPrice)
    : null;

  const profitBuy = amount * priceNow - investedValue;
  const profitSell =
    priceAtSell !== null ? amount * priceAtSell - investedValue : 0;

  const isProfitPositive =
    transaction.type === "buy" ? profitBuy > 0 : profitSell > 0;

  const profitValue = transaction.type === "buy" ? profitBuy : profitSell;
  const profitPercent = (profitValue / investedValue) * 100;

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir esta transação?")) return;
    setIsDeleting(true);
    try {
      await onDelete(transaction.id);
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass-card glass-card-hover group relative overflow-hidden rounded-2xl p-4 transition-all duration-500">
      {/* Background Accent */}
      <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-20 pointer-events-none ${isProfitPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`} />

      {isDeleting ? (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${transaction.type === 'buy' ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-500'}`}>
                {transaction.token.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {transaction.token}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${transaction.type === 'buy' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                    {transaction.type === 'buy' ? 'Compra' : 'Venda'}
                  </span>
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                  <Calendar size={10} />
                  {format(new Date(transaction.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(transaction)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                title="Editar"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                title="Excluir"
                disabled={isDeleting}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-3 sm:grid-cols-4">
            <div className="space-y-1">
              <p className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                <DollarSign size={10} /> {transaction.type === 'buy' ? 'Investido' : 'Retorno'}
              </p>
              <p className="text-xs font-semibold text-slate-200">
                {formatCurrency(investedValue)}
              </p>

            </div>

            <div className="space-y-1">
              <p className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                <Coins size={10} /> Quantidade
              </p>
              <p className="text-xs font-semibold text-slate-200">
                {amount < 1 ? amount.toFixed(6) : amount.toLocaleString('en-US', { maximumFractionDigits: 4 })}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-medium text-slate-500">Preço Entrada</p>
              <p className="text-xs font-semibold text-slate-200">{formatTokenPrice(transaction.price)}</p>

            </div>

            <div className="space-y-1 text-right sm:text-left">
              <p className="text-[10px] font-medium text-slate-500">{transaction.type === 'buy' ? 'Preço Atual' : 'Preço Saída'}</p>
              <p className="text-xs font-semibold text-slate-200">
                {formatTokenPrice(transaction.type === 'buy' ? priceNow : priceAtSell || 0)}
              </p>

            </div>
          </div>

          {/* Profit Section */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-500">
                {transaction.type === "buy" ? "Lucro/Prejuízo Estimado" : "Lucro Realizado"}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isProfitPositive ? 'neon-text-green' : 'neon-text-red'}`}>
                  {isProfitPositive ? '+' : '-'}{formatCurrency(Math.abs(profitValue))}
                </span>

                <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${isProfitPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {isProfitPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(profitPercent).toFixed(2)}%
                </span>
              </div>
            </div>
            
            <div className="h-1.5 w-24 rounded-full bg-white/5 overflow-hidden">
               <div 
                 className={`h-full transition-all duration-1000 ${isProfitPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                 style={{ width: `${Math.min(Math.max(Math.abs(profitPercent), 5), 100)}%` }}
               />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
