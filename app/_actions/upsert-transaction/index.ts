"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { upsertTransaction } from "@/app/_server/transactions/upsert-transaction";
import { upsertTransactionSchema } from "@/app/_server/transactions/schema";

export async function upsertTransactionAction(raw: unknown) {
  const parsed = upsertTransactionSchema.parse(raw);

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const date =
    parsed.date instanceof Date ? parsed.date : new Date(parsed.date);

  await upsertTransaction({
    ...parsed,
    date,
    userId,
  });

  revalidateTag("dashboard");
  revalidatePath("/");
  revalidatePath("/transactions");
}
