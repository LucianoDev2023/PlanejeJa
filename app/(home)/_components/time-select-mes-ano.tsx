"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter, useSearchParams } from "next/navigation";
import { ptBR } from "date-fns/locale";

type TimeSelectMesAnoProps = {
  assinatura: boolean;
  hasCanceledPlan: boolean;
};

const TimeSelectMesAno = ({
  assinatura,
  hasCanceledPlan,
}: TimeSelectMesAnoProps) => {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const monthFromUrl = searchParams.get("month");
  const yearFromUrl = searchParams.get("year");
  const opcaoFromUrl = searchParams.get("opcao");

  const initialYear = yearFromUrl
    ? parseInt(yearFromUrl)
    : new Date().getFullYear();
  const initialMonth = monthFromUrl
    ? parseInt(monthFromUrl)
    : new Date().getMonth() + 1;

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    new Date(initialYear, initialMonth - 1),
  );

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      push(
        `/?month=${month < 10 ? `0${month}` : month}&year=${year}&opcao=${opcaoFromUrl}`,
      );
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <p className="font-sans text-sm font-normal">Escolha o mês</p>
      <DatePicker
        disabled={!assinatura && !hasCanceledPlan}
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="MM/yyyy"
        showMonthYearPicker
        className="bg-trasparent m-0 flex w-[150px] items-center justify-evenly rounded-lg border bg-[#080B0D] p-2 text-center font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        locale={ptBR}
        popperClassName="custom-datepicker"
      />
    </div>
  );
};

export default TimeSelectMesAno;
