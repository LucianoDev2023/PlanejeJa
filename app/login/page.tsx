import Image from "next/image";
import { Button } from "../_components/ui/button";
import { LogInIcon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const LoginPage = async () => {
  const { userId } = await auth();
  if (userId) {
    redirect("/");
  }
  return (
    <>
      <div className="flex flex-col">
        <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-[#03090f] to-[#386289] p-4 sm:flex-row sm:p-8">
          {/* Divisão em duas colunas: uma para o card e a outra para a imagem */}
          <div className="flex h-full max-h-[900px] w-full max-w-7xl flex-col items-center justify-center gap-4 overflow-hidden rounded-lg sm:flex-row">
            {/* Coluna da direita */}
            <div className="flex w-full flex-col">
              <div className="flex items-center justify-center p-4">
                <div className="flex h-full flex-col items-start justify-center sm:p-20">
                  {/* Header and content */}
                  <div className="flex items-center justify-center gap-1">
                    <Image
                      src="/New11.png"
                      width={70}
                      height={20}
                      alt="PlanejeJá"
                      className="mb-4"
                    />
                    <p className="mb-3 font-sans text-2xl font-semibold text-white">
                      PlanejeJá
                    </p>
                  </div>

                  <h1 className="mb-3 text-4xl font-bold text-white">
                    Bem-vindo
                  </h1>
                  <p className="mb-8 text-muted-foreground text-white">
                    PlanejeJá plataforma de gestão financeira que utiliza IA
                    para gerar relatórios sobre suas movimentações, e oferecer
                    insights personalizados, facilitando o controle do seu
                    orçamento.
                  </p>

                  {/* Login Button */}
                  <SignInButton>
                    <Button
                      variant="outline"
                      className="rounded-lg bg-gradient-to-b from-[#3a5673] to-[#040b11] text-white"
                    >
                      <LogInIcon className="mr-2" />
                      Fazer login ou criar conta
                    </Button>
                  </SignInButton>
                </div>
              </div>
            </div>
            {/* Coluna para a imagem */}
            <div className="mb-10 flex w-full flex-col justify-center rounded-lg pb-10 sm:p-10 lg:p-4">
              <Image
                src="/Midnight.png"
                width={840}
                height={547}
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
        </div>
      </div>
    </>
  );
};

export default LoginPage;
