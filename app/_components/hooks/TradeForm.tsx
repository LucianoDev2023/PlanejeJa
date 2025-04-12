import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import TokenPriceChart from "@/app/criptos/_components/criptGrafics";

interface TradeFormProps {
  onAddTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  transactionBeingEdited?: Transaction | null;
  clearEditing: () => void;
  tokenPrices: { [key: string]: string };
  selectedToken: string;
  setSelectedToken: (token: string) => void;
  tokens: string[];
}

export interface Transaction {
  id: string;
  token: string;
  type: string;
  usdValue: string;
  amount: string;
  price: string;
  date: string;
  sellTokenPrice?: string;
  profitSell?: string;
}

export default function TradeForm({
  onAddTransaction,
  onUpdateTransaction,
  transactionBeingEdited,
  clearEditing,
  tokenPrices,
  selectedToken,
  setSelectedToken,
  tokens,
}: TradeFormProps) {
  const [formData, setFormData] = useState<Transaction>({
    id: "",
    token: selectedToken,
    type: "buy",
    usdValue: "",
    amount: "",
    price: "",
    date: "",
    sellTokenPrice: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transactionBeingEdited) {
      setFormData(transactionBeingEdited);
    } else {
      setFormData({
        id: "",
        token: selectedToken,
        type: "buy",
        usdValue: "",
        amount: "",
        price: "",
        date: "",
        sellTokenPrice: "",
      });
    }
  }, [transactionBeingEdited, selectedToken]);

  useEffect(() => {
    if (formData.usdValue && formData.price) {
      const calculatedAmount = (
        parseFloat(formData.usdValue) / parseFloat(formData.price)
      ).toFixed(6);
      setFormData((prev) => ({
        ...prev,
        amount: calculatedAmount,
      }));
    }
  }, [formData.usdValue, formData.price]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Transaction,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.usdValue || !formData.price || !formData.amount) {
      alert("Preencha todos os campos antes de registrar a transação.");
      return;
    }

    if (formData.type === "sell" && !formData.sellTokenPrice) {
      alert("Para vendas, o campo 'Preço token na venda' deve ser preenchido.");
      return;
    }

    setIsSubmitting(true);

    const profitSell =
      formData.type === "sell" && formData.sellTokenPrice && formData.amount
        ? parseFloat(formData.sellTokenPrice) * parseFloat(formData.amount) -
          parseFloat(formData.usdValue)
        : null;

    const payload: Transaction = {
      ...formData,
      date: new Date().toISOString(),
      profitSell: profitSell !== null ? profitSell.toFixed(2) : undefined,
    };

    try {
      let response;

      if (formData.id) {
        response = await fetch(`/api/transactions/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error("Erro ao salvar transação");

      const saved = await response.json();
      if (formData.id) {
        onUpdateTransaction(saved);
        clearEditing();
      } else {
        onAddTransaction(saved);
      }

      setFormData({
        id: "",
        token: selectedToken,
        type: "buy",
        usdValue: "",
        amount: "",
        price: "",
        date: "",
        sellTokenPrice: "",
      });
    } catch (error) {
      console.error("❌ Erro ao salvar transação:", error);
      alert("Erro ao salvar a transação!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full border-b border-gray-800 bg-[#060D13] p-2 px-4 shadow-md">
      <p className="pb-3 text-center font-sans text-sm font-normal text-gray-300 sm:m-0 sm:mb-2 sm:mt-2 sm:pl-2 sm:text-base">
        Registre suas transações de compra ou venda
      </p>
      <form
        onSubmit={handleSubmit}
        className="grid w-full grid-cols-4 gap-2 sm:gap-4 md:grid-cols-7"
      >
        <div className="joyride-token flex flex-col">
          <>
            <Input
              list="token-options"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value.toUpperCase())}
              placeholder="Digite o token"
              disabled={isSubmitting}
              className="w-full border border-gray-600 px-2 py-1 text-[10px] text-white/70 sm:text-xs"
            />
            <datalist id="token-options">
              {tokens.map((token) => (
                <option key={token} value={token} />
              ))}
            </datalist>
          </>

          <p className="pt-1 text-[10px] text-blue-600 sm:text-xs">
            {tokenPrices[selectedToken]
              ? `Preço Atual: $${tokenPrices[selectedToken]}`
              : "Carregando..."}
          </p>
        </div>

        <div className="joyride-type flex flex-col">
          <Select
            disabled={isSubmitting}
            value={formData.type}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                type: value,
              }))
            }
          >
            <SelectTrigger className="w-full border border-gray-600 px-2 py-1 text-[10px] text-white/70 sm:text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Compra</SelectItem>
              <SelectItem value="sell">Venda</SelectItem>
            </SelectContent>
          </Select>
          <p className="pt-1 text-[10px] text-blue-600 md:text-sm">
            Tipo de operação
          </p>
        </div>

        <div className="joyride-usd-value flex flex-col">
          <Input
            disabled={isSubmitting}
            type="number"
            value={formData.usdValue}
            onChange={(e) => handleInputChange(e, "usdValue")}
            placeholder="$ USD"
            required
            className="w-full border border-gray-600 px-2 py-1 text-[10px] text-white/70 sm:text-xs"
          />
          <p className="pt-1 text-[10px] text-blue-600 md:text-sm">
            {formData.type === "buy"
              ? "Total do investimento"
              : "Total para venda"}
          </p>
        </div>

        <div className="joyride-price flex flex-col">
          <Input
            disabled={isSubmitting}
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange(e, "price")}
            placeholder="$ USD"
            required
            className="w-full border border-gray-600 px-2 py-1 text-[10px] text-white/70 sm:text-xs"
          />
          <p className="pt-1 text-[10px] text-blue-600 md:text-sm">
            Preço token na compra
          </p>
        </div>

        {formData.type === "sell" && (
          <div className="joyride-sell-price flex flex-col">
            <Input
              disabled={isSubmitting}
              type="number"
              value={formData.sellTokenPrice}
              onChange={(e) => handleInputChange(e, "sellTokenPrice")}
              placeholder="$ USD"
              className="w-full border border-gray-600 px-2 py-1 text-[10px] text-white/70 sm:text-xs"
            />
            <p className="pt-1 text-[10px] text-blue-600 md:text-sm">
              Preço token na venda
            </p>
          </div>
        )}

        <div className="joyride-amount flex flex-col">
          <div className="flex h-7 w-full items-center justify-center rounded-lg border border-gray-600 text-[10px] text-gray-400 sm:text-xs">
            {formData.amount ? `${formData.amount}` : "0"}
          </div>
          <p className="pt-1 text-[10px] text-blue-600 md:text-sm">
            Quantidade
          </p>
        </div>

        <div className="joyride-submit flex w-full items-start justify-start">
          <button
            type="submit"
            className="flex h-7 w-full items-center justify-center gap-2 rounded-md bg-[#3f8221] px-1 text-[10px] text-white hover:bg-[#4B9C28]"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            )}
            {isSubmitting
              ? ""
              : formData.id
                ? "Salvar alterações"
                : "Registrar"}
          </button>
        </div>
      </form>
      <TokenPriceChart selectedToken={selectedToken} />
    </div>
  );
}
