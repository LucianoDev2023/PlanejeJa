import { db } from "../_lib/prisma";
import { DataTable } from "../_components/ui/data-table";
import { transactionColumns } from "./_columns";
import Navbar from "../_components/navbar";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import TimeSelectTransactions from "./_components/time-select-transaction";
import { isMatch } from "date-fns";
import { TransactionChart } from "./_components/areaChart";

interface TransactionProps {
  searchParams: {
    month: string;
    year: string;
    type: string;
  };
}

const TransactionsPage = async ({
  searchParams: { month, year, type },
}: TransactionProps) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }
  await clerkClient().users.getUser(userId);
  const user = await clerkClient().users.getUser(userId);
  const assinado = user.publicMetadata.subscriptionPlan === "premium";

  const monthIsInvalid = !month || !isMatch(month, "MM");
  const yearIsInvalid = !year || !isMatch(year, "yyyy");
  const validTypes = ["DEPOSIT", "EXPENSE", "INVESTMENT"];

  const transactionType = validTypes.includes(type) ? type : "Todos";

  if (monthIsInvalid && yearIsInvalid) {
    redirect(
      `?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}&type=${transactionType}`,
    );
  }
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: new Date(`${year}-${month || "01"}-01`), // Mês inicial
        lt: new Date(`${year}-${month || "01"}-31`), // Mês final (aproximado)
      },
      // Garantir que 'type' seja um valor válido do enum 'TransactionType' ou undefined
      ...(transactionType !== "Todos" && {
        type: transactionType as "DEPOSIT" | "EXPENSE" | "INVESTMENT", // Cast para o tipo correto
      }),
    },
    orderBy: {
      date: "desc",
    },
  });

  // Calcular o número de dias do mês
  const nextMonth = new Date(Number(year), Number(month), 0); // Último dia do mês
  const daysInMonth = nextMonth.getDate(); // Número de dias do mês

  const chartDate = transactions.map((transaction) => {
    const dateFormatted = transaction.date.toLocaleDateString("pt-BR");
    const [day, month, year] = dateFormatted.split("/");
    const dayNumber = Number(day);
    const monthNumber = Number(month) - 1; // Subtraímos 1 porque em JavaScript os meses começam de 0
    const yearNumber = Number(year);
    const transactionDate = new Date(yearNumber, monthNumber, dayNumber);
    const amountFormatted = `R$${transaction.amount.toFixed(2)}`;
    const type = transaction.type || "Unknown";
    return `${dateFormatted}-${amountFormatted}-${type}-${transactionDate}`;
  });

  const userItemCountMes = await db.transaction.count({
    where: {
      userId,
      date: {
        gte: new Date(`${year}-${month || "01"}-01`), // Mês inicial
        lt: new Date(`${year}-${month || "01"}-31`), // Mês final (aproximado)
      },
      // Garantir que 'type' seja um valor válido do enum 'TransactionType' ou undefined
      ...(transactionType !== "Todos" && {
        type: transactionType as "DEPOSIT" | "EXPENSE" | "INVESTMENT", // Cast para o tipo correto
      }),
    },
  });

  return (
    <>
      <Navbar />
      <div className="m-2 overflow-y-auto">
        {" "}
        {/* Aqui você aplica o scroll na página */}
        <div className="m-2 flex h-full cursor-default flex-col gap-2 sm:flex-row">
          <div className="flex h-full flex-1 flex-col items-center justify-center gap-2">
            <p className="text-center font-sans text-sm font-normal text-white/70 sm:text-lg">
              {assinado ? (
                "Selecione o perído das transações que deseja exibir"
              ) : (
                <span className="font-sans text-gray-500">
                  <span className="font-sans text-xs text-gray-500">
                    (Apenas para Plano Premium)
                    <br />
                  </span>
                  Selecione o perído das transações que deseja exibir{" "}
                </span>
              )}
            </p>
            {/* TÍTULO E BOTÃO */}
            <div className="flex w-full items-center justify-center gap-2">
              <TimeSelectTransactions
                assinatura={user.publicMetadata.subscriptionPlan === "premium"}
              />
              <div className="inline-block rounded-lg border">
                <p className="flex w-fit items-center justify-center p-2 text-xs">
                  {userItemCountMes > 1
                    ? `${userItemCountMes} lançamentos`
                    : `${userItemCountMes} lançamento`}
                </p>
              </div>
            </div>

            <TransactionChart
              chartDates={chartDate}
              daysInMonth={daysInMonth}
            />
          </div>
          <div className="flex flex-1 flex-col">
            <p className="mt-2 pb-2 font-sans font-normal sm:m-0 sm:pl-2">
              Transações mensal
            </p>

            {/* Remover ScrollArea para desativar o scroll interno */}
            <DataTable
              columns={transactionColumns}
              data={JSON.parse(JSON.stringify(transactions))}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionsPage;
