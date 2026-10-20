import type { Idioma } from './i18n';

// Dados do Dashboard. Tudo aqui é mock estático, fiel ao design de referência:
// não existe backend nem pedidos reais no projeto ainda. Este arquivo é o ponto
// único de troca quando a API existir, os componentes só consomem estas formas.

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
  /** Largura da barra, 0 a 100. */
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
  { label: 'Sem 1', periodo: '7 a 14 jan', faturamento: 1120, custos: 580, lucro: 540 },
  { label: 'Sem 2', periodo: '14 a 21 jan', faturamento: 1210, custos: 595, lucro: 615 },
  { label: 'Sem 3', periodo: '21 a 28 jan', faturamento: 1340, custos: 610, lucro: 730 },
  { label: 'Sem 4', periodo: '28 jan a 4 fev', faturamento: 1520, custos: 620, lucro: 900 },
  { label: 'Hoje', periodo: '4 a 11 fev', faturamento: 1760, custos: 640, lucro: 1120 },
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

// DRE simples do mês, fecha exatamente nos KPIs do topo do Painel:
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
    hint: 'Só material, mão de obra e energia do cálculo vinculado a cada produto. Não inclui taxa de canal: a taxa de marketplace já vem separada, direto da integração real (linha acima), somar as duas seria contar o custo do canal duas vezes.',
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

// ---------------------------------------------------------------------------
// Variante EN (mercado americano): mesmos formatos, dados de exemplo dos EUA
// (Etsy e TikTok Shop, dólar, compradores e produtos em inglês). PT e ES
// continuam usando as constantes acima, sem nenhuma mudança.
// ---------------------------------------------------------------------------

export const MARKETPLACES_EN: MarketplaceConectado[] = [
  { id: 'etsy', sigla: 'E', bg: '#f1641e', fg: '#ffffff' },
  { id: 'tiktok', sigla: 'T', bg: '#111111', fg: '#ffffff' },
];

export const ULTIMA_SINCRONIZACAO_EN = 'Last synced 2 minutes ago';

export const KPIS_EN: Kpi[] = [
  {
    id: 'faturamento',
    label: 'Revenue',
    tooltip: 'Gross value of all paid orders in the period, before fees and costs.',
    prefixo: '$',
    inteiro: '5,875',
    decimal: '.00',
    deltaPct: '+9.8%',
    deltaPositivo: true,
    comparativo: 'vs. previous 30 days',
  },
  {
    id: 'pedidos',
    label: 'Orders',
    tooltip: 'Number of paid orders in the period, across all connected marketplaces.',
    inteiro: '176',
    deltaPct: '+6.7%',
    deltaPositivo: true,
    comparativo: 'vs. 165 previous',
  },
  {
    id: 'lucro',
    label: 'Net profit',
    tooltip: 'Revenue minus product costs, marketplace fees, shipping and taxes.',
    prefixo: '$',
    inteiro: '1,592',
    decimal: '.00',
    deltaPct: '+2.4%',
    deltaPositivo: true,
    comparativo: 'margin 27.1%',
  },
  {
    id: 'ticket',
    label: 'Average order value',
    tooltip: 'Revenue divided by the number of orders in the period.',
    prefixo: '$',
    inteiro: '33',
    decimal: '.38',
    deltaPct: '+2.9%',
    deltaPositivo: true,
    comparativo: 'vs. $32.43 previous',
  },
];

export const INSIGHTS_EN: Insight[] = [
  {
    id: 'melhor-dia',
    titulo: 'Best day of the week',
    partes: ['', 'Thursdays', ' account for ', '32%', ' of your sales. Consider scheduling promotions and ads for that day.'],
  },
  {
    id: 'reputacao',
    titulo: 'Etsy Star Seller status',
    partes: ['Your message response rate dropped below 95%. ', '4 buyer messages', ' have been waiting more than 24 hours for a reply.'],
  },
  {
    id: 'margem',
    titulo: 'Margin opportunity',
    partes: ['Your top 3 products have an average margin of ', '26%', '. Cutting costs on the ', 'Articulated dragon', ' by 8% would add ', '$195/mo', ' to your profit.'],
  },
];

export const SERIE_LUCRO_EN: PontoSerie[] = [
  { label: 'Wk 1', periodo: 'Jan 7–14', faturamento: 224, custos: 116, lucro: 108 },
  { label: 'Wk 2', periodo: 'Jan 14–21', faturamento: 242, custos: 119, lucro: 123 },
  { label: 'Wk 3', periodo: 'Jan 21–28', faturamento: 268, custos: 122, lucro: 146 },
  { label: 'Wk 4', periodo: 'Jan 28–Feb 4', faturamento: 304, custos: 124, lucro: 180 },
  { label: 'Today', periodo: 'Feb 4–11', faturamento: 352, custos: 128, lucro: 224 },
];
export const TICKS_Y_EN = [0, 140, 260, 400];
export const MAX_Y_EN = 400;

export const TOP_PRODUTOS_EN: TopProduto[] = [
  { rank: 1, nome: 'Articulated dragon 8"', vendas: 38, margemPct: 31, valor: '$949', barra: 100 },
  { rank: 2, nome: 'Geometric faceted planter', vendas: 41, margemPct: 28, valor: '$779', barra: 82 },
  { rank: 3, nome: 'Modular desk organizer', vendas: 26, margemPct: 24, valor: '$623', barra: 66 },
  { rank: 4, nome: 'Articulated phone stand', vendas: 44, margemPct: 29, valor: '$571', barra: 60 },
  { rank: 5, nome: 'Minimalist wall key holder', vendas: 30, margemPct: 26, valor: '$449', barra: 47 },
];

export const PEDIDOS_RECENTES_EN: PedidoRecente[] = [
  { id: 'pedido-1', canalSigla: 'ET', produto: 'Articulated dragon 8"', quando: '8 minutes ago', codigo: '#3412987650', comprador: 'Emily R.', valor: '$49.98', status: 'Paid' },
  { id: 'pedido-2', canalSigla: 'TT', produto: 'Articulated phone stand', quando: '26 minutes ago', codigo: '#5769120384', comprador: 'Tyler B.', valor: '$25.98', status: 'Paid' },
  { id: 'pedido-3', canalSigla: 'ET', produto: 'Geometric faceted planter', quando: '1 hour ago', codigo: '#3412987651', comprador: 'Madison K.', valor: '$37.98', status: 'Paid' },
];

// DRE do mês em dólar, fecha nos KPIS_EN: receita bruta $5,875.00 e lucro
// líquido $1,592.00 (margem 27,1%).
export const DRE_LINHAS_EN: DreLinha[] = [
  { label: 'Gross revenue', valor: 5875.00, tipo: 'receita', hint: 'Total value of all paid orders in the month' },
  { label: 'Taxes on sales', valor: -235.00, tipo: 'deducao', pct: '4.0%' },
  {
    label: 'Marketplace fees', valor: -881.00, tipo: 'deducao', pct: '15.0%',
    hint: 'Transaction, payment processing, listing and shipping fees from each connected marketplace',
    subitens: [
      { label: 'Etsy', valor: -612.00 },
      { label: 'TikTok Shop', valor: -269.00 },
    ],
  },
  { label: 'Net revenue', valor: 4759.00, tipo: 'subtotal' },
  {
    label: 'Production cost', valor: -2697.00, tipo: 'deducao', dependeDeVinculo: true,
    hint: 'Only material, labor and energy from the calculation linked to each product. It does not include channel fees: marketplace fees come separately, straight from the real integration (line above), so adding both would count the channel cost twice.',
  },
  { label: 'Gross profit', valor: 2062.00, tipo: 'subtotal' },
  { label: 'Operating expenses', valor: -470.00, tipo: 'deducao', hint: 'Ads and other expenses for the month' },
  { label: 'Net profit', valor: 1592.00, tipo: 'resultado' },
];
export const DRE_MARGEM_LIQUIDA_EN = '27.1%';

export interface DadosDashboard {
  marketplaces: MarketplaceConectado[];
  ultimaSincronizacao: string;
  kpis: Kpi[];
  insights: Insight[];
  serieLucro: PontoSerie[];
  ticksY: number[];
  maxY: number;
  topProdutos: TopProduto[];
  pedidosRecentes: PedidoRecente[];
  dreLinhas: DreLinha[];
  dreMargemLiquida: string;
}

const DASHBOARD_PT: DadosDashboard = {
  marketplaces: MARKETPLACES,
  ultimaSincronizacao: ULTIMA_SINCRONIZACAO,
  kpis: KPIS,
  insights: INSIGHTS,
  serieLucro: SERIE_LUCRO,
  ticksY: TICKS_Y,
  maxY: MAX_Y,
  topProdutos: TOP_PRODUTOS,
  pedidosRecentes: PEDIDOS_RECENTES,
  dreLinhas: DRE_LINHAS,
  dreMargemLiquida: DRE_MARGEM_LIQUIDA,
};

const DASHBOARD_EN: DadosDashboard = {
  marketplaces: MARKETPLACES_EN,
  ultimaSincronizacao: ULTIMA_SINCRONIZACAO_EN,
  kpis: KPIS_EN,
  insights: INSIGHTS_EN,
  serieLucro: SERIE_LUCRO_EN,
  ticksY: TICKS_Y_EN,
  maxY: MAX_Y_EN,
  topProdutos: TOP_PRODUTOS_EN,
  pedidosRecentes: PEDIDOS_RECENTES_EN,
  dreLinhas: DRE_LINHAS_EN,
  dreMargemLiquida: DRE_MARGEM_LIQUIDA_EN,
};

/** Dados do Painel no idioma ativo: EN usa a variante americana, PT e ES o mock original. */
export function dashboardDoIdioma(idioma: Idioma): DadosDashboard {
  return idioma === 'en' ? DASHBOARD_EN : DASHBOARD_PT;
}
