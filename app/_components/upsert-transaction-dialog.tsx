import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { MoneyInput } from "./money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  getTransactionCategoryOptions,
  TRANSACTION_PAYMENT_METHOD_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
} from "../_constants/transactions";
import { DatePicker } from "./ui/date-picker";
import { z } from "zod";
import {
  TransactionType,
  TransactionCategory,
  TransactionPaymentMethod,
} from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { upsertTransaction } from "../_actions/upsert-transaction";
import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";

interface UpsertTransactionDialogProps {
  isOpen: boolean;
  defaultValues?: FormSchema;
  transactionId?: string;
  setIsOpen: (isOpen: boolean) => void;
  date?: Date;
}
const formSchema = z.object({
  amount: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        // Remove qualquer coisa que não seja número ou vírgula
        const numericValue = val.replace(/[^\d,]/g, "").replace(",", ".");
        const floatValue = parseFloat(numericValue);

        // Verifica o número de casas decimais
        const decimalPlaces = numericValue.split(".")[1]?.length || 0;

        console.log(decimalPlaces);
        return floatValue;
      }

      return val;
    },
    z
      .number({ required_error: "O valor é obrigatório." })
      .positive({ message: "Digite o valor da transação." }),
  ),
  name: z
    .string()
    .trim()
    .min(1, {
      message: "O nome é obrigatório.",
    })
    .max(25, {
      message: "O nome não pode ter mais de 25 caracteres.",
    }),

  type: z.nativeEnum(TransactionType, {
    required_error: "O tipo é obrigatório.",
  }),
  category: z.nativeEnum(TransactionCategory, {
    required_error: "A categoria é obrigatória.",
  }),
  paymentMethod: z.nativeEnum(TransactionPaymentMethod, {
    required_error: "O método de pagamento é obrigatório.",
  }),
  date: z.date({
    required_error: "A data é obrigatória.",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

const UpsertTransactionDialog = ({
  isOpen,
  defaultValues,
  transactionId,
  setIsOpen,
  date,
}: UpsertTransactionDialogProps) => {
  console.log("VALOR DE AMMOUNT:", defaultValues);
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? {
      amount: 0,
      category: TransactionCategory.OTHER,
      date: date ? new Date(date) : new Date(),
      name: "",
      paymentMethod: TransactionPaymentMethod.CASH,
      type: TransactionType.EXPENSE,
    },
  });

  const [amount, setAmount] = useState<number>(0);

  const formatarMoeda = (value: string) => {
    let valor = value.replace(/[\D]+/g, ""); // Remove tudo que não for número
    valor = parseFloat(valor).toString(); // Converte para inteiro e volta para string
    valor = valor.replace(/([0-9]{2})$/g, ",$1"); // Adiciona a vírgula para separar os centavos

    // Lógica de formatação conforme o tamanho do número
    if (valor.length > 6 && valor.length <= 10) {
      valor = valor.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
    }
    if (valor.length > 10 && valor.length <= 12) {
      valor = valor.replace(/([0-9]{3})\.([0-9]{3}),([0-9]{2}$)/g, ".$1.$2,$3");
    }
    if (valor.length > 12 && valor.length <= 18) {
      valor = valor.replace(
        /([0-9]{3})\.([0-9]{3})\.([0-9]{3}),([0-9]{2}$)/g,
        ".$1.$2.$3,$4",
      );
    }
    return `${valor}`;
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = event.target.value;
    // Substitui qualquer coisa que não seja número ou vírgula
    rawValue = rawValue.replace(/[^\d,]/g, "");
    // Se houver vírgula, converte para ponto
    const numericValue = rawValue.replace(",", ".");
    // Converte para número
    let numericAmount = parseFloat(numericValue);
    // Verifica se a conversão gerou um número válido
    if (isNaN(numericAmount)) return;
    // Garante que o número tenha sempre 2 casas decimais
    if (numericAmount % 1 !== 0) {
      // Verifica se há parte decimal
      // Adiciona zero à direita se tiver apenas uma casa decimal
      numericAmount = parseFloat(numericAmount.toFixed(2));
    }
    setAmount(numericAmount); // Atualiza o valor numérico no estado
  };

  const onSubmit = async (data: FormSchema) => {
    setLoading(true);

    try {
      // Garante que o valor do amount tenha duas casas decimais
      const formattedAmount = amount.toFixed(2);

      await upsertTransaction({
        ...data,
        amount: parseFloat(formattedAmount),
        id: transactionId,
      });

      setTimeout(() => {
        setLoading(false);
      }, 2000);

      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  const [loading, setLoading] = useState(false); // Estado para controlar o loading

  const isUpdate = Boolean(transactionId);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Atualizar" : "Criar"} transação
          </DialogTitle>
          <DialogDescription>Insira as informações abaixo</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full p-2 sm:h-[470px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <MoneyInput
                        type="text"
                        value={formatarMoeda(field.value.toString())} // Formata apenas para exibição
                        onChange={(e) => {
                          field.onChange(e); // Atualiza o valor no formulário
                          handleAmountChange(e); // Atualiza o valor no estado
                        }}
                        onBlur={(e) => {
                          handleAmountChange(e); // Formata ao perder o foco
                          field.onBlur(); // Chama o onBlur do react-hook-form
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome..."
                        maxLength={25} // Limita o número de caracteres para 25
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex w-full gap-4">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TRANSACTION_TYPE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a categoria..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getTransactionCategoryOptions(
                              form.watch("type"),
                            ).map((option, index) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um método de pagamento..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRANSACTION_PAYMENT_METHOD_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <DatePicker
                      value={field.value ? new Date(field.value) : new Date()}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-2 flex gap-3">
                <div className="mb-16 flex w-full justify-end gap-3 sm:mb-0">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </DialogClose>

                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <span className="loader text-xs">Carregando...</span>
                    ) : isUpdate ? (
                      "Atualizar"
                    ) : (
                      "Adicionar"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertTransactionDialog;
