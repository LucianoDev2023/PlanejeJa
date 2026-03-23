import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    let wallet = await (prisma as any).userWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      // Cria carteira inicial se não existir
      wallet = await (prisma as any).userWallet.create({
        data: {
          userId,
          availableBalance: 0,
        },
      });
    }

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("❌ Erro ao buscar carteira:", error);
    return NextResponse.json({ error: "Erro ao buscar carteira" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { balance } = await req.json();

    const wallet = await (prisma as any).userWallet.upsert({
      where: { userId },
      update: { availableBalance: balance },
      create: { userId, availableBalance: balance },
    });

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("❌ Erro ao atualizar carteira:", error);
    return NextResponse.json({ error: "Erro ao atualizar carteira" }, { status: 500 });
  }
}
