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
    where.date = {
      gte: new Date(`${year}-${month}-01`),
      lt: new Date(`${year}-${month}-31`), // Aqui você pode ajustar para o último dia do mês, se necessário
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

  const balance = depositsTotal + investmentsTotal - expensesTotal;

  const transactionsTotal = Number(
    (
      await db.transaction.aggregate({
        where,
        _sum: { amount: true },
      })
    )._sum.amount,
  );

  const typesPercentage: TransactionPercentagePerType = {
    [TransactionType.DEPOSIT]: Math.round(
      (Number(depositsTotal || 0) / Number(transactionsTotal)) * 100,
    ),
    [TransactionType.EXPENSE]: Math.round(
      (Number(expensesTotal || 0) / Number(transactionsTotal)) * 100,
    ),
    [TransactionType.INVESTMENT]: Math.round(
      (Number(investmentsTotal || 0) / Number(transactionsTotal)) * 100,
    ),
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
    take: 8,
  });
  return {
    balance,
    depositsTotal,
    investmentsTotal,
    expensesTotal,
    typesPercentage,
    totalExpensePerCategory,
    lastTransactions: JSON.parse(JSON.stringify(lastTransactions)),
  };
};
