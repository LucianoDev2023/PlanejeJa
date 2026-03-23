import { fetchBinanceAuthenticated } from "@/app/_lib/binance";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

/**
 * Rota para buscar ordens abertas na Binance.
 * Requer autenticação do Clerk para segurança extra.
 */
export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");

    const params: Record<string, string> = {};
    if (symbol) {
      params.symbol = symbol.toUpperCase();
    }

    // Chama o utilitário autenticado
    const openOrders = await fetchBinanceAuthenticated("/api/v3/openOrders", params);

    return NextResponse.json(openOrders);
  } catch (error: any) {
    console.error("❌ Erro ao buscar ordens abertas:", error);
    return NextResponse.json(
      { error: error.message || "Falha na comunicação com a Binance" },
      { status: 500 }
    );
  }
}
