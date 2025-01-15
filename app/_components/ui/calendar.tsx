"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker"; // Importando corretamente o DayPicker

import { cn } from "@/app/_lib/utils";
import { buttonVariants } from "@/app/_components/ui/button";

// Definindo as props do Calendar com base nas props do DayPicker
export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  mode = "single", // Definir "single" como valor padrão
  classNames,
  showOutsideDays = true,
  month: propMonth,
  selected, // O selected deve ser um único Date
  onSelect,
  ...props
}: CalendarProps) {
  // Verifica se propMonth é válido ou usa a data atual como fallback
  const initialMonth = propMonth ? new Date(propMonth) : new Date();

  // Estado para controlar o mês atual

  // Função para navegar para o mês anterior
  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1); // Subtrai um mês
      return newDate;
    });
  };

  // Função para navegar para o próximo mês
  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1); // Adiciona um mês
      return newDate;
    });
  };

  // Passar o mês atual para o DayPicker para renderizar o calendário
  return (
    <DayPicker
      mode={mode} // Modo de seleção, pode ser "single", "multiple" ou "range"
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      selected={selected} // Passa a data selecionada como um único Date
      onDayClick={onSelect} // Usando onDayClick para lidar com a seleção
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => (
          <ChevronLeft className="h-4 w-4" onClick={handlePreviousMonth} />
        ),
        IconRight: () => (
          <ChevronRight className="h-4 w-4" onClick={handleNextMonth} />
        ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
