// import { clerkMiddleware } from "@clerk/nextjs/server";

// export default clerkMiddleware();

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     // Always run for API routes
//     "/(api|trpc)(.*)",
//   ],
// };

import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Criando um middleware customizado que inclui o Clerk e o tratamento do webhook
const customMiddleware = clerkMiddleware((auth, req) => {
  // Desabilitar o processamento automático do Next.js para o webhook da Stripe
  if (req.method === "POST" && req.nextUrl.pathname === "/api/webhooks/hook") {
    return NextResponse.next({
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Se não for o webhook, apenas continue com o Clerk normalmente
  return NextResponse.next();
});

export default customMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and arquivos estáticos, a menos que estejam nos parâmetros da URL
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Sempre rodar para rotas da API
    "/(api|trpc)(.*)",
  ],
};
