import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/_components/ui/accordion";

export function FaqPlano() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full items-center justify-center p-5 sm:m-0 sm:w-1/2"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>O que é a plataforma PlanejeJa?</AccordionTrigger>
        <AccordionContent>
          A plataforma PlanejeJa é uma solução digital projetada para ajudar
          você a monitorar, organizar e gerenciar suas receitas e despesas. Seu
          objetivo é garantir o uso eficiente de seus recursos financeiros.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          Preciso entender alguma coisa sobre controle financeiro para
          aproveitar a plataforma?
        </AccordionTrigger>
        <AccordionContent>
          Não, a plataforma foi projetada para ser fácil de usar,
          independentemente do seu nível de conhecimento em finanças. Você pode
          começar a usá-la imediatamente.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Quais planos estão disponíveis?</AccordionTrigger>
        <AccordionContent>
          Oferecemos dois planos para atender às suas necessidades: • Plano
          Básico: Gratuito, disponível automaticamente ao criar sua conta. •
          Plano Premium: Requer uma assinatura paga e oferece recursos
          adicionais, como relatórios avançados gerados por IA, lançamentos
          ilimitados de transações, entre outros.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>Quais são as formas de pagamento?</AccordionTrigger>
        <AccordionContent>
          A assinatura do Plano Premium pode ser paga exclusivamente por cartão
          de crédito.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-5">
        <AccordionTrigger>
          Como funciona a renovação da assinatura?
        </AccordionTrigger>
        <AccordionContent>
          A renovação é feita de forma automática a cada 30 dias, garantindo que
          seu acesso ao serviço seja contínuo. Você pode cancelar a renovação a
          qualquer momento sem encargos adicionais.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-6">
        <AccordionTrigger>
          Como faço para cancelar minha assinatura?
        </AccordionTrigger>
        <AccordionContent>
          Você pode cancelar a sua conta na própria plataforma. Não há taxa de
          cancelamento , e você pode começar ou encerrar a sua assinatura a
          qualquer momento.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-7">
        <AccordionTrigger>Há limite para relatórios de IA?</AccordionTrigger>
        <AccordionContent>
          Sim, o Plano Premium oferece até 3 relatórios de IA por mês. Após
          atingir esse limite, você poderá gerar novos relatórios no mês
          seguinte. Recomendamos que você salve seus relatórios para consultas
          futuras.________________________________________
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-8">
        <AccordionTrigger>
          A plataforma funciona em dispositivos móveis?
        </AccordionTrigger>
        <AccordionContent>
          Sim, a plataforma é totalmente responsiva, o que significa que você
          pode acessar sua conta de qualquer dispositivo – seja no computador ou
          celular. A experiência é otimizada para ambos, permitindo que você
          gerencie suas finanças a qualquer momento e em qualquer lugar.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
