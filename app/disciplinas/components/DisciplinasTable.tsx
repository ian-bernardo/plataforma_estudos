import { Dispatch, SetStateAction } from "react";
import { Disciplina, NovaDisciplina } from "../types";

type DisciplinasTableProps = {
  disciplinas: Disciplina[];
  novaDisciplina: NovaDisciplina | null;
  setNovaDisciplina: Dispatch<SetStateAction<NovaDisciplina | null>>;
  onDelete: (disciplina: Disciplina) => void;
  onSave: () => void;
};

function formatarData(data: string) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function DisciplinasTable({
  disciplinas,
  novaDisciplina,
  setNovaDisciplina,
  onDelete,
  onSave,
}: DisciplinasTableProps) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      <div
        className="grid grid-cols-12 px-6 py-4 border-b text-xs uppercase tracking-wider"
        style={{
          borderColor: "var(--border)",
          color: "var(--foreground)",
          opacity: 0.6,
        }}
      >
        <div>Disciplina</div>
        <div>Situação</div>
        <div>Semestre</div>
        <div>Data Início</div>
        <div>Data Fim</div>
        <div>Dia 1</div>
        <div>Início</div>
        <div>Fim</div>
        <div>Dia 2</div>
        <div>Início</div>
        <div>Fim</div>
        <div>Ações</div>
      </div>

      {disciplinas.map((d) => (
        <div
          key={d.id}
          className="grid grid-cols-12 px-6 py-4 border-b text-sm items-center transition"
          style={{
            borderColor: "var(--border)",
          }}
        >
          <div>{d.nome}</div>
          <div>{d.situacao}</div>
          <div>{d.semestre}</div>
          <div>{formatarData(d.data_inicio)}</div>
          <div>{formatarData(d.data_fim)}</div>
          <div>{d.dia_1}</div>
          <div>{d.horario_1_inicio}</div>
          <div>{d.horario_1_final}</div>
          <div>{d.dia_2}</div>
          <div>{d.horario_2_inicio}</div>
          <div>{d.horario_2_final}</div>

          <div>
            <button
              onClick={() => onDelete(d)}
              className="text-red-400 hover:text-red-300"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}

      {novaDisciplina && (
        <div
          className="grid grid-cols-12 px-6 py-4 border-t text-sm items-center gap-2 transition"
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
            placeholder="Nome"
            value={novaDisciplina.nome}
            onChange={(e) =>
              setNovaDisciplina({ ...novaDisciplina, nome: e.target.value })
            }
          />

          <select
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            value={novaDisciplina.situacao}
            onChange={(e) =>
              setNovaDisciplina({
                ...novaDisciplina,
                situacao: e.target.value,
              })
            }
          >
            <option>Não Iniciado</option>
            <option>Em Andamento</option>
            <option>Concluído</option>
          </select>

          <select
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            value={novaDisciplina.semestre}
            onChange={(e) =>
              setNovaDisciplina({
                ...novaDisciplina,
                semestre: e.target.value,
              })
            }
          >
            <option>1° Semestre</option>
            <option>2° Semestre</option>
            <option>3° Semestre</option>
            <option>4° Semestre</option>
            <option>5° Semestre</option>
          </select>

          <input
            type="date"
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            onChange={(e) =>
              setNovaDisciplina({
                ...novaDisciplina,
                data_inicio: e.target.value,
              })
            }
          />

          <input
            type="date"
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            onChange={(e) =>
              setNovaDisciplina({
                ...novaDisciplina,
                data_fim: e.target.value,
              })
            }
          />

          <input
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            placeholder="Dia 1"
            onChange={(e) =>
              setNovaDisciplina({ ...novaDisciplina, dia_1: e.target.value })
            }
          />

          <input
            type="time"
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            onChange={(e) =>
              setNovaDisciplina({
                ...novaDisciplina,
                horario_1_inicio: e.target.value,
              })
            }
          />

          <input
            type="time"
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            onChange={(e) =>
              setNovaDisciplina({
                ...novaDisciplina,
                horario_1_final: e.target.value,
              })
            }
          />

          <input
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            placeholder="Dia 2"
            onChange={(e) =>
              setNovaDisciplina({ ...novaDisciplina, dia_2: e.target.value })
            }
          />

          <input
            type="time"
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            onChange={(e) =>
              setNovaDisciplina({
                ...novaDisciplina,
                horario_2_inicio: e.target.value,
              })
            }
          />

          <input
            type="time"
            className="px-2 py-1 rounded text-sm transition"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
            onChange={(e) =>
              setNovaDisciplina({
                ...novaDisciplina,
                horario_2_final: e.target.value,
              })
            }
          />

          <button onClick={onSave} className="text-green-400 hover:text-green-300">
            Salvar
          </button>
        </div>
      )}
    </div>
  );
}
