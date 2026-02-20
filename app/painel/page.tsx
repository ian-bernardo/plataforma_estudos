"use client";

import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ================= TYPES ================= */
type Disciplina = {
  id: string;
  nome: string;
  semestre: string;
  situacao: string;
  data_inicio: string;
  data_fim: string;
  dia_1: string | null;
  dia_2: string | null;
  horario_1_inicio: string | null;
  horario_1_final: string | null;
  horario_2_inicio: string | null;
  horario_2_final: string | null;
};

/* ================= STATUS ================= */
const STATUS = {
  NAO_INICIADO: "Não Iniciado",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDO: "Concluído",
};

const ALL_STATUS = Object.values(STATUS);

/* ================= NORMALIZAÇÃO ================= */
const normalizar = (texto: string) =>
  texto
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/* ================= PAINEL ================= */
function formatarData(data: string | null) {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function Painel() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [semestreSelecionado, setSemestreSelecionado] = useState("Todos");
  const POMODORO_TIME = 25 * 60; // 25 minutos

  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState(false);

  const semestres = [
    "Todos",
    ...Array.from(
      new Set(
        disciplinas
          .map((d) => d.semestre?.trim())
          .filter(Boolean)
      )
    ),
  ];




  useEffect(() => {
    async function carregar() {
      const { data, error } = await supabase
        .from("disciplinas")
        .select(
          `id, nome, semestre, situacao, data_inicio, data_fim, dia_1, dia_2, horario_1_inicio, horario_1_final, horario_2_inicio, horario_2_final`
        );

      if (error) {
        console.error("Erro ao carregar:", error);
      }

      setDisciplinas(data || []);
      setLoading(false);
    }

    carregar();
  }, []);

  const naoIniciado = disciplinas.filter(
    (d) => normalizar(d.situacao) === "nao iniciado"
  );
  const emAndamento = disciplinas.filter(
    (d) => normalizar(d.situacao) === "em andamento"
  );
  const concluido = disciplinas.filter(
    (d) => normalizar(d.situacao) === "concluido"
  );
  const total = disciplinas.length;

  const chartData = [
    { name: "Não Iniciado", value: naoIniciado.length, color: "#8E8B86" },
    { name: "Em Andamento", value: emAndamento.length, color: "#2783DE" },
    { name: "Concluído", value: concluido.length, color: "#46A171" },
  ];

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

  function formatTime(seconds: number) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }


  const activeDisciplina = disciplinas.find((d) => d.id === activeId);

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

    if (
      overItem &&
      normalizar(overItem.situacao) === normalizar(draggedItem.situacao)
    ) {
      const coluna = disciplinas.filter(
        (d) => normalizar(d.situacao) === normalizar(draggedItem.situacao)
      );
      const oldIndex = coluna.findIndex((d) => d.id === draggedId);
      const newIndex = coluna.findIndex((d) => d.id === overId);
      const novaOrdem = arrayMove(coluna, oldIndex, newIndex);

      setDisciplinas((prev) => {
        const outras = prev.filter(
          (d) => normalizar(d.situacao) !== normalizar(draggedItem.situacao)
        );
        return [...outras, ...novaOrdem];
      });

      return;
    }

    let novaColuna: string | null = null;
    if (overItem) novaColuna = overItem.situacao;
    if (ALL_STATUS.includes(overId)) novaColuna = overId;
    if (!novaColuna) return;

    setDisciplinas((prev) =>
      prev.map((d) =>
        d.id === draggedId ? { ...d, situacao: novaColuna! } : d
      )
    );

    await supabase
      .from("disciplinas")
      .update({ situacao: novaColuna })
      .eq("id", draggedId);
  }

  if (loading) return <div className="p-8 text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-[var(--background)] text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* ================= MÉTRICAS ================= */}
      <div className="grid grid-cols-4 gap-8 items-start">




          {/* LADO ESQUERDO */}
          <div className="col-span-3 space-y-10">

            {/* MÉTRICAS */}
            <div className="grid grid-cols-3 gap-6">
              <MetricCard title="Não Iniciado" value={naoIniciado.length} />
              <MetricCard title="Em Andamento" value={emAndamento.length} />
              <MetricCard title="Concluído" value={concluido.length} />
            </div>

            {/* KANBAN */}
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={(e) => setActiveId(e.active.id as string)}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-3 gap-6">
                <Column id={STATUS.NAO_INICIADO} disciplinas={naoIniciado} />
                <Column id={STATUS.EM_ANDAMENTO} disciplinas={emAndamento} />
                <Column id={STATUS.CONCLUIDO} disciplinas={concluido} />
              </div>

              <DragOverlay>
                {activeDisciplina && (
                  <div className="bg-black px-4 py-3 rounded-xl border border-zinc-600 shadow-2xl">
                    <p className="font-medium text-sm">{activeDisciplina.nome}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {activeDisciplina.semestre}
                    </p>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>

          {/* LADO DIREITO */}
          <div className="flex flex-col gap-6 h-full">
                <div className="flex flex-col h-full">
            {/* ================= GRÁFICO ================= */}
            <div className="bg-[#202020] rounded-2xl p-6 border border-zinc-800 flex flex-col items-center">

              <div className="text-zinc-400 text-sm mb-6">Gráfico</div>

              <div className="w-[260px] h-[260px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold">{total}</span>
                  <span className="text-sm text-zinc-400">Total</span>
                </div>
              </div>

              <div className="mt-8 space-y-3 text-sm">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-zinc-300">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
            </div> {/* 👈 FECHA grid grid-cols-4 */}

            {/* ================= POMODORO ================= */}
            <div className="bg-[#181818] h-full rounded-2xl p-6 border border-zinc-800 flex flex-col items-center mb-10">

              <h3 className="text-sm text-zinc-400 mb-4">Pomodoro</h3>

              <span className="text-4xl font-bold mb-6">
                {formatTime(timeLeft)}
              </span>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsRunning(true)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] text-white text-sm"
                >
                  Iniciar
                </button>

                <button
                  onClick={() => setIsRunning(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-600 text-zinc-300 text-sm"
                >
                  Pausar
                </button>

                <button
                  onClick={() => {
                    setIsRunning(false);
                    setTimeLeft(POMODORO_TIME);
                  }}
                  className="px-4 py-2 rounded-lg border border-zinc-600 text-zinc-300 text-sm"
                >
                  Reset
                </button>
              </div>
            </div></div>

          </div>



      {/* ================= GRADE ================= */}

      <div className="mt-20">
        <h2 className="text-xl font-semibold mb-6 tracking-wide bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] bg-clip-text text-transparent">
          DISCIPLINAS POR DIA
        </h2>
        
        {/* ================= FILTRO SEMESTRE ================= */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {semestres.map((sem) => (
            <button
              key={sem}
              onClick={() => setSemestreSelecionado(sem)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                semestreSelecionado === sem
                  ? "bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] text-white"
                  : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}

            >
              {sem}
            </button>
          ))}
        </div>


        <div className="overflow-hidden rounded-xl border border-zinc-700">
          <div className="grid grid-cols-5 bg-zinc-900 px-4 py-3 border-b border-zinc-700 uppercase tracking-wider text-xs font-semibold">
            <div className="bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] bg-clip-text text-transparent">
              Situação
            </div>
            <div className="bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] bg-clip-text text-transparent">
              Disciplina
            </div>
            <div className="bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] bg-clip-text text-transparent">
              Dia
            </div>
            <div className="bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] bg-clip-text text-transparent">
              Horário
            </div>
            <div className="bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] bg-clip-text text-transparent">
              Período
            </div>
          </div>


          {disciplinas
            .filter((d) =>
              semestreSelecionado === "Todos"
                ? true
                : d.semestre?.trim() === semestreSelecionado
            )
            .flatMap((d) => {
              const linhas = [];

              if (d.dia_1) {
                linhas.push(
                  <Row
                    key={`${d.id}-1`}
                    disciplina={d}
                    dia={d.dia_1}
                    inicio={d.horario_1_inicio}
                    fim={d.horario_1_final}
                  />
                );
              }

              if (d.dia_2) {
                linhas.push(
                  <Row
                    key={`${d.id}-2`}
                    disciplina={d}
                    dia={d.dia_2}
                    inicio={d.horario_2_inicio}
                    fim={d.horario_2_final}
                  />
                );
              }

              return linhas;
            })}
        </div> {/* 👈 FECHA overflow-hidden */}
  

        {/* 👇 BOTÃO FORA DA TABELA */}
        <div className="mt-6">
          <button className="flex items-center gap-2 px-4 py-2 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-500 transition">
            <span className="text-lg">+</span>
            Nova Disciplina
          </button>
        </div>

      </div>
    </div>
  );
}

/* ================= COMPONENTES ================= */

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="p-6 rounded-2xl bg-[#202020] border border-zinc-800">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Column({
  id,
  disciplinas,
}: {
  id: string;
  disciplinas: Disciplina[];
}) {
  const { setNodeRef } = useDroppable({ id });

  let bg = "bg-[#202020]";
  let badgeBg = "#1C1C1E";
  let dotColor = "#8E8B86";

  if (id === STATUS.EM_ANDAMENTO) {
    bg = "bg-[#1A2027]";
    badgeBg = "#356292";
    dotColor = "#2783DE";
  }

  if (id === STATUS.CONCLUIDO) {
    bg = "bg-[#1B211D]";
    badgeBg = "#386C4E";
    dotColor = "#46A171";
  }

  return (
    <div ref={setNodeRef} className={`p-6 rounded-2xl ${bg} min-h-[400px]`}>
      <div className="mb-6">
        <div
          className="flex items-center gap-2 px-5 py-2 rounded-full w-fit"
          style={{ backgroundColor: badgeBg }}
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

      <button className="mt-6 w-full border border-zinc-600 rounded-xl py-3 hover:bg-zinc-800 transition">
        + Nova Disciplina
      </button>
    </div>
  );
}

function DisciplinaCard({ disciplina }: { disciplina: Disciplina }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: disciplina.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-black/40 px-4 py-3 rounded-2xl border border-zinc-600 hover:border-zinc-400 transition cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 text-zinc-500 shrink-0">
          <BookOpen size={18} strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-medium text-sm">{disciplina.nome}</p>
          <p className="text-xs text-zinc-400 mt-1">{disciplina.semestre}</p>
        </div>
      </div>
    </div>
  );
}

function Row({
  disciplina,
  dia,
  inicio,
  fim,
}: {
  disciplina: Disciplina;
  dia: string | null;
  inicio: string | null;
  fim: string | null;
}) {
  return (
    <div className="grid grid-cols-5 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900/40 transition">
      <div>
        <StatusBadge situacao={disciplina.situacao} />
      </div>
      <div className="flex items-center gap-2">
        <BookOpen size={16} className="text-zinc-500" />
        <span className="text-sm text-white">{disciplina.nome}</span>
      </div>
      <div className="text-sm text-white">{dia}</div>
      <div className="text-sm text-white">
        {inicio} - {fim}
      </div>
      <div className="text-sm text-white">
        {formatarData(disciplina.data_inicio)} →{" "}
        {formatarData(disciplina.data_fim)}
      </div>
    </div>
  );
}

function StatusBadge({ situacao }: { situacao: string }) {
  let bg = "#1C1C1E";
  let dot = "#8E8B86";

  if (situacao === STATUS.EM_ANDAMENTO) {
    bg = "#356292";
    dot = "#2783DE";
  }

  if (situacao === STATUS.CONCLUIDO) {
    bg = "#386C4E";
    dot = "#46A171";
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1 rounded-full text-xs text-white w-fit"
      style={{ backgroundColor: bg }}
    >
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dot }} />
      {situacao}
    </div>
  );
}

































