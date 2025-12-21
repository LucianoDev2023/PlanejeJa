import {
  TransactionCategory,
  TransactionType,
  TransactionPaymentMethod,
} from "@prisma/client";

export type DashboardTotals = {
  totalVolume: number;
  balance: number;

  depositsTotal: number;
  investmentsTotal: number;
  expensesTotal: number;

  typesPercentage: Record<TransactionType, number>;

  totalExpensePerCategory: {
    category: TransactionCategory; // ✅
    totalAmount: number;
    percentageOfTotal: number;
  }[];

  lastTransactions: {
    id: string;
    name: string; // ✅
    date: Date;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    paymentMethod: TransactionPaymentMethod; // ✅
  }[];
};
