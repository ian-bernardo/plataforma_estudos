import { BookOpen } from "lucide-react";
import { Disciplina, formatarData } from "../types";
import { StatusBadge } from "./StatusBadge";

type DisciplinaRowProps = {
  disciplina: Disciplina;
  dia: string | null;
  inicio: string | null;
  fim: string | null;
};

export function DisciplinaRow({
  disciplina,
  dia,
  inicio,
  fim,
}: DisciplinaRowProps) {
  return (
    <div
      className="grid grid-cols-5 px-4 py-4 transition"
      style={{
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div>
        <StatusBadge situacao={disciplina.situacao} />
      </div>

      <div className="flex items-center gap-2">
        <BookOpen size={16} className="opacity-60" />
        <span className="text-sm text-[var(--foreground)]">{disciplina.nome}</span>
      </div>

      <div className="text-sm text-[var(--foreground)] opacity-80">{dia}</div>

      <div className="text-sm text-[var(--foreground)] opacity-80">
        {inicio} - {fim}
      </div>

      <div className="text-sm text-[var(--foreground)] opacity-80">
        {formatarData(disciplina.data_inicio)} → {formatarData(disciplina.data_fim)}
      </div>
    </div>
  );
}
