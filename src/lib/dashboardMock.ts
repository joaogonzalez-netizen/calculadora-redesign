// Dados do Dashboard. Tudo aqui é mock estático, fiel ao design de referência:
// não existe backend nem pedidos reais no projeto ainda. Este arquivo é o ponto
// único de troca quando a API existir — os componentes só consomem estas formas.

export interface MarketplaceConectado {
  id: string;
  sigla: string;
  bg: string;
  fg: string;
}

export interface Kpi {
  id: string;
  label: string;
  tooltip: string;
  prefixo?: string;
  inteiro: string;
  decimal?: string;
  deltaPct: string;
  deltaPositivo: boolean;
  comparativo: string;
}

export interface Insight {
  id: string;
  titulo: string;
  /** Trechos alternados: índice par = texto normal, ímpar = negrito. */
  partes: string[];
}

export interface PontoSerie {
  label: string;
  periodo: string;
  faturamento: number;
  custos: number;
  /** Sempre faturamento - custos, conforme o subtítulo do gráfico. */
  lucro: number;
}

export interface TopProduto {
  rank: number;
  nome: string;
  vendas: number;
  margemPct: number;
  valor: string;
  /** Largura da barra, 0–100. */
  barra: number;
}

export interface PedidoRecente {
  id: string;
  canalSigla: string;
  produto: string;
  quando: string;
  codigo: string;
  comprador: string;
  valor: string;
  status: string;
}

export const MARKETPLACES: MarketplaceConectado[] = [
  { id: 'ml', sigla: 'Ml', bg: '#ffd400', fg: '#3d3000' },
  { id: 'amazon', sigla: 'a', bg: '#ff9900', fg: '#ffffff' },
  { id: 'shopee', sigla: 'S', bg: '#ee4d2d', fg: '#ffffff' },
  { id: 'magalu', sigla: 'M', bg: '#0086ff', fg: '#ffffff' },
];

export const ULTIMA_SINCRONIZACAO = 'Última sincronização há 2 minuto';

export const KPIS: Kpi[] = [
  {
    id: 'faturamento',
    label: 'Faturamento',
    tooltip: 'Soma do valor bruto de todos os pedidos pagos no período, antes de taxas e custos.',
    prefixo: 'R$',
    inteiro: '29.376',
    decimal: ',00',
    deltaPct: '+9,8%',
    deltaPositivo: true,
    comparativo: 'vs. 30 dias anteriores',
  },
  {
    id: 'pedidos',
    label: 'Pedidos',
    tooltip: 'Quantidade de pedidos pagos no período, somando todos os marketplaces conectados.',
    inteiro: '176',
    deltaPct: '+6,7%',
    deltaPositivo: true,
    comparativo: 'vs. 165 anteriores',
  },
  {
    id: 'lucro',
    label: 'Lucro líquido',
    tooltip: 'Faturamento menos custos de produto, taxas do canal, frete e impostos.',
    prefixo: 'R$',
    inteiro: '7.962',
    decimal: ',00',
    deltaPct: '+2,4%',
    deltaPositivo: true,
    comparativo: 'margem 27,1%',
  },
  {
    id: 'ticket',
    label: 'Ticket médio',
    tooltip: 'Faturamento dividido pela quantidade de pedidos do período.',
    prefixo: 'R$',
    inteiro: '166',
    decimal: ',90',
    deltaPct: '+2,9%',
    deltaPositivo: true,
    comparativo: 'vs. R$ 162,15 anterior',
  },
];

export const INSIGHTS: Insight[] = [
  {
    id: 'melhor-dia',
    titulo: 'Melhor dia da semana',
    partes: ['', 'Quintas-feiras', ' concentram ', '32%', ' das suas vendas. Considere agendar campanhas e impulsionamentos pra esse dia.'],
  },
  {
    id: 'reputacao',
    titulo: 'Reputação no Mercado Livre',
    partes: ['Sua reputação caiu de verde para amarelo. Há 4 reclamações não respondidas há mais de 24h.'],
  },
  {
    id: 'margem',
    titulo: 'Oportunidade de margem',
    partes: ['Seu top 3 produtos tem margem média de ', '26%', '. Reduzir custos do ', 'Tênis esportivo', ' em 8% aumentaria o lucro em ', 'R$ 974/mês', '.'],
  },
];

export const SERIE_LUCRO: PontoSerie[] = [
  { label: 'Sem 1', periodo: '7–14 jan', faturamento: 1120, custos: 580, lucro: 540 },
  { label: 'Sem 2', periodo: '14–21 jan', faturamento: 1210, custos: 595, lucro: 615 },
  { label: 'Sem 3', periodo: '21–28 jan', faturamento: 1340, custos: 610, lucro: 730 },
  { label: 'Sem 4', periodo: '28 jan–4 fev', faturamento: 1520, custos: 620, lucro: 900 },
  { label: 'Hoje', periodo: '4–11 fev', faturamento: 1760, custos: 640, lucro: 1120 },
];

/** Ticks do eixo Y, na mesma escala da série. */
export const TICKS_Y = [0, 700, 1300, 2000];
export const MAX_Y = 2000;

export const TOP_PRODUTOS: TopProduto[] = [
  { rank: 1, nome: 'Lorem ipsum', vendas: 12, margemPct: 28, valor: 'R$ 4.198', barra: 100 },
  { rank: 2, nome: 'Lorem ipsum', vendas: 12, margemPct: 28, valor: 'R$ 4.198', barra: 94 },
  { rank: 3, nome: 'Lorem ipsum', vendas: 12, margemPct: 28, valor: 'R$ 4.198', barra: 88 },
  { rank: 4, nome: 'Lorem ipsum', vendas: 12, margemPct: 28, valor: 'R$ 4.198', barra: 82 },
  { rank: 5, nome: 'Lorem ipsum', vendas: 12, margemPct: 28, valor: 'R$ 4.198', barra: 76 },
];

export const PEDIDOS_RECENTES: PedidoRecente[] = [1, 2, 3].map((n) => ({
  id: 'pedido-' + n,
  canalSigla: 'ML',
  produto: 'Lorem ipsum',
  quando: 'há 8 minutos',
  codigo: '#ML-8472913',
  comprador: 'Carla M.',
  valor: 'R$ 289,90',
  status: 'Pago',
}));

// DRE simples do mês — fecha exatamente nos KPIs do topo do Painel:
// Receita bruta = Faturamento (R$ 29.376,00) e Lucro líquido = R$ 7.962,00 (margem 27,1%).
export type DreTipo = 'receita' | 'deducao' | 'subtotal' | 'resultado';
export interface DreSubitem { label: string; valor: number; }
export interface DreLinha {
  label: string;
  valor: number;
  tipo: DreTipo;
  pct?: string;
  hint?: string;
  subitens?: DreSubitem[];
  /** Marca a linha cujo valor depende dos vínculos de custo em Produtos (ver contarProdutosSemVinculo). */
  dependeDeVinculo?: boolean;
}

export const DRE_MES = 'Maio 2026';
export const DRE_LINHAS: DreLinha[] = [
  { label: 'Receita bruta', valor: 29376.00, tipo: 'receita', hint: 'Soma do valor de todos os pedidos pagos no mês' },
  { label: 'Impostos sobre vendas', valor: -1175.00, tipo: 'deducao', pct: '4,0%' },
  {
    label: 'Taxas de marketplace', valor: -4406.00, tipo: 'deducao', pct: '15,0%',
    hint: 'Comissão, frete e tarifas fixas de cada marketplace conectado',
    subitens: [
      { label: 'Mercado Livre', valor: -2850.00 },
      { label: 'Shopee', valor: -1020.00 },
      { label: 'Amazon', valor: -536.00 },
    ],
  },
  { label: 'Receita líquida', valor: 23795.00, tipo: 'subtotal' },
  {
    label: 'Custo de produção', valor: -13483.00, tipo: 'deducao', dependeDeVinculo: true,
    hint: 'Só material, mão de obra e energia do cálculo vinculado a cada produto. Não inclui taxa de canal: a taxa de marketplace já vem separada, direto da integração real (linha acima) — somar as duas seria contar o custo do canal duas vezes.',
  },
  { label: 'Lucro bruto', valor: 10312.00, tipo: 'subtotal' },
  { label: 'Despesas operacionais', valor: -2350.00, tipo: 'deducao', hint: 'Ads/tráfego pago e outras despesas do mês' },
  { label: 'Lucro líquido', valor: 7962.00, tipo: 'resultado' },
];
export const DRE_MARGEM_LIQUIDA = '27,1%';

export const CREDITOS = '1.250';

export const USUARIO = {
  nome: 'João Gonzalez',
  iniciais: 'JG',
  plano: 'Plano Starter',
  primeiroNome: 'João',
};
