type PomodoroCardProps = {
  timeLabel: string;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
};

export function PomodoroCard({
  timeLabel,
  onStart,
  onPause,
  onReset,
}: PomodoroCardProps) {
  return (
    <div className="bg-[var(--card)] h-full rounded-2xl p-6 border border-[var(--border)] flex flex-col items-center mb-10 shadow-sm">
      <h3 className="text-sm opacity-70 mb-4">Pomodoro</h3>
      <span className="text-5xl font-semibold mb-6">{timeLabel}</span>

      <div className="flex gap-3">
        <button
          onClick={onStart}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition"
          style={{
            background:
              "linear-gradient(to right, var(--gradient-start), var(--gradient-end))",
          }}
        >
          Iniciar
        </button>

        <button
          onClick={onPause}
          className="px-4 py-2 rounded-lg border border-[var(--border)] opacity-80 hover:opacity-100 text-sm"
        >
          Pausar
        </button>

        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] opacity-80 hover:opacity-100 text-sm transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
