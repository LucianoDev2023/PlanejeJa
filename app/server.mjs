import pkg from "@clerk/nextjs/server";
const { clerkClient } = pkg;

import cron from "node-cron";

async function verificarAssinaturasExpiradas() {
  try {
    const { data: users } = await clerkClient.users.getUserList();
    const hoje = new Date();

    for (const user of users) {
      // Garantindo que expirationRaw seja uma string válida ou defina a data padrão
      let expirationRaw = user.publicMetadata?.subscriptionExpiration;
      console.log(expirationRaw);

      // Se expirationRaw não for uma string válida, defina a data padrão
      if (typeof expirationRaw !== "string" || !expirationRaw.trim()) {
        expirationRaw = "2035-01-01"; // Definindo uma data padrão
      }

      // Convertendo expirationRaw para um objeto Date
      const expirationDate = new Date(expirationRaw);

      // Verificando se a data de expiração é válida
      if (isNaN(expirationDate.getTime())) {
        console.error(
          `Data de expiração inválida para o usuário ${user.id}: ${expirationRaw}`,
        );
        continue; // Pula para o próximo usuário
      }

      // Adicionando 1 dia à data de expiração
      const expirationPlusOne = new Date(expirationDate);
      expirationPlusOne.setDate(expirationDate.getDate() + 1);

      // Verificando se a data de expiração é superior à data de hoje
      if (hoje >= expirationPlusOne) {
        await clerkClient.users.updateUser(user.id, {
          publicMetadata: {
            subscriptionPlanStatus: "encerrado", // Alterando o status
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
cron.schedule("15 18 * * *", verificarAssinaturasExpiradas); // Rodando à meia-noite todos os dias

console.log("✅ Agendamento de verificação de assinaturas iniciado.");
