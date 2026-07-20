import { ReactNode } from "react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "cyan";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-mono font-bold text-xs tracking-widest uppercase border-0 rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed";

  const variantClassMap = {
    primary: "px-6.5 py-3.75 bg-magenta text-white hover:shadow-glow-m hover:-translate-y-0.5 active:translate-y-0 focus:ring-cyan focus:ring-offset-void",
    ghost: "px-6.5 py-3.75 bg-transparent text-white border border-line-2 hover:border-cyan hover:shadow-glow-c focus:ring-cyan focus:ring-offset-void",
    cyan: "px-6.5 py-3.75 bg-cyan text-[#04141a] hover:shadow-glow-c focus:ring-cyan focus:ring-offset-void",
  };

  const primaryClipPath =
    variant === "primary"
      ? { clipPath: "polygon(0 0, 100% 0, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }
      : {};

  return (
    <button
      className={`${baseStyles} ${variantClassMap[variant]} ${className}`}
      style={primaryClipPath}
      disabled={disabled}
      {...props}
    />
  );
}
