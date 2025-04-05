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
  // Função para formatar o valor monetário com 2 casas decimais

  function contarCasasDecimais(valor: number) {
    // Converte o valor para string e remove a parte inteira (antes da vírgula ou ponto)
    const partes = valor.toString().split("."); // Separando pela vírgula (caso seja formato brasileiro)
    console.log("PARTE 0:", partes[0], "PARTE 1 :", partes[1]);

    // Condição 1: Se não houver parte decimal
    if (!partes[1]) {
      // Se a segunda parte (decimal) estiver vazia ou não existir
      console.log("Não existe parte decimal");
      return 100;
    }

    // Condição 2: Se existir exatamente um número após o ponto
    if (partes[1].length === 1) {
      console.log("Exatamente um número após o ponto");
      return 10;
    }

    // Retorno padrão se não satisfizer nenhuma das condições anteriores
    return 1;
  }

  let valorFormatado = Number(transactionData.amount);

  if (contarCasasDecimais(valorFormatado) === 100) {
    valorFormatado = valorFormatado * 100;
  }
  if (contarCasasDecimais(valorFormatado) === 10) {
    valorFormatado = Math.round(valorFormatado * 100);
  }
  if (contarCasasDecimais(valorFormatado) === 1) {
    valorFormatado = valorFormatado * 1;
  }

  console.log("VALOR QUE SERÁ ENVIADO NO FORMULÁRIO :", valorFormatado);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-blue-400"
        onClick={() => setDialogIsOpen(true)}
      >
        <PencilIcon />
      </Button>
      <UpsertTransactionDialog
        isOpen={dialogIsOpen}
        setIsOpen={setDialogIsOpen}
        defaultValues={{
          ...transactionData,
          amount: valorFormatado, // Formata o valor com 2 casas decimais para exibição
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
