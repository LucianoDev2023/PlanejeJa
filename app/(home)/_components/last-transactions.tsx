import { Button } from "@/app/_components/ui/button";
import { CardContent } from "@/app/_components/ui/card";
import { TRANSACTION_PAYMENT_METHOD_ICONS } from "@/app/_constants/transactions";
import { formatCurrency } from "@/app/_utils/currency";
import { TransactionType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import type { getDashboardTotal } from "@/app/_server/dashboard/get-dashboard-total";

type Dashboard = Awaited<ReturnType<typeof getDashboardTotal>>;
type LastTransaction = Dashboard["lastTransactions"][number];

interface LastTransactionsProps {
  lastTransactions: Dashboard["lastTransactions"];
}

const LastTransactions = ({ lastTransactions }: LastTransactionsProps) => {
  const getAmountColor = (transaction: LastTransaction) => {
    if (transaction.type === TransactionType.EXPENSE) return "text-red-500";
    if (transaction.type === TransactionType.DEPOSIT) return "text-primary";
    return "text-[#60FFFA]";
  };

  const getAmountPrefix = (transaction: LastTransaction) => {
    if (transaction.type === TransactionType.DEPOSIT) return "+";
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
                  // 🔥 se paymentMethod existir no seu DTO, isso funciona.
                  // Se o TS reclamar aqui, é porque seu select no _server não inclui paymentMethod.
                  src={`/${TRANSACTION_PAYMENT_METHOD_ICONS[transaction.paymentMethod]}`}
                  height={20}
                  width={20}
                  alt="Método de pagamento"
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
              {formatCurrency(transaction.amount)}
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
    </div>
  );
};

export default LastTransactions;
