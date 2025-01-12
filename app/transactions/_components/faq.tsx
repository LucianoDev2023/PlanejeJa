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
        <AccordionTrigger>Quais são os planos disponíveis?</AccordionTrigger>
        <AccordionContent>
          Oferecemos dois planos. Você pode escolher entre o plano básico e
          premium. O plano básico já está habilitado assim que o login é
          realizado, já para o plano premium é necessário realizar a assintura.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Quais as formas de pagamento?</AccordionTrigger>
        <AccordionContent>
          Via de regra, a forma de pagamento aceita é apenas cartão de crédito.
          Para usar boletos é necessário entrar em contato.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>
          Como ocorre a renovação da assinatura?
        </AccordionTrigger>
        <AccordionContent>
          A renovação ocorre de maneira automática, a cada 30 dias, até que você
          opte por cancelar..
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>Como cancelar minha assinatura?</AccordionTrigger>
        <AccordionContent>
          Basta logar em sua conta e clicar em assinatura (Botão com nome do
          Gerenciar plano) e seguir os procedimentos. Você pode cancelar sua
          assinatura a qualquer momento, sem taxas adicionais.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-5">
        <AccordionTrigger>Existe plano anual?</AccordionTrigger>
        <AccordionContent>
          Via de regra, não. Planos anuais só são comercializados em promoções
          que ocorrem esporadicamente. Aqui você estará assinando o plano mensal
          (30 dias).
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-6">
        <AccordionTrigger>
          O sistema funciona em dispositivos móveis?
        </AccordionTrigger>
        <AccordionContent>
          Sim, nossa plataforma é totalmente responsiva, o que significa que
          você pode acessá-la de qualquer dispositivo, seja um computador,
          tablet ou smartphone. Você pode gerenciar suas finanças de onde
          estiver!
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-7">
        <AccordionTrigger>
          Há limite para o número de usuários no meu plano?
        </AccordionTrigger>
        <AccordionContent>
          Sim, como o cadastro de transações é individual, cada assinatura é
          exclusiva e pessoal.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-8">
        <AccordionTrigger>Há limite para relatórios de IA?</AccordionTrigger>
        <AccordionContent>
          Sim, a assinatura premium oferece até 3 relatórios de IA por mês.
          Quando esse limite for atingido, você poderá gerar novos relatórios no
          mês seguinte. Para manter a organização e o controle ao longo do ano,
          recomendamos salvar seus relatórios.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
