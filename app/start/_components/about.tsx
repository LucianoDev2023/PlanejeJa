import { Check } from "lucide-react";
import Image from "next/image";

const About = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto grid w-[95%] grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:w-[85%]">
        <div className="flex items-center justify-center">
          <Image
            src="/Graphite.png"
            alt="Foto mobile"
            className="rounded-3xl object-contain"
            width={840}
            height={762}
            quality={100}
            priority
          />
        </div>

        <div className="border-gray flex flex-col items-start justify-center gap-2 rounded-2xl border-2 p-6 text-gray-300">
          <h1 className="text- mb-4 flex w-full items-center justify-center text-xl font-bold leading-10 text-white md:text-4xl">
            Tudo na palma da sua mão!
          </h1>
          <p className="flex gap-2">
            <Check className="h-6 w-6 flex-shrink-0 text-primary" /> Pare de
            perder tempo com planilhas confusas e anotações espalhadas.
          </p>
          <p className="flex gap-2">
            <Check className="h-6 w-6 flex-shrink-0 text-primary" /> Centralize
            suas finanças em um único lugar e tome decisões mais inteligentes.
          </p>
          <p className="flex gap-2">
            <Check className="h-6 w-6 flex-shrink-0 text-primary" />
            Registre seus gastos e receitas com facilidade.
          </p>

          <p className="flex gap-2">
            {" "}
            <Check className="h-6 w-6 flex-shrink-0 text-primary" /> Acompanhe
            seus investimentos e veja seu dinheiro crescer.
          </p>

          <p className="flex gap-2">
            <Check className="h-6 w-6 flex-shrink-0 text-primary" /> Tenha uma
            visão clara e detalhada de todos os seus movimentos financeiros.
          </p>

          <p className="flex gap-2">
            <Check className="h-6 w-6 flex-shrink-0 text-primary" /> Organização
            é a chave para o sucesso financeiro.
          </p>
          <p className="flex gap-2">
            <Check className="h-6 w-6 flex-shrink-0 text-primary" /> Com nossa
            plataforma, você assume o controle, evita surpresas e constrói um
            futuro sólido.
          </p>
          <p className="flex gap-2">
            <Check className="h-6 w-6 flex-shrink-0 text-primary" />
            Agora você pode inclusive lançar suas movimentações de compra e
            venda de criptomoedas e acompanhar seu lucro atual em tempo real.
          </p>

          <div className="flex w-full items-center justify-center">
            <a
              href="https://planejeja.com.br/"
              className="mt-6 flex w-fit rounded-md bg-primary px-5 py-2 font-bold"
            >
              Experimente grátis
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
