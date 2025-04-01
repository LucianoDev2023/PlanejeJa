"use client";

import { motion } from "framer-motion";

interface TransactionFilterToggleProps {
  value: "all" | "buy" | "sell";
  onChange: (value: "all" | "buy" | "sell") => void;
}

const filters: { label: string; value: "all" | "buy" | "sell" }[] = [
  { label: "Todas", value: "all" },
  { label: "Compras", value: "buy" },
  { label: "Vendas", value: "sell" },
];

export default function TransactionFilterToggle({
  value,
  onChange,
}: TransactionFilterToggleProps) {
  return (
    <div className="relative mx-2 my-2 flex w-fit items-center justify-center rounded-lg bg-gray-900 p-[2px] px-1 py-0.5">
      {filters.map((filter) => {
        const isActive = filter.value === value;
        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={`relative z-10 px-2 py-0.5 text-[10px] font-medium leading-none transition-all duration-300 ${
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
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
