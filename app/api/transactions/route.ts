import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();

    // 15. Criar transação e atualizar saldo em uma TRANSACTION atômica
    const result = await prisma.$transaction(async (tx) => {
      const cryptoTx = await tx.cryptoTransaction.create({
        data: {
          token: body.token,
          type: body.type,
          usdValue: String(body.usdValue),
          amount: String(body.amount),
          price: String(body.price),
          date: new Date(body.date),
          sellTokenPrice: body.sellTokenPrice || null,
          profitSell: body.profitSell || null,
          userId,
        },
      });

      // Atualizar saldo da carteira
      const delta = parseFloat(body.usdValue);
      const balanceChange = body.type === "buy" ? -delta : delta;

      await (tx as any).userWallet.upsert({
        where: { userId },
        update: {
          availableBalance: { increment: balanceChange },
        },
        create: {
          userId,
          availableBalance: balanceChange,
        },
      });

      return cryptoTx;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("❌ Erro ao criar transação:", error);
    return NextResponse.json(
      { error: "Erro ao criar transação" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const transactions = await prisma.cryptoTransaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    console.log(
      transactions.map((t) => ({
        id: t.id,
        type: t.type,
        profitSell: t.profitSell,
        profitSellType: typeof t.profitSell,
      })),
    );

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("❌ Erro ao buscar transações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar transações" },
      { status: 500 },
    );
  }
}
