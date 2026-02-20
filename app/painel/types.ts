export type Disciplina = {
  id: string;
  nome: string;
  semestre: string;
  situacao: string;
  data_inicio: string;
  data_fim: string;
  dia_1: string | null;
  dia_2: string | null;
  horario_1_inicio: string | null;
  horario_1_final: string | null;
  horario_2_inicio: string | null;
  horario_2_final: string | null;
};

export type Prova = {
  id: string;
  disciplina_id: string;
  titulo: string;
  data: string;
  situacao: string;
};

export const STATUS = {
  NAO_INICIADO: "Não Iniciado",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDO: "Concluído",
} as const;

export const ALL_STATUS = Object.values(STATUS);

export function normalizar(texto?: string | null) {
  return (
    texto
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim() ?? ""
  );
}

export function formatarData(data: string | null) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatarTempo(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
