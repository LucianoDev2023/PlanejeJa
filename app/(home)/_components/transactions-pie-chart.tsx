"use client";

import { Pie, PieChart } from "recharts";

import { Card, CardContent } from "@/app/_components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/_components/ui/chart";
import { TransactionType } from "@prisma/client";
import { TransactionPercentagePerType } from "@/app/_data/get-dashboard/types";
import { PiggyBankIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import PercentageItem from "./percentage-item";

const chartConfig = {
  [TransactionType.INVESTMENT]: {
    label: "Investido",
    color: "#FFFFFF",
  },
  [TransactionType.DEPOSIT]: {
    label: "Receita",
    color: "#55B02E",
  },
  [TransactionType.EXPENSE]: {
    label: "Despesas",
    color: "#E93030",
  },
} satisfies ChartConfig;

interface TransactionsPieChartProps {
  valorFormatado: string;
  typesPercentage: TransactionPercentagePerType;
  depositsTotal: number;
  investmentsTotal: number;
  expensesTotal: number;
}

const TransactionsPieChart = ({
  depositsTotal,
  investmentsTotal,
  expensesTotal,
  typesPercentage,
}: TransactionsPieChartProps) => {
  const chartData = [
    {
      type: TransactionType.DEPOSIT,
      amount: depositsTotal,
      fill: "#469126",
    },
    {
      type: TransactionType.INVESTMENT,
      amount: investmentsTotal,
      fill: "#60FFFA",
    },
    {
      type: TransactionType.EXPENSE,
      amount: expensesTotal,
      fill: "#850404",
    },
  ];
  return (
    <Card className="m-0 flex items-center justify-center bg-gradient-to-b from-[#131d27] to-[#040b11] p-0 pt-2 sm:h-full sm:w-full">
      <CardContent className="m-0 mb-2 grid h-full grid-cols-[40%,60%] p-0 sm:mb-0 sm:grid-cols-2">
        {/* Div para o gráfico */}
        <div className="flex flex-col">
          <div
            key="2"
            className="m-0 flex h-full w-full flex-row items-center justify-center sm:flex-col sm:p-2"
          >
            <ChartContainer config={chartConfig} className="h-full w-full">
              <PieChart className="h-full w-full">
                <Pie
                  data={chartData}
                  dataKey="amount"
                  nameKey="type"
                  innerRadius="45%"
                  outerRadius="70%"
                />
              </PieChart>
            </ChartContainer>
          </div>
        </div>

        {/* Div para os PercentageItems */}
        <div className="grid h-full grid-cols-1 gap-3 p-1 pr-6 sm:mr-10 sm:w-4/5 sm:p-2 sm:pb-5">
          <PercentageItem
            icon={<TrendingUpIcon size={16} className="text-primary" />}
            title="Renda"
            value={typesPercentage[TransactionType.DEPOSIT]}
            borderColor="border-primary/70"
          />

          <PercentageItem
            icon={<PiggyBankIcon size={16} className="text-[#60FFFA]" />}
            title="Investido"
            value={typesPercentage[TransactionType.INVESTMENT]}
            borderColor="border-[#60FFFA]"
          />
          <PercentageItem
            icon={<TrendingDownIcon size={16} className="text-red-500" />}
            title="Despesas"
            value={typesPercentage[TransactionType.EXPENSE]}
            borderColor="border-red-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsPieChart;
