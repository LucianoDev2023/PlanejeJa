"use client";

import * as React from "react";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/app/_lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { ActiveModifiers, SelectSingleEventHandler } from "react-day-picker";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "./alert-dialog";

interface DatePickerProps {
  value: Date;
  onChange?: SelectSingleEventHandler;
}

export const DatePicker = ({ value, onChange }: DatePickerProps) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const calendarRef = React.useRef<HTMLDivElement | null>(null);

  const handleSelectDate = (
    day: Date | undefined,
    selectedDay: Date,
    activeModifiers: ActiveModifiers,
    e: React.MouseEvent,
  ) => {
    // A partir daqui você pode realizar qualquer lógica adicional com os parâmetros.
    if (onChange) {
      onChange(day, selectedDay, activeModifiers, e); // Passa todos os parâmetros para o onChange original
    }
    setIsDialogOpen(false); // Fecha o AlertDialog quando a data for selecionada
  };

  // Função para fechar o calendário ao clicar fora
  const handleClickOutside = (e: MouseEvent) => {
    if (
      calendarRef.current &&
      !calendarRef.current.contains(e.target as Node)
    ) {
      setIsDialogOpen(false); // Fecha o calendário
    }
  };

  // Adiciona o listener para o clique fora
  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Extrai o mês e ano da data, ou usa a data atual como fallback
  const month = value ? new Date(value).getMonth() : new Date().getMonth();
  const year = value ? new Date(value).getFullYear() : new Date().getFullYear();

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
          onClick={() => setIsDialogOpen(true)} // Abre o dialog ao clicar
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {/* Mostra o tipo de "value" */}
          {value ? (
            new Date(value).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          ) : (
            <span>Selecione uma data...</span>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        className="h-auto w-auto rounded-lg"
        ref={calendarRef}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelectDate}
          locale={ptBR}
          initialFocus
          month={new Date(year, month)} // Passa o mês e ano para o calendário
        />
      </AlertDialogContent>
    </AlertDialog>
  );
};
