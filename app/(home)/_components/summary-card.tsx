"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importando ícones de olho

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  amount: number;
  size?: "small" | "large";
  userCanAddTransaction?: boolean;
  className?: string;
}

const SummaryCard = ({
  icon,
  title,
  amount,
  size = "small",
}: SummaryCardProps) => {
  const [isAmountVisible, setIsAmountVisible] = useState(true); // Estado para controlar a visibilidade

  const toggleAmountVisibility = () => {
    setIsAmountVisible((prevState) => !prevState); // Alterna a visibilidade
  };
  console.log(isAmountVisible);
  return (
    <>
      <Card className="m-0 flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#131d27] to-[#040b11] p-0 sm:flex-row">
        <CardHeader
          className={`${
            title === "Saldo" ? "flex-row" : "flex-col"
          } m-0 items-center justify-center gap-2 p-2 sm:justify-start sm:p-4`}
        >
          {icon}
          <p
            className={`${
              size === "small"
                ? "text-muted-foreground"
                : "text-white opacity-70"
            } flex items-center`}
          >
            {title}
            {title === "Saldo" && (
              <button
                onClick={toggleAmountVisibility}
                className="ml-5 text-white opacity-80"
              >
                {!isAmountVisible ? <FaEyeSlash /> : <FaEye />}{" "}
                {/* Ícone que muda */}
              </button>
            )}
          </p>
        </CardHeader>
        <CardContent
          className={`${
            title === "Saldo" ? "justify-center" : "justify-center"
          } flex items-center p-1 px-2 text-xs sm:flex-row sm:p-2`}
        >
          <div
            className={`flex w-full flex-col items-center justify-center gap-2 px-4 sm:flex-row sm:pb-2 ${
              title === "Saldo" ? "justify-between" : "justify-center"
            }`}
          >
            <p
              className={`text-center font-bold sm:text-lg ${
                isAmountVisible
                  ? amount < 0
                    ? "text-red-500"
                    : "text-white"
                  : "text-white/50"
              } ${title === "Saldo" ? "text-sm" : "text-xs"}`}
            >
              {isAmountVisible
                ? Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(amount)
                : "R$ ****"}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SummaryCard;
