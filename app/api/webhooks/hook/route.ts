import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

export const POST = async (request: Request) => {
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeWebhookSecret) {
    console.error("Chave de ambiente STRIPE_WEBHOOK_SECRET não configurada.");
    return NextResponse.json(
      { error: "Chave de ambiente STRIPE_WEBHOOK_SECRET não configurada." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.error("Assinatura do Stripe não encontrada.");
    return NextResponse.json(
      { error: "Assinatura do Stripe não encontrada." },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeWebhookSecret,
    );
  } catch (err) {
    console.error("Erro ao verificar assinatura do webhook:", err);
    return NextResponse.json(
      { error: "Erro ao verificar assinatura do webhook." },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "invoice.paid":
      await handleInvoicePaid(event);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event);
      break;
    default:
      console.log(`Evento não tratado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
};

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
        stripeCustomerId: invoice.customer,
        stripeSubscriptionId: invoice.subscription,
      },
      publicMetadata: {
        subscriptionPlan: "premium",
      },
    });
  } catch (err) {
    console.error("Erro ao atualizar usuário no Clerk:", err);
  }
};

const handleSubscriptionDeleted = async (event: Stripe.Event) => {
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
    console.error("Erro ao atualizar usuário no Clerk:", err);
  }
};

const handleSubscriptionUpdated = async (event: Stripe.Event) => {
  const subscription = event.data.object as Stripe.Subscription;

  if (subscription.cancellation_details?.reason === "cancellation_requested") {
    const clerkUserId = subscription.metadata.clerk_user_id;
    const expirationDate = new Date(subscription.current_period_end * 1000);

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
      console.error("Erro ao atualizar usuário no Clerk:", err);
    }
  }
};
