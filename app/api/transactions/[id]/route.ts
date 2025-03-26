import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const transaction = await prisma.cryptoTransaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("❌ Erro ao buscar transação:", error);
    return NextResponse.json(
      { error: "Erro ao buscar transação" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();

    const transaction = await prisma.cryptoTransaction.update({
      where: { id: params.id },
      data: {
        token: body.token,
        type: body.type,
        usdValue: body.usdValue,
        amount: body.amount,
        price: body.price,
        date: body.date,
        sellTokenPrice: body.sellTokenPrice || null,
        profitSell: body.profitSell || null,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("❌ Erro ao atualizar transação:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar transação" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.cryptoTransaction.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Transação excluída com sucesso" });
  } catch (error) {
    console.error("❌ Erro ao excluir transação:", error);
    return NextResponse.json(
      { error: "Erro ao excluir transação" },
      { status: 500 },
    );
  }
}
