import type { Product } from "@/types/product";

/**
 * CATÁLOGO INICIAL — fonte da verdade para o seed do Supabase
 * e fallback local quando o banco não está configurado.
 * Textos e preços conforme o briefing / protótipo.
 */
export const CATALOG: Product[] = [
  {
    id: "sem-paciencia",
    slug: "sem-paciencia",
    name: "SEM PACIÊNCIA",
    category: "Oversized · Preta",
    color: "preta",
    price: 119,
    oldPrice: 149,
    badge: "DROP",
    description:
      "Estampa costas full. O cão que não tá pra conversa — igual você depois de seis horas de trabalho e mais uma na academia. Oversized 240g, preta que não desbota no primeiro sol.",
    imagePath: "/assets/produtos/sem-paciencia.jpg",
  },
  {
    id: "seppuku",
    slug: "seppuku",
    name: "SEPPUKU",
    category: "Oversized · Branca",
    color: "branca",
    price: 129,
    badge: "HYPE",
    badgeCyan: true,
    description:
      "Honra, corte e postura. Guerreiro estampado em alta definição na branca 240g. Pra quem entra na arena todo dia e não conhece recuo.",
    imagePath: "/assets/produtos/seppuku.jpg",
  },
  {
    id: "bulking-bad",
    slug: "bulking-bad",
    name: "BULKING BAD",
    category: "Meme · Coleção",
    color: "meme",
    price: 109,
    badge: "MEME",
    description:
      "Química aplicada: bulking também é ciência. Tributo pesado pra quem trata dieta como laboratório e barra como fórmula. Estampa premium quadrada.",
    imagePath: "/assets/produtos/bulking-bad.jpg",
  },
  {
    id: "estilo-heranca",
    slug: "estilo-heranca",
    name: "ESTILO NÃO É TENDÊNCIA",
    category: "Oversized · Branca",
    color: "branca",
    price: 119,
    description:
      "Moto clássica e tipografia invadindo a estampa. Estilo não segue timeline — vem de trás, é herança. Branca oversized 240g, caimento largo.",
    imagePath: "/assets/produtos/estilo-heranca.jpg",
  },
  {
    id: "original-moda",
    slug: "original-moda",
    name: "O ORIGINAL NUNCA SAI DE MODA",
    category: "Oversized · Preta",
    color: "preta",
    price: 119,
    description:
      "Fusca, textura e atitude. O que é raiz nunca sai de linha. Clássico é clássico. Preta oversized 240g pra quem carrega a origem.",
    imagePath: "/assets/produtos/original-moda.jpg",
  },
];
