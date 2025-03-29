import { TooltipRenderProps } from "react-joyride";

interface CustomTooltipProps extends TooltipRenderProps {
  totalSteps: number;
}

export default function CustomTooltip({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  totalSteps,
}: CustomTooltipProps) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-xl dark:bg-zinc-900">
      <h2 className="mb-2 text-sm font-semibold">{step.title}</h2>
      <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
        {step.content}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          {...backProps}
          className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 dark:bg-zinc-800 dark:text-gray-200"
        >
          Voltar
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            {...skipProps}
            className="text-xs text-red-500 hover:underline"
          >
            Pular
          </button>

          <button
            {...primaryProps}
            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
          >
            {index + 1 < totalSteps
              ? `Próximo (Etapa ${index + 1} de ${totalSteps})`
              : "Concluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
