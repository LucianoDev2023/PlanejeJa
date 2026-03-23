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

    const result = await prisma.$transaction(async (tx) => {
      const oldTx = await tx.cryptoTransaction.findUnique({
        where: { id: params.id },
      });

      if (!oldTx) throw new Error("Transação não encontrada");

      // 1. Reverter saldo antigo
      const oldDelta = parseFloat(oldTx.usdValue);
      const oldReversal = oldTx.type === "buy" ? oldDelta : -oldDelta;

      // 2. Aplicar novo saldo
      const newDelta = parseFloat(body.usdValue);
      const newChange = body.type === "buy" ? -newDelta : newDelta;

      const totalBalanceChange = oldReversal + newChange;

      if (totalBalanceChange !== 0) {
        await (tx as any).userWallet.update({
          where: { userId: oldTx.userId },
          data: {
            availableBalance: { increment: totalBalanceChange },
          },
        });
      }

      return await tx.cryptoTransaction.update({
        where: { id: params.id },
        data: {
          token: body.token,
          type: body.type,
          usdValue: String(body.usdValue),
          amount: String(body.amount),
          price: String(body.price),
          date: body.date,
          sellTokenPrice: body.sellTokenPrice || null,
          profitSell: body.profitSell || null,
        },
      });
    });

    return NextResponse.json(result);
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
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.cryptoTransaction.findUnique({
        where: { id: params.id },
      });

      if (!transaction) throw new Error("Transação não encontrada");

      const delta = parseFloat(transaction.usdValue);
      const balanceReversal = transaction.type === "buy" ? delta : -delta;

      await (tx as any).userWallet.update({
        where: { userId: transaction.userId },
        data: {
          availableBalance: { increment: balanceReversal },
        },
      });

      await tx.cryptoTransaction.delete({
        where: { id: params.id },
      });

      return { message: "Transação excluída e saldo estornado" };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Erro ao excluir transação:", error);
    return NextResponse.json(
      { error: "Erro ao excluir transação" },
      { status: 500 },
    );
  }
}

