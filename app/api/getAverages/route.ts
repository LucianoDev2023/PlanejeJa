import { NextResponse } from "next/server";

// Definindo o tipo para o retorno de cada candle
interface Candle {
  [index: number]: string;
}

const getAveragePrices = async (symbol: string, intervals: string[]) => {
  const baseUrl = "https://api.binance.com/api/v3/klines";
  const averages: { [key: string]: string | null } = {};

  for (const interval of intervals) {
    try {
      const response = await fetch(
        `${baseUrl}?symbol=${symbol}USDT&interval=${interval}&limit=10`,
      );

      if (!response.ok) {
        throw new Error(`Falha na resposta da API: ${response.statusText}`);
      }

      const data: Candle[] = await response.json();
      const closePrices = data.map((item: Candle) => parseFloat(item[4])); // Preço de fechamento (índice 4)

      if (closePrices.length > 0) {
        const averagePrice =
          closePrices.reduce((acc: number, price: number) => acc + price, 0) /
          closePrices.length;
        averages[interval] = averagePrice.toFixed(2);
      } else {
        averages[interval] = null;
      }
    } catch (error) {
      averages[interval] = null;
    }
  }

  return averages;
};

// Definindo o handler para o método GET
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");

  if (!symbol || typeof symbol !== "string") {
    return NextResponse.json(
      { error: "O parâmetro 'symbol' é obrigatório e deve ser uma string." },
      { status: 400 },
    );
  }

  try {
    const averages = await getAveragePrices(symbol, ["15m", "1h", "4h", "1d"]);
    return NextResponse.json(averages, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar as médias de preço." },
      { status: 500 },
    );
  }
}
