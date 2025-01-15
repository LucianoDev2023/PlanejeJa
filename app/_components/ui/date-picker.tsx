"use client";

import * as React from "react";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/app/_lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { SelectSingleEventHandler } from "react-day-picker";
import { FormControl } from "./form";

interface DatePickerProps {
  value?: Date;
  onChange?: SelectSingleEventHandler;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const formattedDate = value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Selecione uma data...";

  // Função para fechar o Popover após selecionar uma data
  const handleDateSelect: SelectSingleEventHandler = (date, selectedDay, activeModifiers, e) => {
    if (date && onChange) {
      onChange(date, selectedDay, activeModifiers, e); // Passa todos os 4 parâmetros esperados
      setIsOpen(false); // Fecha o Popover
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
            onClick={() => setIsOpen(true)} // Abre o Popover quando o botão é clicado
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formattedDate}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="z-50 w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}  // Passa a função para selecionar a data
          locale={ptBR}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
