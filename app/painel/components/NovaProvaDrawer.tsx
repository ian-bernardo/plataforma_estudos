import { Dispatch, SetStateAction } from "react";
import { Disciplina, Prova, ALL_STATUS } from "../types";

type NovaProvaDrawerProps = {
  open: boolean;
  disciplinas: Disciplina[];
  novaProva: Partial<Prova>;
  setNovaProva: Dispatch<SetStateAction<Partial<Prova>>>;
  onSave: () => void;
  onClose: () => void;
};

export function NovaProvaDrawer({
  open,
  disciplinas,
  novaProva,
  setNovaProva,
  onSave,
  onClose,
}: NovaProvaDrawerProps) {
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
          <h2 className="text-lg font-semibold">Nova Prova</h2>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Título</label>
            <input
              className="w-full rounded-lg px-4 py-2 text-sm transition"
              style={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              value={novaProva.titulo || ""}
              onChange={(e) =>
                setNovaProva((prev) => ({ ...prev, titulo: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              Disciplina
            </label>
            <select
              className="w-full rounded-lg px-4 py-2 text-sm transition"
              style={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              value={novaProva.disciplina_id || ""}
              onChange={(e) =>
                setNovaProva((prev) => ({
                  ...prev,
                  disciplina_id: e.target.value,
                }))
              }
            >
              <option value="">Selecione</option>
              {disciplinas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Data</label>
            <input
              type="date"
              className="w-full rounded-lg px-4 py-2 text-sm transition"
              style={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
              value={novaProva.data || ""}
              onChange={(e) =>
                setNovaProva((prev) => ({ ...prev, data: e.target.value }))
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
              value={novaProva.situacao || ALL_STATUS[0]}
              onChange={(e) =>
                setNovaProva((prev) => ({
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

          <button
            onClick={onSave}
            className="w-full mt-4 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            Salvar Prova
          </button>
        </div>
      </div>
    </div>
  );
}
