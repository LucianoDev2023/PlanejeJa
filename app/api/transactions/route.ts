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

    const transaction = await prisma.cryptoTransaction.create({
      data: {
        token: body.token,
        type: body.type,
        usdValue: body.usdValue,
        amount: body.amount,
        price: body.price,
        date: new Date(body.date),
        sellTokenPrice: body.sellTokenPrice || null,
        profitSell: body.profitSell || null,
        userId, // 👈 associa ao usuário logado
      },
    });

    return NextResponse.json(transaction, { status: 201 });
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
      where: { userId }, // 👈 busca apenas do usuário logado
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("❌ Erro ao buscar transações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar transações" },
      { status: 500 },
    );
  }
}
