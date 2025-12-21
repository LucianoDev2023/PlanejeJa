import { prisma } from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { startOfMonth, addMonths } from "date-fns";

export async function getCurrentMonthTransactionsCount() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const start = startOfMonth(new Date());
  const next = addMonths(start, 1);

  return prisma.transaction.count({
    where: {
      userId,
      date: {
        gte: start,
        lt: next,
      },
    },
  });
}
