import { tokens } from "@/app/_components/data/binanceToken";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

    function formatPrice(price: string | number): string {
      const num = Number(price);
      return Number.isInteger(num) ? num.toFixed(2) : num.toString();
    }

    data.forEach((item: { symbol: string; price: string }) => {
      // Ex: BTCUSDT => BTC
      const match = tokens.find((token) => item.symbol === `${token}USDT`);
      if (match) {
        prices[match] = formatPrice(item.price);
      }
    });
    // const availablePairs = data
    //   .filter((item) => item.symbol.endsWith("USDT"))
    //   .map((item) => item.symbol.replace("USDT", ""));

    // // Caminho do arquivo (na raiz do projeto ou onde quiser salvar)
    // const filePath = path.resolve("availableTokens.txt");

    // // Conteúdo que você quer salvar
    // const content = JSON.stringify(availablePairs, null, 2);

    // // Salva o arquivo
    // fs.writeFileSync(filePath, content);

    return NextResponse.json(prices, { status: 200 });
  } catch (error) {
    console.error("❌ Erro ao buscar preços dos tokens Binance:", error);
    return NextResponse.json(
      { error: "Erro ao buscar preços" },
      { status: 500 },
    );
  }
}
