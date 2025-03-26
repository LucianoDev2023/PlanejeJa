import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/prisma/client";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const data = await req.json();

    const transaction = await prisma.cryptoTransaction.create({
      data: {
        token: data.token,
        type: data.type,
        usdValue: data.usdValue,
        amount: data.amount,
        price: data.price,
        date: new Date(data.date),
        sellTokenPrice: data.sellTokenPrice || null,
        profitSell: data.profitSell || null,
        userId, // 👈 associa ao usuário logado
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("❌ Erro ao registrar transação:", error);

    return NextResponse.json(
      { message: "Erro ao processar a transação" },
      { status: 500 },
    );
  }
}
