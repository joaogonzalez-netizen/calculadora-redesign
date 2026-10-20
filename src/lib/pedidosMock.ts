// Mock da tela Pedidos, fiel aos prints de produção. Sem backend: os KPIs do
// topo e a paginação usam o total real de produção (176 pedidos), mas só uma
// amostra é gerada pra tabela, mesmo padrão de lib/produtosMock.ts.

import type { Idioma } from './i18n';

export type StatusPedido = 'Pago' | 'Enviado' | 'Pendente' | 'Cancelado' | 'Entregue';
export type StatusPagamento = 'Aprovado' | 'Pendente' | 'Reembolsado';

export interface ItemPedido {
  nome: string;
  qtd: number;
  precoUnit: number;
  cor?: string;
}

export interface EtapaTimeline {
  label: string;
  data: string;
  feito: boolean;
  detalhe?: string;
}

// Marketplaces do mock brasileiro (PT/ES) e do americano (EN). PEDIDOS segue
// tipado só com ML/Shopee porque outras telas (Fila de produção) dependem disso.
export type MarketplacePedidoBr = 'Mercado Livre' | 'Shopee';
export type MarketplacePedidoUs = 'Etsy' | 'TikTok Shop';

export interface Pedido<M extends string = MarketplacePedidoBr | MarketplacePedidoUs> {
  id: string;
  codigoMlb: string;
  produto: string;
  qtd: number;
  data: string;
  marketplace: M;
  comprador: string;
  compradorHandle: string;
  compradorCompras: number;
  status: StatusPedido;
  pagamento: StatusPagamento;
  pagamentoData: string;
  valorTotal: number;
  precoUnit: number;
  frete: number;
  taxaPct: number;
  envioMetodo: string;
  envioCodigo: string;
  destinoCidade: string;
  destinoCep: string;
  rastreio: string;
  itens: ItemPedido[];
  timeline: EtapaTimeline[];
}

export const PEDIDOS_KPIS = {
  total: 176,
  faturamento: 29376,
  aguardandoEnvio: 6,
  taxasEstimadas: 3231,
};

const NOMES_COMPRADORES = [
  { nome: 'João Gonzalez', handle: '@joaog', compras: 12 },
  { nome: 'Maria Silva', handle: '@mariasilva', compras: 4 },
  { nome: 'Carlos Souza', handle: '@carlossouza', compras: 1 },
  { nome: 'Ana Paula Reis', handle: '@anapreis', compras: 7 },
  { nome: 'Pedro Lima', handle: '@pedrolima', compras: 2 },
  { nome: 'Beatriz Rocha', handle: '@biarocha', compras: 9 },
  { nome: 'Lucas Fernandes', handle: '@lucasf', compras: 3 },
  { nome: 'Juliana Costa', handle: '@julicosta', compras: 5 },
];

const PRODUTOS_PEDIDO: { nome: string; preco: number }[] = [
  { nome: 'Suporte articulado para celular', preco: 39.9 },
  { nome: 'Vaso geométrico facetado', preco: 39.9 },
  { nome: 'Dragão articulado 20cm', preco: 39.9 },
  { nome: 'Organizador de mesa modular', preco: 39.9 },
  { nome: 'Luminária geométrica de mesa', preco: 39.9 },
  { nome: 'Porta-chaves parede minimalista', preco: 39.9 },
  { nome: 'Letreiro decorativo resina 12cm', preco: 39.9 },
];

const CIDADES = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Curitiba, PR', 'Porto Alegre, RS'];

// { status do pedido, status do pagamento }, proporção parecida com o print
// (maioria Entregue/Aprovado, um punhado em cada estado intermediário).
const CICLO_STATUS: { status: StatusPedido; pagamento: StatusPagamento }[] = [
  { status: 'Pago', pagamento: 'Aprovado' },
  { status: 'Enviado', pagamento: 'Pendente' },
  { status: 'Pendente', pagamento: 'Pendente' },
  { status: 'Cancelado', pagamento: 'Reembolsado' },
  { status: 'Entregue', pagamento: 'Aprovado' },
  { status: 'Entregue', pagamento: 'Aprovado' },
  { status: 'Entregue', pagamento: 'Aprovado' },
  { status: 'Entregue', pagamento: 'Aprovado' },
  { status: 'Entregue', pagamento: 'Aprovado' },
  { status: 'Entregue', pagamento: 'Aprovado' },
];

function montarTimeline(status: StatusPedido, dataBase: number): EtapaTimeline[] {
  const fmt = (ms: number) => new Date(ms).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' ·');
  const etapas: EtapaTimeline[] = [
    { label: 'Pedido criado', data: fmt(dataBase), feito: true },
    { label: 'Pagamento aprovado', data: fmt(dataBase + 60000), feito: status !== 'Pendente' && status !== 'Cancelado' },
    { label: 'Etiqueta gerada', data: fmt(dataBase + 3 * 3600000), feito: ['Enviado', 'Entregue'].includes(status) },
    { label: 'Pedido despachado', data: fmt(dataBase + 19 * 3600000), feito: status === 'Entregue', detalhe: status === 'Entregue' ? 'Coletado pela transportadora' : undefined },
    { label: 'Entrega prevista', data: 'Até ' + fmt(dataBase + 4 * 86400000).split(' ·')[0], feito: false, detalhe: status === 'Entregue' ? 'Entregue ao destinatário' : 'Aguardando atualização da transportadora' },
  ];
  if (status === 'Entregue') etapas[4] = { ...etapas[4], feito: true, label: 'Pedido entregue' };
  return etapas;
}

export function gerarPedidos(qtd: number): Pedido<MarketplacePedidoBr>[] {
  const agora = Date.now();
  return Array.from({ length: qtd }, (_, i) => {
    const ciclo = CICLO_STATUS[i % CICLO_STATUS.length];
    const comprador = NOMES_COMPRADORES[i % NOMES_COMPRADORES.length];
    const produto = PRODUTOS_PEDIDO[i % PRODUTOS_PEDIDO.length];
    const marketplace: MarketplacePedidoBr = i % 3 === 1 ? 'Shopee' : 'Mercado Livre';
    const qtdItem = 2;
    const frete = 18.5;
    const valorTotal = produto.preco * qtdItem;
    const taxaPct = 0.1;
    const dataBase = agora - (i + 1) * 8 * 3600000;

    return {
      id: String(2000012345678901 + i),
      codigoMlb: 'MLB-' + String(2000012345678901 + i),
      produto: produto.nome,
      qtd: qtdItem,
      data: new Date(dataBase).toLocaleDateString('pt-BR'),
      marketplace,
      comprador: comprador.nome,
      compradorHandle: comprador.handle,
      compradorCompras: comprador.compras,
      status: ciclo.status,
      pagamento: ciclo.pagamento,
      pagamentoData: new Date(dataBase + 60000).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      valorTotal,
      precoUnit: produto.preco,
      frete,
      taxaPct,
      envioMetodo: marketplace === 'Mercado Livre' ? 'Mercado Envios Flex' : 'Shopee Xpress',
      envioCodigo: 'BR' + String(1234567890 + i) + 'XX',
      destinoCidade: CIDADES[i % CIDADES.length],
      destinoCep: '0' + (1310 + i) + '-100',
      rastreio: 'BR' + String(1234567890 + i) + 'XX',
      itens: [{ nome: produto.nome, qtd: qtdItem, precoUnit: produto.preco, cor: 'Preto' }],
      timeline: montarTimeline(ciclo.status, dataBase),
    };
  });
}

export const PEDIDOS: Pedido<MarketplacePedidoBr>[] = gerarPedidos(30);

// ---------------------------------------------------------------------------
// Variante EN (mercado americano): Etsy e TikTok Shop, valores em dólar,
// compradores e endereços dos EUA, datas mm/dd/yyyy. Status e pagamento
// continuam com as chaves em português (são chaves de filtro/estilo); a tela
// traduz o rótulo exibido.
// ---------------------------------------------------------------------------

export const PEDIDOS_KPIS_EN = {
  total: 176,
  faturamento: 5875,
  aguardandoEnvio: 6,
  taxasEstimadas: 646,
};

const COMPRADORES_EN = [
  { nome: 'Emily Rodriguez', handle: '@emilyrod', compras: 12 },
  { nome: 'Tyler Brooks', handle: '@tbrooks', compras: 4 },
  { nome: 'Madison Kelly', handle: '@madikelly', compras: 1 },
  { nome: 'Jordan Mitchell', handle: '@jmitch', compras: 7 },
  { nome: 'Ashley Nguyen', handle: '@ashnguyen', compras: 2 },
  { nome: 'Ryan Cooper', handle: '@ryancooper', compras: 9 },
  { nome: 'Hannah Patel', handle: '@hannahp', compras: 3 },
  { nome: 'Austin Walker', handle: '@awalker', compras: 5 },
];

const PRODUTOS_PEDIDO_EN: { nome: string; preco: number }[] = [
  { nome: 'Articulated phone stand', preco: 12.99 },
  { nome: 'Geometric faceted planter', preco: 18.99 },
  { nome: 'Articulated dragon 8"', preco: 24.99 },
  { nome: 'Modular desk organizer', preco: 22.99 },
  { nome: 'Geometric desk lamp', preco: 34.99 },
  { nome: 'Minimalist wall key holder', preco: 14.99 },
  { nome: 'Resin decorative sign 5"', preco: 19.99 },
];

const DESTINOS_EN = [
  { cidade: 'Austin, TX', zip: '78701' },
  { cidade: 'Portland, OR', zip: '97205' },
  { cidade: 'Denver, CO', zip: '80202' },
  { cidade: 'Columbus, OH', zip: '43215' },
  { cidade: 'Raleigh, NC', zip: '27601' },
];

function fmtDataHoraEn(ms: number) {
  return new Date(ms).toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(',', ' ·');
}

function montarTimelineEn(status: StatusPedido, dataBase: number): EtapaTimeline[] {
  const etapas: EtapaTimeline[] = [
    { label: 'Order placed', data: fmtDataHoraEn(dataBase), feito: true },
    { label: 'Payment approved', data: fmtDataHoraEn(dataBase + 60000), feito: status !== 'Pendente' && status !== 'Cancelado' },
    { label: 'Shipping label created', data: fmtDataHoraEn(dataBase + 3 * 3600000), feito: ['Enviado', 'Entregue'].includes(status) },
    { label: 'Order shipped', data: fmtDataHoraEn(dataBase + 19 * 3600000), feito: status === 'Entregue', detalhe: status === 'Entregue' ? 'Picked up by the carrier' : undefined },
    { label: 'Estimated delivery', data: 'By ' + new Date(dataBase + 4 * 86400000).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }), feito: false, detalhe: status === 'Entregue' ? 'Delivered to recipient' : 'Waiting for a carrier update' },
  ];
  if (status === 'Entregue') etapas[4] = { ...etapas[4], feito: true, label: 'Order delivered' };
  return etapas;
}

export function gerarPedidosEn(qtd: number): Pedido<MarketplacePedidoUs>[] {
  const agora = Date.now();
  return Array.from({ length: qtd }, (_, i) => {
    const ciclo = CICLO_STATUS[i % CICLO_STATUS.length];
    const comprador = COMPRADORES_EN[i % COMPRADORES_EN.length];
    const produto = PRODUTOS_PEDIDO_EN[i % PRODUTOS_PEDIDO_EN.length];
    const destino = DESTINOS_EN[i % DESTINOS_EN.length];
    const marketplace: MarketplacePedidoUs = i % 3 === 1 ? 'TikTok Shop' : 'Etsy';
    const qtdItem = 2;
    const frete = 4.99;
    const valorTotal = Math.round(produto.preco * qtdItem * 100) / 100;
    const taxaPct = marketplace === 'Etsy' ? 0.1 : 0.08;
    const dataBase = agora - (i + 1) * 8 * 3600000;
    const numero = marketplace === 'Etsy' ? String(3412987650 + i) : String(576912038400000 + i);
    const rastreio = '9400 1118 9922 ' + String(3456 + i).padStart(4, '0') + ' ' + String(7801 + i).padStart(4, '0') + ' 21';

    return {
      id: numero,
      codigoMlb: (marketplace === 'Etsy' ? 'ETSY-' : 'TTS-') + numero,
      produto: produto.nome,
      qtd: qtdItem,
      data: new Date(dataBase).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      marketplace,
      comprador: comprador.nome,
      compradorHandle: comprador.handle,
      compradorCompras: comprador.compras,
      status: ciclo.status,
      pagamento: ciclo.pagamento,
      pagamentoData: fmtDataHoraEn(dataBase + 60000).replace(' ·', ','),
      valorTotal,
      precoUnit: produto.preco,
      frete,
      taxaPct,
      envioMetodo: marketplace === 'Etsy' ? 'USPS Ground Advantage' : 'TikTok Shop Shipping (UPS)',
      envioCodigo: rastreio,
      destinoCidade: destino.cidade,
      destinoCep: destino.zip,
      rastreio,
      itens: [{ nome: produto.nome, qtd: qtdItem, precoUnit: produto.preco, cor: 'Black' }],
      timeline: montarTimelineEn(ciclo.status, dataBase),
    };
  });
}

export const PEDIDOS_EN: Pedido<MarketplacePedidoUs>[] = gerarPedidosEn(30);

/** Pedidos de exemplo do idioma ativo: EN usa a variante americana, PT e ES o mock original. */
export function pedidosDoIdioma(idioma: Idioma): Pedido[] {
  return idioma === 'en' ? PEDIDOS_EN : PEDIDOS;
}

export function pedidosKpisDoIdioma(idioma: Idioma) {
  return idioma === 'en' ? PEDIDOS_KPIS_EN : PEDIDOS_KPIS;
}
