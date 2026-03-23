"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, AlertCircle, Search } from "lucide-react";

export default function BinanceDebugPage() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`/api/binance/open-orders?symbol=${symbol}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Erro desconhecido");
      }

      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Binance Auth Debugger</h1>
            <p className="text-slate-400">Teste suas chaves e assinaturas HMAC-SHA256</p>
          </div>
        </header>

        <div className="glass-card mb-8 rounded-3xl p-8 ring-1 ring-white/10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Ex: BTCUSDT"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-slate-500 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={handleTest}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 font-bold text-white transition-all hover:bg-primary/80 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Testar API"}
            </button>
          </div>

          {!data && !error && !loading && (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-500">
              Clique em "Testar API" para enviar uma requisição assinada.
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-2xl bg-rose-500/10 p-4 text-rose-400 ring-1 ring-rose-500/20">
              <AlertCircle className="mt-0.5 shrink-0" size={18} />
              <div className="text-sm">
                <p className="font-bold">Falha no Teste:</p>
                <p>{error}</p>
                <ul className="mt-2 list-inside list-disc opacity-80">
                  <li>Verifique se as chaves no .env estão corretas</li>
                  <li>Certifique-se de que o IP está liberado na Binance (se aplicável)</li>
                  <li>O símbolo deve ser válido (ex: BTCUSDT)</li>
                </ul>
              </div>
            </div>
          )}

          {data && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-400">✓ Conectado com sucesso</span>
                <span className="text-xs text-slate-500">JSON Output</span>
              </div>
              <pre className="max-h-[400px] overflow-auto rounded-2xl bg-black/40 p-4 text-xs font-mono text-emerald-400/90 ring-1 ring-white/5">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <footer className="text-center text-xs text-slate-500">
          <p>Esta página é apenas para fins de debug. Não esqueça de removê-la em produção.</p>
        </footer>
      </div>
    </div>
  );
}
