"use client";

import { BookOpen, ClipboardList, Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { supabase } from "../lib/supabase";
import {
  ALL_STATUS,
  Disciplina,
  Prova,
  STATUS,
  formatarData,
  formatarTempo,
  normalizar,
} from "./types";
import { DisciplinaRow } from "./components/DisciplinaRow";
import { KanbanColumn } from "./components/KanbanColumn";
import { MetricCard } from "./components/MetricCard";
import { NavButton } from "./components/NavButton";
import { NovaDisciplinaDrawer } from "./components/NovaDisciplinaDrawer";
import { NovaProvaDrawer } from "./components/NovaProvaDrawer";
import { PomodoroCard } from "./components/PomodoroCard";
import { ProgressChartCard } from "./components/ProgressChartCard";
import { StatusBadge } from "./components/StatusBadge";

const POMODORO_TIME = 25 * 60;

const INITIAL_NOVA_PROVA: Partial<Prova> = {
  titulo: "",
  disciplina_id: "",
  data: "",
  situacao: STATUS.NAO_INICIADO,
};

const INITIAL_NOVA_DISCIPLINA: Partial<Disciplina> = {
  nome: "",
  semestre: "",
  situacao: STATUS.NAO_INICIADO,
  data_inicio: "",
  data_fim: "",
  dia_1: "",
  dia_2: "",
  horario_1_inicio: "",
  horario_1_final: "",
  horario_2_inicio: "",
  horario_2_final: "",
};

export default function Painel() {
  const router = useRouter();

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [provas, setProvas] = useState<Prova[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerAberto, setDrawerAberto] = useState(false);
  const [drawerProvaAberto, setDrawerProvaAberto] = useState(false);
  const [novaDisciplina, setNovaDisciplina] =
    useState<Partial<Disciplina>>(INITIAL_NOVA_DISCIPLINA);
  const [novaProva, setNovaProva] = useState<Partial<Prova>>(INITIAL_NOVA_PROVA);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [semestreSelecionado, setSemestreSelecionado] = useState("Todos");
  const [semestreProvaSelecionado, setSemestreProvaSelecionado] =
    useState("Todos");

  const [temaClaro, setTemaClaro] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("tema") === "light";
  });
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const html = document.documentElement;

    if (temaClaro) {
      html.classList.add("light");
      localStorage.setItem("tema", "light");
    } else {
      html.classList.remove("light");
      localStorage.setItem("tema", "dark");
    }
  }, [temaClaro]);

  useEffect(() => {
    async function carregar() {
      const [{ data: disciplinasData }, { data: provasData }] = await Promise.all(
        [supabase.from("disciplinas").select("*"), supabase.from("provas").select("*")],
      );

      setDisciplinas(disciplinasData || []);
      setProvas(provasData || []);
      setLoading(false);
    }

    carregar();
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const semestres = useMemo(
    () => [
      "Todos",
      ...Array.from(
        new Set(disciplinas.map((d) => d.semestre?.trim()).filter(Boolean)),
      ),
    ],
    [disciplinas],
  );

  const naoIniciado = disciplinas.filter(
    (d) => normalizar(d.situacao) === normalizar(STATUS.NAO_INICIADO),
  );
  const emAndamento = disciplinas.filter(
    (d) => normalizar(d.situacao) === normalizar(STATUS.EM_ANDAMENTO),
  );
  const concluido = disciplinas.filter(
    (d) => normalizar(d.situacao) === normalizar(STATUS.CONCLUIDO),
  );

  const total = disciplinas.length;
  const activeDisciplina = disciplinas.find((d) => d.id === activeId);

  const chartData = [
    {
      name: STATUS.NAO_INICIADO,
      value: naoIniciado.length,
      color: "var(--kanban-nao-dot)",
    },
    {
      name: STATUS.EM_ANDAMENTO,
      value: emAndamento.length,
      color: "var(--kanban-and-dot)",
    },
    {
      name: STATUS.CONCLUIDO,
      value: concluido.length,
      color: "var(--kanban-con-dot)",
    },
  ];

  const provasFiltradas = provas.filter((p) =>
    semestreProvaSelecionado === "Todos"
      ? true
      : getDisciplinaSemestre(p.disciplina_id).trim() === semestreProvaSelecionado,
  );

  function getDisciplinaNome(disciplinaId: string) {
    return disciplinas.find((d) => d.id === disciplinaId)?.nome || "-";
  }

  function getDisciplinaSemestre(disciplinaId: string) {
    return disciplinas.find((d) => d.id === disciplinaId)?.semestre || "";
  }

  function navigateTo(path: string) {
    setIsTransitioning(true);
    setTimeout(() => router.push(path), 150);
  }

  async function salvarDisciplina() {
    if (!novaDisciplina.nome) return;

    const { error } = await supabase.from("disciplinas").insert([
      {
        nome: novaDisciplina.nome,
        semestre: novaDisciplina.semestre,
        situacao: novaDisciplina.situacao,
        data_inicio: novaDisciplina.data_inicio,
        data_fim: novaDisciplina.data_fim,
        dia_1: novaDisciplina.dia_1,
        horario_1_inicio: novaDisciplina.horario_1_inicio,
        horario_1_final: novaDisciplina.horario_1_final,
        dia_2: novaDisciplina.dia_2,
        horario_2_inicio: novaDisciplina.horario_2_inicio,
        horario_2_final: novaDisciplina.horario_2_final,
      },
    ]);

    if (error) return;

    const { data } = await supabase.from("disciplinas").select("*");
    setDisciplinas(data || []);
    setDrawerAberto(false);
    setNovaDisciplina(INITIAL_NOVA_DISCIPLINA);
  }

  async function salvarProva() {
    if (!novaProva.titulo || !novaProva.disciplina_id) return;

    const { error } = await supabase.from("provas").insert([
      {
        titulo: novaProva.titulo,
        disciplina_id: novaProva.disciplina_id,
        data: novaProva.data,
        situacao: novaProva.situacao,
      },
    ]);

    if (error) return;

    const { data } = await supabase.from("provas").select("*");
    setProvas(data || []);
    setDrawerProvaAberto(false);
    setNovaProva(INITIAL_NOVA_PROVA);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const draggedId = active.id as string;
    const overId = over.id as string;
    if (draggedId === overId) return;

    const draggedItem = disciplinas.find((d) => d.id === draggedId);
    if (!draggedItem) return;

    const overItem = disciplinas.find((d) => d.id === overId);
    const isSameColumn =
      overItem &&
      normalizar(overItem.situacao) === normalizar(draggedItem.situacao);

    if (isSameColumn) {
      const coluna = disciplinas.filter(
        (d) => normalizar(d.situacao) === normalizar(draggedItem.situacao),
      );
      const oldIndex = coluna.findIndex((d) => d.id === draggedId);
      const newIndex = coluna.findIndex((d) => d.id === overId);
      const novaOrdem = arrayMove(coluna, oldIndex, newIndex);

      setDisciplinas((prev) => {
        const outras = prev.filter(
          (d) => normalizar(d.situacao) !== normalizar(draggedItem.situacao),
        );
        return [...outras, ...novaOrdem];
      });
      return;
    }

    let novaColuna: string | null = null;
    if (overItem) novaColuna = overItem.situacao;
    if (ALL_STATUS.some((status) => status === overId)) novaColuna = overId;
    if (!novaColuna) return;

    setDisciplinas((prev) =>
      prev.map((d) => (d.id === draggedId ? { ...d, situacao: novaColuna! } : d)),
    );

    await supabase.from("disciplinas").update({ situacao: novaColuna }).eq("id", draggedId);
  }

  if (loading) return <div className="p-8 text-white">Carregando...</div>;

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
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTemaClaro((prev) => !prev)}
            className="flex items-center justify-center w-10 h-10 rounded-lg transition"
            style={{
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            {temaClaro ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <NavButton href="/disciplinas" onClick={() => navigateTo("/disciplinas")}>
            <BookOpen size={18} />
            Disciplinas
          </NavButton>

          <NavButton href="/provas" onClick={() => navigateTo("/provas")}>
            <ClipboardList size={18} />
            Provas
          </NavButton>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8 items-start">
        <div className="col-span-3 space-y-10">
          <div className="grid grid-cols-3 gap-6">
            <MetricCard title={STATUS.NAO_INICIADO} value={naoIniciado.length} />
            <MetricCard title={STATUS.EM_ANDAMENTO} value={emAndamento.length} />
            <MetricCard title={STATUS.CONCLUIDO} value={concluido.length} />
          </div>

          <DndContext
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveId(e.active.id as string)}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-3 gap-6">
              <KanbanColumn
                id={STATUS.NAO_INICIADO}
                disciplinas={naoIniciado}
                onAddDisciplina={() => setDrawerAberto(true)}
              />
              <KanbanColumn
                id={STATUS.EM_ANDAMENTO}
                disciplinas={emAndamento}
                onAddDisciplina={() => setDrawerAberto(true)}
              />
              <KanbanColumn
                id={STATUS.CONCLUIDO}
                disciplinas={concluido}
                onAddDisciplina={() => setDrawerAberto(true)}
              />
            </div>

            <DragOverlay>
              {activeDisciplina && (
                <div
                  className="px-4 py-3 rounded-xl shadow-2xl transition"
                  style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <p className="font-medium text-sm">{activeDisciplina.nome}</p>
                  <p style={{ opacity: 0.6 }} className="text-xs mt-1">
                    {activeDisciplina.semestre}
                  </p>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>

        <div className="flex flex-col gap-6 h-full">
          <div className="flex flex-col h-full">
            <ProgressChartCard total={total} chartData={chartData} />
          </div>

          <PomodoroCard
            timeLabel={formatarTempo(timeLeft)}
            onStart={() => setIsRunning(true)}
            onPause={() => setIsRunning(false)}
            onReset={() => {
              setIsRunning(false);
              setTimeLeft(POMODORO_TIME);
            }}
          />
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-xl font-semibold mb-6 tracking-wide bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent">
          DISCIPLINAS POR DIA
        </h2>

        <div className="flex gap-4 mb-6 flex-wrap">
          {semestres.map((sem) => (
            <button
              key={`disciplinas-${sem}`}
              onClick={() => setSemestreSelecionado(sem)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                semestreSelecionado === sem
                  ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white"
                  : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {sem}
            </button>
          ))}
        </div>

        <div
          className="overflow-hidden rounded-xl border"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card)",
          }}
        >
          <div
            className="grid grid-cols-5 px-4 py-3 border-b uppercase tracking-wider text-xs font-semibold"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="inline-block bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Situação
            </div>
            <div
              className="inline-block bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Disciplina
            </div>
            <div
              className="inline-block bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Dia
            </div>
            <div
              className="inline-block bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Horário
            </div>
            <div
              className="inline-block bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Período
            </div>
          </div>

          {disciplinas
            .filter((d) =>
              semestreSelecionado === "Todos"
                ? true
                : d.semestre?.trim() === semestreSelecionado,
            )
            .flatMap((d) => {
              const linhas = [];

              if (d.dia_1) {
                linhas.push(
                  <DisciplinaRow
                    key={`${d.id}-1`}
                    disciplina={d}
                    dia={d.dia_1}
                    inicio={d.horario_1_inicio}
                    fim={d.horario_1_final}
                  />,
                );
              }

              if (d.dia_2) {
                linhas.push(
                  <DisciplinaRow
                    key={`${d.id}-2`}
                    disciplina={d}
                    dia={d.dia_2}
                    inicio={d.horario_2_inicio}
                    fim={d.horario_2_final}
                  />,
                );
              }

              return linhas;
            })}
        </div>

        <div className="mt-6">
          <button
            onClick={() => setDrawerAberto(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition hover:opacity-80"
            style={{
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            <span className="text-lg">+</span>
            Nova Disciplina
          </button>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-xl font-semibold mb-6 tracking-wide bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent">
          PROVAS
        </h2>

        <div className="flex gap-4 mb-6 flex-wrap">
          {semestres.map((sem) => (
            <button
              key={`provas-${sem}`}
              onClick={() => setSemestreProvaSelecionado(sem)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                semestreProvaSelecionado === sem
                  ? "bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white"
                  : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {sem}
            </button>
          ))}
        </div>

        <div
          className="overflow-hidden rounded-xl border"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card)",
          }}
        >
          <div
            className="grid grid-cols-4 px-4 py-3 border-b uppercase tracking-wider text-xs font-semibold"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <div
              className="inline-block bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Situação
            </div>
            <div
              className="inline-block bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Prova
            </div>
            <div
              className="inline-block bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Disciplina
            </div>
            <div
              className="inline-block bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Data
            </div>
          </div>

          {provasFiltradas.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-4 px-4 py-4 transition"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div>
                <StatusBadge situacao={p.situacao} />
              </div>
              <div className="text-sm text-[var(--foreground)]">{p.titulo}</div>
              <div className="text-sm text-[var(--foreground)]">
                {getDisciplinaNome(p.disciplina_id)}
              </div>
              <div className="text-sm text-[var(--foreground)]">
                {formatarData(p.data)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={() => setDrawerProvaAberto(true)}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-500 transition"
          >
            <span className="text-lg">+</span>
            Nova Prova
          </button>
        </div>
      </div>

      <NovaProvaDrawer
        open={drawerProvaAberto}
        disciplinas={disciplinas}
        novaProva={novaProva}
        setNovaProva={setNovaProva}
        onSave={salvarProva}
        onClose={() => setDrawerProvaAberto(false)}
      />

      <NovaDisciplinaDrawer
        open={drawerAberto}
        novaDisciplina={novaDisciplina}
        setNovaDisciplina={setNovaDisciplina}
        onSave={salvarDisciplina}
        onClose={() => setDrawerAberto(false)}
      />
    </div>
  );
}
