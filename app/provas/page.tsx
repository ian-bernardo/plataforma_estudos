"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, LayoutDashboard } from "lucide-react";
import { supabase } from "../lib/supabase";
import { ConfirmDeleteModal } from "./components/ConfirmDeleteModal";
import { NavButton } from "./components/NavButton";
import { ProvasTable } from "./components/ProvasTable";
import { Disciplina, NovaProva, Prova } from "./types";

const INITIAL_NOVA_PROVA: NovaProva = {
  titulo: "",
  disciplina_id: "",
  data: "",
  situacao: "Não Iniciado",
};

export default function Provas() {
  const router = useRouter();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [provas, setProvas] = useState<Prova[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [novaProva, setNovaProva] = useState<NovaProva | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<Prova | null>(
    null,
  );

  async function carregar() {
    const { data: provasData } = await supabase.from("provas").select("*");
    const { data: disciplinasData } = await supabase
      .from("disciplinas")
      .select("id, nome");

    setProvas(provasData || []);
    setDisciplinas(disciplinasData || []);
  }

  useEffect(() => {
    void (async () => {
      const { data: provasData } = await supabase.from("provas").select("*");
      const { data: disciplinasData } = await supabase
        .from("disciplinas")
        .select("id, nome");

      setProvas(provasData || []);
      setDisciplinas(disciplinasData || []);
    })();
  }, []);

  function navigateTo(path: string) {
    setIsTransitioning(true);
    setTimeout(() => router.push(path), 150);
  }

  async function salvar() {
    if (!novaProva?.titulo || !novaProva?.disciplina_id) return;
    const payload = novaProva;

    const { error } = await supabase.from("provas").insert([
      {
        titulo: payload.titulo,
        disciplina_id: payload.disciplina_id,
        data: payload.data,
        situacao: payload.situacao,
      },
    ]);

    if (error) return;

    setNovaProva(null);
    await carregar();
  }

  async function excluirConfirmado() {
    if (!confirmarExclusao) return;

    await supabase.from("provas").delete().eq("id", confirmarExclusao.id);
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
        <h1 className="text-3xl font-bold">Provas</h1>

        <div className="flex gap-4">
          <NavButton href="/" onClick={() => navigateTo("/")}>
            <LayoutDashboard size={16} />
            Dashboard
          </NavButton>

          <NavButton href="/disciplinas" onClick={() => navigateTo("/disciplinas")}>
            <BookOpen size={16} />
            Disciplinas
          </NavButton>
        </div>
      </div>

      <ProvasTable
        provas={provas}
        disciplinas={disciplinas}
        novaProva={novaProva}
        setNovaProva={setNovaProva}
        onDelete={setConfirmarExclusao}
        onSave={salvar}
      />

      {!novaProva && (
        <div className="mt-6">
          <button
            onClick={() => setNovaProva(INITIAL_NOVA_PROVA)}
            className="px-4 py-2 rounded-xl transition"
            style={{
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            + Nova Prova
          </button>
        </div>
      )}

      {confirmarExclusao && (
        <ConfirmDeleteModal
          itemNome={confirmarExclusao.titulo}
          onCancel={() => setConfirmarExclusao(null)}
          onConfirm={excluirConfirmado}
        />
      )}
    </div>
  );
}
