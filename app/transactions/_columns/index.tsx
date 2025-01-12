"use client";

import { Transaction } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import TransactionTypeBadge from "../_components/type-badge";
import EditTransactionButton from "../_components/edit-transaction-button";
import DeleteTransactionButton from "../_components/delete-transaction-button";

export const transactionColumns: ColumnDef<Transaction>[] = [
  // {
  //   accessorKey: "name",
  //   header: () => <div className="text-left">Nome</div>,
  // },
  // {
  //   accessorKey: "type",
  //   header: () => <div className="text-left">Tipo</div>,
  //   cell: ({ row: { original: transaction } }) => (
  //     <div className="flex w-fit pl-3 text-center">
  //       <TransactionTypeBadge transaction={transaction} />
  //     </div>
  //   ),
  // },
  // {
  //   accessorKey: "category",
  //   header: "Categoria",
  //   cell: ({ row: { original: transaction } }) =>
  //     TRANSACTION_CATEGORY_LABELS[transaction.category],
  // },
  {
    accessorKey: "name",
    header: () => <div className="text-left">Nome</div>,
    cell: ({ row: { original: transaction } }) => (
      <div className="flex flex-col gap-2 text-left">
        <span>{transaction.name}</span>
        <span>
          <TransactionTypeBadge transaction={transaction} />
        </span>
      </div>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: () => <div className="text-center">Data / valor</div>,
    cell: ({ row: { original: transaction } }) => (
      <div className="flex flex-col gap-1">
        <span className="text-center">
          {new Date(transaction.date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "numeric",
          })}
        </span>
        <span className="text-center">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(Number(transaction.amount))}
        </span>
      </div>
    ),
  },

  // {
  //   accessorKey: "paymentMethod",
  //   header: "Método de Pagamento",
  //   cell: ({ row: { original: transaction } }) =>
  //     TRANSACTION_PAYMENT_METHOD_LABELS[transaction.paymentMethod],
  // },
  // {
  //   accessorKey: "date",
  //   header: "Data",
  //   cell: ({ row: { original: transaction } }) =>
  //     new Date(transaction.date).toLocaleDateString("pt-BR", {
  //       day: "2-digit",
  //       month: "numeric",
  //       // year: "numeric",
  //     }),
  // },
  // {
  //   accessorKey: "amount",
  //   header: "Valor",
  //   cell: ({ row: { original: transaction } }) =>
  //     new Intl.NumberFormat("pt-BR", {
  //       style: "currency",
  //       currency: "BRL",
  //     }).format(Number(transaction.amount)),
  // },
  {
    accessorKey: "actions",
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row: { original: transaction } }) => {
      return (
        <div className="gap-1 text-right">
          <EditTransactionButton transaction={transaction} />
          <DeleteTransactionButton transactionId={transaction.id} />
        </div>
      );
    },
  },
];
