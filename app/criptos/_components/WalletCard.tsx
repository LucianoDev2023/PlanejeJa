"use client";

import { useEffect, useState } from "react";
import { DollarSign, Edit2, Check, X, Loader2 } from "lucide-react";
import { formatCurrency } from "@/app/_utils/currency";

interface WalletCardProps {
  initialBalance: number;
}

export default function WalletCard({ initialBalance }: WalletCardProps) {
  const [balance, setBalance] = useState<number>(initialBalance);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);


  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/wallet");
      if (!res.ok) throw new Error("Erro ao buscar carteira");
      const data = await res.json();
      setBalance(parseFloat(data.availableBalance));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    
    // Escuta por eventos de atualização de transações para sincronizar o saldo
    const handleSync = () => fetchWallet();
    window.addEventListener("transaction-updated", handleSync);
    return () => window.removeEventListener("transaction-updated", handleSync);
  }, []);

  useEffect(() => {
    setBalance(initialBalance);
  }, [initialBalance]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: parseFloat(editValue) }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar saldo");
      const data = await res.json();
      setBalance(parseFloat(data.availableBalance));
      setIsEditing(false);
      
      // 🔄 Notifica o container que o saldo mudou manualmente
      window.dispatchEvent(new Event("transaction-updated"));
    } catch (error) {
      console.error(error);
      alert("Falha ao salvar o saldo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card flex h-[100px] items-center justify-center rounded-3xl p-6 lg:h-full">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="glass-card glass-card-hover group relative overflow-hidden rounded-3xl p-6">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
            <DollarSign size={24} />
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-medium text-slate-400">Disponível para Investir</p>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-32 rounded-lg bg-white/10 px-3 py-1 text-lg font-bold text-white outline-none ring-1 ring-primary/50 focus:ring-primary"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-emerald-500/20 p-1.5 text-emerald-400 hover:bg-emerald-500/30"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg bg-rose-500/20 p-1.5 text-rose-400 hover:bg-rose-500/30"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {formatCurrency(balance || 0)}
                </h2>
                <button
                  onClick={() => {
                    setEditValue(String(balance || 0));
                    setIsEditing(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
