import { STATUS, normalizar } from "../types";

type StatusBadgeProps = {
  situacao: string;
};

export function StatusBadge({ situacao }: StatusBadgeProps) {
  let bg = "var(--kanban-nao-badge)";
  let dot = "var(--kanban-nao-dot)";
  const status = normalizar(situacao);

  if (status === normalizar(STATUS.EM_ANDAMENTO)) {
    bg = "var(--kanban-and-badge)";
    dot = "var(--kanban-and-dot)";
  }

  if (status === normalizar(STATUS.CONCLUIDO)) {
    bg = "var(--kanban-con-badge)";
    dot = "var(--kanban-con-dot)";
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium w-fit"
      style={{
        backgroundColor: bg,
        color: "white",
      }}
    >
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dot }} />
      {situacao}
    </div>
  );
}
