import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 1. Buscar Saldo da Carteira (Caixa)
    const wallet = await (prisma as any).userWallet.findUnique({
      where: { userId },
    });
    const safeWalletBalance = Number(wallet?.availableBalance || 0);

    // 2. Buscar Transações de Cripto (Apenas as que estão em HOLD)
    const transactions = await prisma.cryptoTransaction.findMany({
      where: { userId },
    });

    // 3. Buscar Preços Atualizados (via nossa API interna para aproveitar o cache do Redis)
    const origin = new URL(req.url).origin;
    const pricesRes = await fetch(`${origin}/api/prices`, {
      cache: "no-store",
    });
    
    let tokenPrices: Record<string, string> = {};
    if (pricesRes.ok) {
      tokenPrices = await pricesRes.json();
    }

    // 4. Calcular valor do portfolio de Cripto (Hold)
    let currentHoldValue = 0;
    
    transactions.forEach((t) => {
      const amount = parseFloat(t.amount || "0");
      const currentPrice = parseFloat(tokenPrices[t.token] || "0");

      if (t.type === "buy") {
        if (t.profitSell === null || t.profitSell === undefined) {
          // Ativo em hold
          currentHoldValue += amount * currentPrice;
        }
      }
    });

    const totalPortfolioValue = safeWalletBalance + currentHoldValue;

    return NextResponse.json({
      totalPortfolioValue,
      safeWalletBalance,
      currentHoldValue,
      updatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ Erro ao calcular resumo do portfolio:", error);
    return NextResponse.json(
      { error: "Erro ao buscar resumo do portfolio" },
      { status: 500 }
    );
  }
}
