/**
 * Utilitário para exportar dados JSON para CSV e disparar o download no navegador.
 */
export const exportToCSV = (data: any[], filename: string, headers: { key: string; label: string }[]) => {
  if (!data || data.length === 0) return;

  const csvRows = [];

  // 1. Cabeçalhos
  csvRows.push(headers.map(h => h.label).join(","));

  // 2. Dados
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header.key];
      // Tratamento para strings com vírgula ou aspas
      const escaped = ("" + (val ?? "")).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  // 3. Criar Blob e link de download
  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
