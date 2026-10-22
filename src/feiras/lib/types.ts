export type Etapa = 'novo' | 'conversa' | 'orcamento' | 'negociando' | 'fechado' | 'perdido';
export type Temperatura = 'frio' | 'morno' | 'quente';
export type TipoContato = 'presencial' | 'whatsapp' | 'ligacao' | 'email' | 'prospeccao';
export type StatusPedido = 'Na fila' | 'Imprimindo' | 'Em preparação para envio' | 'Pronto' | 'Entregue' | 'Pago' | 'Cancelado';

export interface Contato {
  id: string;
  data: string; // ISO yyyy-mm-dd
  tipo: TipoContato;
  nota: string;
}

/** Outra pessoa de contato do cliente (ex.: compradora, financeiro). */
export interface OutroContato {
  id: string;
  nome: string;
  telefone: string;
  obs: string; // cargo ou observação
}

export interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  categoria: string;
  telefone: string;
  telefoneAlt?: string; // fixo ou outro número, além do WhatsApp
  outrosContatos?: OutroContato[];
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
  // O que foi combinado com o cliente (pagamento, prazo, entrega…), vai no resumo do WhatsApp.
  combinado?: string;
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

// Produto que será vendido numa feira/ponto de venda: vem do catálogo (calculadora) e leva a
// quantidade de unidades que o vendedor pretende levar.
export interface ProdutoDaFeira {
  produtoId: string;
  qtd: number;
  // Valor unitário combinado (começa no preço da tabela escolhida).
  unit?: number;
}

// Lançamento de um dia de feira, por produto: o que levou, o que vendeu, o que quebrou e o que foi cortesia.
export interface RegistroItem {
  produtoId: string;
  levou: number;
  vendeu: number;
  quebra: number;
  cortesia: number;
  unit: number;
}
export interface RegistroDia { itens: RegistroItem[] }

export interface RegraRepete {
  freq: 'dia' | 'semana' | 'mes' | 'ano';
  cada: number;
  diasSemana?: number[]; // 0 = domingo
  mensal?: 'dia' | 'nesimo'; // mesmo dia do mês ou "3ª terça"
  termina?: { tipo: 'data'; data: string } | { tipo: 'vezes'; vezes: number }; // ausente = nunca
}

export interface Feira {
  id: string;
  nome: string;
  local: string;
  inicio: string;
  // Só para feiras antigas (início–fim); hoje a feira tem uma data e uma regra de repetição.
  fim?: string;
  // Todos os dias da primeira edição (inclui `inicio`); a repetição desloca esse conjunto inteiro.
  dias?: string[];
  regra?: RegraRepete;
  // Ausente em feiras antigas (conta como lista vazia).
  produtos?: ProdutoDaFeira[];
  // Lançamentos por dia de feira (chave = data AAAA-MM-DD).
  registros?: Record<string, RegistroDia>;
}

export interface Config {
  custoKg: number;
  custoHora: number;
  markupAtacado: number;
  markupVarejo: number;
}

export interface Prospecto {
  id: string;
  placeId: string;
  nome: string;
  status: 'lead' | 'descartado';
  clienteId: string | null;
  atualizadoEm: string;
}

export interface Db {
  prospectos: Prospecto[];
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

export const STATUS_PEDIDO: StatusPedido[] = ['Na fila', 'Imprimindo', 'Em preparação para envio', 'Pronto', 'Entregue', 'Pago', 'Cancelado'];
export const TIPOS_CONTATO: { id: TipoContato; label: string }[] = [
  { id: 'presencial', label: 'No ponto de venda' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'ligacao', label: 'Ligação' },
  { id: 'email', label: 'E-mail' },
  { id: 'prospeccao', label: 'Prospecção' },
];
