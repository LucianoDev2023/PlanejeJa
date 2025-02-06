import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Configuração para não processar automaticamente o corpo da requisição no Next.js
export const config = {
  api: {
    bodyParser: false, // Desabilita o bodyParser do Next.js
  },
};

export const POST = async (request: Request) => {
  // Verificação das variáveis de ambiente
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !stripeWebhookSecret) {
    console.error("Chaves de ambiente da Stripe não configuradas.");
    return NextResponse.error();
  }

  // Extrair assinatura do cabeçalho
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.error("Assinatura do Stripe não encontrada.");
    return NextResponse.error();
  }

  // Obter o corpo raw da requisição
  const rawBody = await request.clone().text();

  // Inicializar o cliente Stripe
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-01-27.acacia", // Versão da API da Stripe
  });

  let event: Stripe.Event;

  // Verificação da assinatura do webhook
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeWebhookSecret,
    );
  } catch (err) {
    console.error("Erro ao verificar assinatura do webhook:");
    return NextResponse.error();
  }

  // Processar os eventos recebidos
  switch (event.type) {
    case "invoice.paid":
      console.log("Evento: invoice.paid");
      await handleInvoicePaid(event);
      break;

    case "customer.subscription.deleted":
      console.log("Evento: customer.subscription.deleted");
      await handleSubscriptionDeleted(event, stripe);
      break;

    case "customer.subscription.updated":
      console.log("Evento: customer.subscription.updated");
      await handleSubscriptionUpdated(event, stripe);
      break;

    default:
      console.log(`Evento não tratado: ${event.type}`);
      break;
  }

  // Retorno bem-sucedido
  return NextResponse.json({ received: true });
};

// Função para lidar com o evento "invoice.paid"
const handleInvoicePaid = async (event: Stripe.Event) => {
  const invoice = event.data.object as Stripe.Invoice;
  const clerkUserId = invoice.subscription_details?.metadata?.clerk_user_id;

  if (!clerkUserId) {
    console.error("Clerk User ID não encontrado.");
    return;
  }

  try {
    await clerkClient.users.updateUser(clerkUserId, {
      privateMetadata: {
        stripeCustomerId: invoice.customer as string,
        stripeSubscriptionId: invoice.subscription as string,
      },
      publicMetadata: {
        subscriptionPlan: "premium",
      },
    });
  } catch (err) {
    console.error("Erro ao atualizar usuário no Clerk:");
  }
};

// Função para lidar com o evento "customer.subscription.deleted"
const handleSubscriptionDeleted = async (
  event: Stripe.Event,
  stripe: Stripe,
) => {
  const subscription = event.data.object as Stripe.Subscription;
  const clerkUserId = subscription.metadata.clerk_user_id;

  if (!clerkUserId) {
    console.error("Clerk User ID não encontrado.");
    return;
  }

  try {
    await clerkClient.users.updateUser(clerkUserId, {
      privateMetadata: {
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      },
      publicMetadata: {
        subscriptionPlan: null,
      },
    });
  } catch (err) {
    console.error("Erro ao atualizar usuário no Clerk:");
  }
};

// Função para lidar com o evento "customer.subscription.updated"
const handleSubscriptionUpdated = async (
  event: Stripe.Event,
  stripe: Stripe,
) => {
  const subscription = event.data.object as Stripe.Subscription;

  if (subscription.cancellation_details?.reason === "cancellation_requested") {
    const clerkUserId = subscription.metadata.clerk_user_id;
    const expirationDate = new Date(subscription.current_period_end * 1000); // Convertendo timestamp para Date

    console.log("Cancelamento solicitado. Data de expiração:", expirationDate);

    if (!clerkUserId) {
      console.error("Clerk User ID não encontrado.");
      return;
    }

    try {
      await clerkClient.users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeSubscriptionId: subscription.id,
          subscriptionExpiration: expirationDate.toISOString(),
        },
        publicMetadata: {
          subscriptionPlanStatus: "canceled",
        },
      });
    } catch (err) {
      console.error("Erro ao atualizar usuário no Clerk:");
    }
  }
};
