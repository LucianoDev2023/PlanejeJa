"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter, useSearchParams } from "next/navigation";
import { ptBR } from "date-fns/locale";

const TimeSelectAno = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const monthFromUrl = searchParams.get("month");
  const yearFromUrl = searchParams.get("year");
  const opcaoFromUrl = searchParams.get("opcao");

  const initialYear = yearFromUrl
    ? parseInt(yearFromUrl)
    : new Date().getFullYear();

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    new Date(initialYear, 0),
  ); // Definir o mês para 0 para evitar que o mês seja exibido

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      const year = date.getFullYear();
      push(`/?month=${monthFromUrl}&year=${year}&opcao=${opcaoFromUrl}`);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <>
        <p className="text-white/50">Escolha o ano</p>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy" // Formato para exibir apenas o ano
          showYearPicker // Exibe apenas o ano
          className="bg-trasparent m-0 flex w-[150px] items-center justify-center rounded-lg border bg-[#080B0D] p-2 text-center font-sans text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
          locale={ptBR}
          popperClassName="dark custom-datepicker"
        />
      </>
    </div>
  );
};

export default TimeSelectAno;
