"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface AssinaturaPremium {
  assinatura: boolean;
  cancelPlan: boolean;
}

const MONTH_OPTIONS = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const TimeSelectTransactions: React.FC<AssinaturaPremium> = ({
  assinatura,
  cancelPlan,
}) => {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const month = searchParams.get("month");
  const yearFromUrl = searchParams.get("year");

  const initialYear = yearFromUrl
    ? parseInt(yearFromUrl)
    : new Date().getFullYear();

  const [year, setYear] = useState(initialYear);
  const [loading, setLoading] = useState(false);

  const handleMonthChange = (month: string) => {
    setLoading(true); // Inicia o carregamento
    push(`/transactions?month=${month}&year=${year}`);
  };

  const handleYearChange = (increment: boolean) => {
    const newYear = increment ? year + 1 : year - 1;
    setYear(newYear);
    setLoading(true); // Inicia o carregamento
    push(`/transactions?month=${month}&year=${newYear}`);
  };

  // Verifica quando os parâmetros de URL mudam e define o estado de loading como falso
  // Adiciona um delay de 2 segundos antes de definir o loading como false
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false); // Para o carregamento após o delay
      }, 1500); // Tempo de 2 segundos

      // Limpa o timer caso o componente seja desmontado ou o estado de loading seja alterado
      return () => clearTimeout(timer);
    }
  }, [loading, month, year]);

  return (
    <>
      <div className="flex items-center gap-2">
        {loading ? (
          <div className="spinner text-sm">
            <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-[#38be19]"></div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Select
              onValueChange={(value) => handleMonthChange(value)}
              defaultValue={month ?? ""}
              disabled={!assinatura && !cancelPlan}
            >
              <SelectTrigger className="w-[120px] rounded-lg bg-transparent p-2">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent className="m-0 bg-[#111A21] p-0">
                {MONTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span
                      className={`${assinatura || cancelPlan ? "text-white" : "text-gray-500"}`}
                    >
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 rounded-lg border-e-2 border-s-2">
              <button
                disabled={!assinatura && !cancelPlan}
                onClick={() => handleYearChange(false)}
                className={`flex h-8 w-8 items-center ${assinatura || cancelPlan ? "text-white" : "text-gray-500"} justify-center rounded-lg bg-[#111A21]`}
              >
                &lt;
              </button>
              <span
                className={`sm:text-md text-xs ${assinatura || cancelPlan ? "text-white" : "text-gray-500"}`}
              >
                {year}
              </span>
              <button
                disabled={!assinatura && !cancelPlan}
                onClick={() => handleYearChange(true)}
                className={`flex h-8 w-8 items-center ${assinatura || cancelPlan ? "text-white" : "text-gray-500"} justify-center rounded-lg bg-[#111A21]`}
              >
                &gt;
              </button>
            </div>
          </div>
        )}{" "}
        {/* Exibe o spinner */}
      </div>
    </>
  );
};

export default TimeSelectTransactions;
