import { prisma } from "@/prisma/client";
import { NextResponse } from "next/server";
import { toZonedTime, fromZonedTime, format } from "date-fns-tz";




/**
 * Rota de Cron para tirar um snapshot diário do patrimônio de cada usuário.
 * Pode ser disparada por um serviço externo (Vercel Cron, GitHub Actions, etc.)
 */
export async function GET(req: Request) {
  try {
    // 1. Segurança: Verificar chave secreta
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("⚠️ Tentativa de disparo de cron não autorizada.");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // 2. Buscar todos os usuários que possuem transações de cripto

    const usersWithTransactions = await prisma.cryptoTransaction.findMany({
      distinct: ["userId"],
      select: { userId: true },
    });

    if (usersWithTransactions.length === 0) {
      return NextResponse.json({ message: "Nenhum usuário para processar." });
    }

    // 3. Buscar preços atuais (via nossa API interna ou serviço que usa cache)
    // Para simplificar e garantir performance, buscamos direto da Binance ou do Cache se disponível
    // Aqui vamos simular a busca de preços ou chamar a lógica interna
    const pricesResponse = await fetch(`${new URL(req.url).origin}/api/prices`, {
      cache: "no-store",
    });
    const tokenPrices = await pricesResponse.json();

    const results = [];

    // 4. Processar cada usuário
    for (const { userId } of usersWithTransactions) {
      // 4.1 Buscar Carteira (Caixa)
      const wallet = await (prisma as any).userWallet.findUnique({
        where: { userId },
      });
      const cashBalance = Number(wallet?.availableBalance || 0);

      // 4.2 Buscar Transações
      const transactions = await prisma.cryptoTransaction.findMany({
        where: { userId },
      });

      let currentHoldingsValue = 0;
      let totalInvestedInActiveHoldings = 0;

      transactions.forEach((t) => {
        const invested = parseFloat(t.usdValue || "0");
        const amount = parseFloat(t.amount || "0");
        const priceNow = parseFloat(tokenPrices[t.token] || "0");

        if (t.type === "buy" && (t.profitSell === null || t.profitSell === undefined)) {
          // Ativo ainda em HOLD
          currentHoldingsValue += amount * priceNow;
          totalInvestedInActiveHoldings += invested;
        }
      });

      const totalValue = cashBalance + currentHoldingsValue;
      const totalProfit = currentHoldingsValue - totalInvestedInActiveHoldings;

      // 5. Calcular timestamp e dateKey (Hoje às 20:59 no horário de Brasília)
      const timezone = "America/Sao_Paulo";
      const now = new Date();
      const zonedDate = toZonedTime(now, timezone);
      zonedDate.setHours(20, 59, 0, 0);
      const brtDate = fromZonedTime(zonedDate, timezone);
      const dateKey = format(zonedDate, "yyyy-MM-dd", { timeZone: timezone });

      // 6. Salvar/Atualizar snapshot (Idempotência Senior)
      const snapshot = await (prisma as any).portfolioSnapshot.upsert({
        where: {
          userId_dateKey: {
            userId,
            dateKey,
          },
        },
        update: {
          totalValue,
          investedValue: totalInvestedInActiveHoldings,
          profitValue: totalProfit,
          timestamp: brtDate,
        },
        create: {
          userId,
          dateKey,
          totalValue,
          investedValue: totalInvestedInActiveHoldings,
          profitValue: totalProfit,
          timestamp: brtDate,
        },
      });



      results.push({ userId, snapshotId: snapshot.id });

    }

    return NextResponse.json({
      message: "Snapshots gerados com sucesso",
      processed: results.length,
      details: results,
    });
  } catch (error) {
    console.error("❌ Erro no job de snapshot:", error);
    return NextResponse.json(
      { error: "Erro ao gerar snapshots" },
      { status: 500 }
    );
  }
}
