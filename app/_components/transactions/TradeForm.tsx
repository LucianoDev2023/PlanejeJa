import { useState, useEffect } from "react";
import { Loader2, Info, ArrowRightLeft, DollarSign, Coins, Timer } from "lucide-react";
import { formatTokenPrice } from "@/app/_utils/currency";

import TokenPriceChart from "@/app/criptos/_components/criptGrafics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { cn } from "@/app/_lib/utils";

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
      setFormData((prev: Transaction) => ({
        ...prev,
        id: "",
        token: selectedToken,
        type: "buy",
        usdValue: "",
        amount: "",
        price: "",
        date: "",
        sellTokenPrice: "",
      }));
    }
  }, [transactionBeingEdited, selectedToken]);

  useEffect(() => {
    if (formData.usdValue && formData.price) {
      const calculatedAmount = (
        parseFloat(formData.usdValue) / parseFloat(formData.price)
      ).toFixed(6);
      setFormData((prev: Transaction) => ({
        ...prev,
        amount: calculatedAmount,
      }));
    }
  }, [formData.usdValue, formData.price]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Transaction,
  ) => {
    setFormData((prev: Transaction) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.usdValue || !formData.price || !formData.amount) {
      return;
    }

    if (formData.type === "sell" && !formData.sellTokenPrice) {
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
      date: formData.id ? formData.date : new Date().toISOString(),
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

      // 🔄 Notifica outros componentes (como o WalletCard) para recarregar o saldo
      window.dispatchEvent(new Event("transaction-updated"));


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
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMarketPrice = tokenPrices[selectedToken];

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {transactionBeingEdited ? "Editar Operação" : "Nova Operação"}
          </h2>
          <p className="text-sm text-slate-400">
            {transactionBeingEdited ? "Atualize os detalhes da sua transação" : "Registre suas compras e vendas de ativos"}
          </p>
        </div>
        {transactionBeingEdited && (
           <button 
             onClick={clearEditing}
             className="text-xs font-bold text-primary hover:underline"
           >
             Cancelar Edição
           </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Token Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Coins size={14} className="text-primary" /> Ativo
            </label>
            <div className="relative">
              <Input
                list="token-options"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value.toUpperCase())}
                placeholder="Ex: BTC"
                disabled={isSubmitting}
                className="h-12 border-white/10 bg-white/5 pl-4 pr-10 text-sm font-bold text-white transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
              <datalist id="token-options">
                {tokens.map((token) => (
                  <option key={token} value={token} />
                ))}
              </datalist>
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-emerald-400 animate-pulse">
                    {currentMarketPrice ? formatTokenPrice(currentMarketPrice) : '...'}
                  </span>

                </div>
              </div>
            </div>
          </div>

          {/* Operation Type */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <ArrowRightLeft size={14} className="text-primary" /> Tipo
            </label>
            <div className="flex h-12 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: "buy" }))}
                className={cn(
                  "flex-1 rounded-xl text-xs font-bold transition-all",
                  formData.type === "buy" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Compra
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: "sell" }))}
                className={cn(
                  "flex-1 rounded-xl text-xs font-bold transition-all",
                  formData.type === "sell" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Venda
              </button>
            </div>
          </div>

          {/* Total Value */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <DollarSign size={14} className="text-primary" /> {formData.type === 'buy' ? 'Investimento' : 'Valor Ganho'}
            </label>
            <div className="relative">
              <Input
                type="number"
                step="any"
                value={formData.usdValue}
                onChange={(e) => handleInputChange(e, "usdValue")}
                placeholder="0.00"
                required
                className="h-12 border-white/10 bg-white/5 pl-8 text-sm font-bold text-white transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">$</span>
            </div>
          </div>

          {/* Entry Price */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Info size={14} className="text-primary" /> Preço de Entrada
            </label>
            <div className="relative">
              <Input
                type="number"
                step="any"
                value={formData.price}
                onChange={(e) => handleInputChange(e, "price")}
                placeholder="0.00"
                required
                className="h-12 border-white/10 bg-white/5 pl-8 text-sm font-bold text-white transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">$</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, price: currentMarketPrice }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary hover:underline"
              >
                MERCADO
              </button>
            </div>
          </div>
        </div>

        {/* Second Row for Sell Info and Amount */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {formData.type === "sell" && (
            <div className="space-y-2 animate-slow-fade">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <DollarSign size={14} className="text-amber-500" /> Preço de Saída
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="any"
                  value={formData.sellTokenPrice}
                  onChange={(e) => handleInputChange(e, "sellTokenPrice")}
                  placeholder="0.00"
                  className="h-12 border-white/10 bg-white/5 pl-8 text-sm font-bold text-white transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">$</span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sellTokenPrice: currentMarketPrice }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-500 hover:underline"
                >
                  FECHAMENTO
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Coins size={14} className="text-primary" /> Quantidade Final
            </label>
            <div className="flex h-12 items-center rounded-2xl border border-dashed border-white/20 bg-white/5 px-4">
              <span className="text-sm font-bold text-white">
                {formData.amount || "0.000000"} <span className="text-slate-500 font-medium">{selectedToken}</span>
              </span>
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "h-12 w-full rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2",
                formData.type === 'buy' 
                  ? "bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]" 
                  : "bg-amber-600 shadow-lg shadow-amber-600/20 hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {formData.id ? "Atualizar Transação" : `Confirmar ${formData.type === 'buy' ? 'Compra' : 'Venda'}`}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
      <TokenPriceChart selectedToken={selectedToken} />
    </div>
  );
}
