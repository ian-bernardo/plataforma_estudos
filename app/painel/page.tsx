"use client";

import { BookOpen, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useRouter } from "next/navigation";
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

type Prova = {
  id: string;
  disciplina_id: string;
  titulo: string;
  data: string;
  situacao: string;
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
  const [drawerProvaAberto, setDrawerProvaAberto] = useState(false);
  const [novaProva, setNovaProva] = useState<Partial<Prova>>({
    titulo: "",
    disciplina_id: "",
    data: "",
    situacao: "Não Iniciado",
  });

  const [provas, setProvas] = useState<Prova[]>([]);
  const router = useRouter();
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [semestreSelecionado, setSemestreSelecionado] = useState("Todos");
  const [semestreProvaSelecionado, setSemestreProvaSelecionado] =
    useState("Todos");
  const POMODORO_TIME = 25 * 60; // 25 minutos
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [novaDisciplina, setNovaDisciplina] = useState<Partial<Disciplina>>({
    nome: "",
    semestre: "",
    situacao: STATUS.NAO_INICIADO,
  });

  const [temaClaro, setTemaClaro] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (temaClaro) {
      html.classList.add("light");
    } else {
      html.classList.remove("light");
    }
  }, [temaClaro]);

  function abrirDrawer() {
    setDrawerAberto(true);
  }

  function fecharDrawer() {
    setDrawerAberto(false);
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

    if (!error) {
      setDrawerAberto(false);
      setNovaDisciplina({});
      window.location.reload();
    }
  }

  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState(false);

  const semestres = [
    "Todos",
    ...Array.from(
      new Set(disciplinas.map((d) => d.semestre?.trim()).filter(Boolean)),
    ),
  ];

  useEffect(() => {
    async function carregar() {
      const { data: disciplinasData } = await supabase
        .from("disciplinas")
        .select("*");

      const { data: provasData } = await supabase.from("provas").select("*");

      setDisciplinas(disciplinasData || []);
      setProvas(provasData || []);
      setLoading(false);
    }

    carregar();
  }, []);

  const naoIniciado = disciplinas.filter(
    (d) => normalizar(d.situacao) === "nao iniciado",
  );
  const emAndamento = disciplinas.filter(
    (d) => normalizar(d.situacao) === "em andamento",
  );
  const concluido = disciplinas.filter(
    (d) => normalizar(d.situacao) === "concluido",
  );
  const total = disciplinas.length;

  const provasFiltradas = provas.filter((p) =>
    semestreProvaSelecionado === "Todos"
      ? true
      : getDisciplinaSemestre(p.disciplina_id)?.trim() ===
        semestreProvaSelecionado,
  );

  const chartData = [
    {
      name: "Não Iniciado",
      value: naoIniciado.length,
      color: "var(--kanban-nao-dot)",
    },
    {
      name: "Em Andamento",
      value: emAndamento.length,
      color: "var(--kanban-and-dot)",
    },
    {
      name: "Concluído",
      value: concluido.length,
      color: "var(--kanban-con-dot)",
    },
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

  function getDisciplinaNome(disciplinaId: string) {
    return disciplinas.find((d) => d.id === disciplinaId)?.nome || "-";
  }

  function getDisciplinaSemestre(disciplinaId: string) {
    return disciplinas.find((d) => d.id === disciplinaId)?.semestre || "";
  }

  function formatTime(seconds: number) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  const activeDisciplina = disciplinas.find((d) => d.id === activeId);

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

    if (!error) {
      setDrawerProvaAberto(false);
      setNovaProva({
        titulo: "",
        disciplina_id: "",
        data: "",
        situacao: "Não Iniciado",
      });

      // Atualiza lista sem reload
      const { data } = await supabase.from("provas").select("*");
      setProvas(data || []);
    }
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

    if (
      overItem &&
      normalizar(overItem.situacao) === normalizar(draggedItem.situacao)
    ) {
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
    if (ALL_STATUS.includes(overId)) novaColuna = overId;
    if (!novaColuna) return;

    setDisciplinas((prev) =>
      prev.map((d) =>
        d.id === draggedId ? { ...d, situacao: novaColuna! } : d,
      ),
    );

    await supabase
      .from("disciplinas")
      .update({ situacao: novaColuna })
      .eq("id", draggedId);
  }

  if (loading) return <div className="p-8 text-white">Carregando...</div>;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;

      const percentual =
        total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;

      return (
        <div
          className="bg-[#1f1f1f] border border-zinc-700 px-4 py-3 rounded-lg shadow-xl"
          style={{
            backgroundColor: "#1f1f1f",
            border: "1px solid #3f3f46",
          }}
        >
          <p className="text-sm font-medium text-white">{item.name}</p>
          <p className="text-sm text-zinc-300">Quantidade: {item.value}</p>
          <p className="text-sm text-zinc-400">{percentual}%</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`min-h-screen p-8 ${temaClaro ? "light" : ""}`}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="flex items-center gap-4">
          {/* BOTÃO TEMPLATE */}
          <button
            onClick={() => setTemaClaro(!temaClaro)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition"
          >
            {temaClaro ? "🌙" : "☀️"}
          </button>

          <button
            onClick={() => router.push("/disciplinas")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition"
          >
            <BookOpen size={18} />
            <span className="text-sm">Disciplinas</span>
          </button>

          <button
            onClick={() => router.push("/provas")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition"
          >
            <ClipboardList size={18} />
            <span className="text-sm">Provas</span>
          </button>
        </div>
      </div>
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
              <Column
                id={STATUS.NAO_INICIADO}
                disciplinas={naoIniciado}
                abrirDrawer={() => setDrawerAberto(true)}
              />

              <Column
                id={STATUS.EM_ANDAMENTO}
                disciplinas={emAndamento}
                abrirDrawer={() => setDrawerAberto(true)}
              />

              <Column
                id={STATUS.CONCLUIDO}
                disciplinas={concluido}
                abrirDrawer={() => setDrawerAberto(true)}
              />
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
            <div className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] flex flex-col items-center shadow-sm transition">
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
                      isAnimationActive={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>

                    <Tooltip
                      content={<CustomTooltip />}
                      wrapperStyle={{
                        pointerEvents: "none",
                        zIndex: 9999,
                      }}
                      position={{ x: undefined, y: undefined }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
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
                    <span className="text-[var(--foreground)] opacity-80">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>{" "}
          {/* 👈 FECHA grid grid-cols-4 */}
          {/* ================= POMODORO ================= */}
          <div className="bg-[var(--card)] h-full rounded-2xl p-6 border border-[var(--border)] flex flex-col items-center mb-10 shadow-sm">
            <h3 className="text-sm opacity-70 mb-4">Pomodoro</h3>

            <span className="text-5xl font-semibold mb-6">
              {formatTime(timeLeft)}
            </span>

            <div className="flex gap-3">
              <button
                onClick={() => setIsRunning(true)}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition"
                style={{
                  background: `linear-gradient(to right, var(--gradient-start), var(--gradient-end))`,
                }}
              >
                Iniciar
              </button>

              <button
                onClick={() => setIsRunning(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border)] opacity-80 hover:opacity-100 text-sm"
              >
                Pausar
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setTimeLeft(POMODORO_TIME);
                }}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] opacity-80 hover:opacity-100 text-sm transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
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
              onClick={() => setSemestreProvaSelecionado(sem)}
              className={`px-4 py-2 rounded-full text-sm transition ${
                semestreProvaSelecionado === sem
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
                : d.semestre?.trim() === semestreSelecionado,
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
                  />,
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
                  />,
                );
              }

              return linhas;
            })}
        </div>{" "}
        {/* 👈 FECHA overflow-hidden */}
        {/* 👇 BOTÃO FORA DA TABELA */}
        <div className="mt-6">
          <button
            onClick={() => setDrawerAberto(true)}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-500 transition"
          >
            <span className="text-lg">+</span>
            Nova Disciplina
          </button>
        </div>
      </div>{" "}
      {/* 👈 FECHA GRADE */}
      {/* ================= PROVAS ================= */}
      <div className="mt-20">
        <h2 className="text-xl font-semibold mb-6 tracking-wide bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] bg-clip-text text-transparent">
          PROVAS
        </h2>
        {/* ================= FILTRO SEMESTRE PROVAS ================= */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {semestres.map((sem) => (
            <button
              key={`provas-${sem}`}
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
          <div className="grid grid-cols-4 bg-zinc-900 px-4 py-3 border-b border-zinc-700 uppercase tracking-wider text-xs font-semibold">
            <div className="bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] bg-clip-text text-transparent">
              Situação
            </div>
            <div className="bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] bg-clip-text text-transparent">
              Prova
            </div>
            <div className="bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] bg-clip-text text-transparent">
              Disciplina
            </div>
            <div className="bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] bg-clip-text text-transparent">
              Data
            </div>
          </div>

          {provasFiltradas.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-4 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900/40 transition"
            >
              <div>
                <StatusBadge situacao={p.situacao} />
              </div>

              <div className="text-sm text-white">{p.titulo}</div>

              <div className="text-sm text-white">
                {getDisciplinaNome(p.disciplina_id)}
              </div>

              <div className="text-sm text-white">{formatarData(p.data)}</div>
            </div>
          ))}
        </div>

        {/* BOTÃO NOVA PROVA */}
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
      {/* ================= DRAWER ================= */}
      {drawerProvaAberto && (
        <div className="fixed inset-0 z-50 flex">
          {/* Fundo */}
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerProvaAberto(false)}
          />

          {/* Painel lateral */}
          <div className="w-[600px] bg-[#181818] border-l border-zinc-800 p-8 overflow-y-auto animate-slideIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Nova Prova</h2>

              <button
                onClick={() => setDrawerProvaAberto(false)}
                className="text-zinc-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Título
                </label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                  value={novaProva.titulo || ""}
                  onChange={(e) =>
                    setNovaProva({ ...novaProva, titulo: e.target.value })
                  }
                />
              </div>

              {/* Disciplina */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Disciplina
                </label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                  value={novaProva.disciplina_id || ""}
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
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Data</label>
                <input
                  type="date"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                  onChange={(e) =>
                    setNovaProva({ ...novaProva, data: e.target.value })
                  }
                />
              </div>

              {/* Situação */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Situação
                </label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
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
              </div>

              <button
                onClick={salvarProva}
                className="w-full mt-4 bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
              >
                Salvar Prova
              </button>
            </div>
          </div>
        </div>
      )}
      {drawerAberto && (
        <div className="fixed inset-0 z-50 flex">
          {/* Fundo escuro */}
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={fecharDrawer}
          />

          {/* Painel lateral */}
          <div className="w-[600px] bg-[#181818] border-l border-zinc-800 p-8 overflow-y-auto animate-slideIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Nova Disciplina</h2>

              <button
                onClick={fecharDrawer}
                className="text-zinc-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Nome</label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500"
                  value={novaDisciplina.nome || ""}
                  onChange={(e) =>
                    setNovaDisciplina({
                      ...novaDisciplina,
                      nome: e.target.value,
                    })
                  }
                />
              </div>

              {/* Semestre */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Semestre
                </label>
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500"
                  value={novaDisciplina.semestre || ""}
                  onChange={(e) =>
                    setNovaDisciplina({
                      ...novaDisciplina,
                      semestre: e.target.value,
                    })
                  }
                />
              </div>

              {/* Situação */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Situação
                </label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                  value={novaDisciplina.situacao}
                  onChange={(e) =>
                    setNovaDisciplina({
                      ...novaDisciplina,
                      situacao: e.target.value,
                    })
                  }
                >
                  {ALL_STATUS.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Período */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Data Início
                  </label>
                  <input
                    type="date"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                    onChange={(e) =>
                      setNovaDisciplina({
                        ...novaDisciplina,
                        data_inicio: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                    onChange={(e) =>
                      setNovaDisciplina({
                        ...novaDisciplina,
                        data_fim: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Dia 1 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Dia 1
                  </label>
                  <input
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                    onChange={(e) =>
                      setNovaDisciplina({
                        ...novaDisciplina,
                        dia_1: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Início
                  </label>
                  <input
                    type="time"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                    onChange={(e) =>
                      setNovaDisciplina({
                        ...novaDisciplina,
                        horario_1_inicio: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Fim
                  </label>
                  <input
                    type="time"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                    onChange={(e) =>
                      setNovaDisciplina({
                        ...novaDisciplina,
                        horario_1_final: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Dia 2 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Dia 2
                  </label>
                  <input
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                    onChange={(e) =>
                      setNovaDisciplina({
                        ...novaDisciplina,
                        dia_2: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Início
                  </label>
                  <input
                    type="time"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                    onChange={(e) =>
                      setNovaDisciplina({
                        ...novaDisciplina,
                        horario_2_inicio: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Fim
                  </label>
                  <input
                    type="time"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                    onChange={(e) =>
                      setNovaDisciplina({
                        ...novaDisciplina,
                        horario_2_final: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <button
                onClick={salvarDisciplina}
                className="w-full mt-4 bg-gradient-to-r from-[#34BBC0] to-[#2B50CA] text-white py-3 rounded-lg font-medium hover:opacity-90 transition"
              >
                Salvar Disciplina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  {
    /* 👈 FECHA CONTAINER PRINCIPAL */
  }

  {
    /* 👈 FECHA min-h-screen */
  }
}

/* ================= COMPONENTES ================= */

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-4xl font-semibold mt-2">{value}</p>
    </div>
  );
}

function Column({
  id,
  disciplinas,
  abrirDrawer,
}: {
  id: string;
  disciplinas: Disciplina[];
  abrirDrawer: () => void;
}) {
  const { setNodeRef } = useDroppable({ id });

  let cardColor = "var(--kanban-nao-card)";
  let badgeColor = "var(--kanban-nao-badge)";
  let dotColor = "var(--kanban-nao-dot)";

  if (id === STATUS.EM_ANDAMENTO) {
    cardColor = "var(--kanban-and-card)";
    badgeColor = "var(--kanban-and-badge)";
    dotColor = "var(--kanban-and-dot)";
  }

  if (id === STATUS.CONCLUIDO) {
    cardColor = "var(--kanban-con-card)";
    badgeColor = "var(--kanban-con-badge)";
    dotColor = "var(--kanban-con-dot)";
  }

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
        onClick={abrirDrawer}
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
      {...attributes}
      {...listeners}
      className="px-4 py-3 rounded-2xl border transition cursor-grab active:cursor-grabbing select-none shadow-sm"
      style={{
        ...style,
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
