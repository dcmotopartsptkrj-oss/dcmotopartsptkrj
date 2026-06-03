import React from "react";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Product, Store } from "../types";
import { formatPrice, getStatusLabel, getWhatsAppHref } from "../utils/format";
import ProductVisual from "./ProductVisual";

interface ProductCardProps {
  product: Product;
  store: Store;
}

export default function ProductCard({ product, store }: ProductCardProps): React.JSX.Element {
  const isSoldOut = product.status === "soldout";

  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-panel transition hover:-translate-y-1 hover:border-ember/50 hover:shadow-glow">
      <Link to={`/products/${product.slug}`} className="block bg-zinc-100 p-3">
        <div className="relative h-56 overflow-hidden rounded-xl">
          <ProductVisual src={product.image} alt={product.name} />
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              isSoldOut
                ? "bg-red-100 text-red-600"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {getStatusLabel(product.status)}
          </span>
        </div>
      </Link>

      <div className="p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-peach">
          {product.category}
        </p>
        <Link
          to={`/products/${product.slug}`}
          className="mt-2 block text-base font-semibold text-zinc-100 transition group-hover:text-peach"
        >
          {product.name}
        </Link>
        <p className="mt-3 text-lg font-extrabold text-peach">
          {formatPrice(product.price)}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            to={`/products/${product.slug}`}
            className="inline-flex items-center justify-center rounded-lg border border-peach/70 px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-peach transition hover:bg-peach hover:text-night"
          >
            Lihat Detail
          </Link>
          <a
            href={getWhatsAppHref(store.whatsapp, product.name)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-peach px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-night transition hover:bg-white"
          >
            <MessageSquare size={14} />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
