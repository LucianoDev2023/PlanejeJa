"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TransactionFilterToggleProps {
  value: "all" | "buy" | "sell" | "positive" | "negative";
  onChange: (value: "all" | "buy" | "sell" | "positive" | "negative") => void;
}

const filters: {
  label?: string;
  icon?: React.ReactNode;
  value: "all" | "buy" | "sell" | "positive" | "negative";
}[] = [
  { label: "Todas", value: "all" },
  { label: "Compras", value: "buy" },
  { label: "Vendas", value: "sell" },
  {
    icon: <ArrowUpRight size={14} className="rounded-md text-green-500" />,
    value: "positive",
  },
  {
    icon: <ArrowDownRight size={14} className="text-red-500" />,
    value: "negative",
  },
];

export default function TransactionFilterToggle({
  value,
  onChange,
}: TransactionFilterToggleProps) {
  return (
    <div className="relative mx-2 my-2 flex w-fit items-center justify-center rounded-lg bg-gray-900 p-[2px] px-1 py-0.5">
      {filters.map((filter) => {
        const isActive = value === filter.value;
        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={`relative z-10 flex items-center justify-center gap-1 px-2 py-0.5 text-[10px] font-medium leading-none transition-all duration-300 ${
              isActive ? "text-white" : "text-gray-500"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="toggle"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute inset-0 z-[-1] rounded-md bg-gradient-to-t from-[#0b1529] to-[#10c1edc5]"
              />
            )}
            {filter.icon && (
              <span
                className={` ${filter.value === "positive" ? "text-green-500" : ""} ${filter.value === "negative" ? "text-red-500" : ""} ${!isActive ? "opacity-60" : ""} `}
              >
                {filter.icon}
              </span>
            )}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
