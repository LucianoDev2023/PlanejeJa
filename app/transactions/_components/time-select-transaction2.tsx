"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter, useSearchParams } from "next/navigation";
import { ptBR } from "date-fns/locale";

const TimeSelectMesAno2 = () => {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const monthFromUrl = searchParams.get("month");
  const yearFromUrl = searchParams.get("year");

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
      push(`/transactions?month=${month}&year=${year}`);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <p className="text-white/50">Escolha o período </p>
      <DatePicker
        selected={selectedDate}
        focusSelectedMonth={false}
        onChange={handleDateChange}
        dateFormat="MM/yyyy"
        showMonthYearPicker
        className="bg-trasparent m-0 flex w-[150px] items-center justify-evenly rounded-lg border bg-[#080B0D] p-2 text-center font-sans text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
        locale={ptBR}
        popperClassName="custom-datepicker"
      />
    </div>
  );
};

export default TimeSelectMesAno2;
