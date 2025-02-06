import { clerkClient } from "@clerk/nextjs/server";
import cron from "node-cron";

async function verificarAssinaturasExpiradas() {
  try {
    const { data: users } = await clerkClient.users.getUserList();
    const hoje = new Date();

    for (const user of users) {
      // Garantindo que expirationRaw seja uma string válida ou defina a data padrão
      let expirationRaw: unknown = user.publicMetadata?.subscriptionExpiration;
      console.log(expirationRaw);

      // Se expirationRaw não for uma string válida, defina a data padrão
      if (typeof expirationRaw !== "string" || !expirationRaw.trim()) {
        expirationRaw = "2035-01-01";
      }

      // Afirmação de tipo para garantir que expirationRaw é uma string válida
      const expirationDate = new Date(expirationRaw as string);
      const expirationPlusOne = new Date(expirationDate);
      expirationPlusOne.setDate(expirationDate.getDate());

      if (hoje >= expirationPlusOne) {
        await clerkClient.users.updateUser(user.id, {
          publicMetadata: {
            subscriptionPlanStatus: "encerrado",
          },
        });
        console.log(
          `Assinatura do usuário ${user.id} foi marcada como encerrada.`,
        );
      }
    }
  } catch (error) {
    console.error("Erro ao verificar assinaturas expiradas:", error);
  }
}

// Agendar a execução todos os dias à meia-noite
cron.schedule("20 17 * * *", verificarAssinaturasExpiradas);

console.log("✅ Agendamento de verificação de assinaturas iniciado.");
