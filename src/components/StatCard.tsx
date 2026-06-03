import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  note?: string;
  icon?: ReactNode;
}

export default function StatCard({ label, value, note, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.22em] text-zinc-400 font-sans">
            {label}
          </p>
          <h3 className="mt-3 text-4xl font-black text-ember font-sans">{value}</h3>
          {note && <p className="mt-3 text-xs font-bold text-zinc-500">{note}</p>}
        </div>
        {icon && (
          <div className="rounded-xl bg-peach p-3 text-ember-dark">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
