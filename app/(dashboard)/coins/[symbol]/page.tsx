// app/(dashboard)/coins/[symbol]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma/client";
import { CoinAnalyticsClient } from "./CoinAnalyticsClient";

export default async function CoinAnalyticsPage({
  params,
}: {
  params: { symbol: string };
}) {
  const { userId } = auth();

  if (!userId) {
    // ajuste o caminho de login conforme seu app
    redirect("/sign-in");
  }

  // Busca todas as moedas em que o usuário tem operações de COMPRA
  const tokens = await prisma.cryptoTransaction.findMany({
    where: {
      userId,
      type: "buy", // você grava "buy" na criação da transação
    },
    select: { token: true },
    distinct: ["token"],
  });

  const availableSymbols = tokens
    .map((t) => t.token.trim().toUpperCase())
    .filter((t) => t.length > 0);

  if (availableSymbols.length === 0) {
    return (
      <main className="mx-auto flex max-w-5xl flex-col gap-4 p-4 text-slate-100">
        <h1 className="text-xl font-bold">Análise de Criptomoedas</h1>
        <p className="text-sm text-slate-300">
          Você ainda não possui operações de compra registradas. Cadastre uma
          transação para ver o gráfico de lucro por hora.
        </p>
      </main>
    );
  }

  const paramSymbol = params.symbol?.toUpperCase();
  const initialSymbol = availableSymbols.includes(paramSymbol)
    ? paramSymbol
    : availableSymbols[0];

  return (
    <CoinAnalyticsClient
      availableSymbols={availableSymbols}
      initialSymbol={initialSymbol}
    />
  );
}
