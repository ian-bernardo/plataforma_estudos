"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, FileText } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import Header from "@/components/ui/Header";

type Disciplina = {
  id: string;
  nome: string;
  situacao: string;
  semestre: string;
  data_inicio: string;
  data_fim: string;
  dia_1: string | null;
  dia_2: string | null;
  horario_1_inicio: string | null;
  horario_1_final: string | null;
  horario_2_inicio: string | null;
  horario_2_final: string | null;
};

export default function Disciplinas() {
  const router = useRouter();
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [novaDisciplina, setNovaDisciplina] = useState<any | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const supabase = createClient();
  const { userId, loading: loadingUser } = useUser();

  // 🔴 NOVO ESTADO PARA CONFIRMAÇÃO
  const [confirmarExclusao, setConfirmarExclusao] = useState<Disciplina | null>(
    null,
  );

  function navigateTo(path: string) {
    setIsTransitioning(true);

    setTimeout(() => {
      router.push(path);
    }, 150);
  }

  async function carregar() {
    const { data } = await supabase.from("disciplinas").select("*");
    setDisciplinas(data || []);
  }

  async function excluirConfirmado() {
    if (!confirmarExclusao) return;

    await supabase.from("disciplinas").delete().eq("id", confirmarExclusao.id);

    setConfirmarExclusao(null);
    carregar();
  }

  async function salvar() {
    if (!novaDisciplina.nome || !userId) return;

    const { error } = await supabase.from("disciplinas").insert([
      {
        nome: novaDisciplina.nome,
        situacao: novaDisciplina.situacao,
        semestre: novaDisciplina.semestre,
        data_inicio: novaDisciplina.data_inicio,
        data_fim: novaDisciplina.data_fim,
        dia_1: novaDisciplina.dia_1,
        horario_1_inicio: novaDisciplina.horario_1_inicio,
        horario_1_final: novaDisciplina.horario_1_final,
        dia_2: novaDisciplina.dia_2,
        horario_2_inicio: novaDisciplina.horario_2_inicio,
        horario_2_final: novaDisciplina.horario_2_final,
        user_id: userId, // ✅ Adiciona o ID do usuárioo,
      },
    ]);

    if (!error) {
      setNovaDisciplina(null);
      carregar();
    }
  }

  function formatarData(data: string) {
    if (!data) return "";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
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
          <h1 className="text-3xl font-bold">Disciplinas</h1>

          <div className="flex gap-4">
            <div className="flex gap-4">
              <NavButton href="/" onClick={() => router.push("/")}>
                <LayoutDashboard size={16} />
                Dashboard
              </NavButton>

              <NavButton href="/provas" onClick={() => navigateTo("/provas")}>
                <FileText size={16} />
                Provas
              </NavButton>
            </div>
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
                  onClick={() => setConfirmarExclusao(d)}
                  className="text-red-400 hover:text-red-300"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}

          {/* LINHA EDITÁVEL */}
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
                  setNovaDisciplina({
                    ...novaDisciplina,
                    dia_1: e.target.value,
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
                  setNovaDisciplina({
                    ...novaDisciplina,
                    dia_2: e.target.value,
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

              <button
                onClick={salvar}
                className="text-green-400 hover:text-green-300"
              >
                Salvar
              </button>
            </div>
          )}
        </div>

        {!novaDisciplina && (
          <div className="mt-6">
            <button
              onClick={() =>
                setNovaDisciplina({
                  nome: "",
                  situacao: "Não Iniciado",
                  semestre: "1° Semestre",
                })
              }
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

        {/* 🔴 MODAL DE CONFIRMAÇÃO */}
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
                <span className="font-medium">{confirmarExclusao.nome}</span>?
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setConfirmarExclusao(null)}
                  className="px-4 py-2 rounded-lg transition"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  Cancelar
                </button>

                <button
                  onClick={excluirConfirmado}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
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

      {/* Linha animada inferior */}
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
