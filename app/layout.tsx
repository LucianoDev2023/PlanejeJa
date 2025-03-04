import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import Script from "next/script"; // Importando o componente Script

const mulish = Mulish({
  subsets: ["latin-ext"],
});

export const metadata: Metadata = {
  title: "PlanejeJá - Controle Financeiro Fácil e Rápido",
  description:
    "Gerencie suas finanças de maneira prática e objetiva com PlanejeJá. Acompanhe seu fluxo de caixa, investimentos e gastos de forma intuitiva.",
  openGraph: {
    title: "PlanejeJá - Controle Financeiro Fácil e Rápido",
    description:
      "Com PlanejeJá você tem as ferramentas certas para organizar suas finanças, controlar despesas, receitas e investimentos de forma simples e eficaz.",
    url: "https://planejeja.com.br",
    type: "website",
    images: [
      {
        url: "https://planejeja.com.br/mobile4.png",
        width: 1200,
        height: 630,
        alt: "Imagem de compartilhamento do PlanejeJá",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlanejeJá - Controle Financeiro Fácil e Rápido",
    description:
      "Gerencie suas finanças de maneira prática e objetiva com PlanejeJá. Acompanhe seu fluxo de caixa, investimentos e gastos de forma intuitiva.",
    images: ["https://planejeja.com.br/mobile4.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt_BR">
      <head>
        {/* Usando o componente Script para carregar o Google Tag Manager */}
        <Script
          strategy="afterInteractive" // Isso garante que o script seja carregado após a página ser interativa
          src="https://www.googletagmanager.com/gtag/js?id=AW-16908282311"
          async
        />
        <Script id="gtag-setup" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16908282311');
          `}
        </Script>
        {/* Fim do Google Tag Manager */}
      </head>
      <body className={`${mulish.className} dark bg-[#0D141A] antialiased`}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
          }}
        >
          <div className="flex h-full flex-col overflow-hidden">{children}</div>
        </ClerkProvider>
        <Toaster />
      </body>
    </html>
  );
}
