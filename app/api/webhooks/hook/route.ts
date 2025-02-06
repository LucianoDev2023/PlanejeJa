import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.error();
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.error();
  }

  // Desativando processamento automático do Next.js
  const rawBody = await request.clone().text();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia",
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Erro ao verificar assinatura do webhook:", err);
    return NextResponse.error();
  }

  switch (event.type) {
    case "invoice.paid": {
      console.log("invoice.paid");

      const invoice = event.data.object as Stripe.Invoice;
      const clerkUserId = invoice.subscription_details?.metadata?.clerk_user_id;

      if (!clerkUserId) {
        console.error("Clerk User ID não encontrado.");
        return NextResponse.error();
      }

      await clerkClient.users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: invoice.customer as string,
          stripeSubscriptionId: invoice.subscription as string,
        },
        publicMetadata: {
          subscriptionPlan: "premium",
        },
      });

      break;
    }

    case "customer.subscription.deleted": {
      console.log("customer.subscription.deleted");

      const subscription = await stripe.subscriptions.retrieve(
        event.data.object.id,
      );
      const clerkUserId = subscription.metadata.clerk_user_id;

      if (!clerkUserId) {
        console.error("Clerk User ID não encontrado.");
        return NextResponse.error();
      }

      await clerkClient.users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
        publicMetadata: {
          subscriptionPlan: null,
        },
      });

      break;
    }

    case "customer.subscription.updated": {
      console.log("customer.subscription.updated");

      const subscription = event.data.object as Stripe.Subscription;

      if (
        subscription.cancellation_details?.reason === "cancellation_requested"
      ) {
        const clerkUserId = subscription.metadata.clerk_user_id;
        const expirationDate = new Date(subscription.current_period_end * 1000); // Convertendo timestamp para Date

        console.log(
          "Cancelamento solicitado. Data de expiração:",
          expirationDate,
        );

        if (!clerkUserId) {
          console.error("Clerk User ID não encontrado.");
          return NextResponse.error();
        }

        await clerkClient.users.updateUser(clerkUserId, {
          privateMetadata: {
            stripeSubscriptionId: subscription.id,
            subscriptionExpiration: expirationDate.toISOString(),
          },
          publicMetadata: {
            subscriptionPlanStatus: "canceled",
          },
        });
      }

      break;
    }

    default:
      console.log(`Evento não tratado: ${event.type}`);
  }

  return NextResponse.json({
    message: "Webhook processado com sucesso!",
    received: true,
  });
};
