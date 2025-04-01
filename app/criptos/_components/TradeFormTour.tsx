"use client";

import CustomTooltip from "@/app/(home)/_actions/tour/components/CustomTooltip";
import { useEffect, useState } from "react";
import Joyride, { Step, CallBackProps, STATUS } from "react-joyride";

const tradeFormSteps: Step[] = [
  {
    target: ".joyride-token",
    content: "Selecione o token da criptomoeda que deseja registrar.",
  },
  {
    target: ".joyride-type",
    content: "Escolha se é uma operação de compra ou venda.",
  },
  {
    target: ".joyride-usd-value",
    content: "Informe o valor em dólares da operação.",
  },
  {
    target: ".joyride-price",
    content: "Digite o preço do token na hora da compra.",
  },
  {
    target: ".joyride-sell-price",
    content: "Se for uma venda, informe o preço do token no momento da venda.",
  },
  {
    target: ".joyride-amount",
    content: "Essa é a quantidade de tokens calculada automaticamente.",
  },
  {
    target: ".joyride-submit",
    content: "Clique para registrar ou salvar a transação.",
  },
].map((step) => ({ ...step, placement: "bottom" }));

export default function TradeFormTour() {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [showTourButton, setShowTourButton] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTradeFormTour");
    if (hasSeenTour !== "true") {
      setSteps(tradeFormSteps);
      setShowTourButton(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      setShowTourButton(false);
      localStorage.setItem("hasSeenTradeFormTour", "true");
    }
  };

  if (!showTourButton) return null;

  return (
    <>
      <button
        onClick={() => setRun(true)}
        className="relative z-50 rounded-t-lg bg-gradient-to-b from-[#14202c] to-[#68aaff] px-4 py-2 font-sans text-white shadow hover:bg-gradient-to-t"
      >
        <span className="absolute -inset-1 z-[-1] animate-pulse-border border-2 border-[#68aaff]"></span>
        Começar Tour Formuálio
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
