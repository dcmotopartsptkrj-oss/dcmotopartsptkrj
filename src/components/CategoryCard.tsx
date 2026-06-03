import React from "react";
import { BatteryCharging, Bolt, CircleDot, Cog, Droplet, ShieldCheck, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Category } from "../types";

const icons: Record<string, LucideIcon> = {
  Oil: Droplet,
  Brake: ShieldCheck,
  Bolt,
  Cog,
  Circle: CircleDot,
  Battery: BatteryCharging
};

interface CategoryCardProps {
  category: Category;
  large?: boolean;
}

export default function CategoryCard({ category, large = false }: CategoryCardProps): React.JSX.Element {
  const Icon = icons[category.icon] || Cog;

  return (
    <Link
      to={`/products?category=${category.id}`}
      className={`group relative overflow-hidden rounded-2xl border border-line bg-panel p-6 transition hover:-translate-y-1 hover:border-ember/60 hover:shadow-glow ${
        large ? "min-h-[280px] sm:col-span-2" : "min-h-[160px]"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,75,31,.16),transparent_30%)] opacity-70" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <Icon className="text-peach" size={28} />
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-zinc-100 group-hover:text-peach">
            {category.name}
          </h3>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[.22em] text-zinc-500">
            {category.label}
          </p>
        </div>
      </div>
    </Link>
  );
}
