import { prisma } from "@/prisma/client";
import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";

export type UpsertTransactionInput = {
  id?: string;
  userId: string;

  name: string;
  amount: number;

  type: TransactionType;
  category: TransactionCategory;
  paymentMethod: TransactionPaymentMethod;

  date: Date;
};

export async function upsertTransaction(input: UpsertTransactionInput) {
  const { id, userId, ...data } = input;

  // CREATE
  if (!id) {
    return prisma.transaction.create({
      data: { ...data, userId },
      select: { id: true },
    });
  }

  // SECURITY CHECK (garante que pertence ao user)
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Transaction not found");
  }

  // UPDATE
  return prisma.transaction.update({
    where: { id },
    data: { ...data },
    select: { id: true },
  });
}
