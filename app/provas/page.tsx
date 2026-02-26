"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import Header from "@/components/ui/Header";

type Prova = {
  id: string;
  disciplina_id: string;
  titulo: string;
  data: string;
  situacao: string;
};

type Disciplina = {
  id: string;
  nome: string;
};

export default function Provas() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [provas, setProvas] = useState<Prova[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [novaProva, setNovaProva] = useState<any | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<Prova | null>(
    null,
  );
  const supabase = createClient();
  const { userId, loading: loadingUser } = useUser();

  function navigateTo(path: string) {
    setIsTransitioning(true);

    setTimeout(() => {
      router.push(path);
    }, 150);
  }

  async function carregar() {
    if (!userId) return;
    
    const { data: provasData } = await supabase
      .from("provas")
      .select("*")
      .eq('user_id', userId);
    const { data: disciplinasData } = await supabase
      .from("disciplinas")
      .select("id, nome")
      .eq('user_id', userId);

    setProvas(provasData || []);
    setDisciplinas(disciplinasData || []);
  }

  async function excluirConfirmado() {
    if (!confirmarExclusao) return;

    await supabase.from("provas").delete().eq("id", confirmarExclusao.id);

    setConfirmarExclusao(null);
    carregar();
  }

  async function salvar() {
    if (!novaProva.titulo || !novaProva.disciplina_id || !userId) return;

    const { error } = await supabase.from("provas").insert([
      {
        titulo: novaProva.titulo,
        disciplina_id: novaProva.disciplina_id,
        data: novaProva.data,
        situacao: novaProva.situacao,
        user_id: userId, // ✅ Adiciona o ID do usuário
      },
    ]);

    if (!error) {
      setNovaProva(null);
      carregar();
    }
  }

  function formatarData(data: string) {
    if (!data) return "";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function getDisciplinaNome(id: string) {
    return disciplinas.find((d) => d.id === id)?.nome || "-";
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <>
      <Header />
      <div
        className={`
      min-h-screen pt-24 px-8 pb-8
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

          <NavButton
            href="/disciplinas"
            onClick={() => navigateTo("/disciplinas")}
          >
            <BookOpen size={16} />
            Disciplinas
          </NavButton>
        </div>
      </div>

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
                onClick={() => setConfirmarExclusao(p)}
                className="text-red-400 hover:text-red-300"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}

        {/* LINHA EDITÁVEL */}
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
              onChange={(e) =>
                setNovaProva({ ...novaProva, data: e.target.value })
              }
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

            <button
              onClick={salvar}
              className="text-green-400 hover:text-green-300"
            >
              Salvar
            </button>
          </div>
        )}
      </div>

      {!novaProva && (
        <div className="mt-6">
          <button
            onClick={() =>
              setNovaProva({
                titulo: "",
                disciplina_id: "",
                data: "",
                situacao: "Não Iniciado",
              })
            }
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

      {/* MODAL CONFIRMAÇÃO */}
      {confirmarExclusao && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className="p-8 rounded-2xl border w-[400px] text-center transition"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <h2 className="text-xl font-semibold mb-4">Confirmar Exclusão</h2>

            <p style={{ opacity: 0.7 }} className="mb-6">
              Tem certeza que deseja excluir <br />
              <span className="text-white font-medium">
                {confirmarExclusao.titulo}
              </span>
              ?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmarExclusao(null)}
                className="px-4 py-2 border border-zinc-600 rounded-lg hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>

              <button
                onClick={excluirConfirmado}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
function NavButton({
  children,
  href,
  onClick,
}: {
  children: React.ReactNode;
  href: string;
  onClick: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <button
      onClick={onClick}
      className="
        relative flex items-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-300 ease-out
        border
        active:scale-95
      "
      style={{
        borderColor: "var(--border)",
        color: "var(--foreground)",
        backgroundColor: isActive ? "var(--card)" : "transparent",
      }}
    >
      {children}

      <span
        className="absolute left-3 right-3 bottom-0 h-[2px] rounded-full transition-all duration-300"
        style={{
          background:
            "linear-gradient(to right, var(--gradient-start), var(--gradient-end))",
          opacity: isActive ? 1 : 0,
        }}
      />
    </button>
  );
}
