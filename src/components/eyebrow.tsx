import { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  tone?: "default" | "live";
  className?: string;
}

export function Eyebrow({
  children,
  tone = "default",
  className = "",
}: EyebrowProps) {
  const color = tone === "live" ? "text-magenta" : "text-cyan";

  return (
    <div
      className={`font-mono text-xs tracking-widest uppercase inline-flex items-center gap-2.25 ${color} ${className}`}
    >
      <span
        className={`w-5.5 h-px ${tone === "live" ? "bg-magenta" : "bg-cyan"} opacity-70`}
      />
      {children}
    </div>
  );
}
