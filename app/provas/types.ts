export type Prova = {
  id: string;
  disciplina_id: string;
  titulo: string;
  data: string;
  situacao: string;
};

export type Disciplina = {
  id: string;
  nome: string;
};

export type NovaProva = {
  disciplina_id: string;
  titulo: string;
  data: string;
  situacao: string;
};
