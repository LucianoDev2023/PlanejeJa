import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isMatch } from "date-fns";

import Navbar from "../_components/navbar";
import AddTransactionButton from "../_components/add-transaction-button";
import { Card } from "../_components/ui/card";

import SummaryCards from "./_components/summary-cards";
import TransactionsPieChart from "./_components/transactions-pie-chart";
import ExpensesPerCategory from "./_components/expenses-per-category";
import LastTransactions from "./_components/last-transactions";
import AiReportButton from "./_components/ai-report-button";

// Se ainda não moveu para _server, pode manter esses imports por enquanto

import { getYearLimits } from "../_data/get-dashboard/limit_year";
import { getDashboardTotal } from "../_server/dashboard/get-dashboard-total";
import { canUserAddTransaction } from "../_data/can-user-add-transaction/can-user-add-transaction";

const validPeriodo = ["mensal", "anual", "geral"] as const;
type Periodo = (typeof validPeriodo)[number];

interface HomeProps {
  searchParams?: {
    month?: string; // "01".."12"
    year?: string; // "2025"
    opcao?: string; // pode vir sujo da URL, validamos abaixo
  };
}

function formatarParaMoedaBrasil(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const Home = async ({ searchParams }: HomeProps) => {
  const { userId } = await auth();
  if (!userId) redirect("/login?resetTour=true");

  const user = await clerkClient().users.getUser(userId);

  const month = searchParams?.month;
  const year = searchParams?.year;
  const opcao = searchParams?.opcao;

  // ✅ valida opcao e produz periodo tipado
  const periodo: Periodo =
    opcao && (validPeriodo as readonly string[]).includes(opcao)
      ? (opcao as Periodo)
      : "mensal";

  // ✅ valida ano e mês; se inválido, redireciona com valores corretos
  const monthIsInvalid = !month || !isMatch(month, "MM"); // exige "01"
  const yearIsInvalid = !year || !isMatch(year, "yyyy"); // exige "2025"

  if (monthIsInvalid || yearIsInvalid) {
    const now = new Date();
    const monthStr = String(now.getMonth() + 1).padStart(2, "0"); // ✅ "01"
    const yearStr = String(now.getFullYear());

    redirect(`?month=${monthStr}&year=${yearStr}&opcao=${periodo}`);
  }

  // ✅ agora month/year existem e estão no formato certo
  const dashboard = await getDashboardTotal({ month, year, opcao: periodo });
  type Dashboard = Awaited<ReturnType<typeof getDashboardTotal>>;

  // ⚠️ se seu service refatorado renomeou balanceSun -> totalVolume, ajuste aqui
  const movFinanceiraTotal = dashboard.totalVolume;

  const valorFormatado = formatarParaMoedaBrasil(movFinanceiraTotal);

  const [limit_years, userCanAddTransactionRes] = await Promise.all([
    getYearLimits(),
    canUserAddTransaction(),
  ]);

  return (
    <div className="flex h-full flex-col justify-between">
      <Navbar
        logoClass="joyride-logo"
        inicioClass="joyride-inicio"
        transacoesClass="joyride-transacoes"
        criptosClass="joyride-criptos"
        assinaturaClass="joyride-assinatura"
      />

      <div className="m-3 flex h-full flex-grow cursor-default flex-col overflow-auto caret-transparent sm:m-1 sm:space-y-1">
        <div className="flex justify-between p-2">
          <div className="flex w-full items-center justify-between sm:justify-start sm:gap-4">
            <AddTransactionButton
              className="joyride-add-transaction"
              userCanAddTransaction={userCanAddTransactionRes}
            />

            <AiReportButton
              className="joyride-ai-report"
              month={month}
              hasPremiumPlan={
                user?.publicMetadata?.subscriptionPlan === "premium"
              }
              hasCanceledPlan={
                user?.publicMetadata?.subscriptionPlanStatus === "canceled"
              }
            />
          </div>
        </div>

        <div className="flex h-full flex-col gap-3 p-2 sm:flex-row">
          {/* Coluna 1 */}
          <div className="flex h-full w-full flex-col gap-3 sm:w-1/2">
            <SummaryCards
              className="joyride-periodo"
              hasPremiumPlan={
                user?.publicMetadata?.subscriptionPlan === "premium"
              }
              hasCanceledPlan={
                user?.publicMetadata?.subscriptionPlanStatus === "canceled"
              }
              option={periodo} // ✅ usa o periodo validado
              month={month}
              year={year}
              min_Year={limit_years.minYear?.toString() || ""}
              max_Year={limit_years.maxYear?.toString() || ""}
              {...dashboard}
              {...limit_years}
              userCanAddTransaction={userCanAddTransactionRes}
            />

            <div className="flex-1 items-center justify-center">
              {movFinanceiraTotal === 0 ? (
                <Card className="m-0 flex h-full items-center justify-center bg-gradient-to-b from-[#131d27] to-[#040b11] p-0 sm:w-full">
                  <div className="flex flex-col gap-2">
                    <p className="text-center text-xs text-gray-500">
                      Sem dados para o mês selecionado
                    </p>
                    <p className="text-sm text-gray-500">
                      Comece hoje seus lançamentos
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="flex h-full w-full flex-col gap-2">
                  <p className="font-sans font-normal sm:m-0 sm:pl-2">
                    Movimentação financeira no período selecionado
                  </p>
                  <TransactionsPieChart
                    valorFormatado={valorFormatado}
                    {...dashboard}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Coluna 2 */}
          <div className="flex flex-1 flex-col">
            <p className="mt-2 pb-2 font-sans font-normal sm:m-0 sm:pl-2">
              Últimas Transações
            </p>
            <div className="rouded-lg flex-1 items-center justify-between rounded-lg bg-gradient-to-b from-[#131d27] to-[#040b11]">
              <LastTransactions lastTransactions={dashboard.lastTransactions} />
            </div>
          </div>

          {/* Coluna 3 */}
          <div className="flex flex-1 flex-col">
            <p className="mt-2 pb-2 font-sans font-normal sm:m-0 sm:pl-2">
              Gastos por Categoria
            </p>
            <div className="flex-1 items-center justify-center rounded-lg bg-gradient-to-b from-[#131d27] to-[#040b11]">
              <ExpensesPerCategory
                expensesPerCategory={dashboard.totalExpensePerCategory}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
