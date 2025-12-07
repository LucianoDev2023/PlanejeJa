// app/api/prices/save/route.ts
import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1) Tokens com compra registrada
    const openTokens = await prisma.cryptoTransaction.findMany({
      where: {
        type: "buy", // você usa "buy"/"sell"
      },
      select: { token: true },
      distinct: ["token"],
    });

    const baseSymbols = openTokens
      .map((t) => t.token.trim().toUpperCase())
      .filter(Boolean);

    if (!baseSymbols.length) {
      console.log("Nenhum token com compra registrada. Nada para salvar.");
      return NextResponse.json(
        { message: "Nenhum token para registrar" },
        { status: 200 },
      );
    }

    const baseSymbolsSet = new Set(baseSymbols);
    console.log("📊 Tokens com posição aberta:", [...baseSymbolsSet]);

    // 2) Buscar preços na Binance (todos os símbolos)
    const response = await fetch(
      "https://api.binance.com/api/v3/ticker/price",
      { cache: "no-store" },
    );

    if (!response.ok) {
      console.error("Erro ao buscar preços da Binance:", response.statusText);
      return NextResponse.json(
        { error: "Erro ao buscar preços na Binance" },
        { status: 500 },
      );
    }

    const data: { symbol: string; price: string }[] = await response.json();

    // 3) "Bucket" por MINUTO: início do minuto atual
    const now = new Date();
    const currentMinute = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(), // 👈 aqui muda em relação à versão por hora
      0,
      0,
    );

    let snapshotsCount = 0;

    // 4) Para cada símbolo que você acompanha, apagar + criar snapshot do minuto
    for (const item of data) {
      if (!item.symbol.endsWith("USDT")) continue;

      const base = item.symbol.replace("USDT", "").toUpperCase();
      if (!baseSymbolsSet.has(base)) continue;

      const price = Number(item.price);
      if (!price || Number.isNaN(price)) continue;

      // Apaga qualquer snapshot anterior deste MESMO MINUTO para esse símbolo
      await prisma.priceSnapshot.deleteMany({
        where: {
          symbol: base,
          capturedAt: currentMinute,
        },
      });

      // Cria o snapshot deste minuto
      await prisma.priceSnapshot.create({
        data: {
          symbol: base,
          priceUsd: price,
          capturedAt: currentMinute,
        },
      });

      snapshotsCount++;
    }

    if (!snapshotsCount) {
      console.log("Nenhum snapshot para salvar neste minuto.");
      return NextResponse.json(
        { message: "Nenhum snapshot gerado" },
        { status: 200 },
      );
    }

    console.log(
      `✅ ${snapshotsCount} snapshots salvos para ${currentMinute.toISOString()}`,
    );

    // 5) Limpeza: manter apenas últimos 30 dias (pode manter igual)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const deleteResult = await prisma.priceSnapshot.deleteMany({
      where: {
        capturedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    if (deleteResult.count > 0) {
      console.log(
        `🧹 ${deleteResult.count} snapshots antigos removidos (> 30 dias)`,
      );
    }

    return NextResponse.json(
      {
        message: "Snapshots por minuto salvos com sucesso",
        snapshots: snapshotsCount,
        deletedOld: deleteResult.count,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Erro ao salvar snapshots:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar snapshots" },
      { status: 500 },
    );
  }
}
