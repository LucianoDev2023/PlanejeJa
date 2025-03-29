"use client";

import { useEffect, useState } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";
import CustomTooltip from "./components/CustomTooltip";

const allSteps: Step[] = [
  {
    target: ".joyride-add-transaction",
    content: "Clique aqui para adicionar uma nova transação.",
  },
  {
    target: ".joyride-ai-report",
    content: "Gere um relatório inteligente com IA aqui.",
  },
  {
    target: ".joyride-periodo",
    content: "Selecione o período que deseja exibir suas transações",
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
    content: "Gerencie seus investimentos em criptomoedas.",
  },
  {
    target: ".joyride-assinatura",
    content: "Aqui você pode atualizar seu plano ou ver o status.",
  },
].map((step) => ({ ...step, placement: "bottom" }));

export default function Tour() {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [showTourButton, setShowTourButton] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const hasSeenTour = localStorage.getItem("hasSeenTour");

    if (!hasSeenTour) {
      setShowTourButton(true);
      setSteps(isMobile ? allSteps.slice(0, 4) : allSteps);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setShowTourButton(false);
      localStorage.setItem("hasSeenTour", "true");
    }
  };

  if (!showTourButton) return null;

  return (
    <>
      <button
        onClick={() => setRun(true)}
        className="relative z-50 rounded-lg bg-gradient-to-b from-[#14202c] to-[#68aaff] px-4 py-2 font-sans text-white shadow hover:bg-gradient-to-t"
      >
        <span className="absolute -inset-1 z-[-1] animate-pulse-border rounded-full border-2 border-blue-400"></span>
        Começar Tour
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
