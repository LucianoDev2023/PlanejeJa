"use client";

import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, LineChart, Layers, ShoppingBag, DollarSign } from "lucide-react";

export type TransactionFilterValue =
  | "all"
  | "buy"
  | "sell"
  | "positive"
  | "negative"
  | "chart";

interface TransactionFilterToggleProps {
  value: TransactionFilterValue;
  onChange: (value: TransactionFilterValue) => void;
}

const filters: {
  label: string;
  icon: ReactNode;
  value: TransactionFilterValue;
  color?: string;
}[] = [
  { label: "Todas", icon: <Layers size={14} />, value: "all" },
  { label: "Compras", icon: <ShoppingBag size={14} />, value: "buy" },
  { label: "Vendas", icon: <DollarSign size={14} />, value: "sell" },
  { label: "Profit", icon: <ArrowUpRight size={14} />, value: "positive", color: "text-emerald-400" },
  { label: "Loss", icon: <ArrowDownRight size={14} />, value: "negative", color: "text-rose-400" },
];

export default function TransactionFilterToggle({
  value,
  onChange,
}: TransactionFilterToggleProps) {
  return (
    <div className="flex w-full items-center justify-start overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
      <div className="flex h-11 items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
        {filters.map((filter) => {
          const isActive = value === filter.value;

          return (
            <button
              key={filter.value}
              onClick={() => onChange(filter.value)}
              className={`relative flex h-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-filter"
                  className="absolute inset-0 rounded-xl bg-primary/20 ring-1 ring-primary/40 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <span className={`relative z-10 ${isActive ? (filter.color || 'text-primary') : 'opacity-70'}`}>
                {filter.icon}
              </span>
              <span className="relative z-10">{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
