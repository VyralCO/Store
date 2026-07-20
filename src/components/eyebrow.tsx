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
  return (
    <span
      className={`eyebrow ${tone === "live" ? "tag-live" : ""} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
