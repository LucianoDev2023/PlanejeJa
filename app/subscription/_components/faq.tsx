import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/_components/ui/accordion";

export function FaqPlano() {
  return (
    <>
      <Accordion
        type="single"
        collapsible
        className="w-full items-center justify-center p-6 sm:m-0 sm:w-1/2"
      >
        <div className="space-y-2">
          <AccordionItem value="item-1 ">
            <div className="rounded-lg bg-gradient-to-b from-[#253846] to-[#475b6d] px-2">
              <AccordionTrigger>
                O que é a plataforma PlanejeJá?
              </AccordionTrigger>
            </div>

            <AccordionContent className="p-1">
              A plataforma PlanejeJá é uma solução digital projetada para ajudar
              você a monitorar, organizar e gerenciar suas receitas e despesas.
              Seu objetivo é garantir o uso eficiente de seus recursos
              financeiros.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2 p-2">
            <div className="rounded-lg bg-gradient-to-b from-[#253846] to-[#475b6d] px-2">
              <AccordionTrigger className="text-left">
                Preciso entender alguma coisa sobre controle financeiro para
                aproveitar a plataforma?
              </AccordionTrigger>
            </div>
            <AccordionContent className="p-1">
              Não, a plataforma foi projetada para ser fácil de usar,
              independentemente do seu nível de conhecimento em finanças. Você
              pode começar a usá-la imediatamente.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3 p-2">
            <div className="rounded-lg bg-gradient-to-b from-[#253846] to-[#475b6d] px-2">
              <AccordionTrigger>
                Quais os planos estão disponíveis?
              </AccordionTrigger>
            </div>
            <AccordionContent className="p-1">
              Oferecemos dois planos para atender às suas necessidades:
              <br />
              &nbsp;&nbsp; • <strong>Plano Básico:</strong> Gratuito, disponível
              automaticamente ao criar sua conta.
              <br />
              &nbsp;&nbsp; • <strong>Plano Premium:</strong> Requer uma
              assinatura paga e oferece recursos adicionais, como relatórios
              avançados gerados por IA, lançamentos ilimitados de transações,
              entre outros.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <div className="rounded-lg bg-gradient-to-b from-[#253846] to-[#475b6d] px-2">
              <AccordionTrigger className="text-left">
                Quais são as formas de pagamento?
              </AccordionTrigger>
            </div>
            <AccordionContent className="p-1">
              A assinatura do Plano Premium pode ser paga exclusivamente por
              cartão de crédito.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <div className="rounded-lg bg-gradient-to-b from-[#253846] to-[#475b6d] px-2">
              <AccordionTrigger className="text-left">
                Como funciona a renovação da assinatura?
              </AccordionTrigger>
            </div>
            <AccordionContent className="p-1">
              A renovação é feita de forma automática a cada 30 dias, garantindo
              que seu acesso ao serviço seja contínuo. Você pode cancelar a
              renovação a qualquer momento sem encargos adicionais.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <div className="rounded-lg bg-gradient-to-b from-[#253846] to-[#475b6d] px-2">
              <AccordionTrigger>
                Há limite para relatórios de IA?
              </AccordionTrigger>
            </div>
            <AccordionContent className="p-1"></AccordionContent>
            <AccordionContent>
              Sim, o Plano Premium oferece até 3 relatórios de IA por mês. Após
              atingir esse limite, você poderá gerar novos relatórios no mês
              seguinte. Recomendamos que você salve seus relatórios para
              consultas futuras.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-7">
            <div className="rounded-lg bg-gradient-to-b from-[#253846] to-[#475b6d] px-2">
              <AccordionTrigger className="text-left">
                A plataforma funciona em dispositivos móveis?
              </AccordionTrigger>
            </div>
            <AccordionContent className="p-1">
              Sim, a plataforma é totalmente responsiva, o que significa que
              você pode acessar sua conta de qualquer dispositivo – seja no
              computador ou celular. A experiência é otimizada para ambos,
              permitindo que você gerencie suas finanças a qualquer momento e em
              qualquer lugar.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-8">
            <div className="rounded-lg bg-gradient-to-b from-[#253846] to-[#475b6d] px-2">
              <AccordionTrigger className="text-left">
                Como faço para cancelar minha assinatura?
              </AccordionTrigger>
            </div>
            <AccordionContent className="p-1">
              Você pode cancelar a sua conta na própria plataforma. Não há taxa
              de cancelamento, e você pode começar ou encerrar a sua assinatura
              a qualquer momento.
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>
    </>
  );
}
