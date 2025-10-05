"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  console.log(
    "[Webhook] Recebendo requisição POST para criar sessão do Stripe",
  );

  const { userId } = await auth();
  if (!userId) {
    console.error("[Erro] Usuário não autenticado");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[Erro] Chave secreta do Stripe não encontrada");
    return NextResponse.json(
      { message: "Stripe secret key not found" },
      { status: 500 },
    );
  }

  console.log("[Info] Autenticação bem-sucedida para userId:", userId);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2025-01-27.acacia", // Sempre especifique a versão do Stripe
  });

  try {
    console.log("[Info] Criando sessão do Stripe para userId:", userId);

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
          quantity: 1,
        },
      ],
      return_url: "https://planejeja.com.br/",
      mode: "subscription",
      payment_method_types: ["card"],
      subscription_data: {
        metadata: {
          clerk_user_id: userId,
        },
      },
    });

    console.log("[Sucesso] Sessão do Stripe criada com ID:", session.id);

    return NextResponse.json({
      id: session.id,
      client_secret: session.client_secret,
    });
  } catch (e) {
    console.error("[Erro] Falha ao criar sessão do Stripe:", e);
    return NextResponse.json(
      {
        message: "Error creating Stripe session",
        details: e,
      },
      { status: 400 },
    );
  }
}
