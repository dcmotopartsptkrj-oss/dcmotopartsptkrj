import { useState } from "react";

interface ProductVisualProps {
  src?: string;
  alt: string;
  className?: string;
}

export default function ProductVisual({ src, alt, className = "" }: ProductVisualProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative flex h-full min-h-[220px] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-300 ${className}`}
    >
      {!failed && src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,75,31,.18),transparent_34%),linear-gradient(135deg,#efefef,#cfcfcf)] p-8 text-center">
          <span className="text-4xl font-black tracking-wider text-zinc-900">DC</span>
          <span className="mt-2 text-sm font-bold uppercase tracking-[.35em] text-ember">
            Motopart
          </span>
          <p className="mt-4 max-w-xs text-xs font-semibold uppercase tracking-widest text-zinc-500">
            {alt}
          </p>
        </div>
      )}
    </div>
  );
}
