"use client";

import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/app/_components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/_components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Despesas",
    color: "#FF5733",
  },
  mobile: {
    label: "Investimento",
    color: "#60FFFA",
  },
  mobiles: {
    label: "Receitas",
    color: "#55B02E",
  },
} satisfies ChartConfig;

interface ChartProps {
  chartDates: string[]; // Array de strings no formato "29/01/2025-R$5063.00-EXPENSE"
  daysInMonth: number;
}

export function TransactionChart({ chartDates, daysInMonth }: ChartProps) {
  // Inicializando chartData com valores padrão, com 0 para os dias e os tipos
  const chartData = {
    days: Array(daysInMonth).fill(0),
    Despesa: Array(31).fill(0),
    Investimento: Array(31).fill(0),
    Receita: Array(31).fill(0),
  };

  // Se chartDates estiver vazio, retornamos um gráfico zerado (sem dados)
  if (chartDates.length === 0) {
    // Preparando o formato final com valores zerados para o gráfico
    const graphData = chartData.days.map((_, index) => ({
      day: index + 1,
      Receita: 0,
      Despesa: 0,
      Investimento: 0,
    }));

    return (
      <Card className="w-full items-center justify-center bg-gradient-to-b from-[#131d27] to-[#040b11]">
        <CardHeader className="flex w-full items-center gap-2 space-y-0 sm:flex-row"></CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="w-full">
            <LineChart
              className="items-center justify-center"
              data={graphData}
              margin={{
                left: 1,
                right: 1,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}`}
              />
              <YAxis />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />

              <Line
                dataKey="Receita"
                type="monotone"
                stroke={chartConfig.mobiles.color}
                strokeWidth={0}
                dot={false}
              />
              <Line
                dataKey="Despesa"
                type="monotone"
                stroke={chartConfig.desktop.color}
                strokeWidth={0}
                dot={false}
              />
              <Line
                dataKey="Investimento"
                type="monotone"
                stroke={chartConfig.mobile.color}
                strokeWidth={0}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  const [firstDate] = chartDates; // Pegando a primeira transação (se houver)
  const [date] = firstDate.split("-"); // Pegando a data da primeira transação
  const mes = new Date(date.split("/").reverse().join("-")); // Criando objeto Date
  const yearInTwoDigits = mes.getFullYear().toString();

  const monthInPortuguese = mes.toLocaleDateString("pt-BR", {
    month: "long",
  });

  chartDates.forEach((data) => {
    const [date, amount, type] = data.split("-");
    const numericAmount = parseFloat(
      amount.replace("R$", "").replace(",", "."),
    );
    const day = parseInt(date.split("/")[0], 10); // Obtendo o dia da transação
    // Atualizando os valores diários no array 'days'
    chartData.days[day - 1] += numericAmount;
    // Atualizando os totais por tipo
    if (type === "DEPOSIT") {
      chartData.Receita[day - 1] += numericAmount;
    } else if (type === "INVESTMENT") {
      chartData.Investimento[day - 1] += numericAmount;
    } else if (type === "EXPENSE") {
      chartData.Despesa[day - 1] += numericAmount;
    }
  });

  // Preparando o formato final para o gráfico
  const graphData = chartData.days.map((_, index) => ({
    day: index + 1,
    Receita: chartData.Receita[index],
    Despesa: chartData.Despesa[index],
    Investimento: chartData.Investimento[index],
  }));

  return (
    <Card className="w-full items-center justify-center bg-gradient-to-b from-[#131d27] to-[#040b11] pb-4">
      <CardHeader className="flex w-full items-center space-y-0 text-center sm:flex-row">
        <CardDescription className="w-full items-center justify-center font-sans font-normal">
          Gráfico referente ao mês de {monthInPortuguese}{" "}
          <span className="font-sans font-normal">de</span> {yearInTwoDigits}
        </CardDescription>
      </CardHeader>
      <CardContent className="m-0 items-center justify-center p-2 text-center">
        <ChartContainer config={chartConfig} className="w-full">
          <LineChart
            data={graphData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            <Line
              dataKey="Receita"
              type="monotone"
              stroke={chartConfig.mobiles.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="Despesa"
              type="monotone"
              stroke={chartConfig.desktop.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="Investimento"
              type="monotone"
              stroke={chartConfig.mobile.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
