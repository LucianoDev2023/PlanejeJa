import Image from "next/image";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-teal-950 p-4 text-white">
      <div>
        <Image
          src="/mobileScreen3.png"
          alt="Foto mobile"
          className="object-cover opacity-60 md:hidden"
          fill
          quality={100}
          priority
        />
      </div>
      <div className="absolute inset-0 bg-black opacity-30 md:hidden"></div>
      <div className="container relative mx-auto px-4">
        <article className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col items-start justify-center space-y-6">
            <h1 className="text-3xl font-bold leading-10 md:text-4xl">
              Controle financeiro descomplicado com gestão inteligente.
            </h1>
            <p>
              Planeje seu futuro e construa uma jornada financeira sólida. Com
              organização, clareza e ações consistentes, a estabilidade que você
              deseja está ao seu alcance.
            </p>
            <div>
              <a
                href="#"
                className="items-center justify-center rounded-md bg-primary px-5 py-2 font-bold"
              >
                Experimente grátis
              </a>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-400">
                Planeje, economize, realize.
              </p>
            </div>
          </div>

          <div className="relative hidden h-full w-full md:block">
            <Image
              src="/mobileScreen3.png"
              alt="Foto mobile"
              className="object-contain"
              width={840}
              height={762}
              quality={100}
              priority
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default Hero;
