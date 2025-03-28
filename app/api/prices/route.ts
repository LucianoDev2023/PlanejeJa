import { tokens } from "@/app/_components/data/binanceToken";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const prices: { [key: string]: string } = {};

    const responses = await Promise.allSettled(
      tokens.map((token) =>
        fetch(
          `https://api.binance.com/api/v3/ticker/price?symbol=${token}USDT`,
          { cache: "no-store" },
          // cache padrão: force-cache (sem opções aqui)
        )
          .then((res) => res.json())
          .then((data) => ({ token, data })),
      ),
    );

    responses.forEach((result) => {
      if (result.status === "fulfilled") {
        const { token, data } = result.value;

        if (data && typeof data.price === "string") {
          prices[token] = parseFloat(data.price).toFixed(2);
        } else {
          console.warn(`⚠️ Resposta inválida para ${token}:`, data);
        }
      } else {
        console.error(`❌ Erro ao buscar preço para token:`, result.reason);
      }
    });

    return NextResponse.json(prices, { status: 200 });
  } catch (error) {
    console.error("❌ Erro geral ao buscar preços dos tokens Binance:", error);
    return NextResponse.json(
      { error: "Erro ao buscar preços" },
      { status: 500 },
    );
  }
}
