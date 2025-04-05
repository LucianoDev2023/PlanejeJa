"use client";

import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Transaction } from "./TradeForm";
import { Trash2, Pencil, Loader2 } from "lucide-react";

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

  const displayedProfit =
    transaction.type === "buy"
      ? !isNaN(profitBuy)
        ? `$${profitBuy.toFixed(2)}`
        : " -"
      : !isNaN(profitSell)
        ? `$${profitSell.toFixed(2)}`
        : " -";

  const profitPercent =
    transaction.type === "buy"
      ? !isNaN(profitBuy)
        ? `${((profitBuy / investedValue) * 100).toFixed(2)}%`
        : "-"
      : !isNaN(profitSell)
        ? `${((profitSell / investedValue) * 100).toFixed(2)}%`
        : "-";

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(transaction.id);
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
    }
  };

  return (
    <Card className="m-2 border-transparent bg-gradient-to-b from-[#131D27] to-[#0f273d] p-0 text-gray-300">
      <CardContent className="relative flex items-center justify-center p-1 px-3">
        <span className="absolute left-0 top-0 rounded-full border border-gray-700 px-1 text-[8px] font-bold text-blue-400">
          {" "}
          {number}
        </span>
        {isDeleting ? (
          <Loader2 className="h-20 w-6 animate-spin text-white sm:h-8" />
        ) : (
          <div className="grid w-full grid-cols-1 items-center justify-center text-left md:grid-cols-7">
            <p className="col-span-1 break-words text-xs font-semibold">
              {transaction.token} -{" "}
              {transaction.type === "buy" ? "🛒 Compra" : "💰 Venda"}
            </p>

            <p className="col-span-1 break-words text-xs">
              <strong>Data:</strong>{" "}
              {new Date(transaction.date).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Sao_Paulo",
              })}
            </p>

            <p className="col-span-1 break-words text-xs">
              <strong>
                {transaction.type === "buy"
                  ? "Compra em USD:"
                  : "Venda em USD:"}
              </strong>{" "}
              ${transaction.usdValue}
            </p>

            <p className="col-span-1 break-words text-xs">
              <strong>Qtd. Tokens:</strong>{" "}
              {Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(4)}
            </p>

            <p className="col-span-1 break-words text-xs">
              <strong>Preço na Compra:</strong> ${transaction.price}
            </p>

            {transaction.type === "sell" && transaction.sellTokenPrice && (
              <p className="col-span-1 break-words text-xs">
                <strong>Preço na Venda:</strong> ${transaction.sellTokenPrice}
              </p>
            )}

            {transaction.type === "buy" && (
              <p className="col-span-1 break-words text-xs">
                <strong>Preço Atual:</strong> ${Number(priceNow).toString()}
              </p>
            )}

            <div className="col-span-2 flex items-center justify-between gap-3 md:col-span-1">
              <div className="flex flex-col text-xs">
                <span className="font-semibold">
                  {transaction.type === "buy"
                    ? "Lucro atual:"
                    : "Lucro realizado:"}
                </span>
                <span
                  className={`${isProfitPositive ? "text-green-600" : "text-red-600"}`}
                >
                  {displayedProfit} ({profitPercent})
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    console.log("📝 Editar clicado:", transaction);
                    onEdit(transaction);
                  }}
                  className="text-blue-400"
                  title="Editar"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-amber-700"
                  title="Excluir"
                  disabled={isDeleting}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
