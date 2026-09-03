// Mock da tela Pedidos, fiel aos prints de produção. Sem backend: os KPIs do
// topo e a paginação usam o total real de produção (176 pedidos), mas só uma
// amostra é gerada pra tabela — mesmo padrão de lib/produtosMock.ts.

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

export interface Pedido {
  id: string;
  codigoMlb: string;
  produto: string;
  qtd: number;
  data: string;
  marketplace: 'Mercado Livre' | 'Shopee';
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
  { nome: 'Letreiro decorativo - resina 12cm', preco: 39.9 },
];

const CIDADES = ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Curitiba, PR', 'Porto Alegre, RS'];

// { status do pedido, status do pagamento } — proporção parecida com o print
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

export function gerarPedidos(qtd: number): Pedido[] {
  const agora = Date.now();
  return Array.from({ length: qtd }, (_, i) => {
    const ciclo = CICLO_STATUS[i % CICLO_STATUS.length];
    const comprador = NOMES_COMPRADORES[i % NOMES_COMPRADORES.length];
    const produto = PRODUTOS_PEDIDO[i % PRODUTOS_PEDIDO.length];
    const marketplace: Pedido['marketplace'] = i % 3 === 1 ? 'Shopee' : 'Mercado Livre';
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

export const PEDIDOS: Pedido[] = gerarPedidos(30);
