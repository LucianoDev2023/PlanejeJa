"use client";

import { ArrowDownUpIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import UpsertTransactionDialog from "./upsert-transaction-dialog";
import Link from "next/link";

interface AddTransactionButtonProps {
  userCanAddTransaction?: boolean;
  className?: string;
}

const AddTransactionButton = ({
  userCanAddTransaction,
  className = "",
}: AddTransactionButtonProps) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <>
      {userCanAddTransaction ? (
        <Button
          className={`rounded-lg font-bold ${className}`}
          onClick={() => setDialogIsOpen(true)}
          disabled={!userCanAddTransaction}
        >
          Adicionar transação
          <ArrowDownUpIcon />
        </Button>
      ) : (
        <Button className="rounded-lg font-bold">
          <Link href="/subscription">Assinar plano premium</Link>
        </Button>
      )}

      <UpsertTransactionDialog
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
      />
    </>
  );
};

export default AddTransactionButton;
