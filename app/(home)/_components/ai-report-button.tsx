"use client";

import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { BotIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import Markdown from "react-markdown";
import Link from "next/link";
import { generateAiReport } from "../_actions/generate-ai-report";
import { jsPDF } from "jspdf";

interface AiReportButtonProps {
  hasPremiumPlan: boolean;
  hasCanceledPlan: boolean;
  month: string;
  className?: string;
}

const AiReportButton = ({
  month,
  hasPremiumPlan,
  hasCanceledPlan,
  className = "",
}: AiReportButtonProps) => {
  const [report, setReport] = useState<string | null>(null);
  const [reportIsLoading, setReportIsLoading] = useState(false);

  const handleGenerateReportClick = async () => {
    try {
      setReportIsLoading(true);
      const aiReport = await generateAiReport({ month });
      console.log({ aiReport });
      setReport(aiReport);
    } catch (error) {
      console.error(error);
    } finally {
      setReportIsLoading(false);
    }
  };

  const handleSaveReportClick = () => {
    if (report) {
      const doc = new jsPDF();

      // Define a posição inicial do texto
      let yPosition = 10;
      const margin = 10;
      const lineHeight = 10;

      // Adiciona o texto ao PDF, dividindo-o em várias linhas, caso necessário
      const lines = doc.splitTextToSize(report, 180); // 180 é a largura do texto antes de quebrar para a próxima linha

      // Loop para adicionar o texto no PDF
      lines.forEach((line: string) => {
        if (yPosition + lineHeight > 280) {
          // Verifica se a posição Y ultrapassou o limite da página (tamanho da página)
          doc.addPage(); // Adiciona uma nova página
          yPosition = margin; // Reseta a posição Y para o topo da página
        }

        doc.text(line, margin, yPosition); // Adiciona o texto na posição atual
        yPosition += lineHeight; // Ajusta a posição Y para a próxima linha
      });

      // Salva o arquivo PDF com o nome especificado
      doc.save(`relatorio_${month}.pdf`);
    }
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setReport(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`rounded-lg bg-white/20 font-bold ${className}`}
        >
          <BotIcon />
          <span className="text-xs sm:block">Relatório</span> IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px]">
        {hasPremiumPlan || hasCanceledPlan ? (
          <>
            <DialogHeader>
              <DialogTitle>Relatório IA</DialogTitle>
              <DialogDescription>
                Use inteligência artificial para gerar um relatório com insights
                sobre suas finanças.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="prose max-h-[350px] text-white prose-h3:text-white prose-h4:text-white prose-strong:text-white">
              <Markdown>{report}</Markdown>
            </ScrollArea>
            <DialogFooter className="gap-3 rounded-lg bg-[#111A21] p-6">
              <DialogClose asChild>
                <Button variant="ghost" className="flex border-2">
                  {report !== null ? "Fechar" : "Cancelar"}
                </Button>
              </DialogClose>

              <Button
                onClick={handleGenerateReportClick}
                disabled={reportIsLoading || report !== null}
                variant={report !== null ? "ghost" : "default"}
                className={`${report !== null ? "border-2" : ""} flex`}
              >
                {reportIsLoading && <Loader2Icon className="animate-spin" />}
                Gerar relatório
              </Button>
              {report && (
                <Button
                  onClick={handleSaveReportClick}
                  className="flex border-2"
                >
                  Salvar Relatório
                </Button>
              )}
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Relatório IA</DialogTitle>
              <DialogDescription>
                Você precisa de um plano premium para gerar relatórios com IA.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex items-center justify-center gap-3">
                <DialogClose asChild>
                  <Button variant="outline" className="rouded-lg bg-white/20">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button asChild>
                  <Link href="/subscription">Assinar plano premium</Link>
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AiReportButton;
