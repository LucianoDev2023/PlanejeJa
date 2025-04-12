import { useState, useEffect, useCallback } from "react";

// Definindo o tipo para os dados da resposta da API
interface TokenPrices {
  [key: string]: string;
}

interface TokenPriceChartProps {
  selectedToken: string;
}

const TokenPriceChart: React.FC<TokenPriceChartProps> = ({ selectedToken }) => {
  const [prices, setPrices] = useState<TokenPrices | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async (token: string) => {
    setLoading(true);
    setError(null); // Reset error on new fetch
    try {
      const response = await fetch(`/api/getAverages?symbol=${token}`);

      // Verifica se a resposta é bem-sucedida
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados, status: ${response.status}`);
      }

      const data: TokenPrices = await response.json();

      // Verifica se o retorno contém dados válidos
      if (data && Object.keys(data).length > 0) {
        setPrices(data);
      } else {
        setError("Nenhum dado encontrado para o token selecionado.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`Ocorreu um erro: ${error.message}`);
      } else {
        console.error("Erro desconhecido:", error);
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedToken) {
      fetchPrices(selectedToken);
    }
  }, [selectedToken, fetchPrices]);

  // Renderização condicional
  if (loading) return <p className="text-[10px]">Carregando preços...</p>;
  if (error) return <p>{error}</p>;
  if (!prices || Object.keys(prices).length === 0)
    return (
      <p className="text-[10px]">Sem dados para o token {selectedToken}.</p>
    );

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <p className="text-[8px] text-orange-500">Preços médios:</p>
      <p className="text-[8px] text-gray-300">
        <span className="text-cyan-400">15m:</span> ${prices["15m"]}
      </p>
      <p className="text-[8px] text-gray-300">
        <span className="text-yellow-500">1h:</span> ${prices["1h"]}
      </p>
      <p className="text-[8px] text-gray-300">
        <span className="text-green-500">4h:</span> ${prices["4h"]}
      </p>
      <p className="text-[8px] text-gray-300">
        <span className="text-pink-500">1d:</span> ${prices["1d"]}
      </p>
    </div>
  );
};

export default TokenPriceChart;
