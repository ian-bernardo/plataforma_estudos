import { Dispatch, SetStateAction } from "react";
import { ALL_STATUS, Disciplina } from "../types";

type NovaDisciplinaDrawerProps = {
  open: boolean;
  novaDisciplina: Partial<Disciplina>;
  setNovaDisciplina: Dispatch<SetStateAction<Partial<Disciplina>>>;
  onSave: () => void;
  onClose: () => void;
};

export function NovaDisciplinaDrawer({
  open,
  novaDisciplina,
  setNovaDisciplina,
  onSave,
  onClose,
}: NovaDisciplinaDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="w-[600px] p-8 overflow-y-auto animate-slideIn transition"
        style={{
          backgroundColor: "var(--card)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Nova Disciplina
          </h2>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Nome</label>
            <input
              className="w-full rounded-lg px-4 py-2 text-sm transition"
              style={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              value={novaDisciplina.nome || ""}
              onChange={(e) =>
                setNovaDisciplina((prev) => ({ ...prev, nome: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Semestre</label>
            <input
              className="w-full rounded-lg px-4 py-2 text-sm transition"
              style={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              value={novaDisciplina.semestre || ""}
              onChange={(e) =>
                setNovaDisciplina((prev) => ({
                  ...prev,
                  semestre: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Situação</label>
            <select
              className="w-full rounded-lg px-4 py-2 text-sm transition"
              style={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              value={novaDisciplina.situacao || ALL_STATUS[0]}
              onChange={(e) =>
                setNovaDisciplina((prev) => ({
                  ...prev,
                  situacao: e.target.value,
                }))
              }
            >
              {ALL_STATUS.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Data Início
              </label>
              <input
                type="date"
                className="w-full rounded-lg px-4 py-2 text-sm transition"
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                value={novaDisciplina.data_inicio || ""}
                onChange={(e) =>
                  setNovaDisciplina((prev) => ({
                    ...prev,
                    data_inicio: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                className="w-full rounded-lg px-4 py-2 text-sm transition"
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                value={novaDisciplina.data_fim || ""}
                onChange={(e) =>
                  setNovaDisciplina((prev) => ({
                    ...prev,
                    data_fim: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Dia 1</label>
              <input
                className="w-full rounded-lg px-4 py-2 text-sm transition"
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                value={novaDisciplina.dia_1 || ""}
                onChange={(e) =>
                  setNovaDisciplina((prev) => ({
                    ...prev,
                    dia_1: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Início</label>
              <input
                type="time"
                className="w-full rounded-lg px-4 py-2 text-sm transition"
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                value={novaDisciplina.horario_1_inicio || ""}
                onChange={(e) =>
                  setNovaDisciplina((prev) => ({
                    ...prev,
                    horario_1_inicio: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Fim</label>
              <input
                type="time"
                className="w-full rounded-lg px-4 py-2 text-sm transition"
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                value={novaDisciplina.horario_1_final || ""}
                onChange={(e) =>
                  setNovaDisciplina((prev) => ({
                    ...prev,
                    horario_1_final: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Dia 2</label>
              <input
                className="w-full rounded-lg px-4 py-2 text-sm transition"
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                value={novaDisciplina.dia_2 || ""}
                onChange={(e) =>
                  setNovaDisciplina((prev) => ({
                    ...prev,
                    dia_2: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Início</label>
              <input
                type="time"
                className="w-full rounded-lg px-4 py-2 text-sm transition"
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                value={novaDisciplina.horario_2_inicio || ""}
                onChange={(e) =>
                  setNovaDisciplina((prev) => ({
                    ...prev,
                    horario_2_inicio: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Fim</label>
              <input
                type="time"
                className="w-full rounded-lg px-4 py-2 text-sm transition"
                style={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                value={novaDisciplina.horario_2_final || ""}
                onChange={(e) =>
                  setNovaDisciplina((prev) => ({
                    ...prev,
                    horario_2_final: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <button
            onClick={onSave}
            className="w-full mt-4 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            Salvar Disciplina
          </button>
        </div>
      </div>
    </div>
  );
}
