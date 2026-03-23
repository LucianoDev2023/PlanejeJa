import Link from "next/link";
import { ShieldCheck, ChevronRight } from "lucide-react";

export default function DebugIndexPage() {
  const tools = [
    {
      title: "Binance Auth Debugger",
      description: "Teste chaves de API, assinaturas HMAC e ordens abertas.",
      href: "/debug/binance",
      icon: <ShieldCheck className="text-primary" size={24} />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight">Debug Panel</h1>
          <p className="text-slate-400">Ferramentas de desenvolvedor para o PlanejeJá</p>
        </header>

        <div className="grid gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass-card glass-card-hover group flex items-center justify-between rounded-3xl p-6 ring-1 ring-white/10 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 group-hover:bg-primary/20 transition-colors">
                  {tool.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{tool.title}</h3>
                  <p className="text-sm text-slate-500">{tool.description}</p>
                </div>
              </div>
              <ChevronRight className="text-slate-600 group-hover:text-primary transition-colors" size={20} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
