// Mock da tela Produtos, fiel ao Figma (node 21941:37727). Sem backend: tudo
// estático ou derivado do que já existe no localStorage (histórico de cálculos).

import { PRODUTO_VINCULOS_KEY, readJson } from './storage';

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
  marketplace: 'Mercado Livre' | 'Shopee';
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
  { id: 'p1', nome: 'Letreiro decorativo - resina 12cm', sku: 'MLB-2093012345678901', imagensQtd: 6, marketplace: 'Mercado Livre', status: 'Ativo', estoque: 47, estoqueSituacao: 'Saudável', vendidos: 32, preco: 'R$ 269,90', categoria: 'Suportes', categoriaSub: 'Acessórios para Celular', controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesPadrao('R$ 39,90') },
  { id: 'p2', nome: 'Letreiro decorativo - PETG 15cm', sku: 'MLB-2093012345678902', imagensQtd: 4, marketplace: 'Shopee', status: 'Ativo', estoque: 24, estoqueSituacao: 'Saudável', vendidos: 12, preco: 'R$ 269,90', categoria: 'Decoração', categoriaSub: 'Objetos decorativos', controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesPadrao('R$ 39,90') },
  { id: 'p3', nome: 'Letreiro decorativo - mini 8cm', sku: 'MLB-2093012345678903', imagensQtd: 5, marketplace: 'Mercado Livre', status: 'Pausado', estoque: 32, estoqueSituacao: 'Saudável', vendidos: 4, preco: 'R$ 269,90', categoria: 'Decoração', categoriaSub: 'Objetos decorativos', controladoCatalogoMl: false, inventarioMl: false, linkPublico: true, variacoes: variacoesPadrao('R$ 39,90') },
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
 * da Calculadora) — usado no DRE do Painel pra sinalizar que "Custo de produção"
 * pode estar subestimado, já que produtos sem vínculo entrariam com custo zero. */
export function contarProdutosSemVinculo(): { semVinculo: number; total: number } {
  const vinculos = readJson<Record<string, unknown>>(PRODUTO_VINCULOS_KEY, {});
  const semVinculo = PRODUTOS.filter((p) => !vinculos[p.id]).length;
  return { semVinculo, total: PRODUTOS.length };
}
