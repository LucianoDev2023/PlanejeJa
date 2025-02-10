import { FaqPlano } from "../subscription/_components/faq";
import About from "./_components/about";
import Hero from "./_components/hero";
import Image from "next/image";
import NavStart from "./_components/navstart";

const LandingPage = () => {
  return (
    <main className="flex flex-col overflow-auto bg-gradient-to-t from-[#5c7a95] to-[#040b11]">
      <div className="mt-10">
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
              // objectFit: "cover",
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
            href="https://planejeja.com.br/"
            className="items-center justify-center rounded-md bg-primary px-5 py-2 font-bold"
          >
            Experimente grátis
          </a>
        </div>
        <p className="text-xs text-gray-400"> Versão 1.4.0 ©2024</p>
        <p className="pb-2 text-xs text-gray-400">planejejasuporte@gmail.com</p>
      </div>
    </main>
  );
};

export default LandingPage;
