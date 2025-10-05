import { auth, clerkClient } from "@clerk/nextjs/server";
import Navbar from "../_components/navbar";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "../_components/ui/card";
import { CheckIcon, HandIcon, XIcon } from "lucide-react";
import { Badge } from "../_components/ui/badge";
import { getCurrentMonthTransactions } from "../_data/get-current-month-transactions";
import { ScrollArea } from "../_components/ui/scroll-area";
import PaymentButton from "./_components/payment-button";
import { FaqPlano } from "./_components/faq";
import ContactForm from "./_components/ContactForm";

const SubscriptionPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login?resetTour=true");
  }

  const user = await clerkClient().users.getUser(userId);
  const email = user.emailAddresses[0].emailAddress;
  const firstName = user.firstName;
  const currentMonthTransactions = await getCurrentMonthTransactions();
  const hasPremiumPlan = user.publicMetadata.subscriptionPlan == "premium";
  const expiration = user.publicMetadata.subscriptionExpiration;
  const hasCanceledPlan =
    user.publicMetadata.subscriptionPlanStatus == "canceled";

  return (
    <div className="h-full cursor-default bg-gradient-to-b from-[#2b4960] to-[#040b11] caret-transparent">
      <ScrollArea className="h-full">
        <div className="flex h-full flex-col overflow-auto">
          <div>
            <Navbar />
          </div>

          <div className="mb-10 flex h-full w-full flex-col items-center gap-5">
            <h1 className="mt-10 text-2xl font-bold">Assinatura</h1>
            <p className="mx-2 px-2 text-center">
              A solução ideal para o seu controle financeiro{" "}
              <span className="text-center">
                está a um clique de distância.
              </span>
            </p>
            <div className="flex flex-col gap-8 border-white shadow-sm sm:flex-row">
              <Card className="flex w-[300px] flex-col border-2 border-white/20 sm:w-[400px]">
                <CardHeader className="relative border-b border-solid py-4">
                  <div>
                    {!hasPremiumPlan && !hasCanceledPlan && (
                      // <Badge className="absolute right-16 top-11 bg-primary/10 text-primary">
                      <Badge className="bg-primary/90 text-sm text-white">
                        Ativo
                      </Badge>
                    )}
                    <h2 className="text-center text-2xl font-semibold">
                      Plano Básico
                    </h2>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <span className="sm:text-2xl md:text-3xl">R$</span>
                    <span className="text-2xl font-semibold sm:text-3xl md:text-4xl">
                      0
                    </span>
                    <div className="text-muted-foreground">/ mês</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 py-8">
                  {currentMonthTransactions === 10 &&
                    !hasPremiumPlan &&
                    !hasCanceledPlan && (
                      <div className="flex items-center gap-2">
                        <HandIcon className="text-red-600" size={16} />
                        <p className="text-sm">
                          O limite do plano básico foi <br />
                          atingido (
                          <span className="font-bold text-red-600">
                            {currentMonthTransactions}
                          </span>{" "}
                          de 10 disponíveis)
                        </p>
                      </div>
                    )}
                  {currentMonthTransactions < 10 && !hasPremiumPlan && (
                    <div className="flex items-center gap-2">
                      <CheckIcon className="text-primary" />
                      <p className="text-sm">
                        Limite de 10 transações por mês, conta atual (
                        <span>{currentMonthTransactions}</span> de 10
                        disponíveis)
                      </p>
                    </div>
                  )}
                  {hasPremiumPlan && (
                    <div className="flex items-center gap-2">
                      <CheckIcon className="text-primary" size={20} />
                      <p className="text-sm">Limite de 10 transações por mês</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <CheckIcon className="text-primary" size={20} />
                    <p className="text-sm">Apresentação gráfica do mês atual</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <XIcon className="text-red-600" size={20} />
                    <p className="text-sm">Relatórios de IA (PDF)</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="flex w-[300px] flex-col rounded-lg border-2 shadow-[2px_2px_10px_rgba(255,255,255,0.8)] sm:w-[400px]">
                <CardHeader className="relative border-b border-solid py-4">
                  <div className="flex gap-5">
                    {(hasPremiumPlan || hasCanceledPlan) && (
                      // <Badge className="absolute right-16 top-11 bg-primary/10 text-primary">
                      <Badge className="bg-primary/90 text-sm text-white">
                        Ativo
                      </Badge>
                    )}
                    <h2 className="text-center text-2xl font-semibold">
                      Plano Premium
                    </h2>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <span className="sm:text-2xl md:text-3xl">R$</span>
                    <div>
                      <span className="text-lg font-semibold sm:text-3xl md:text-4xl">
                        12
                      </span>
                      <span className="text-sm font-semibold sm:text-lg md:text-2xl">
                        ,90
                      </span>
                    </div>

                    <div className="text-muted-foreground">/ mês</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 py-8">
                  <div className="flex items-center gap-2">
                    <CheckIcon className="text-primary" size={20} />
                    <p className="text-sm">Transações ilimitadas</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckIcon className="text-primary" size={20} />
                    <p className="text-sm">
                      Seleção de meses e anos para <br /> apresentação gráfica
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="text-primary" size={20} />
                    <p className="text-sm">Relatórios de IA (PDF)</p>
                  </div>

                  <PaymentButton />
                </CardContent>
              </Card>
            </div>
            <div className="text-center font-sans text-xs text-gray-500">
              {" "}
              {hasCanceledPlan ? `Sua assinatura expira em ${expiration}` : ""}
            </div>
            <FaqPlano />
            <div className="w-full border-t border-gray-700">
              <p className="p-1 pt-5 text-center text-xs text-gray-300">
                {" "}
                Para mais informações entre em contato com o suporte
              </p>
            </div>
            <div className="w-full flex-col items-center justify-center px-6 sm:w-1/3">
              <ContactForm email={email} firstName={firstName} />
            </div>
            <div className="flex flex-col items-center justify-center pt-2">
              <p className="text-xs text-gray-700">
                planejejasuporte@gmail.com
              </p>
              <p className="text-xs text-gray-700"> Versão 1.4.0 ©2024</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default SubscriptionPage;
