import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "light" | "danger";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function Button({
  children,
  to,
  href,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false
}: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center rounded-xl px-6 py-4 text-xs font-black uppercase tracking-wider transition duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-ember text-white hover:bg-ember-dark hover:shadow-glow",
    secondary: "border border-line bg-panel text-zinc-100 hover:border-ember hover:text-white",
    light: "bg-peach text-night hover:bg-white",
    danger: "bg-danger text-white hover:bg-red-600"
  };

  const combinedStyle = `${baseStyle} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedStyle}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={combinedStyle}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={combinedStyle}>
      {children}
    </button>
  );
}
