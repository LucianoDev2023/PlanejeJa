"use client";

import * as React from "react";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/app/_lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { FormControl } from "./form";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog"; // Radix UI para modal
import { SelectSingleEventHandler } from "react-day-picker";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false); // Estado para controlar a abertura do dialog

  const formattedDate = value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Selecione uma data...";

  // Função para garantir que o parâmetro não seja undefined
  const handleDateSelect: SelectSingleEventHandler = (
    date,
    selectedDay,
    activeModifiers,
    e,
  ) => {
    // Verifica se 'date' não é undefined antes de passar para 'onChange'
    if (date && onChange) {
      onChange(date); // Passa apenas a data para o onChange, já que agora onChange aceita um Date
      setIsDialogOpen(false); // Fecha o dialog após a seleção da data
    }
  };

  return (
    <FormControl>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
            onClick={() => setIsDialogOpen(true)} // Abre o dialog ao clicar no botão
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formattedDate}
          </Button>
        </DialogTrigger>

        <DialogContent className="mx-auto w-auto max-w-md rounded-lg bg-gradient-to-b from-[#131d27] to-[#0f2b44] p-4 shadow-lg">
          <DialogDescription className="rounded-lg">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              locale={ptBR}
              initialFocus
            />
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </FormControl>
  );
};
