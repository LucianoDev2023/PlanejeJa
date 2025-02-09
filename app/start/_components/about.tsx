import { Check } from "lucide-react";
import Image from "next/image";

const About = () => {
  return (
    <section className="bg-blue-100 py-16">
      <div className="container relative mx-auto grid w-[95%] grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:w-[85%]">
        <div className="relative h-full w-full md:block">
          <Image
            src="/contrle-financeiro.jpg"
            alt="Foto mobile"
            className="rounded-3xl object-contain"
            width={840}
            height={762}
            quality={100}
            priority
          />
        </div>
        <div className="flex flex-col items-start justify-center gap-2 text-black">
          <h1 className="mb-4 text-lg font-bold leading-10 md:text-4xl">
            Na palma da sua mão!
          </h1>
          <p className="flex gap-2">
            <Check className="text-primary" /> Pare de perder tempo com
            planilhas confusas e anotações espalhadas.
          </p>
          <p className="flex gap-2">
            <Check className="text-primary" /> Centralize suas finanças em um
            único lugar e tome decisões mais inteligentes!
          </p>
          <p className="flex gap-2">
            <Check className="text-primary" />
            Registre seus gastos e receitas com facilidade.
          </p>

          <p className="flex gap-2">
            {" "}
            <Check className="text-primary" /> Acompanhe seus investimentos e
            veja seu dinheiro crescer.
          </p>

          <p className="flex gap-2">
            <Check className="text-primary" /> Tenha uma visão clara e detalhada
            de todos os seus movimentos financeiros.
          </p>

          <p className="flex gap-2">
            <Check className="text-primary" /> Organização é a chave para o
            sucesso financeiro!
          </p>
          <p className="flex gap-2">
            <Check className="text-primary" /> Com nossa plataforma, você assume
            o controle, evita surpresas e constrói um futuro sólido.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
