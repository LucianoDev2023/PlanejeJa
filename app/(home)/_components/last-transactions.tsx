import { Button } from "@/app/_components/ui/button";
import { CardContent } from "@/app/_components/ui/card";
// import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { TRANSACTION_PAYMENT_METHOD_ICONS } from "@/app/_constants/transactions";
import { formatCurrency } from "@/app/_utils/currency";
import { Transaction, TransactionType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface LastTransactionsProps {
  lastTransactions: Transaction[];
}

const LastTransactions = ({ lastTransactions }: LastTransactionsProps) => {
  const getAmountColor = (transaction: Transaction) => {
    if (transaction.type === TransactionType.EXPENSE) {
      return "text-red-500";
    }
    if (transaction.type === TransactionType.DEPOSIT) {
      return "text-primary";
    }
    return "text-[#60FFFA]";
  };
  const getAmountPrefix = (transaction: Transaction) => {
    if (transaction.type === TransactionType.DEPOSIT) {
      return "+";
    }
    return "-";
  };
  return (
    <div className="h-full w-full rounded-lg border">
      <CardContent className="m-0 flex flex-col items-start justify-between space-y-2 pt-2">
        {lastTransactions.map((transaction) => (
          <div key={transaction.id} className="flex w-full justify-between p-0">
            <div className="flex items-start justify-between gap-1">
              <div className="rounded-lg bg-white bg-opacity-[3%] p-1 text-white">
                <Image
                  src={`/${TRANSACTION_PAYMENT_METHOD_ICONS[transaction.paymentMethod]}`}
                  height={20}
                  width={20}
                  alt="PIX"
                />
              </div>
              <div>
                <p className="text-sm font-bold">{transaction.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <p
              className={`flex pt-2 text-xs font-bold ${getAmountColor(transaction)}`}
            >
              {getAmountPrefix(transaction)}
              {formatCurrency(Number(transaction.amount))}
            </p>
          </div>
        ))}
      </CardContent>
      <div className="m-0 flex flex-row pb-6 pl-6">
        <Button
          size={"sm"}
          className="rounded-md border bg-[#111B21] font-sans"
          asChild
        >
          <Link href="/transactions">
            <span className="text-white/70">Ver mais</span>
          </Link>
        </Button>
      </div>
      {/* </ScrollArea> */}
    </div>
  );
};

export default LastTransactions;
