import { BookOpen } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Disciplina, STATUS, normalizar } from "../types";

type KanbanColumnProps = {
  id: string;
  disciplinas: Disciplina[];
  onAddDisciplina: () => void;
};

function getKanbanColors(id: string) {
  const normalized = normalizar(id);

  if (normalized === normalizar(STATUS.EM_ANDAMENTO)) {
    return {
      cardColor: "var(--kanban-and-card)",
      badgeColor: "var(--kanban-and-badge)",
      dotColor: "var(--kanban-and-dot)",
    };
  }

  if (normalized === normalizar(STATUS.CONCLUIDO)) {
    return {
      cardColor: "var(--kanban-con-card)",
      badgeColor: "var(--kanban-con-badge)",
      dotColor: "var(--kanban-con-dot)",
    };
  }

  return {
    cardColor: "var(--kanban-nao-card)",
    badgeColor: "var(--kanban-nao-badge)",
    dotColor: "var(--kanban-nao-dot)",
  };
}

function DisciplinaCard({ disciplina }: { disciplina: Disciplina }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: disciplina.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="px-4 py-3 rounded-2xl border transition cursor-grab active:cursor-grabbing select-none shadow-sm"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 opacity-60 shrink-0">
          <BookOpen size={18} strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-medium text-sm text-[var(--foreground)]">
            {disciplina.nome}
          </p>
          <p className="text-xs opacity-70 mt-1">{disciplina.semestre}</p>
        </div>
      </div>
    </div>
  );
}

export function KanbanColumn({
  id,
  disciplinas,
  onAddDisciplina,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });
  const { cardColor, badgeColor, dotColor } = getKanbanColors(id);

  return (
    <div
      ref={setNodeRef}
      className="p-6 rounded-2xl min-h-[400px] transition"
      style={{ backgroundColor: cardColor }}
    >
      <div className="mb-6">
        <div
          className="flex items-center gap-2 px-5 py-2 rounded-full w-fit"
          style={{ backgroundColor: badgeColor }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
          <span className="text-white text-sm font-medium">{id}</span>
        </div>
      </div>

      <SortableContext
        items={disciplinas.map((d) => d.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {disciplinas.map((d) => (
            <DisciplinaCard key={d.id} disciplina={d} />
          ))}
        </div>
      </SortableContext>

      <button
        onClick={onAddDisciplina}
        className="mt-6 w-full border rounded-xl py-3 hover:opacity-80 transition text-white"
        style={{
          borderColor: "rgba(255,255,255,0.5)",
        }}
      >
        + Nova Disciplina
      </button>
    </div>
  );
}
