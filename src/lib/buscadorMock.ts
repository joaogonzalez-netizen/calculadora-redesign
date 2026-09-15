// Mock da tela Buscador de Produtos ("Product Finder"). Sem backend: lista
// estática de produtos 3D em alta, seguindo o mesmo padrão de produtosMock.ts.
// Não há convenção de foto real nos mocks existentes (produtosMock.ts guarda
// só a contagem de imagens) — aqui usamos um emoji como placeholder visual
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
}

export const PRODUTOS_BUSCA: ProdutoBusca[] = [
  { id: 'b1', nome: 'Kit 3 Mini Vasinhos com Planta Artificial Decorativo', imagem: '🪴', precoAtual: 24.90, precoOriginal: 34.90, descontoPct: 29, vendas: 1284, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷' },
  { id: 'b2', nome: 'Porta Pincéis e Caneta Giratório Organizador de Mesa', imagem: '🖌️', precoAtual: 39.90, vendas: 742, marketplace: 'Shopee', paisBandeira: '🇧🇷' },
  { id: 'b3', nome: 'Kit 2 Vasos Decorativos em Espiral Modernos', imagem: '🏺', precoAtual: 54.90, precoOriginal: 69.90, descontoPct: 21, vendas: 2109, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷' },
  { id: 'b4', nome: '3D Led Relógio de Mesa com Efeito Ilusão de Ótica', imagem: '⏰', precoAtual: 89.90, precoOriginal: 119.90, descontoPct: 25, vendas: 561, marketplace: 'Etsy', paisBandeira: '🇧🇷' },
  { id: 'b5', nome: 'Organizador de Escova de Dentes com Suporte Giratório', imagem: '🪥', precoAtual: 29.90, vendas: 398, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷' },
  { id: 'b6', nome: 'Luminária Lua 3D com Base de Madeira e Controle', imagem: '🌙', precoAtual: 74.90, precoOriginal: 99.90, descontoPct: 25, vendas: 1830, marketplace: 'Shopee', paisBandeira: '🇧🇷' },
  { id: 'b7', nome: 'Porta Controle Remoto Articulado para Sofá', imagem: '🎮', precoAtual: 34.90, vendas: 276, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷' },
  { id: 'b8', nome: 'Cachepot Geométrico Facetado com Prato Embutido', imagem: '🌵', precoAtual: 44.90, precoOriginal: 59.90, descontoPct: 17, vendas: 963, marketplace: 'Etsy', paisBandeira: '🇧🇷' },
  { id: 'b9', nome: 'Suporte Articulado para Celular e Tablet de Mesa', imagem: '📱', precoAtual: 49.90, vendas: 1502, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷' },
  { id: 'b10', nome: 'Porta Joias Modular com Gavetas Empilháveis', imagem: '💍', precoAtual: 64.90, precoOriginal: 84.90, descontoPct: 24, vendas: 421, marketplace: 'Shopee', paisBandeira: '🇧🇷' },
  { id: 'b11', nome: 'Chaveiro Personalizado com Nome em Relevo 3D', imagem: '🔑', precoAtual: 19.90, vendas: 3187, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷' },
  { id: 'b12', nome: 'Quebra-Cabeça 3D Engrenagens Decorativo de Mesa', imagem: '⚙️', precoAtual: 59.90, precoOriginal: 79.90, descontoPct: 25, vendas: 687, marketplace: 'Etsy', paisBandeira: '🇧🇷' },
  { id: 'b13', nome: 'Organizador de Cabos e Carregadores para Escritório', imagem: '🔌', precoAtual: 27.90, vendas: 512, marketplace: 'Mercado Livre', paisBandeira: '🇧🇷' },
  { id: 'b14', nome: 'Vaso Autoirrigável com Reservatório de Água Interno', imagem: '🌱', precoAtual: 47.90, precoOriginal: 62.90, descontoPct: 24, vendas: 1096, marketplace: 'Shopee', paisBandeira: '🇧🇷' },
];
