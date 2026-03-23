import { tokens } from "@/app/_components/data/binanceToken";
import { NextResponse } from "next/server";
import { redis } from "@/app/_lib/redis";

export const dynamic = "force-dynamic";

const CACHE_KEY = "binance_prices";
const CACHE_TTL = 30; // 30 segundos

export async function GET() {
  try {
    // 1. Tentar buscar do Cache
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      console.log("🚀 Cache HIT: Preços da Binance carregados do Redis/Memória");
      return NextResponse.json(JSON.parse(cachedData), { status: 200 });
    }

    console.log("📡 Cache MISS: Buscando preços na Binance API...");
    const response = await fetch(
      "https://api.binance.com/api/v3/ticker/price",
      {
        cache: "no-store",
      },
    );

    const data = await response.json();

    const prices: { [key: string]: string } = {};

    function formatPrice(price: string | number): string {
      const num = Number(price);
      if (!Number.isFinite(num)) return "0.00";
      // Se for inteiro ou tiver poucas decimais, garante .00
      // Caso contrário, retorna a string original da API para preservar a precisão
      return num % 1 === 0 ? num.toFixed(2) : price.toString();
    }



    data.forEach((item: { symbol: string; price: string }) => {
      // Ex: BTCUSDT => BTC
      const match = tokens.find((token) => item.symbol === `${token}USDT`);
      if (match) {
        prices[match] = formatPrice(item.price);
      }
    });

    // 2. Salvar no Cache
    await redis.set(CACHE_KEY, JSON.stringify(prices), "EX", CACHE_TTL);

    return NextResponse.json(prices, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar preços dos tokens Binance:", error);
    return NextResponse.json(
      { error: "Erro ao buscar preços" },
      { status: 500 },
    );
  }
}
