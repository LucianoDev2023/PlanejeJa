import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function DELETE() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Deleta todas as transações e reseta o saldo em uma transação atômica
    await prisma.$transaction(async (tx) => {
      // 1. Remove todas as transações do usuário
      await tx.cryptoTransaction.deleteMany({
        where: { userId }
      });

      // 2. Reseta o saldo da carteira para zero
      await (tx as any).userWallet.update({
        where: { userId },
        data: {
          availableBalance: 0
        }
      });
    });

    return NextResponse.json({ message: "Dados resetados com sucesso" });
  } catch (error: any) {
    console.error("❌ Erro ao resetar dados:", error);
    return NextResponse.json(
      { error: "Falha ao resetar dados do usuário" },
      { status: 500 }
    );
  }
}
