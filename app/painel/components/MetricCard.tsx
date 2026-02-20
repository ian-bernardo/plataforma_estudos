type MetricCardProps = {
  title: string;
  value: number;
};

export function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-4xl font-semibold mt-2">{value}</p>
    </div>
  );
}
