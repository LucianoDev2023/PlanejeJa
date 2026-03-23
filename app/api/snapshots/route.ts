import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const snapshots = await (prisma as any).portfolioSnapshot.findMany({
      where: { userId },
      orderBy: { timestamp: "asc" },
      take: 30, // Últimos 30 snapshots diários
    });


    return NextResponse.json(snapshots);
  } catch (error) {
    console.error("❌ Erro ao buscar snapshots:", error);
    return NextResponse.json(
      { error: "Erro ao buscar snapshots" },
      { status: 500 }
    );
  }
}
