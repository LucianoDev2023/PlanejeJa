import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";
import Head from "next/head";

const mulish = Mulish({
  subsets: ["latin-ext"],
});

export const metadata: Metadata = {
  title: "PlanejeJá",
  description: "Genrenciador de transações financeiras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt_BR">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="PlanejeJá é a solução ideal para o controle financeiro pessoal e empresarial, ajudando você a planejar suas finanças e alcançar seus objetivos financeiros."
        />
        <meta
          property="og:title"
          content="PlanejeJá - Controle Financeiro Fácil e Rápido"
        />
        <meta
          property="og:description"
          content="Com PlanejeJá, você tem as ferramentas certas para organizar suas finanças, controlar despesas, receitas e investimentos de forma simples e eficaz."
        />
        <meta property="og:image" content="/bg.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.planejeja.com.br" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="PlanejeJá - Controle Financeiro Fácil e Rápido"
        />
        <meta
          name="twitter:description"
          content="Gerencie suas finanças de maneira prática e objetiva com PlanejeJá. Acompanhe seu fluxo de caixa, investimentos e gastos de forma intuitiva."
        />
        <meta name="twitter:image" content="/bg-png" />
        <meta name="author" content="PlanejeJá Team" />
        <meta name="robots" content="index, follow" />
      </Head>
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
