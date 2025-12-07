import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

interface PnlPoint {
  time: Date;
  price: number;
  profit: number;
  delta: number;
}

export async function GET(
  req: Request,
  { params }: { params: { symbol: string } },
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const hoursParam = searchParams.get("hours");
    const operationId = searchParams.get("operationId");
    const hours = hoursParam ? Number(hoursParam) : 24;

    const symbol = params.symbol.toUpperCase();
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    // 1) Snapshots horários dessa moeda no período
    const snapshots = await prisma.priceSnapshot.findMany({
      where: {
        symbol,
        capturedAt: {
          gte: since,
        },
      },
      orderBy: {
        capturedAt: "asc",
      },
    });

    if (snapshots.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // 2) Transações dessa moeda para o usuário logado
    const txWhere = {
      token: symbol,
      userId,
      ...(operationId ? { id: operationId } : {}),
    };

    const transactions = await prisma.cryptoTransaction.findMany({
      where: txWhere,
    });

    if (transactions.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // 3) Pré-processar transações (string -> number)
    const processedTx = transactions.map((t) => {
      const amount = Number(t.amount) || 0;
      const investedValue = Number(t.usdValue) || 0;

      return {
        id: t.id,
        type: t.type, // "buy" | "sell"
        amount,
        investedValue,
      };
    });

    // 4) Montar série com preço e lucro por snapshot
    const series: PnlPoint[] = snapshots.map((snap) => {
      const priceNumber = Number(snap.priceUsd);
      let profitTotal = 0;

      for (const t of processedTx) {
        const { amount, investedValue, type } = t;

        // Por enquanto: apenas operações de compra (lucro não realizado)
        if (type === "buy" && amount > 0 && investedValue > 0) {
          profitTotal += amount * priceNumber - investedValue;
        }
      }

      return {
        time: snap.capturedAt,
        price: priceNumber,
        profit: profitTotal,
        delta: 0,
      };
    });

    // 5) Calcular delta em relação à hora anterior
    const dataWithDelta: PnlPoint[] = series.map((point, index) => {
      if (index === 0) {
        return { ...point, delta: 0 };
      }

      const prev = series[index - 1];
      const delta = point.profit - prev.profit;

      return {
        ...point,
        delta,
      };
    });

    // 6) Resposta pro front
    const responseData = dataWithDelta.map((p) => ({
      time: p.time.toISOString(),
      price: p.price,
      profit: p.profit,
      delta: p.delta,
    }));

    return NextResponse.json({ data: responseData }, { status: 200 });
  } catch (error) {
    console.error("❌ Erro na rota /api/coins/[symbol]/pnl-series:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar série de PnL" },
      { status: 500 },
    );
  }
}
