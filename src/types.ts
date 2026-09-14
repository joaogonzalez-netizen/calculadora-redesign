// Schemas per PRD seção 5/6 — preservar nomes de campos exatamente.

export type Canal = 'Venda direta' | 'Mercado Livre' | 'Shopee' | 'Etsy' | 'TikTok Shop';
export type ModoPrec = 'preco' | 'margem';
export type Moeda = 'BRL' | 'USD' | 'EUR' | 'ARS';
export type CustoCategoria = 'Embalagem' | 'Mão de obra' | 'Acabamento' | 'Outro' | 'Outras';
export type PgtoId = 'debito' | 'credito' | 'pix' | 'custom';
export type MlTipo = 'classico' | 'premium';
export type ShopeeTipo = 'cnpj' | 'cpf';

export interface Impressora {
  nome: string;
  kwh: number;
}

export interface Filamento {
  nome: string;
  tipo: string;
  cor: string;
  preco: number; // R$/kg
}

export interface CustoExtra {
  nome: string;
  valor: number;
  categoria: CustoCategoria;
  ativo: boolean;
}

export interface FilamentoItem {
  id: string;
  nome: string;
  cor: string;
  precoKg: number;
  pesoG: number;
}

export interface AccItem {
  id: string;
  nome: string;
  valor: number;
  categoria: CustoCategoria;
}

export interface Preferencias {
  impressora: string; // index as string, '' = nenhuma
  kwh: number;
  filamento: string; // index as string, '' = nenhum
  imposto: number;
  margem: number;
  descontoPix: number;
  moeda: Moeda;
  taxaDebito: number;
  taxaCredito: number;
  taxaPix: number;
}

export interface HistoricoEntry {
  id: number; // Date.now()
  nome: string;
  marketplace: Canal;
  custoUnit: number;
  precoConsumidor: number;
  precoVarejo: number;
  lucroBruto: number;
  lucroLiquido: number;
  margem: number;
  potMensal: number;
  taxaFalha: number;
  custoKwh: number;
  peso: number;
  filamentoItems: FilamentoItem[];
  tempoH: number;
  qtd: number;
  imposto: number;
  modoPrec: ModoPrec;
  margemDesejada: number;
  precoVenda: number;
  stlLink: string;
  concorrenteLink: string;
  comPromo: boolean;
  descontoPromo: number;
  // formato antigo, mantido só pra leitura de exemplos semeados
  custoFilamento?: number;
}

export interface MlFreteInfo {
  faixaPesoLabel: string;
  faixaPrecoLabel: string;
  custo: number;
}

export interface CanalTaxas {
  pct: number;
  fixo: number;
  freteInfo?: MlFreteInfo;
}

export interface CalculoState {
  nomePeca: string;
  stlLink: string;
  concorrenteLink: string;

  impressoraIdx: string; // '' | 'custom' | index
  custoKwh: number;
  precoKwh: number;
  quantidade: number;
  horasImpressao: number;
  minutosImpressao: number;
  taxaFalha: number;

  filamentoItems: FilamentoItem[];

  modoPrec: ModoPrec;
  precoVenda: number;
  margemDesejada: number;
  imposto: number;
  comPromo: boolean;
  descontoPromo: number;

  canalAtivo: Canal;

  // Venda direta
  pgtoSelecionado: PgtoId;
  taxaCartaoPct: number;
  pgtoPixTaxa: number;
  pgtoPixDesconto: number;
  outraParcelas: number;
  pgtoCustom: number;
  freteDiretoCusto: number;
  embutirTaxas: boolean;

  // Mercado Livre
  mlTipo: MlTipo;
  mlCategoria: string;
  mlComissaoManual: boolean;
  mlComissao: number;
  mlPesoEmbalagem: number;
  mlImposto: number;
  mlAds: number;
  mlExtras: number;

  // Shopee
  shopeeTipo: ShopeeTipo;
  shopeeCpfAlto: boolean;
  shopeeFrete: number;

  // Etsy
  etsyFrete: number;

  // TikTok Shop
  tiktokFrete: number;
  tiktokNovoVendedor: boolean;

  accItems: AccItem[];

  adsAtivo: boolean;
}

export interface CalculoResultado {
  custoUnit: number;
  cMaterial: number;
  cEnergia: number;
  cFalha: number;
  cAcc: number;
  precoConsumidor: number;
  precoVarejo: number;
  precoComPromo: number;
  lucroBruto: number;
  lucroLiquido: number;
  margem: number;
  taxaValor: number;
  taxas: CanalTaxas;
  pecasDia: number;
  ciclosDia: number;
  potDiario: number;
  potMensal: number;
}
