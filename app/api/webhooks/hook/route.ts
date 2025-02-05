import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false, // Desabilita o bodyParser padrão
  },
};

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe environment variables not set" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );
  }

  const text = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia", // Use a versão mais recente
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "invoice.paid": {
      console.log("invoice.paid");
      const { customer, subscription, subscription_details } =
        event.data.object;
      const clerkUserId = subscription_details?.metadata?.clerk_user_id;

      if (!clerkUserId) {
        return NextResponse.json(
          { error: "clerk_user_id não encontrado" },
          { status: 400 },
        );
      }

      await clerkClient.users.updateUser(clerkUserId, {
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
      console.log("customer.subscription.deleted");
      const subscription = await stripe.subscriptions.retrieve(
        event.data.object.id,
      );
      const clerkUserId = subscription.metadata.clerk_user_id;

      if (!clerkUserId) {
        return NextResponse.json(
          { error: "clerk_user_id não encontrado" },
          { status: 400 },
        );
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

      if (subscription.status === "canceled") {
        console.log("canceled");
        const clerkUserId = subscription.metadata.clerk_user_id;
        const expirationDate = new Date(subscription.current_period_end * 1000);

        if (!clerkUserId) {
          return NextResponse.json(
            { error: "clerk_user_id não encontrado" },
            { status: 400 },
          );
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
  }

  return NextResponse.json({
    message: "Webhook processado com sucesso!",
    received: true,
  });
};
