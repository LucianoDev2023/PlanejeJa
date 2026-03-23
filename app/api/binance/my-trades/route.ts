import { fetchBinanceAuthenticated, getBinanceAccount } from "@/app/_lib/binance";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

/**
 * Rota para buscar o histórico de trades (compras) da Binance.
 * 1. Busca os saldos da conta para ver o que o usuário POSSUI.
 * 2. Para cada moeda com saldo, busca os trades recentes.
 */
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 1. Pega saldos da conta
    const accountInfo = await getBinanceAccount();
    
    // Filtra ativos que possuem saldo (livre ou preso em ordens)
    const balances = accountInfo.balances.filter((b: any) => 
      parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
    );

    const symbolsToFetch = balances
      .map((b: any) => b.asset)
      .filter((asset: string) => !["USDT", "BUSD", "USDC", "FDUSD", "BRL"].includes(asset));

    // 2. Busca trades para cada símbolo
    const allTrades: any[] = [];
    
    // Top 15 ativos para cobrir mais do portfólio
    const topAssets = symbolsToFetch.slice(0, 15);

    for (const asset of topAssets) {
      // Tenta tanto USDT quanto BRL
      const pairs = [`${asset}USDT`, `${asset}BRL`];
      
      for (const symbol of pairs) {
        try {
          // 1. Busca Histórico (Trades executados)
          const trades = await fetchBinanceAuthenticated("/api/v3/myTrades", { 
            symbol,
            limit: 500 
          });
          
          allTrades.push(...trades.map((t: any) => ({
            ...t,
            asset,
            symbol,
            isExecuted: true
          })));

          // 2. Busca Ordens em Aberto (Ainda não executadas)
          const openOrders = await fetchBinanceAuthenticated("/api/v3/openOrders", { symbol });
          
          allTrades.push(...openOrders.map((o: any) => ({
            ...o,
            asset,
            symbol,
            isExecuted: false,
            // Normaliza campos para bater com o layout de trades
            qty: o.origQty,
            price: o.price,
            time: o.time,
            isBuyer: o.side === "BUY"
          })));
        } catch (err) {
          // Silencioso
        }
      }
    }



    // 3. Cálculo de Posições em Aberto (Preço Médio)
    const positions: any[] = [];
    
    for (const balance of balances) {
      const asset = balance.asset;
      const totalBalance = parseFloat(balance.free) + parseFloat(balance.locked);
      
      if (totalBalance <= 0 || ["USDT", "BUSD", "USDC", "FDUSD", "BRL"].includes(asset)) continue;

      // Filtra trades deste ativo (apenas executados por enquanto para preço médio real)
      const assetTrades = allTrades
        .filter(t => t.asset === asset && t.isExecuted)
        .sort((a, b) => b.time - a.time); // Mais recentes primeiro

      let remainingBalance = totalBalance;
      let totalCostValue = 0;
      let matchedQty = 0;

      for (const trade of assetTrades) {
        if (remainingBalance <= 0) break;
        if (!trade.isBuyer) continue; // Só compras contam para o custo de entrada

        const tradeQty = parseFloat(trade.qty);
        const tradePrice = parseFloat(trade.price);
        
        // Se o trade for maior que o saldo restante, pegamos apenas a parte que compõe o saldo
        const qtyInPosition = Math.min(tradeQty, remainingBalance);
        
        totalCostValue += qtyInPosition * tradePrice;
        matchedQty += qtyInPosition;
        remainingBalance -= qtyInPosition;
      }

      if (matchedQty > 0) {
        positions.push({
          asset,
          avgPrice: totalCostValue / matchedQty,
          totalInvested: totalCostValue,
          totalQty: totalBalance,
        });
      }
    }

    // Ordena por tempo (mais recentes primeiro)
    const sortedTrades = allTrades.sort((a, b) => b.time - a.time);

    return NextResponse.json({
      trades: sortedTrades,
      balances,
      positions
    });

  } catch (error: any) {

    console.error("❌ Erro ao buscar histórico de trades:", error);
    return NextResponse.json(
      { error: error.message || "Falha na comunicação com a Binance" },
      { status: 500 }
    );
  }
}
