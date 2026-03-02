import { Dispatch, SetStateAction } from "react";
import { Disciplina, NovaProva, Prova } from "../types";

type ProvasTableProps = {
  provas: Prova[];
  disciplinas: Disciplina[];
  novaProva: NovaProva | null;
  setNovaProva: Dispatch<SetStateAction<NovaProva | null>>;
  onDelete: (prova: Prova) => void;
  onSave: () => void;
};

function formatarData(data: string) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function ProvasTable({
  provas,
  disciplinas,
  novaProva,
  setNovaProva,
  onDelete,
  onSave,
}: ProvasTableProps) {
  function getDisciplinaNome(id: string) {
    return disciplinas.find((d) => d.id === id)?.nome || "-";
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      <div
        className="grid grid-cols-5 px-6 py-4 border-b text-xs uppercase tracking-wider"
        style={{
          borderColor: "var(--border)",
          color: "var(--foreground)",
          opacity: 0.6,
        }}
      >
        <div>Título</div>
        <div>Disciplina</div>
        <div>Data</div>
        <div>Situação</div>
        <div>Ações</div>
      </div>

      {provas.map((p) => (
        <div
          key={p.id}
          className="grid grid-cols-5 px-6 py-4 border-b text-sm items-center transition"
          style={{
            borderColor: "var(--border)",
          }}
        >
          <div>{p.titulo}</div>
          <div>{getDisciplinaNome(p.disciplina_id)}</div>
          <div>{formatarData(p.data)}</div>
          <div>{p.situacao}</div>

          <div>
            <button
              onClick={() => onDelete(p)}
              className="text-red-400 hover:text-red-300"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}

      {novaProva && (
        <div
          className="grid grid-cols-5 px-6 py-4 border-t text-sm items-center gap-2 transition"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--background)",
          }}
        >
          <input
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            placeholder="Título"
            value={novaProva.titulo}
            onChange={(e) =>
              setNovaProva({ ...novaProva, titulo: e.target.value })
            }
          />

          <select
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            value={novaProva.disciplina_id}
            onChange={(e) =>
              setNovaProva({
                ...novaProva,
                disciplina_id: e.target.value,
              })
            }
          >
            <option value="">Selecione</option>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            onChange={(e) => setNovaProva({ ...novaProva, data: e.target.value })}
          />

          <select
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            value={novaProva.situacao}
            onChange={(e) =>
              setNovaProva({
                ...novaProva,
                situacao: e.target.value,
              })
            }
          >
            <option>Não Iniciado</option>
            <option>Em Andamento</option>
            <option>Concluído</option>
          </select>

          <button onClick={onSave} className="text-green-400 hover:text-green-300">
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}
