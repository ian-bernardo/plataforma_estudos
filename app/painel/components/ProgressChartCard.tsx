import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type ChartItem = {
  name: string;
  value: number;
  color: string;
};

type ProgressChartCardProps = {
  total: number;
  chartData: ChartItem[];
};

function CustomTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartItem }>;
  total: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const item = payload[0].payload;
  const percentual = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";

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

export function ProgressChartCard({
  total,
  chartData,
}: ProgressChartCardProps) {
  return (
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
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              content={<CustomTooltip total={total} />}
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
  );
}
