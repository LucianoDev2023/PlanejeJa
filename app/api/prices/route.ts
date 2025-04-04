import { tokens } from "@/app/_components/data/binanceToken";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.binance.com/api/v3/ticker/price",
      {
        cache: "no-store",
      },
    );

    const data = await response.json();

    const prices: { [key: string]: string } = {};

    data.forEach((item: { symbol: string; price: string }) => {
      // Ex: BTCUSDT => BTC
      const match = tokens.find((token) => item.symbol === `${token}USDT`);
      if (match) {
        prices[match] = parseFloat(item.price).toFixed(6);
      }
    });

    return NextResponse.json(prices, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar preços dos tokens Binance:", error);
    return NextResponse.json(
      { error: "Erro ao buscar preços" },
      { status: 500 },
    );
  }
}
