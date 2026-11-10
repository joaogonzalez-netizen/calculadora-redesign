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
}

export const PRODUTOS_BUSCA: ProdutoBusca[] = [
  { id: 'b1', nome: 'Kit 3 Mini Vasinhos com Planta Artificial Decorativo', imagem: '🪴', precoAtual: 24.90, precoOriginal: 34.90, descontoPct: 29, vendas: 1284, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 5 },
  { id: 'b2', nome: 'Porta Pincéis e Caneta Giratório Organizador de Mesa', imagem: '🖌️', precoAtual: 39.90, vendas: 742, marketplace: 'Shopee', paisBandeira: '🇧🇷', diasNoAr: 18 },
  { id: 'b3', nome: 'Kit 2 Vasos Decorativos em Espiral Modernos', imagem: '🏺', precoAtual: 54.90, precoOriginal: 69.90, descontoPct: 21, vendas: 2109, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 64 },
  { id: 'b4', nome: '3D Led Relógio de Mesa com Efeito Ilusão de Ótica', imagem: '⏰', precoAtual: 89.90, precoOriginal: 119.90, descontoPct: 25, vendas: 561, marketplace: 'Etsy', paisBandeira: '🇧🇷', diasNoAr: 9 },
  { id: 'b5', nome: 'Organizador de Escova de Dentes com Suporte Giratório', imagem: '🪥', precoAtual: 29.90, vendas: 398, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 120 },
  { id: 'b6', nome: 'Luminária Lua 3D com Base de Madeira e Controle', imagem: '🌙', precoAtual: 74.90, precoOriginal: 99.90, descontoPct: 25, vendas: 1830, marketplace: 'Shopee', paisBandeira: '🇧🇷', diasNoAr: 27 },
  { id: 'b7', nome: 'Porta Controle Remoto Articulado para Sofá', imagem: '🎮', precoAtual: 34.90, vendas: 276, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 3 },
  { id: 'b8', nome: 'Cachepot Geométrico Facetado com Prato Embutido', imagem: '🌵', precoAtual: 44.90, precoOriginal: 59.90, descontoPct: 17, vendas: 963, marketplace: 'Etsy', paisBandeira: '🇧🇷', diasNoAr: 210 },
  { id: 'b9', nome: 'Suporte Articulado para Celular e Tablet de Mesa', imagem: '📱', precoAtual: 49.90, vendas: 1502, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 45 },
  { id: 'b10', nome: 'Porta Joias Modular com Gavetas Empilháveis', imagem: '💍', precoAtual: 64.90, precoOriginal: 84.90, descontoPct: 24, vendas: 421, marketplace: 'Shopee', paisBandeira: '🇧🇷', diasNoAr: 14 },
  { id: 'b11', nome: 'Chaveiro Personalizado com Nome em Relevo 3D', imagem: '🔑', precoAtual: 19.90, vendas: 3187, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 82 },
  { id: 'b12', nome: 'Quebra-Cabeça 3D Engrenagens Decorativo de Mesa', imagem: '⚙️', precoAtual: 59.90, precoOriginal: 79.90, descontoPct: 25, vendas: 687, marketplace: 'Etsy', paisBandeira: '🇧🇷', diasNoAr: 6 },
  { id: 'b13', nome: 'Organizador de Cabos e Carregadores para Escritório', imagem: '🔌', precoAtual: 27.90, vendas: 512, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷', diasNoAr: 150 },
  { id: 'b14', nome: 'Vaso Autoirrigável com Reservatório de Água Interno', imagem: '🌱', precoAtual: 47.90, precoOriginal: 62.90, descontoPct: 24, vendas: 1096, marketplace: 'Shopee', paisBandeira: '🇧🇷', diasNoAr: 33 },
];

/** Vitrines "Personalizáveis" (STLAI) e "Drops STLFLIX". Só o primeiro card
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
  { id: 'fx1', nome: 'Cantinho Sagrado', descricao: 'Drop 372 · altares e imagens para decorar', emoji: '⛪', metrica: '4,8 mil' },
  { id: 'fx2', nome: 'Estátuas de Luz Sagrada', descricao: 'Drop 365 · estátuas com LED embutido', emoji: '🕯️', metrica: '3,1 mil' },
  { id: 'fx3', nome: 'Modwall', descricao: 'Drop 352 · painéis modulares de parede', emoji: '🧱', metrica: '2,4 mil' },
];

export const DESTAQUES_STLFLIX: DropVitrine[] = [
  { id: 'fd1', nome: 'Santa com LED', descricao: 'Cantinho Sagrado', emoji: '🕊️', metrica: '1,2 mil' },
  { id: 'fd2', nome: 'Anjo da Guarda', descricao: 'Estátuas de Luz Sagrada', emoji: '😇', metrica: '980' },
  { id: 'fd3', nome: 'Painel Hexagonal', descricao: 'Modwall', emoji: '⬡', metrica: '870' },
  { id: 'fd4', nome: 'Oratório de Parede', descricao: 'Cantinho Sagrado', emoji: '🛐', metrica: '760' },
];
