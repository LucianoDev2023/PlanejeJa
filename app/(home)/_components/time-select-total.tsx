"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const MONTH_OPTIONS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const TimeSelect = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const month = searchParams.get("month");
  const yearFromUrl = searchParams.get("year");
  const opcaoFromUrl = searchParams.get("opcao");

  const initialYear = yearFromUrl
    ? parseInt(yearFromUrl)
    : new Date().getFullYear();
  const [year, setYear] = useState(initialYear);

  const handleMonthChange = (month: string) => {
    push(`/?month=${month}&year=${year}&opcao=${opcaoFromUrl}`);
  };

  const handleYearChange = (increment: boolean) => {
    const newYear = increment ? year + 1 : year - 1;
    setYear(newYear);
    push(`/?month=${month}&year=${newYear}&opcao=${newYear}`);
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <Select
        onValueChange={(value) => handleMonthChange(value)}
        defaultValue={month ?? ""}
      >
        <SelectTrigger className="m-0 flex w-[150px] items-center justify-evenly rounded-full bg-zinc-900 p-0">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent className="m-0 flex items-center justify-center bg-zinc-950">
          {MONTH_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center justify-center gap-2 rounded-full border-e-2 border-s-2 bg-zinc-900">
        <button
          onClick={() => handleYearChange(false)}
          className="flex h-10 w-10 items-center justify-center rounded-full"
        >
          &lt;
        </button>
        <span className="sm:text-md text-sm">{year}</span>
        <button
          onClick={() => handleYearChange(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default TimeSelect;
