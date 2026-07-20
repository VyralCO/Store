/**
 * Logo VYRAL do hero com efeito glitch.
 * 3 camadas do wordmark (branca base + magenta + cyan) usando o SVG como
 * máscara. As camadas m/c animam com mix-blend screen; desligadas em
 * prefers-reduced-motion (tratado no globals.css).
 * Server Component — animação é puro CSS, sem interação.
 */
export function HeroLogo() {
  return (
    <div className="hero-logo" aria-label="VYRAL">
      <span className="layer base" />
      <span className="layer m" aria-hidden="true" />
      <span className="layer c" aria-hidden="true" />
    </div>
  );
}
