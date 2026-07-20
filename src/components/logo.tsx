interface LogoProps {
  variant?: "wordmark" | "lockup";
  tone?: "white" | "black";
  height?: number;
  className?: string;
}

export function Logo({
  variant = "wordmark",
  tone = "white",
  height = 84,
  className = "",
}: LogoProps) {
  const logoPath = variant === "wordmark" 
    ? `/assets/logo/vyral-wordmark-${tone}.svg`
    : `/assets/logo/vyral-logo-lockup-${tone}.svg`;

  return (
    <img
      src={logoPath}
      alt="VYRAL — O Hype Vira Roupa"
      style={{
        height: `${height}px`,
        width: "auto",
        display: "block",
      }}
      className={className}
    />
  );
}
