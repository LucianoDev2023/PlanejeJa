import { auth } from "@clerk/nextjs/server";
import { TransactionCategory, TransactionType } from "@prisma/client";
import type { DashboardTotals } from "@/app/_domain/dashboard/types";
import { prisma } from "@/prisma/client";

type DashboardOption = "mensal" | "anual" | "geral";

/**
 * Constrói o filtro de data de forma segura.
 * Intervalos são sempre [início, próximo_início)
 */
function buildDateFilter(
  opcao: DashboardOption,
  month?: string,
  year?: string,
): { date?: { gte: Date; lt: Date } } {
  if (opcao === "mensal" && month && year) {
    const yearNum = Number(year);
    const monthNum = Number(month);

    // month deve vir como "01".."12" (mas aqui aceitamos número válido também)
    if (
      !Number.isFinite(yearNum) ||
      !Number.isFinite(monthNum) ||
      monthNum < 1 ||
      monthNum > 12
    ) {
      return {};
    }

    const start = new Date(yearNum, monthNum - 1, 1);
    const next = new Date(yearNum, monthNum, 1);

    return { date: { gte: start, lt: next } };
  }

  if (opcao === "anual" && year) {
    const yearNum = Number(year);
    if (!Number.isFinite(yearNum)) return {};

    const start = new Date(yearNum, 0, 1);
    const next = new Date(yearNum + 1, 0, 1);

    return { date: { gte: start, lt: next } };
  }

  // "geral" → sem filtro de data
  return {};
}

function percent(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10; // 1 casa decimal
}

/**
 * Retorna todos os dados consolidados do dashboard
 * (DTO pronto para UI: amount já convertido para number)
 */
export async function getDashboardTotal(params: {
  month?: string;
  year?: string;
  opcao: DashboardOption;
}): Promise<DashboardTotals> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const dateFilter = buildDateFilter(params.opcao, params.month, params.year);

  const whereBase = {
    userId,
    ...dateFilter,
  };

  /**
   * 1) Soma por tipo (uma query só)
   */
  const sumsByType = await prisma.transaction.groupBy({
    by: ["type"],
    where: whereBase,
    _sum: { amount: true },
  });

  const depositsTotal =
    Number(
      sumsByType.find((t) => t.type === TransactionType.DEPOSIT)?._sum.amount,
    ) || 0;

  const expensesTotal =
    Number(
      sumsByType.find((t) => t.type === TransactionType.EXPENSE)?._sum.amount,
    ) || 0;

  const investmentsTotal =
    Number(
      sumsByType.find((t) => t.type === TransactionType.INVESTMENT)?._sum
        .amount,
    ) || 0;

  const totalVolume = depositsTotal + expensesTotal + investmentsTotal;
  const balance = depositsTotal - expensesTotal - investmentsTotal;

  /**
   * 2) Percentuais por tipo (sem NaN)
   */
  const depositPercentage = percent(depositsTotal, totalVolume);
  const expensePercentage = percent(expensesTotal, totalVolume);
  let investmentPercentage = percent(investmentsTotal, totalVolume);

  // Ajuste para fechar exatamente 100% quando houver arredondamento
  if (totalVolume > 0) {
    const diff =
      Math.round(
        (100 - (depositPercentage + expensePercentage + investmentPercentage)) *
          10,
      ) / 10;

    investmentPercentage = Math.round((investmentPercentage + diff) * 10) / 10;
  }

  const typesPercentage = {
    [TransactionType.DEPOSIT]: depositPercentage,
    [TransactionType.EXPENSE]: expensePercentage,
    [TransactionType.INVESTMENT]: investmentPercentage,
  };

  /**
   * 3) Gastos por categoria
   * Observação: category no seu schema parece ser enum (TransactionCategory)
   */
  const groupedExpenses =
    expensesTotal > 0
      ? await prisma.transaction.groupBy({
          by: ["category"],
          where: {
            ...whereBase,
            type: TransactionType.EXPENSE,
          },
          _sum: { amount: true },
        })
      : [];

  const totalExpensePerCategory = groupedExpenses.map((row) => {
    const totalAmount = Number(row._sum.amount) || 0;

    return {
      category: row.category ?? TransactionCategory.OTHER, // ✅ nunca null
      totalAmount,
      percentageOfTotal:
        expensesTotal > 0 ? Math.round((totalAmount / expensesTotal) * 100) : 0,
    };
  });

  /**
   * 4) Últimas transações (somente campos necessários)
   * amount vem como Decimal -> convertemos para number (DTO para UI)
   */
  const lastTransactionsRaw = await prisma.transaction.findMany({
    where: whereBase,
    orderBy: { date: "desc" },
    take: 10,
    select: {
      id: true,
      name: true, // ✅ precisa para UI
      date: true,
      amount: true, // Decimal
      type: true,
      category: true,
      paymentMethod: true, // ✅ precisa para ícone
    },
  });

  const lastTransactions = lastTransactionsRaw.map((t) => ({
    ...t,
    amount: Number(t.amount),
  }));

  return {
    totalVolume,
    balance,
    depositsTotal,
    investmentsTotal,
    expensesTotal,
    typesPercentage,
    totalExpensePerCategory,
    lastTransactions,
  };
}
