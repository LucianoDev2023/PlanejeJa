import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "../_components/navbar";
import SummaryCards from "./_components/summary-cards";
// import TimeSelect from "./_components/time-select";
import { isMatch } from "date-fns";
import TransactionsPieChart from "./_components/transactions-pie-chart";
import ExpensesPerCategory from "./_components/expenses-per-category";
import LastTransactions from "./_components/last-transactions";
import { canUserAddTransaction } from "../_data/can-user-add-transaction";
import AiReportButton from "./_components/ai-report-button";
import { getDashboardTotal } from "../_data/get-dashboard/index_total";
import { getYearLimits } from "../_data/get-dashboard/limit_year";
import AddTransactionButton from "../_components/add-transaction-button";
import { Card } from "../_components/ui/card";
import Tour from "./_actions/tour/Tour";
import WelcomeModal from "./_components/WelcomeModal";

interface HomeProps {
  searchParams: {
    month?: string;
    year: string;
    opcao: string;
  };
}

const Home = async ({ searchParams: { month, year, opcao } }: HomeProps) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login?resetTour=true");
  }

  await clerkClient().users.getUser(userId);

  const monthIsInvalid = !month || !isMatch(month, "MM");
  const validPeriodo = ["mensal", "anual", "todos"];

  const periodo = validPeriodo.includes(opcao) ? opcao : "mensal";

  if (monthIsInvalid) {
    // redirect(`?month=${new Date().getMonth() + 1}`);
    redirect(
      `?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}&opcao=${periodo}`,
    );
  }

  const dashboard = await getDashboardTotal(month, year, opcao);
  const movFinanceiraTotal = dashboard.balanceSun;

  function formatarParaMoedaBrasil(valor: number) {
    // Formatando o número para moeda brasileira
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const valorFormatado = formatarParaMoedaBrasil(movFinanceiraTotal);

  const limit_years = await getYearLimits();
  const userCanAddTransaction = await canUserAddTransaction();
  const user = await clerkClient().users.getUser(userId);

  return (
    <div className="flex h-full flex-col justify-between">
      {/* <WelcomeModal /> */}
      <Navbar
        logoClass="joyride-logo"
        inicioClass="joyride-inicio"
        transacoesClass="joyride-transacoes"
        criptosClass="joyride-criptos"
        assinaturaClass="joyride-assinatura"
      />
      {/* <div className="flex items-center justify-center">
      <AddTransactionButton
        userCanAddTransaction={userCanAddTransaction}
      ></AddTransactionButton>
    </div> */}
      <div className="m-3 flex h-full flex-grow cursor-default flex-col overflow-auto caret-transparent sm:m-1 sm:space-y-1">
        <div className="flex justify-between p-2">
          <div className="flex w-full items-center justify-between sm:justify-start sm:gap-4">
            <AddTransactionButton
              className="joyride-add-transaction"
              userCanAddTransaction={userCanAddTransaction}
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
            {/* <TimeSelect /> */}
          </div>
        </div>

        <div className="flex h-full flex-col gap-3 p-2 sm:flex-row">
          {/* Coluna 1 */}
          <div className="flex h-full w-full flex-col gap-3 sm:w-1/2">
            <SummaryCards
              className="joyride-periodo"
              hasPremiumPlan={
                user.publicMetadata.subscriptionPlan === "premium"
              }
              hasCanceledPlan={
                user?.publicMetadata.subscriptionPlanStatus == "canceled"
              }
              option={opcao}
              month={month}
              year={year}
              min_Year={limit_years.minYear?.toString() || ""}
              max_Year={limit_years.maxYear?.toString() || ""}
              {...dashboard}
              {...limit_years}
              userCanAddTransaction={userCanAddTransaction}
            />

            <div className="flex-1 items-center justify-center">
              {dashboard.balanceSun === 0 ? (
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
                    Movimentação financeira no período selecionado{" "}
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
      <Tour />
    </div>
  );
};

export default Home;
