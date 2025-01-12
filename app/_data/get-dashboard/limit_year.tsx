import { db } from "@/app/_lib/prisma";

export const getYearLimits = async () => {
  // Consulta o banco para obter o menor e maior ano presente na tabela
  const result = await db.transaction.aggregate({
    _min: {
      // Extrai o menor ano da coluna 'date'
      date: true,
    },
    _max: {
      // Extrai o maior ano da coluna 'date'
      date: true,
    },
  });

  // Extraindo o ano a partir das datas mínimas e máximas
  const minYear = result._min.date
    ? new Date(result._min.date).getFullYear()
    : null;
  const maxYear = result._max.date
    ? new Date(result._max.date).getFullYear()
    : null;

  return { minYear, maxYear };
};
