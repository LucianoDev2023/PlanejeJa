"use client";

import { Button } from "@/app/_components/ui/button";
import UpsertTransactionDialog from "@/app/_components/upsert-transaction-dialog";
import { Transaction } from "@prisma/client";
import { PencilIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface EditTransactionButtonProps {
  transaction: Transaction;
}

const EditTransactionButton = ({ transaction }: EditTransactionButtonProps) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [transactionData, setTransactionData] = useState(transaction); // Estado local para armazenar dados atualizados

  useEffect(() => {
    if (dialogIsOpen) {
      // Garantir que a transação é atualizada ao abrir o modal
      setTransactionData(transaction);
    }
  }, [dialogIsOpen, transaction]); // Atualiza quando o diálogo é aberto ou a transação muda

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        onClick={() => setDialogIsOpen(true)}
      >
        <PencilIcon />
      </Button>
      <UpsertTransactionDialog
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
        defaultValues={{
          ...transactionData,
          amount: Number(transactionData.amount),
          date:
            transactionData.date instanceof Date
              ? transactionData.date
              : new Date(transactionData.date),
        }}
        transactionId={transactionData.id}
        date={
          transactionData.date instanceof Date
            ? transactionData.date
            : new Date(transactionData.date)
        }
      />
    </>
  );
};

export default EditTransactionButton;
