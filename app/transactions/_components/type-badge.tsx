import { Badge } from "@/app/_components/ui/badge";
import { Transaction, TransactionType } from "@prisma/client";
import { CircleIcon } from "lucide-react";

interface TransactionTypeBadgeProps {
  transaction: Transaction;
}

const TransactionTypeBadge = ({ transaction }: TransactionTypeBadgeProps) => {
  if (transaction.type === TransactionType.DEPOSIT) {
    return (
      <Badge className="bg-muted font-bold text-primary hover:bg-muted">
        <CircleIcon className="fill-primary" size={10} />
        {/* Renda */}
      </Badge>
    );
  }
  if (transaction.type === TransactionType.EXPENSE) {
    return (
      <Badge className="font bold bg-danger bg-opacity-10 text-danger">
        <CircleIcon className="fill-danger" size={10} />
        {/* Despesa */}
      </Badge>
    );
  }
  return (
    <Badge className="font bold bg-[#60FFFA] bg-opacity-10 text-[#60FFFA]">
      <CircleIcon className="fill-[#60FFFA]" size={10} />
      {/* Investimento */}
    </Badge>
  );
};

export default TransactionTypeBadge;
