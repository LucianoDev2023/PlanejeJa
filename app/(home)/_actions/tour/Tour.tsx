"use client";

import { useEffect, useState } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";
import CustomTooltip from "./components/CustomTooltip";

const allSteps: Step[] = [
  {
    target: ".joyride-logo",
    content: `Clique na logo para retornar à página inicial.`,
  },
  {
    target: ".joyride-add-transaction",
    content: `Clique aqui para adicionar uma nova transação. \n
      Limite de 10 transações por mês no Plano Básico e ilimitado para o Plano Premium.`,
  },
  {
    target: ".joyride-ai-report",
    content:
      "Gere um relatório inteligente com IA aqui. Disponível apenas no Plano Premium.",
  },
  {
    target: ".joyride-periodo",
    content: `Selecione o período que deseja exibir suas transações.
              Para o Plano Básico, apresenta apenas as transações do mês atual.`,
  },
  {
    target: ".joyride-cards",
    content:
      "Selecione um dos três cards para apresentar as transações referentes a Renda, Investimento ou Despesas",
  },
  {
    target: ".joyride-inicio",
    content: "Clique para voltar à página inicial.",
  },
  {
    target: ".joyride-transacoes",
    content: "Aqui você vê todas as suas transações registradas.",
  },
  {
    target: ".joyride-criptos",
    content:
      "Gerencie seus investimentos em criptomoedas, acompanhe valores em tempo real, lucro nas operações de compra e muito mais.",
  },
  {
    target: ".joyride-assinatura",
    content: "Aqui você pode atualizar seu plano ou ver o status da conta.",
  },
].map((step) => ({ ...step, placement: "bottom" }));

export default function Tour() {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [showTourButton, setShowTourButton] = useState(false);

  useEffect(() => {
    console.log("🚀 Tour montado");
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      const hasSeenTour = localStorage.getItem("hasSeenTour");

      // Tour só aparece se ainda não foi visto
      if (hasSeenTour !== "true") {
        setShowTourButton(true);
        setSteps(isMobile ? allSteps.slice(0, 5) : allSteps);
      }
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setShowTourButton(false);

      // 🔒 Marca como já visto no localStorage
      localStorage.setItem("hasSeenTour", "true");
      console.log("✅ Tour finalizado ou pulado. Flag salva.");
    }
  };

  if (!showTourButton) return null;

  return (
    <>
      <button
        onClick={() => setRun(true)}
        className="relative z-40 rounded-t-lg bg-gradient-to-b from-[#14202c] to-[#68aaff] px-4 py-2 font-sans text-white shadow hover:bg-gradient-to-t"
      >
        <span className="absolute -inset-1 z-[-1] animate-pulse-border border-2 border-[#68aaff]"></span>
        Conheça a janela principal
      </button>

      <Joyride
        steps={steps}
        run={run}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        tooltipComponent={(props) => (
          <CustomTooltip {...props} totalSteps={steps.length} />
        )}
        styles={{ options: { zIndex: 9999 } }}
      />
    </>
  );
}
