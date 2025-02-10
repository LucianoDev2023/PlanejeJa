import { db } from "@/app/_lib/prisma";
import { TransactionType } from "@prisma/client";
import { TotalExpensePerCategory, TransactionPercentagePerType } from "./types";
import { auth } from "@clerk/nextjs/server";

export const getDashboardTotal = async (
  month: string,
  year: string,
  opcao: string,
) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const where: {
    userId: string;
    date?: object; // Torna a propriedade 'date' opcional
  } = {
    userId,
  };

  // Caso 1: Quando a opção é "Mensal" e temos ano e mês
  if (opcao === "mensal" && year && month) {
    // Converte year e month de string para número
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10) - 1; // Subtrai 1, pois o mês em JavaScript é zero-indexado

    const startDate = new Date(yearNum, monthNum, 1); // Primeiro dia do mês
    // const endDate = new Date(yearNum, monthNum + 1, 0); // Último dia do mês

    // Defina a data limite como o primeiro dia do próximo mês (fevereiro)
    const nextMonth = new Date(yearNum, monthNum + 1, 1);

    where.date = {
      gte: startDate,
      lt: nextMonth, // Inclui todos os dias até o último dia do mês
    };
  }
  // Caso 2: Quando a opção é "Anual" e temos apenas o ano
  else if (opcao === "anual" && year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${parseInt(year) + 1}-01-01`);

    where.date = {
      gte: startDate,
      lt: endDate, // Para pegar todos os registros de um ano
    };
  }
  // Caso 3: Quando a opção é "Geral" e não há filtro de data
  else if (opcao === "geral") {
    // Não adiciona o filtro de data
    delete where.date;
  }
  // Verifique se `where.date` está presente antes de passar para a consulta do Prisma
  const queryFilter = where.date ? { ...where } : { userId }; // Se `where.date` não estiver presente, apenas o `userId` será passado

  const depositsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...queryFilter, type: "DEPOSIT" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );
  const investmentsTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...queryFilter, type: "INVESTMENT" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );

  const expensesTotal = Number(
    (
      await db.transaction.aggregate({
        where: { ...queryFilter, type: "EXPENSE" },
        _sum: { amount: true },
      })
    )?._sum?.amount,
  );

  const balance = depositsTotal - investmentsTotal - expensesTotal;
  const balanceSun = depositsTotal + investmentsTotal + expensesTotal;

  const transactionsTotal = Number(
    (
      await db.transaction.aggregate({
        where,
        _sum: { amount: true },
      })
    )._sum.amount,
  );

  // const typesPercentage: TransactionPercentagePerType = {
  //   [TransactionType.DEPOSIT]:
  //     Math.round(
  //       (Number(depositsTotal || 0) / Number(transactionsTotal)) * 100 * 10,
  //     ) / 10, // Arredonda para uma casa decimal
  //   [TransactionType.EXPENSE]:
  //     Math.round(
  //       (Number(expensesTotal || 0) / Number(transactionsTotal)) * 100 * 10,
  //     ) / 10, // Arredonda para uma casa decimal

  //   [TransactionType.INVESTMENT]:
  //     Math.round(
  //       (Number(investmentsTotal || 0) / Number(transactionsTotal)) * 100 * 10,
  //     ) / 10, // Arredonda para uma casa decimal
  // };

  const depositPercentage =
    Math.round(
      (Number(depositsTotal || 0) / Number(transactionsTotal)) * 100 * 10,
    ) / 10; // Arredonda para uma casa decimal

  const expensePercentage =
    Math.round(
      (Number(expensesTotal || 0) / Number(transactionsTotal)) * 100 * 10,
    ) / 10; // Arredonda para uma casa decimal

  // Calcule a porcentagem de investimentos de forma normal
  let investmentPercentage =
    Math.round(
      (Number(investmentsTotal || 0) / Number(transactionsTotal)) * 100 * 10,
    ) / 10; // Arredonda para uma casa decimal

  // Calcule a soma das porcentagens de depósitos e despesas
  const totalPercentage = depositPercentage + expensePercentage;

  // Ajuste a porcentagem de investimentos para garantir que a soma seja 100%
  investmentPercentage += 100 - totalPercentage - investmentPercentage;

  // Limitar a apresentação de investmentPercentage para 1 casa decimal, mantendo o tipo numérico
  investmentPercentage = Math.round(investmentPercentage * 10) / 10; // Isso arredonda para 1 casa decimal como número

  const typesPercentage: TransactionPercentagePerType = {
    [TransactionType.DEPOSIT]: depositPercentage,
    [TransactionType.EXPENSE]: expensePercentage,
    [TransactionType.INVESTMENT]: investmentPercentage, // Agora é um número
  };

  const totalExpensePerCategory: TotalExpensePerCategory[] = (
    await db.transaction.groupBy({
      by: ["category"],
      where: {
        ...where,
        type: TransactionType.EXPENSE,
      },
      _sum: {
        amount: true,
      },
    })
  ).map((category) => ({
    category: category.category,
    totalAmount: Number(category._sum.amount),
    percentageOfTotal: Math.round(
      (Number(category._sum.amount) / Number(expensesTotal)) * 100,
    ),
  }));
  const lastTransactions = await db.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: 10,
  });
  return {
    balanceSun,
    balance,
    depositsTotal,
    investmentsTotal,
    expensesTotal,
    typesPercentage,
    totalExpensePerCategory,
    lastTransactions: JSON.parse(JSON.stringify(lastTransactions)),
  };
};
