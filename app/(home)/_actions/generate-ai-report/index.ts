"use server";

import { db } from "@/app/_lib/prisma";
import { endOfMonth, startOfMonth } from "date-fns";
import { auth, clerkClient } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { GenerateAiReportSchema, generateAiReportSchema } from "./schema";

const DUMMY_REPORT = `
### Relatório de Finanças Pessoais

#### Resumo Geral das Finanças
As transações listadas foram analisadas e as seguintes informações foram extraídas para oferecer insights sobre suas finanças:

- **Total de despesas:** R$ 19.497,56
- **Total de investimentos:** R$ 14.141,47
- **Total de depósitos/correntes:** R$ 10.100,00 (considerando depósitos de salário e outros)
- **Categoria de maior despesa:** Alimentação

#### Análise por Categoria

1. **Alimentação:** R$ 853,76
2. **Transporte:** R$ 144,05
3. **Entretenimento:** R$ 143,94
4. **Outras despesas:** R$ 17.828,28 (inclui categorias como saúde, educação, habitação)

#### Tendências e Insights
- **Despesas Elevadas em Alimentação:** A categoria de alimentação representa uma parte significativa de suas despesas, com um total de R$ 853,76 nos últimos meses. É importante monitorar essa categoria para buscar economia.
  
- **Despesas Variáveis:** Outros tipos de despesas, como entretenimento e transporte, também se acumulam ao longo do mês. Identificar dias em que se gasta mais pode ajudar a diminuir esses custos.
  
- **Investimentos:** Você fez investimentos significativos na ordem de R$ 14.141,47. Isso é um bom sinal para a construção de patrimônio e aumento de sua segurança financeira no futuro.
  
- **Categorização das Despesas:** Há uma série de despesas listadas como "OUTRA", que podem ser reavaliadas. Classificar essas despesas pode ajudar a ter um controle melhor das finanças.

#### Dicas para Melhorar Sua Vida Financeira

1. **Crie um Orçamento Mensal:** Defina um limite de gastos para cada categoria. Isso ajuda a evitar gastos excessivos em áreas como alimentação e entretenimento.
2. **Reduza Gastos com Alimentação:** Considere cozinhar em casa com mais frequência, planejar refeições e usar listas de compras para evitar compras impulsivas.
3. **Revise Despesas Recorrentes:** Dê uma olhada nas suas despesas fixas (como saúde e educação) para verificar se estão adequadas às suas necessidades e se há espaço para redução.
4. **Estabeleça Metas de Poupança:** Com base em seus depósitos e investimentos, estabeleça metas específicas para economizar uma porcentagem do seu rendimento mensal. Estimar quanto você pode economizar pode ajudar a garantir uma reserva de emergência.
5. **Diminua os Gastos com Entretenimento:** Planeje lazer de forma que não exceda seu orçamento, busque opções gratuitas ou de baixo custo. Lembre-se de que entretenimento também pode ser feito em casa.
6. **Reavalie Seus Investimentos:** Certifique-se de que seus investimentos estejam alinhados com seus objetivos financeiros a curto e longo prazo. Pesquise alternativas que podem oferecer melhor retorno.
7. **Acompanhe Suas Finanças Regularmente:** Use aplicativos de gerenciamento financeiro para controlar suas despesas e receitas, ajudando você a manter-se informado sobre sua saúde financeira.

#### Conclusão
Melhorar sua vida financeira é um processo contínuo que envolve planejamento, monitoramento e ajustes regulares. Com as análises e as sugestões acima, você pode começar a tomar decisões financeiras mais estratégicas para alcançar seus objetivos. Lembre-se que cada real economizado é um passo a mais em direção à segurança financeira!
`;

export const generateAiReport = async ({ month }: GenerateAiReportSchema) => {
  // Validação do mês e dados de entrada
  generateAiReportSchema.parse({ month });

  // Autenticação e verificação do plano
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await clerkClient().users.getUser(userId);
  const hasPremiumPlan = user.publicMetadata.subscriptionPlan === "premium";
  const hasCanceledPlan =
    user.publicMetadata.subscriptionPlanStatus == "canceled";

  if (!hasPremiumPlan && !hasCanceledPlan) {
    console.log(user?.publicMetadata);
    throw new Error("You need a premium plan to generate AI reports");
  }

  // Checando a chave da API
  if (!process.env.OPENAI_API_KEY) {
    console.error("API Key not found");
    return DUMMY_REPORT;
  }

  // Inicializando o OpenAI
  const openAi = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Definindo o intervalo de datas para o mês selecionado
  const startOfMonthDate = startOfMonth(new Date(`2025-${month}-01`));
  const endOfMonthDate = endOfMonth(new Date(`2025-${month}-31`));

  // Buscando transações no banco de dados
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonthDate,
        lt: endOfMonthDate,
      },
    },
  });

  // Se não houver transações, retornar um relatório padrão
  if (!transactions || transactions.length === 0) {
    console.warn("No transactions found for the specified month");
    return DUMMY_REPORT;
  }

  // Somando as despesas, depósitos e investimentos com conversão para number
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "EXPENSE") // Filtra as despesas
    .reduce((sum, transaction) => sum + transaction.amount.toNumber(), 0); // Converte Decimal para number antes de somar

  const totalDeposits = transactions
    .filter((transaction) => transaction.type === "DEPOSIT") // Filtra os depósitos
    .reduce((sum, transaction) => sum + transaction.amount.toNumber(), 0); // Converte Decimal para number

  const totalInvestments = transactions
    .filter((transaction) => transaction.type === "INVESTMENT") // Filtra os investimentos
    .reduce((sum, transaction) => sum + transaction.amount.toNumber(), 0); // Converte Decimal para number

  // Preparando o conteúdo para o relatório
  const content = `Gere um relatório com a indicação do mês de referência, liste as transações e me apresnete os valores abaixo, e me dê dicas de controle financeiro. 
**Renda total:** R$${totalDeposits.toFixed(2)}; 
  **Total de Despesas:** R$${totalExpenses.toFixed(2)}; 
**Total de Investimentos:** R$${totalInvestments.toFixed(2)}. 
Os dados seguem abaixo:
${transactions
  .map(
    (transaction) =>
      `${transaction.date.toLocaleDateString("pt-BR")}-R$${transaction.amount.toFixed(2)}-${transaction.type}-${transaction.category}`,
  )
  .join(";")}`;

  // Enviando para a API do OpenAI
  try {
    const completion = await openAi.chat.completions.create({
      model: "gpt-4o-mini", // Corrigido o modelo para uma versão válida
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em gestão e organização de finanças pessoais e em matemática. Você ajuda as pessoas a organizarem melhor as suas finanças.",
        },
        {
          role: "user",
          content,
        },
      ],
    });

    // Retornando o relatório gerado
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Erro ao gerar o relatório:", error);
    return DUMMY_REPORT;
  }
};
