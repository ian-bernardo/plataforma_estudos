"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen } from "lucide-react";

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

  const [provas, setProvas] = useState<Prova[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [novaProva, setNovaProva] = useState<any | null>(null);
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

  async function excluirConfirmado() {
    if (!confirmarExclusao) return;

    await supabase.from("provas").delete().eq("id", confirmarExclusao.id);

    setConfirmarExclusao(null);
    carregar();
  }

  async function salvar() {
    if (!novaProva.titulo || !novaProva.disciplina_id) return;

    const { error } = await supabase.from("provas").insert([
      {
        titulo: novaProva.titulo,
        disciplina_id: novaProva.disciplina_id,
        data: novaProva.data,
        situacao: novaProva.situacao,
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
    <div className="min-h-screen bg-[var(--background)] text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Provas</h1>

        <div className="flex gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>

          <button
            onClick={() => router.push("/disciplinas")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition"
          >
            <BookOpen size={16} />
            Disciplinas
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#202020]">
        <div className="grid grid-cols-5 px-6 py-4 border-b border-zinc-700 text-xs uppercase tracking-wider text-zinc-400">
          <div>Título</div>
          <div>Disciplina</div>
          <div>Data</div>
          <div>Situação</div>
          <div>Ações</div>
        </div>

        {provas.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-5 px-6 py-4 border-b border-zinc-800 text-sm items-center hover:bg-zinc-900/40 transition"
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
          <div className="grid grid-cols-5 px-6 py-4 border-t border-zinc-800 bg-zinc-900/40 text-sm items-center gap-2">
            <input
              className="bg-zinc-800 px-2 py-1 rounded"
              placeholder="Título"
              value={novaProva.titulo}
              onChange={(e) =>
                setNovaProva({ ...novaProva, titulo: e.target.value })
              }
            />

            <select
              className="bg-zinc-800 px-2 py-1 rounded"
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
              className="bg-zinc-800 px-2 py-1 rounded"
              onChange={(e) =>
                setNovaProva({ ...novaProva, data: e.target.value })
              }
            />

            <select
              className="bg-zinc-800 px-2 py-1 rounded"
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
            className="px-4 py-2 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-500 transition"
          >
            + Nova Prova
          </button>
        </div>
      )}

      {/* MODAL CONFIRMAÇÃO */}
      {confirmarExclusao && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#202020] p-8 rounded-2xl border border-zinc-700 w-[400px] text-center">
            <h2 className="text-xl font-semibold mb-4">Confirmar Exclusão</h2>

            <p className="text-zinc-400 mb-6">
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
  );
}
