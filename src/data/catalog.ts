import type { Product } from "@/types/product";

/**
 * CATÁLOGO INICIAL — fallback local quando o banco não está configurado.
 */
export const CATALOG: Product[] = [
  {
    id: "sem-paciencia",
    slug: "sem-paciencia",
    name: "SEM PACIÊNCIA",
    categoryId: null,
    categoryName: "Streetwear",
    price: 119,
    oldPrice: 149,
    badge: "DROP",
    description:
      "Estampa costas full. O cão que não tá pra conversa — igual você depois de seis horas de trabalho e mais uma na academia. Oversized 240g, preta que não desbota no primeiro sol.",
    availableBlack: true,
    availableWhite: false,
    mockupBlackPath: "/assets/produtos/sem-paciencia.jpg",
  },
  {
    id: "seppuku",
    slug: "seppuku",
    name: "SEPPUKU",
    categoryId: null,
    categoryName: "Anime",
    price: 129,
    badge: "HYPE",
    badgeCyan: true,
    description:
      "Honra, corte e postura. Guerreiro estampado em alta definição na branca 240g. Pra quem entra na arena todo dia e não conhece recuo.",
    availableBlack: false,
    availableWhite: true,
    mockupWhitePath: "/assets/produtos/seppuku.jpg",
  },
  {
    id: "bulking-bad",
    slug: "bulking-bad",
    name: "BULKING BAD",
    categoryId: null,
    categoryName: "Meme",
    price: 109,
    badge: "MEME",
    description:
      "Química aplicada: bulking também é ciência. Tributo pesado pra quem trata dieta como laboratório e barra como fórmula. Estampa premium quadrada.",
    availableBlack: true,
    availableWhite: false,
    mockupBlackPath: "/assets/produtos/bulking-bad.jpg",
  },
  {
    id: "estilo-heranca",
    slug: "estilo-heranca",
    name: "ESTILO NÃO É TENDÊNCIA",
    categoryId: null,
    categoryName: "Streetwear",
    price: 119,
    description:
      "Moto clássica e tipografia invadindo a estampa. Estilo não segue timeline — vem de trás, é herança. Branca oversized 240g, caimento largo.",
    availableBlack: false,
    availableWhite: true,
    mockupWhitePath: "/assets/produtos/estilo-heranca.jpg",
  },
  {
    id: "original-moda",
    slug: "original-moda",
    name: "O ORIGINAL NUNCA SAI DE MODA",
    categoryId: null,
    categoryName: "Streetwear",
    price: 119,
    description:
      "Fusca, textura e atitude. O que é raiz nunca sai de linha. Clássico é clássico. Preta oversized 240g pra quem carrega a origem.",
    availableBlack: true,
    availableWhite: false,
    mockupBlackPath: "/assets/produtos/original-moda.jpg",
  },
];
