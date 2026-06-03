interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="mb-3 text-xs font-extrabold uppercase tracking-[.28em] text-ember">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-100 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm leading-7 text-muted sm:text-base">{description}</p>
      )}
    </div>
  );
}
