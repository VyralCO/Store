import { Logo } from "@/components/logo";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line mt-20 py-14">
      <div className="container">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-9 mb-10">
          {/* Brand column */}
          <div>
            <div className="mb-3">
              <Logo variant="wordmark" tone="white" height={42} />
            </div>
            <p className="font-mono text-xs tracking-widest uppercase text-muted mt-3">
              O hype vira roupa
            </p>
          </div>

          {/* Loja links */}
          <div>
            <h4 className="font-mono text-xs tracking-widest uppercase text-muted mb-3.5">
              Loja
            </h4>
            <ul className="space-y-2.25">
              <li>
                <Link
                  href="/loja"
                  className="text-sm hover:text-magenta transition-colors"
                >
                  Todas as peças
                </Link>
              </li>
              <li>
                <Link
                  href="/loja"
                  className="text-sm hover:text-magenta transition-colors"
                >
                  Pretas
                </Link>
              </li>
              <li>
                <Link
                  href="/loja"
                  className="text-sm hover:text-magenta transition-colors"
                >
                  Brancas
                </Link>
              </li>
              <li>
                <Link
                  href="/personalizar"
                  className="text-sm hover:text-magenta transition-colors"
                >
                  Monte a sua
                </Link>
              </li>
            </ul>
          </div>

          {/* Ajuda links */}
          <div>
            <h4 className="font-mono text-xs tracking-widest uppercase text-muted mb-3.5">
              Ajuda
            </h4>
            <ul className="space-y-2.25">
              <li>
                <Link
                  href="/carrinho"
                  className="text-sm hover:text-magenta transition-colors"
                >
                  Minha sacola
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-magenta transition-colors"
                >
                  Tabela de medidas
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-magenta transition-colors"
                >
                  Trocas &amp; devoluções
                </a>
              </li>
            </ul>
          </div>

          {/* Sinal links */}
          <div>
            <h4 className="font-mono text-xs tracking-widest uppercase text-muted mb-3.5">
              Sinal
            </h4>
            <ul className="space-y-2.25">
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-magenta transition-colors"
                >
                  @vyral
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-magenta transition-colors"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm hover:text-magenta transition-colors"
                >
                  Newsletter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-line pt-5 flex flex-col md:flex-row justify-between items-center gap-3 font-mono text-xs tracking-wider text-muted-2">
          <span>&copy; 2026 VYRAL — O HYPE VIRA ROUPA</span>
          <span>NAVEGÁVEL EM DESENVOLVIMENTO</span>
        </div>
      </div>
    </footer>
  );
}
