import foto1 from '../assets/buscador/produtos/p1.jpg';
import foto2 from '../assets/buscador/produtos/p2.jpg';
import foto3 from '../assets/buscador/produtos/p3.jpg';
import foto4 from '../assets/buscador/produtos/p4.jpg';
import foto5 from '../assets/buscador/produtos/p5.jpg';
import foto6 from '../assets/buscador/produtos/p6.jpg';
import foto7 from '../assets/buscador/produtos/p7.jpg';
import foto8 from '../assets/buscador/produtos/p8.jpg';
import foto9 from '../assets/buscador/produtos/p9.jpg';
import foto10 from '../assets/buscador/produtos/p10.jpg';
import foto11 from '../assets/buscador/produtos/p11.jpg';
import foto12 from '../assets/buscador/produtos/p12.jpg';
import foto13 from '../assets/buscador/produtos/p13.jpg';
import foto14 from '../assets/buscador/produtos/p14.jpg';
import foto15 from '../assets/buscador/produtos/p15.jpg';
// Mock da tela Buscador de Produtos ("Product Finder"). Sem backend: lista
// estática de produtos 3D em alta, seguindo o mesmo padrão de produtosMock.ts.
// Não há convenção de foto real nos mocks existentes (produtosMock.ts guarda
// só a contagem de imagens), aqui usamos um emoji como placeholder visual
// do card, em vez de introduzir URLs externas.

export interface ProdutoBusca {
  id: string;
  nome: string;
  imagem: string;
  precoAtual: number;
  precoOriginal?: number;
  descontoPct?: number;
  vendas: number;
  marketplace: 'Mercado Livre' | 'Etsy' | 'Shopee';
  paisBandeira: string;
  /** Há quantos dias o anúncio foi publicado. */
  diasNoAr: number;
  /** Material de impressão exibido no chip do card. */
  material?: string;
  /** Margem estimada (%) sobre o preço, já descontando material, energia e taxa do marketplace. */
  margemPct?: number;
  /** Foto do produto; sem ela o card cai no emoji. */
  foto?: string;
}

export const PRODUTOS_BUSCA: ProdutoBusca[] = [
  { id: 'b1', nome: 'Kit 3 Mini Vasinhos com Planta Artificial Decorativo', imagem: '🪴', foto: foto1, precoAtual: 24.90, precoOriginal: 34.90, descontoPct: 29, vendas: 1284, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 5 },
  { id: 'b2', nome: 'Porta Pincéis e Caneta Giratório Organizador de Mesa', imagem: '🖌️', foto: foto3, precoAtual: 39.90, vendas: 742, marketplace: 'Shopee', paisBandeira: '🇧🇷', diasNoAr: 18 },
  { id: 'b3', nome: 'Kit 2 Vasos Decorativos em Espiral Modernos', imagem: '🏺', foto: foto4, precoAtual: 54.90, precoOriginal: 69.90, descontoPct: 21, vendas: 2109, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 64 },
  { id: 'b4', nome: 'Kit 4 Mini Vasinhos Decorativos com Planta Artificial', imagem: '⏰', foto: foto2, precoAtual: 89.90, precoOriginal: 119.90, descontoPct: 25, vendas: 561, marketplace: 'Etsy', paisBandeira: '🇧🇷', diasNoAr: 9 },
  { id: 'b5', nome: 'Trio de Vasos Cachepot Decorativo Riscado 3 Unidades', imagem: '🪥', foto: foto5, precoAtual: 29.90, vendas: 398, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 120 },
  { id: 'b6', nome: 'Luminária Lanterna Mini Estante Library com LED', imagem: '🌙', foto: foto13, precoAtual: 74.90, precoOriginal: 99.90, descontoPct: 25, vendas: 1830, marketplace: 'Shopee', paisBandeira: '🇧🇷', diasNoAr: 27 },
  { id: 'b7', nome: 'Estátua Sentada Grim Reaper para Estante e Prateleira', imagem: '🎮', foto: foto9, precoAtual: 34.90, vendas: 276, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 3 },
  { id: 'b8', nome: 'Vaso Cachepot Mini Horta Lápides Cemitério', imagem: '🌵', foto: foto14, precoAtual: 44.90, precoOriginal: 59.90, descontoPct: 17, vendas: 963, marketplace: 'Etsy', paisBandeira: '🇧🇷', diasNoAr: 210 },
  { id: 'b9', nome: 'Porta Caneta e Lápis Divertido para Escritório', imagem: '📱', foto: foto15, precoAtual: 49.90, vendas: 1502, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 45 },
  { id: 'b10', nome: 'Estante Caixão Gótica para Porta Joias e Decoração', imagem: '💍', foto: foto12, precoAtual: 64.90, precoOriginal: 84.90, descontoPct: 24, vendas: 421, marketplace: 'Shopee', paisBandeira: '🇧🇷', diasNoAr: 14 },
  { id: 'b11', nome: 'Lesma Articulada Fidget Brinquedo 3D Colorido', imagem: '🔑', foto: foto6, precoAtual: 19.90, vendas: 3187, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 82 },
  { id: 'b12', nome: 'Miniaturas de Taverna para RPG e Jogos de Mesa', imagem: '⚙️', foto: foto8, precoAtual: 59.90, precoOriginal: 79.90, descontoPct: 25, vendas: 687, marketplace: 'Etsy', paisBandeira: '🇧🇷', diasNoAr: 6 },
  { id: 'b13', nome: 'Copo Flutuante de Café Derramando Decorativo', imagem: '🔌', foto: foto11, precoAtual: 27.90, vendas: 512, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 150 },
  { id: 'b14', nome: 'Concha Mística Roxa Decoração de Mesa', imagem: '🌱', foto: foto7, precoAtual: 47.90, precoOriginal: 62.90, descontoPct: 24, vendas: 1096, marketplace: 'Shopee', paisBandeira: '🇧🇷', diasNoAr: 33 },
  { id: 'b15', nome: 'Besta Medieval Porta Dados com Nome Personalizado', imagem: '🏹', foto: foto10, precoAtual: 32.90, precoOriginal: 44.90, descontoPct: 27, vendas: 640, marketplace: 'Etsy', paisBandeira: '🇧🇷', diasNoAr: 33 },
];

/** Vitrines "Personalizáveis" (STLAI) e "Modelos STLFLIX". Só o primeiro card
 * tem a imagem real do design; os demais usam emoji sobre fundo de marca. */
export interface DropVitrine {
  id: string;
  nome: string;
  descricao: string;
  imagem?: string;
  emoji: string;
  /** Vendas no nicho (STLAI) ou downloads (STLFLIX), já formatado. */
  metrica: string;
}

export const DROPS_STLAI: DropVitrine[] = [
  { id: 'ai1', nome: 'Enfeites da Família', descricao: 'Fotos viram caricatura · trem, guirlanda, pet', emoji: '🎄', metrica: '1,1 mil' },
  { id: 'ai2', nome: 'Chaveiro com Nome', descricao: 'Nome em relevo · fontes e cores à escolha', emoji: '🔑', metrica: '3,2 mil' },
  { id: 'ai3', nome: 'Luminária com Foto', descricao: 'Litofania a partir de qualquer foto', emoji: '💡', metrica: '860' },
  { id: 'ai4', nome: 'Topo de Bolo Personalizado', descricao: 'Nome, idade e tema da festa', emoji: '🎂', metrica: '540' },
];

export const DROPS_STLFLIX: DropVitrine[] = [
  { id: 'fx1', nome: 'Cantinho Sagrado', descricao: 'Modelo 372 · altares e imagens para decorar', emoji: '⛪', metrica: '4,8 mil' },
  { id: 'fx2', nome: 'Estátuas de Luz Sagrada', descricao: 'Modelo 365 · estátuas com LED embutido', emoji: '🕯️', metrica: '3,1 mil' },
  { id: 'fx3', nome: 'Modwall', descricao: 'Modelo 352 · painéis modulares de parede', emoji: '🧱', metrica: '2,4 mil' },
];

export const DESTAQUES_STLFLIX: DropVitrine[] = [
  { id: 'fd1', nome: 'Santa com LED', descricao: 'Cantinho Sagrado', emoji: '🕊️', metrica: '1,2 mil' },
  { id: 'fd2', nome: 'Anjo da Guarda', descricao: 'Estátuas de Luz Sagrada', emoji: '😇', metrica: '980' },
  { id: 'fd3', nome: 'Painel Hexagonal', descricao: 'Modwall', emoji: '⬡', metrica: '870' },
  { id: 'fd4', nome: 'Oratório de Parede', descricao: 'Cantinho Sagrado', emoji: '🛐', metrica: '760' },
];

/** Lista maior só pra exercitar a paginação no mock (a produção devolve page/limit/total).
 * Repete os produtos-base com ids únicos, vendas decrescentes e anúncios mais antigos. */
/** Margem estimada por produto-base (mock); alterna faixas alta, média e baixa. */
const MARGENS_MOCK = [44, 31, 52, 18, 36, 27, 61, 9, 48, 23, 39, 57, 14, 33, 46];

export function lucroEstimado(p: ProdutoBusca): number {
  return Math.round(p.precoAtual * ((p.margemPct ?? 0) / 100) * 100) / 100;
}

const MATERIAIS_MOCK = ['Plástico', 'PLA', 'PETG', 'Resina'];

export const PRODUTOS_BUSCA_LISTA: ProdutoBusca[] = Array.from({ length: 120 }, (_, i) => {
  const base = PRODUTOS_BUSCA[i % PRODUTOS_BUSCA.length];
  const material = MATERIAIS_MOCK[i % MATERIAIS_MOCK.length];
  const margemBase = MARGENS_MOCK[i % MARGENS_MOCK.length];
  // As repetições do mock variam um pouco a margem pra a ordenação não empilhar cópias idênticas.
  const margemPct = i < PRODUTOS_BUSCA.length ? margemBase : Math.min(70, Math.max(5, margemBase + ((i * 7) % 17) - 8));
  if (i < PRODUTOS_BUSCA.length) return { ...base, material, margemPct };
  return { ...base, material, margemPct, id: `${base.id}-${i}`, vendas: Math.max(10, base.vendas - i * 7), diasNoAr: base.diasNoAr + i };
});
