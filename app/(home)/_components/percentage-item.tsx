import { ReactNode } from "react";

interface PercentageItemProps {
  icon: ReactNode;
  title: string;
  value: number;
  borderColor?: string; // Adicionando a nova prop
}

const PercentageItem = ({
  icon,
  title,
  value,
  borderColor,
}: PercentageItemProps) => {
  return (
    <div
      className={`m-0 flex items-center justify-between gap-2 rounded-lg border ${borderColor || "border-white/60"}`}
    >
      {/* Icone */}
      <div className="flex w-full items-center justify-between gap-1 p-2">
        <div className="flex items-center justify-start gap-2 sm:w-full sm:pl-12">
          <p className="rounded-lg bg-white bg-opacity-[3%] p-2">{icon}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <div className="flex w-full justify-end sm:justify-center">
          <p className="text-sm font-bold">{value}%</p>
        </div>
      </div>
    </div>
  );
};

export default PercentageItem;
