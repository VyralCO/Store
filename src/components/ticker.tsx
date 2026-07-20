const TICKER_ITEMS = [
  "Drop novo toda semana",
  "Frete grátis acima de R$249",
  "Tecido premium 240g",
  "Oversized de verdade",
  "Meme vira roupa em 48h",
  "Estampa que não desbota",
];

/**
 * Ticker horizontal contínuo. Duplica os itens para loop perfeito.
 * Animação desligada em prefers-reduced-motion (globals.css).
 */
export function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}
