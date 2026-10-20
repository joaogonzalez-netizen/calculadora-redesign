// Mock da tela Produtos, fiel ao Figma (node 21941:37727). Sem backend: tudo
// estático ou derivado do que já existe no localStorage (histórico de cálculos).

import { PRODUTO_VINCULOS_KEY, readJson } from './storage';
import type { Idioma } from './i18n';

export type ProdutoStatus = 'Ativo' | 'Pausado' | 'Esgotado';
export type EstoqueSituacao = 'Saudável' | 'Estoque baixo' | 'Sem estoque';

export interface Variacao {
  nome: string;
  cor: string;
  sku: string;
  preco: string;
  estoque: number;
  vendidos: number;
  participacaoPct: number;
}

export interface Produto {
  id: string;
  nome: string;
  sku: string;
  imagensQtd: number;
  marketplace: 'Mercado Livre' | 'Shopee' | 'Etsy' | 'TikTok Shop';
  status: ProdutoStatus;
  estoque: number;
  estoqueSituacao: EstoqueSituacao;
  vendidos: number;
  preco: string;
  categoria: string;
  categoriaSub: string;
  controladoCatalogoMl: boolean;
  inventarioMl: boolean;
  linkPublico: boolean;
  variacoes: Variacao[];
}

export const PRODUTOS_KPIS = {
  vendasAcumuladas: '4819',
  produtosAtivos: { valor: '176', sub: 'de 190 publicados no total' },
  emEstoque: { valor: '128', sub: 'somando as variações' },
  estoqueBaixo: { valor: '23', sub: 'repor antes de zerar' },
  semEstoque: { valor: '6', sub: 'ação imediata necessária' },
};

function variacoesPadrao(preco: string): Variacao[] {
  return [
    { nome: 'Preto', cor: '#14181a', sku: '#175928394759', preco, estoque: 23, vendidos: 180, participacaoPct: 58 },
    { nome: 'Branco', cor: '#e7e9e8', sku: '#175928394760', preco, estoque: 24, vendidos: 132, participacaoPct: 42 },
  ];
}

export const PRODUTOS: Produto[] = [
  { id: 'p1', nome: 'Letreiro decorativo resina 12cm', sku: 'MLB-2093012345678901', imagensQtd: 6, marketplace: 'Mercado Livre', status: 'Ativo', estoque: 47, estoqueSituacao: 'Saudável', vendidos: 32, preco: 'R$ 269,90', categoria: 'Suportes', categoriaSub: 'Acessórios para Celular', controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesPadrao('R$ 39,90') },
  { id: 'p2', nome: 'Letreiro decorativo PETG 15cm', sku: 'MLB-2093012345678902', imagensQtd: 4, marketplace: 'Shopee', status: 'Ativo', estoque: 24, estoqueSituacao: 'Saudável', vendidos: 12, preco: 'R$ 269,90', categoria: 'Decoração', categoriaSub: 'Objetos decorativos', controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesPadrao('R$ 39,90') },
  { id: 'p3', nome: 'Letreiro decorativo mini 8cm', sku: 'MLB-2093012345678903', imagensQtd: 5, marketplace: 'Mercado Livre', status: 'Pausado', estoque: 32, estoqueSituacao: 'Saudável', vendidos: 4, preco: 'R$ 269,90', categoria: 'Decoração', categoriaSub: 'Objetos decorativos', controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesPadrao('R$ 39,90') },
  { id: 'p4', nome: 'Suporte de celular articulado', sku: 'MLB-2093012345678904', imagensQtd: 3, marketplace: 'Mercado Livre', status: 'Esgotado', estoque: 12, estoqueSituacao: 'Estoque baixo', vendidos: 24, preco: 'R$ 269,90', categoria: 'Suportes', categoriaSub: 'Acessórios para Celular', controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesPadrao('R$ 39,90') },
  { id: 'p5', nome: 'Vaso geométrico facetado', sku: 'MLB-2093012345678905', imagensQtd: 6, marketplace: 'Shopee', status: 'Ativo', estoque: 39, estoqueSituacao: 'Saudável', vendidos: 89, preco: 'R$ 269,90', categoria: 'Decoração', categoriaSub: 'Vasos e cachepots', controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesPadrao('R$ 39,90') },
  { id: 'p6', nome: 'Dragão articulado 20cm', sku: 'MLB-2093012345678906', imagensQtd: 8, marketplace: 'Mercado Livre', status: 'Esgotado', estoque: 0, estoqueSituacao: 'Sem estoque', vendidos: 43, preco: 'R$ 269,90', categoria: 'Brinquedos', categoriaSub: 'Miniaturas articuladas', controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesPadrao('R$ 39,90') },
  { id: 'p7', nome: 'Organizador de mesa modular', sku: 'MLB-2093012345678907', imagensQtd: 4, marketplace: 'Mercado Livre', status: 'Ativo', estoque: 47, estoqueSituacao: 'Saudável', vendidos: 33, preco: 'R$ 269,90', categoria: 'Organização', categoriaSub: 'Mesa e escritório', controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesPadrao('R$ 39,90') },
  { id: 'p8', nome: 'Porta-chaves parede minimalista', sku: 'MLB-2093012345678908', imagensQtd: 5, marketplace: 'Shopee', status: 'Ativo', estoque: 12, estoqueSituacao: 'Saudável', vendidos: 43, preco: 'R$ 269,90', categoria: 'Organização', categoriaSub: 'Entrada e corredor', controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesPadrao('R$ 39,90') },
  { id: 'p9', nome: 'Luminária geométrica de mesa', sku: 'MLB-2093012345678909', imagensQtd: 6, marketplace: 'Mercado Livre', status: 'Ativo', estoque: 40, estoqueSituacao: 'Saudável', vendidos: 20, preco: 'R$ 269,90', categoria: 'Decoração', categoriaSub: 'Iluminação', controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesPadrao('R$ 39,90') },
  { id: 'p10', nome: 'Suporte para fones de ouvido', sku: 'MLB-2093012345678910', imagensQtd: 4, marketplace: 'Mercado Livre', status: 'Ativo', estoque: 80, estoqueSituacao: 'Saudável', vendidos: 40, preco: 'R$ 269,90', categoria: 'Suportes', categoriaSub: 'Acessórios de mesa', controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesPadrao('R$ 39,90') },
];

export const PERIODOS = ['Hoje', 'Ontem', 'Últimos 7 dias', 'Últimos 30 dias', 'Maio 2026', 'Abril 2026', 'Últimos 3 meses', 'Este ano', 'Personalizado'];
export const ORDENS = ['Mais recentes', 'Mais antigos', 'Título A-Z', 'Título Z-A'];

/** Quantos produtos ainda não têm um cálculo de custo vinculado (nem manual, nem
 * da Calculadora), usado no DRE do Painel pra sinalizar que "Custo de produção"
 * pode estar subestimado, já que produtos sem vínculo entrariam com custo zero. */
export function contarProdutosSemVinculo(): { semVinculo: number; total: number } {
  const vinculos = readJson<Record<string, unknown>>(PRODUTO_VINCULOS_KEY, {});
  const semVinculo = PRODUTOS.filter((p) => !vinculos[p.id]).length;
  return { semVinculo, total: PRODUTOS.length };
}

// ---------------------------------------------------------------------------
// Variante EN (mercado americano): Etsy e TikTok Shop, preços em dólar,
// produtos e categorias em inglês. Mesmos ids (p1..p10) do mock PT, então os
// vínculos de custo salvos continuam valendo nos dois idiomas. Status e
// situação de estoque seguem com as chaves em português (a tela traduz).
// ---------------------------------------------------------------------------

export const PRODUTOS_KPIS_EN = {
  vendasAcumuladas: '4,819',
  produtosAtivos: { valor: '176', sub: 'out of 190 listed in total' },
  emEstoque: { valor: '128', sub: 'across all variations' },
  estoqueBaixo: { valor: '23', sub: 'restock before it runs out' },
  semEstoque: { valor: '6', sub: 'needs action now' },
};

function variacoesEn(preco: string, sku: string): Variacao[] {
  return [
    { nome: 'Black', cor: '#14181a', sku: sku + '-BLK', preco, estoque: 23, vendidos: 180, participacaoPct: 58 },
    { nome: 'White', cor: '#e7e9e8', sku: sku + '-WHT', preco, estoque: 24, vendidos: 132, participacaoPct: 42 },
  ];
}

function produtoEn(p: Omit<Produto, 'controladoCatalogoMl' | 'inventarioMl' | 'linkPublico' | 'variacoes'>): Produto {
  return { ...p, controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesEn(p.preco, p.sku) };
}

export const PRODUTOS_EN: Produto[] = [
  produtoEn({ id: 'p1', nome: 'Resin decorative sign 5"', sku: 'ETSY-1587234901', imagensQtd: 6, marketplace: 'Etsy', status: 'Ativo', estoque: 47, estoqueSituacao: 'Saudável', vendidos: 32, preco: '$19.99', categoria: 'Home & Living', categoriaSub: 'Wall decor' }),
  produtoEn({ id: 'p2', nome: 'PETG decorative sign 6"', sku: 'TTS-1729384756102', imagensQtd: 4, marketplace: 'TikTok Shop', status: 'Ativo', estoque: 24, estoqueSituacao: 'Saudável', vendidos: 12, preco: '$22.99', categoria: 'Home Decor', categoriaSub: 'Decorative accents' }),
  produtoEn({ id: 'p3', nome: 'Mini decorative sign 3"', sku: 'ETSY-1587234903', imagensQtd: 5, marketplace: 'Etsy', status: 'Pausado', estoque: 32, estoqueSituacao: 'Saudável', vendidos: 4, preco: '$12.99', categoria: 'Home & Living', categoriaSub: 'Wall decor' }),
  produtoEn({ id: 'p4', nome: 'Articulated phone stand', sku: 'ETSY-1587234904', imagensQtd: 3, marketplace: 'Etsy', status: 'Esgotado', estoque: 12, estoqueSituacao: 'Estoque baixo', vendidos: 24, preco: '$12.99', categoria: 'Electronics & Accessories', categoriaSub: 'Phone stands' }),
  produtoEn({ id: 'p5', nome: 'Geometric faceted planter', sku: 'TTS-1729384756105', imagensQtd: 6, marketplace: 'TikTok Shop', status: 'Ativo', estoque: 39, estoqueSituacao: 'Saudável', vendidos: 89, preco: '$18.99', categoria: 'Home Decor', categoriaSub: 'Planters & pots' }),
  produtoEn({ id: 'p6', nome: 'Articulated dragon 8"', sku: 'ETSY-1587234906', imagensQtd: 8, marketplace: 'Etsy', status: 'Esgotado', estoque: 0, estoqueSituacao: 'Sem estoque', vendidos: 43, preco: '$24.99', categoria: 'Toys & Games', categoriaSub: 'Articulated figures' }),
  produtoEn({ id: 'p7', nome: 'Modular desk organizer', sku: 'ETSY-1587234907', imagensQtd: 4, marketplace: 'Etsy', status: 'Ativo', estoque: 47, estoqueSituacao: 'Saudável', vendidos: 33, preco: '$22.99', categoria: 'Office', categoriaSub: 'Desk organizers' }),
  produtoEn({ id: 'p8', nome: 'Minimalist wall key holder', sku: 'TTS-1729384756108', imagensQtd: 5, marketplace: 'TikTok Shop', status: 'Ativo', estoque: 12, estoqueSituacao: 'Saudável', vendidos: 43, preco: '$14.99', categoria: 'Home Organization', categoriaSub: 'Entryway' }),
  produtoEn({ id: 'p9', nome: 'Geometric desk lamp', sku: 'ETSY-1587234909', imagensQtd: 6, marketplace: 'Etsy', status: 'Ativo', estoque: 40, estoqueSituacao: 'Saudável', vendidos: 20, preco: '$34.99', categoria: 'Home & Living', categoriaSub: 'Lighting' }),
  produtoEn({ id: 'p10', nome: 'Headphone stand', sku: 'ETSY-1587234910', imagensQtd: 4, marketplace: 'Etsy', status: 'Ativo', estoque: 80, estoqueSituacao: 'Saudável', vendidos: 40, preco: '$16.99', categoria: 'Electronics & Accessories', categoriaSub: 'Desk accessories' }),
];

/** Rótulos EN dos filtros de Período e Ordem; os valores PT seguem como chave. */
export const PERIODOS_LABEL_EN: Record<string, string> = {
  'Hoje': 'Today',
  'Ontem': 'Yesterday',
  'Últimos 7 dias': 'Last 7 days',
  'Últimos 30 dias': 'Last 30 days',
  'Maio 2026': 'May 2026',
  'Abril 2026': 'April 2026',
  'Últimos 3 meses': 'Last 3 months',
  'Este ano': 'This year',
  'Personalizado': 'Custom',
};
export const ORDENS_LABEL_EN: Record<string, string> = {
  'Mais recentes': 'Newest',
  'Mais antigos': 'Oldest',
  'Título A-Z': 'Title A-Z',
  'Título Z-A': 'Title Z-A',
};

/** Produtos de exemplo do idioma ativo: EN usa a variante americana, PT e ES o mock original. */
export function produtosDoIdioma(idioma: Idioma): Produto[] {
  return idioma === 'en' ? PRODUTOS_EN : PRODUTOS;
}

export function produtosKpisDoIdioma(idioma: Idioma) {
  return idioma === 'en' ? PRODUTOS_KPIS_EN : PRODUTOS_KPIS;
}

/** Preço do anúncio como número, aceitando o formato BR ("R$ 1.269,90") e o
 * americano ("$1,269.90"). */
export function precoProdutoNumero(preco: string): number {
  const s = preco.trim();
  if (s.startsWith('$')) return parseFloat(s.replace(/[$,\s]/g, ''));
  return parseFloat(s.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
}
