export type Disciplina = {
  id: string;
  nome: string;
  situacao: string;
  semestre: string;
  data_inicio: string;
  data_fim: string;
  dia_1: string | null;
  dia_2: string | null;
  horario_1_inicio: string | null;
  horario_1_final: string | null;
  horario_2_inicio: string | null;
  horario_2_final: string | null;
};

export type NovaDisciplina = {
  nome: string;
  situacao: string;
  semestre: string;
  data_inicio?: string;
  data_fim?: string;
  dia_1?: string;
  horario_1_inicio?: string;
  horario_1_final?: string;
  dia_2?: string;
  horario_2_inicio?: string;
  horario_2_final?: string;
};
