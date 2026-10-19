export type Etapa = 'novo' | 'conversa' | 'orcamento' | 'negociando' | 'fechado' | 'perdido';
export type Temperatura = 'frio' | 'morno' | 'quente';
export type TipoContato = 'presencial' | 'whatsapp' | 'ligacao' | 'email';
export type StatusPedido = 'Na fila' | 'Imprimindo' | 'Pronto' | 'Entregue' | 'Pago' | 'Cancelado';

export interface Contato {
  id: string;
  data: string; // ISO yyyy-mm-dd
  tipo: TipoContato;
  nota: string;
}

export interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  categoria: string;
  telefone: string;
  email: string;
  cidade: string;
  obs: string;
  feiraId: string | null;
  criadoEm: string;
  contatos: Contato[];
}

export interface Negocio {
  id: string;
  clienteId: string;
  titulo: string;
  valor: number;
  etapa: Etapa;
  temperatura: Temperatura;
  feiraId: string | null;
  proximoContato: string | null;
  motivoPerda: string;
  criadoEm: string;
  atualizadoEm: string;
  pedidoId: string | null;
  // Produtos do catálogo (e itens avulsos) que o cliente quer, viram o pedido ao fechar.
  itens?: ItemPedido[];
}

export interface Produto {
  id: string;
  nome: string;
  sku: string;
  categoria: string;
  material: string;
  tempoH: number;
  pesoG: number;
  acessorio: number;
  atacadoManual: number | null;
  varejoManual: number | null;
  // Produto vindo da Calculadora (histórico): custo fixo e id do cálculo de origem.
  custoManual?: number | null;
  calcId?: number;
}

export interface ItemPedido {
  produtoId: string | null;
  // Item digitado à mão (fora do catálogo).
  avulso?: boolean;
  nome: string;
  qtd: number;
  unit: number;
  custoUnit: number;
  tempoH: number;
}

export interface Pedido {
  id: string;
  clienteId: string;
  negocioId: string | null;
  feiraId: string | null;
  itens: ItemPedido[];
  status: StatusPedido;
  dataPedido: string;
  entrega: string;
  obs: string;
}

export interface Feira {
  id: string;
  nome: string;
  local: string;
  inicio: string;
  fim: string;
}

export interface Config {
  custoKg: number;
  custoHora: number;
  markupAtacado: number;
  markupVarejo: number;
}

export interface Db {
  clientes: Cliente[];
  negocios: Negocio[];
  produtos: Produto[];
  pedidos: Pedido[];
  feiras: Feira[];
  feiraAtivaId: string | null;
  config: Config;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  empresa: string;
}

export const ETAPAS: { id: Etapa; label: string; hint: string }[] = [
  { id: 'novo', label: 'Novo contato', hint: 'Acabou de chegar ao ponto de venda' },
  { id: 'conversa', label: 'Em conversa', hint: 'Já houve retorno' },
  { id: 'orcamento', label: 'Orçamento enviado', hint: 'Aguardando resposta' },
  { id: 'negociando', label: 'Negociando', hint: 'Ajustando preço, prazo ou quantidade' },
  { id: 'fechado', label: 'Fechado', hint: 'Virou pedido' },
  { id: 'perdido', label: 'Perdido', hint: 'Não avançou' },
];

export const STATUS_PEDIDO: StatusPedido[] = ['Na fila', 'Imprimindo', 'Pronto', 'Entregue', 'Pago', 'Cancelado'];
export const TIPOS_CONTATO: { id: TipoContato; label: string }[] = [
  { id: 'presencial', label: 'No ponto de venda' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'ligacao', label: 'Ligação' },
  { id: 'email', label: 'E-mail' },
];
