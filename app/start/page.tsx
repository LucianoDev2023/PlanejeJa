"use client";
import { useEffect } from "react"; // Para utilizar useEffect
import Script from "next/script"; // Importando o Script do Next.js
import { FaqPlano } from "../subscription/_components/faq";
import About from "./_components/about";
import Hero from "./_components/hero";
import Image from "next/image";
import NavStart from "./_components/navstart";
import WelcomeModal from "../(home)/_components/WelcomeModal";

// Declarando a função gtag_report_conversion para evitar o erro no TypeScript
declare global {
  function gtag_report_conversion(url: string): boolean;
}

const LandingPage = () => {
  useEffect(() => {
    // Função de rastreamento de conversão do Google Tag Manager
    const handleButtonClick = () => {
      gtag_report_conversion("https://planejeja.com.br/"); // Redireciona para a URL após o rastreamento
    };

    // Associando o evento de clique ao botão
    const button = document.getElementById("experimente-gratis");
    if (button) {
      button.addEventListener("click", handleButtonClick);
    }

    return () => {
      // Limpeza do evento de clique
      if (button) {
        button.removeEventListener("click", handleButtonClick);
      }
    };
  }, []); // O useEffect roda apenas uma vez quando o componente for montado

  return (
    <main className="flex flex-col overflow-auto bg-gradient-to-t from-[#5c7a95] to-[#040b11]">
      <div className="mt-10">
        <WelcomeModal />
        <NavStart />
      </div>

      <div>
        <Hero />
      </div>
      <div>
        <About />
      </div>

      <div className="flex flex-col items-center justify-between px-2 lg:flex-row lg:px-10">
        <FaqPlano />
        <div className="flex justify-end rounded-lg p-4 sm:p-10">
          <Image
            src="/Midnight.png"
            width={560}
            height={364}
            alt="PlanejeJá"
            quality={100}
            priority
            style={{
              pointerEvents: "none", // Impede qualquer interação com a imagem
              userSelect: "none", // Impede que o usuário selecione a imagem
            }}
          />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <h2 className="flex items-center justify-center py-5 font-sans text-2xl font-bold">
          O que você está esperando?
        </h2>
        <div className="pb-6">
          <a
            id="experimente-gratis" // Adicionando um id para o botão de referência
            href="https://planejeja.com.br/"
            className="items-center justify-center rounded-md bg-primary px-5 py-2 font-bold"
          >
            Experimente grátis
          </a>
        </div>
        <p className="text-xs text-gray-400"> Versão 1.5.0 ©2025</p>
        <p className="pb-2 text-xs text-gray-400">planejejasuporte@gmail.com</p>
      </div>

      {/* Script para o rastreamento de conversões */}
      <Script id="gtag-conversion-script">
        {`
          function gtag_report_conversion(url) {
            var callback = function () {
              if (typeof(url) != 'undefined') {
                window.location = url;
              }
            };
            gtag('event', 'conversion', {
                'send_to': 'AW-16908282311/_YQGCPH5l6YaEMfTv_4-',
                'value': 1.0,
                'currency': 'BRL',
                'transaction_id': '',
                'event_callback': callback
            });
            return false;
          }
        `}
      </Script>
    </main>
  );
};

export default LandingPage;
