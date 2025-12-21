import { getCurrentMonthTransactionsCount } from "@/app/_server/transactions/get-current-month-transactions";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const canUserAddTransaction = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await clerkClient().users.getUser(userId);
  if (
    user.publicMetadata.subscriptionPlan === "premium" ||
    user.publicMetadata.subscriptionPlanStatus === "canceled"
  ) {
    return true;
  }

  const currentMonthCount = await getCurrentMonthTransactionsCount();

  if (currentMonthCount >= 10) {
    return false;
  }
  return true;
};
