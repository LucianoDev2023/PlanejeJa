"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not found");
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2024-11-20.acacia", // Sempre especifique a versão do Stripe
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
      return_url: "http://localhost:3000/",
      mode: "subscription",
      payment_method_types: ["card"],
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
    console.error("Stripe error:", e);
    return NextResponse.json(
      {
        message: "Error creating Stripe session",
        details: e,
      },
      { status: 400 },
    );
  }
}
