import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/prisma/client";
import { getBinanceAccount } from "@/app/_lib/binance";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 1. Busca dados da conta na Binance
    const accountInfo = await getBinanceAccount();
    
    // 2. Localiza o saldo de USDT (o mais comum para "Caixa")
    const usdtBalance = accountInfo.balances.find(
      (b: { asset: string; free: string }) => b.asset === "USDT"
    );

    if (!usdtBalance) {
      return NextResponse.json({ message: "Saldo USDT não encontrado na Binance" }, { status: 404 });
    }

    const amount = parseFloat(usdtBalance.free);

    // 3. Atualiza o UserWallet no banco de dados
    const updatedWallet = await prisma.userWallet.upsert({
      where: { userId },
      update: { availableBalance: amount },
      create: { userId, availableBalance: amount },
    });

    console.log(`✅ [Sync] Saldo de USDT atualizado para o usuário ${userId}: ${amount}`);

    return NextResponse.json({ 
      success: true, 
      balance: amount,
      updatedAt: updatedWallet.updatedAt 
    });

  } catch (error: any) {
    console.error("❌ Erro na sincronização automática de carteira:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno na sincronização" },
      { status: 500 }
    );
  }
}
