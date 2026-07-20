import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "cyan";
  block?: boolean;
  children: ReactNode;
}

/**
 * Button — replica exata do .btn do protótipo.
 * variant "primary" (magenta + clip-path) | "ghost" (borda inset) | "cyan"
 */
export function Button({
  variant = "primary",
  block = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "ghost" ? "ghost" : variant === "cyan" ? "cyan" : "";

  return (
    <button
      className={`btn ${variantClass} ${block ? "block" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
