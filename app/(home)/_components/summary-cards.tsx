import {
  PiggyBankIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import SummaryCard from "./summary-card";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/app/_components/ui/card";
import DialogoSeletor from "./Dialogo_seletor";

interface SummaryCards {
  hasPremiumPlan: boolean;
  hasCanceledPlan: boolean;
  month: string;
  year: string;
  balance: number;
  depositsTotal: number;
  investmentsTotal: number;
  expensesTotal: number;
  userCanAddTransaction?: boolean;
  min_Year: string;
  max_Year: string;
  option: string;
  className?: string;
}

const SummaryCards = async ({
  hasPremiumPlan,
  hasCanceledPlan,
  balance,
  depositsTotal,
  expensesTotal,
  investmentsTotal,
  month,
  year,
  min_Year,
  max_Year,
  option,
  className,

  // userCanAddTransaction,
}: SummaryCards) => {
  const monthNumber = parseInt(month);
  const monthsAbbreviated = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* PRIMEIRO CARD */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <SummaryCard
          icon={<WalletIcon size={20} />}
          title="Saldo"
          amount={balance}
          size="small"
          // userCanAddTransaction={userCanAddTransaction}
        />
        <Card className="bg-gradient-to-b from-[#131d27] to-[#040b11]">
          <CardHeader className="m-0 flex h-full w-full p-0">
            <CardContent className="flex h-full w-full flex-col items-center justify-center gap-4 p-2">
              <DialogoSeletor
                className="joyride-periodo"
                assinatura={hasPremiumPlan}
                hasCanceledPlan={hasCanceledPlan}
              />

              <div>
                {option === "mensal" && (
                  <p className="sm:text-md font-sans text-sm text-white/70">
                    {monthsAbbreviated[monthNumber - 1]} de {year}
                  </p>
                )}

                {option === "anual" && (
                  <p className="sm:text-md font-sans text-sm text-white/70">
                    Referência {year}
                  </p>
                )}

                {option === "geral" && (
                  <p className="sm:text-md font-sans text-sm text-white/70">
                    {min_Year} a {max_Year}
                  </p>
                )}
              </div>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
      {/* OUTROS CARDS */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/transactions?type=DEPOSIT">
          <SummaryCard
            icon={<TrendingUpIcon size={16} className="text-primary" />}
            title="Renda"
            amount={depositsTotal}
            size="large"
            classNameCards="joyride-cards"
          />
        </Link>

        <Link href="/transactions?type=INVESTMENT">
          <SummaryCard
            icon={<PiggyBankIcon size={16} className="text-[#60FFFA]" />}
            title="Investido"
            amount={investmentsTotal}
            size="large"
          />
        </Link>

        <Link href="/transactions?type=EXPENSE">
          <SummaryCard
            icon={<TrendingDownIcon size={16} className="text-red-500" />}
            title="Despesas"
            amount={expensesTotal}
            size="large"
          />
        </Link>
      </div>
    </div>
  );
};

export default SummaryCards;
