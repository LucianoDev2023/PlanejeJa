import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Configuração do segmento de rota
export const runtime = "nodejs"; // Ou 'edge', dependendo da sua necessidade
export const dynamic = "force-dynamic"; // Garante que a rota seja dinâmica

// Constantes para tipos de eventos do Stripe
const STRIPE_EVENTS = {
  INVOICE_PAID: "invoice.paid",
  SUBSCRIPTION_DELETED: "customer.subscription.deleted",
  SUBSCRIPTION_UPDATED: "customer.subscription.updated",
};

// Inicializa o Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia", // Use a versão mais recente ou omita para usar a padrão
});

// Função para atualizar o usuário no Clerk
async function updateUserMetadata(
  clerkUserId: string,
  metadata: {
    privateMetadata: UserPrivateMetadata;
    publicMetadata: UserPublicMetadata;
  },
) {
  await clerkClient.users.updateUser(clerkUserId, metadata);
}

// Função para processar o evento de pagamento de fatura
async function handleInvoicePaid(event: Stripe.Event) {
  const { customer, subscription, subscription_details } = event.data
    .object as Stripe.Invoice;
  const clerkUserId = subscription_details?.metadata?.clerk_user_id;

  if (!clerkUserId) {
    throw new Error("Clerk User ID not found in metadata");
  }

  await updateUserMetadata(clerkUserId, {
    privateMetadata: {
      stripeCustomerId: customer,
      stripeSubscriptionId: subscription,
    },
    publicMetadata: {
      subscriptionPlan: "premium",
    },
  });
}

// Função para processar o evento de exclusão de assinatura
async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const clerkUserId = subscription.metadata.clerk_user_id;

  if (!clerkUserId) {
    throw new Error("Clerk User ID not found in metadata");
  }

  await updateUserMetadata(clerkUserId, {
    privateMetadata: {
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    },
    publicMetadata: {
      subscriptionPlan: null,
    },
  });
}

// Função para processar o evento de atualização de assinatura
async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  if (subscription.cancellation_details?.reason === "cancellation_requested") {
    const clerkUserId = subscription.metadata.clerk_user_id;
    const expirationDate = new Date(subscription.current_period_end * 1000); // Convertendo timestamp para Date

    if (!clerkUserId) {
      throw new Error("Clerk User ID not found in metadata");
    }

    await updateUserMetadata(clerkUserId, {
      privateMetadata: {
        stripeSubscriptionId: subscription.id,
        subscriptionExpiration: expirationDate.toISOString(), // Salvando a data de expiração
      },
      publicMetadata: {
        subscriptionPlanStatus: "canceled",
      },
    });
  }
}

// Função principal para processar o webhook
export const POST = async (request: Request) => {
  try {
    // Verifica se as variáveis de ambiente estão definidas
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe environment variables are missing");
    }

    // Obtém a assinatura do cabeçalho da requisição
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("Stripe signature is missing");
    }

    // Lê o corpo da requisição como texto
    const text = await request.text();

    // Constrói o evento do webhook
    const event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    // Processa o evento com base no tipo
    switch (event.type) {
      case STRIPE_EVENTS.INVOICE_PAID:
        await handleInvoicePaid(event);
        break;

      case STRIPE_EVENTS.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event);
        break;

      case STRIPE_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Retorna uma resposta de sucesso
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 400 },
    );
  }
};
