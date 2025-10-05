"use client";

import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/app/_components/ui/select";
import React, { useEffect, useState } from "react";

import TimeSelectMesAno from "./time-select-mes-ano";
import { useRouter, useSearchParams } from "next/navigation";
import TimeSelectAno from "./time-select-ano";

// Corrigi a interface, usando a convenção correta
interface AssinaturaPremium {
  assinatura: boolean;
  hasCanceledPlan: boolean;
  className?: string;
}

const DialogoSeletor: React.FC<AssinaturaPremium> = ({
  assinatura,
  hasCanceledPlan,
  className = "",
}) => {
  const [selectedOption, setSelectedOption] = useState("mensal");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para controlar o loading
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const monthFromUrl = searchParams.get("month");
  const yearFromUrl = searchParams.get("year");

  // Função para atualizar a URL quando a opção for "geral"
  useEffect(() => {
    if (selectedOption === "geral") {
      push(
        `/?month=${monthFromUrl || ""}&year=${yearFromUrl || ""}&opcao=geral`,
      );
    } else {
      push(
        `/?month=${monthFromUrl || ""}&year=${yearFromUrl || ""}&opcao=${selectedOption}`,
      );
    }
  }, [selectedOption, push, monthFromUrl, yearFromUrl]);

  const handleOkClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false); // Fechar o modal após 2 segundos
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={"sm"}
          className={`rounded-lg border ${className} bg-[#0D141A]`}
        >
          <span className="font-sans font-normal text-white">Período</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="min m-0 flex max-h-[330px] min-h-[250px] min-w-[320px] max-w-[320px] flex-col justify-between gap-6 rounded-lg py-6 sm:min-w-[425px] sm:max-w-[425px]">
        {loading ? (
          <div className="spinner flex h-full items-center justify-center text-sm">
            <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-[#38be19]"></div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-start justify-between gap-6">
            {assinatura || hasCanceledPlan ? (
              <p className="font-sans text-sm font-normal text-gray-500">
                Selecione o perído desejado
              </p>
            ) : (
              <>
                <p className="pt-4 font-sans text-xs font-normal text-gray-500">
                  Seleção de datas não disponível no plano básico
                </p>
              </>
            )}
            <div className="flex items-center justify-center gap-4">
              <p className="text-gray500 font-sans text-sm font-normal">
                Período
              </p>
              <Select value={selectedOption} onValueChange={setSelectedOption}>
                <SelectTrigger className="w-fit justify-center px-4">
                  <span className="flex items-center justify-center px-3">
                    {selectedOption.charAt(0).toUpperCase() +
                      selectedOption.slice(1)}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    className="font-sans text-sm font-normal"
                    value="mensal"
                  >
                    Mensal
                  </SelectItem>
                  <SelectItem
                    className={`font-sans text-sm font-normal ${assinatura || hasCanceledPlan ? "" : "text-gray-500"}`}
                    value="anual"
                    disabled={!assinatura && !hasCanceledPlan}
                  >
                    Anual
                  </SelectItem>

                  <SelectItem
                    className={`font-sans text-sm font-normal ${assinatura || hasCanceledPlan ? "" : "text-gray-500"}`}
                    value="geral"
                    disabled={!assinatura && !hasCanceledPlan}
                  >
                    Geral
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-4">
              {/* Condicional para selecionar mês e ano, ou apenas ano, dependendo da opção escolhida */}
              {selectedOption === "mensal" && (
                <div className="flex w-full items-center justify-center font-sans font-normal">
                  <TimeSelectMesAno
                    assinatura={assinatura}
                    hasCanceledPlan={hasCanceledPlan}
                  />
                </div>
              )}
              {selectedOption === "anual" && (
                <div className="flex w-full items-center justify-center">
                  <TimeSelectAno />
                </div>
              )}
              {selectedOption === "geral" && (
                <div className="col-span-4 text-center font-sans text-sm font-normal text-gray-500">
                  Todas as transações lançadas
                </div>
              )}
            </div>

            <Button
              onClick={handleOkClick}
              disabled={loading}
              className="flex w-1/3 items-center justify-center"
            >
              {loading ? (
                <span className="loader font-sans text-xs font-normal">
                  Carregando...
                </span> // Você pode customizar o ícone de carregamento aqui
              ) : (
                "OK"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogoSeletor;
