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
  const text = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia",
  });
  const event = stripe.webhooks.constructEvent(
    text,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    case "invoice.paid": {
      console.log("invoice.paid");
      // Atualizar o usuário com o seu novo plano
      const { customer, subscription, subscription_details } =
        event.data.object;
      const clerkUserId = subscription_details?.metadata?.clerk_user_id;
      if (!clerkUserId) {
        return NextResponse.error();
      }
      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: customer,
          stripeSubscriptionId: subscription,
        },
        publicMetadata: {
          subscriptionPlan: "premium",
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      console.log(`Assinatura ${event.data.object.id} foi encerrada.`);
      // Remover plano premium do usuário
      const subscription = await stripe.subscriptions.retrieve(
        event.data.object.id,
      );
      const clerkUserId = subscription.metadata.clerk_user_id;
      if (!clerkUserId) {
        return NextResponse.error();
      }
      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
        publicMetadata: {
          subscriptionPlan: "Básico",
          subscriptionPlanStatus: "Encerrada",
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      console.log("customer.subscription.updated");
      // Identificar solicitação de cancelamento
      const subscription = event.data.object as Stripe.Subscription;
      if (
        subscription.cancellation_details?.reason === "cancellation_requested"
      ) {
        const clerkUserId = subscription.metadata.clerk_user_id;
        const expirationDate = new Date(subscription.current_period_end * 1000);
        const formattedExpirationDate =
          expirationDate.toLocaleDateString("pt-BR");

        console.log("Cancelamente solicitado data:", formattedExpirationDate);

        if (!clerkUserId) {
          return NextResponse.error();
        }

        await clerkClient.users.updateUser(clerkUserId, {
          privateMetadata: {
            stripeSubscriptionId: subscription.id,
            // Salvando a data de expiração
          },
          publicMetadata: {
            subscriptionPlanStatus: "canceled",
            subscriptionExpiration: formattedExpirationDate,
          },
        });
        break;
      }
      if (
        subscription.cancel_at_period_end === false &&
        subscription.status === "active"
      ) {
        console.log("Assinatura reativada!");
        {
          const clerkUserId = subscription.metadata.clerk_user_id;
          if (!clerkUserId) {
            return NextResponse.error();
          }

          await clerkClient().users.updateUser(clerkUserId, {
            privateMetadata: {
              stripeSubscriptionId: subscription.id,
            },
            publicMetadata: {
              subscriptionPlan: "premium",
            },
          });

          break;
        }
      }

      break;
    }
  }
  return NextResponse.json({
    message: "Plano cancelado com sucesso!",
    received: true,
  });
};
