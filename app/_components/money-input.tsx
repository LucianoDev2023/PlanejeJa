import React, { forwardRef } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";

import { Input, InputProps } from "@/app/_components/ui/input";

// Definir o componente MoneyInput utilizando forwardRef
export const MoneyInput = forwardRef<
  HTMLInputElement,
  NumericFormatProps<InputProps>
>(({ value = "0,00", ...props }, ref) => {
  return (
    <NumericFormat
      {...props}
      value={value} // Definir valor inicial como "0,00" ou o valor fornecido
      thousandSeparator="."
      decimalSeparator=","
      prefix="R$ "
      allowNegative={false}
      customInput={Input}
      getInputRef={ref}
      displayType="input"
    />
  );
});

// Definir displayName para o componente
MoneyInput.displayName = "MoneyInput";
