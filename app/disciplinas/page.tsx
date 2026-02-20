"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, LayoutDashboard } from "lucide-react";
import { supabase } from "../lib/supabase";
import { ConfirmDeleteModal } from "./components/ConfirmDeleteModal";
import { DisciplinasTable } from "./components/DisciplinasTable";
import { NavButton } from "./components/NavButton";
import { Disciplina, NovaDisciplina } from "./types";

const INITIAL_NOVA_DISCIPLINA: NovaDisciplina = {
  nome: "",
  situacao: "Não Iniciado",
  semestre: "1° Semestre",
};

export default function Disciplinas() {
  const router = useRouter();

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [novaDisciplina, setNovaDisciplina] = useState<NovaDisciplina | null>(
    null,
  );
  const [confirmarExclusao, setConfirmarExclusao] = useState<Disciplina | null>(
    null,
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  async function carregar() {
    const { data } = await supabase.from("disciplinas").select("*");
    setDisciplinas(data || []);
  }

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("disciplinas").select("*");
      setDisciplinas(data || []);
    })();
  }, []);

  function navigateTo(path: string) {
    setIsTransitioning(true);
    setTimeout(() => router.push(path), 150);
  }

  async function salvar() {
    if (!novaDisciplina?.nome) return;
    const payload = novaDisciplina;

    const { error } = await supabase.from("disciplinas").insert([
      {
        nome: payload.nome,
        situacao: payload.situacao,
        semestre: payload.semestre,
        data_inicio: payload.data_inicio,
        data_fim: payload.data_fim,
        dia_1: payload.dia_1,
        horario_1_inicio: payload.horario_1_inicio,
        horario_1_final: payload.horario_1_final,
        dia_2: payload.dia_2,
        horario_2_inicio: payload.horario_2_inicio,
        horario_2_final: payload.horario_2_final,
      },
    ]);

    if (error) return;

    setNovaDisciplina(null);
    await carregar();
  }

  async function excluirConfirmado() {
    if (!confirmarExclusao) return;

    await supabase.from("disciplinas").delete().eq("id", confirmarExclusao.id);
    setConfirmarExclusao(null);
    await carregar();
  }

  return (
    <div
      className={`
        min-h-screen p-8
        transition-all duration-200 ease-in-out
        ${isTransitioning ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100"}
      `}
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Disciplinas</h1>

        <div className="flex gap-4">
          <NavButton href="/" onClick={() => navigateTo("/")}>
            <LayoutDashboard size={16} />
            Dashboard
          </NavButton>

          <NavButton href="/provas" onClick={() => navigateTo("/provas")}>
            <FileText size={16} />
            Provas
          </NavButton>
        </div>
      </div>

      <DisciplinasTable
        disciplinas={disciplinas}
        novaDisciplina={novaDisciplina}
        setNovaDisciplina={setNovaDisciplina}
        onDelete={setConfirmarExclusao}
        onSave={salvar}
      />

      {!novaDisciplina && (
        <div className="mt-6">
          <button
            onClick={() => setNovaDisciplina(INITIAL_NOVA_DISCIPLINA)}
            className="px-4 py-2 rounded-xl transition"
            style={{
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            + Nova Disciplina
          </button>
        </div>
      )}

      {confirmarExclusao && (
        <ConfirmDeleteModal
          itemNome={confirmarExclusao.nome}
          onCancel={() => setConfirmarExclusao(null)}
          onConfirm={excluirConfirmado}
        />
      )}
    </div>
  );
}
