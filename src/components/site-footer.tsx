import { Logo } from "@/components/logo";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          {/* Marca */}
          <div>
            <div className="big">
              <Logo variant="wordmark" tone="white" height={42} />
            </div>
            <div className="slog">O hype vira roupa</div>
          </div>

          {/* Loja */}
          <div>
            <h4>Loja</h4>
            <ul>
              <li>
                <Link href="/loja">Todas as peças</Link>
              </li>
              <li>
                <Link href="/loja">Pretas</Link>
              </li>
              <li>
                <Link href="/loja">Brancas</Link>
              </li>
              <li>
                <Link href="/personalizar">Monte a sua</Link>
              </li>
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4>Ajuda</h4>
            <ul>
              <li>
                <Link href="/carrinho">Minha sacola</Link>
              </li>
              <li>
                <a>Tabela de medidas</a>
              </li>
              <li>
                <a>Trocas &amp; devoluções</a>
              </li>
            </ul>
          </div>

          {/* Sinal */}
          <div>
            <h4>Sinal</h4>
            <ul>
              <li>
                <a>@vyral</a>
              </li>
              <li>
                <a>TikTok</a>
              </li>
              <li>
                <a>Newsletter</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          <span>&copy; 2026 VYRAL &mdash; O HYPE VIRA ROUPA</span>
          <span>O HYPE VIRA ROUPA</span>
        </div>
      </div>
    </footer>
  );
}
