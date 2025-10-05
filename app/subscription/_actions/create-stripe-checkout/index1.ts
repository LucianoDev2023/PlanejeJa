"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const createStripeCheckout = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not found");
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia",
  });
  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      payment_method_types: ["card"],
      success_url: process.env.APP_URL,
      cancel_url: process.env.APP_URL,
      subscription_data: {
        metadata: {
          clerk_user_id: userId,
        },
      },
    });
    return NextResponse.json({
      id: session.id,
      client_secret: session.client_secret,
    });
  } catch (e) {
    return Response.json(e, { status: 400 });
  }
};
