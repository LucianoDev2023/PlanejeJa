import Image from "next/image";

const Hero = () => {
  return (
    <div className="relative overflow-hidden p-4 text-white">
      <div>
        <Image
          src="/mobile4.png"
          alt="Foto mobile"
          className="object-cover opacity-30 md:hidden"
          fill
          quality={100}
          priority
        />
      </div>
      {/* <div className="absolute inset-0 bg-black opacity-30 md:hidden"></div> */}
      <div className="lg-w-[85%] container relative mx-auto w-[100%] px-4">
        <article className="grid grid-cols-1 justify-items-center gap-4 md:grid-cols-2">
          <div className="flex flex-col items-start justify-center space-y-6 lg:w-2/3">
            <h1 className="mt-12 text-3xl font-bold leading-10 md:text-4xl">
              Controle financeiro descomplicado com gestão{" "}
              <span className="rounded-lg font-sans font-bold text-primary">
                inteligente.
              </span>
            </h1>
            <p>
              Planeje seu futuro e construa uma jornada financeira sólida. Com
              organização, clareza e ações consistentes, a estabilidade que você
              deseja está ao seu alcance.
            </p>
            <div className="pb-6">
              <a
                href="https://planejeja.com.br/"
                className="items-center justify-center rounded-md bg-primary px-5 py-2 font-bold"
              >
                Experimente grátis
              </a>
            </div>
          </div>

          <div className="relative hidden h-full w-full rounded-lg md:block">
            <Image
              src="/mobile4.png"
              alt="Foto mobile"
              className="object-contain"
              width={840}
              height={762}
              quality={100}
              priority
            />
            <div>
              <p className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center justify-center bg-transparent text-sm text-gray-400">
                Planeje, economize, realize.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default Hero;
