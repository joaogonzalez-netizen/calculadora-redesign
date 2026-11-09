// Etiquetas de envio Shopee (protótipo). Sem backend: o arquivo da etiqueta é
// simulado e o "gerar" devolve um resultado fictício. Contrato real em
// docs/spec-etiquetas-shopee.md, seção 7.

import type { Pedido } from './pedidosMock';

export type FormatoEtiqueta = 'termica-a6' | 'a4';
export type MotivoInelegivel = 'pendente' | 'cancelado' | 'entregue';
export type ErroEtiqueta = 'codigo' | 'falha';

export interface ResultadoEtiqueta {
  id: string;
  erro: ErroEtiqueta | null;
}

/** Limite do protótipo. O real vem da API da Shopee. */
export const LIMITE_LOTE_ETIQUETAS = 50;

const CHAVE_IMPRESSAS = 'stlseller_etiquetas_impressas';
const CHAVE_FORMATO = 'stlseller_etiqueta_formato';

export function ehPedidoShopee(p: Pedido): boolean {
  return p.marketplace === 'Shopee';
}

/** Só chamar para pedido Shopee. Null = pode imprimir. */
export function motivoInelegivel(p: Pedido): MotivoInelegivel | null {
  if (p.status === 'Pendente') return 'pendente';
  if (p.status === 'Cancelado') return 'cancelado';
  if (p.status === 'Entregue') return 'entregue';
  return null;
}

export function podeImprimirEtiqueta(p: Pedido): boolean {
  return ehPedidoShopee(p) && motivoInelegivel(p) === null;
}

/**
 * Gerador pseudo-aleatório determinístico: a mesma semente sempre devolve a
 * mesma sequência. O preview da etiqueta (QR, barras, endereço) usa isso para
 * não "piscar" a cada render.
 */
export function gerador(semente: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < semente.length; i++) {
    h ^= semente.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tudo que o preview da etiqueta mostra além do que o pedido já traz. Dados FICTÍCIOS. */
export interface DadosEtiqueta {
  destinatario: { nome: string; endereco: string; bairro: string; cep: string; pedido: string };
  rota: { cidade: string; codigo1: string; codigo2: string };
  rastreio: string;
  remetente: { nome: string; endereco: string; cep: string; envioPrevisto: string; hub1: string; hub2: string };
  danfe: { nf: string; serie: string; emissao: string; chave: string; item: string };
}

const RUAS = ['Rua das Acácias', 'Avenida Brasil', 'Rua Quinze de Novembro', 'Travessa dos Ipês', 'Rua Sete de Setembro', 'Alameda das Flores'];
const BAIRROS = ['Centro', 'Jardim das Palmeiras', 'Vila Nova', 'Bela Vista', 'Parque Industrial', 'Jardim Primavera'];

const doisDigitos = (n: number) => String(n).padStart(2, '0');
const formatarDia = (d: Date) => `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()}`;

/** `dd/mm/aaaa` do mock em português; qualquer outro formato cai na data de hoje. */
function dataDoPedido(data: string): Date {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(data);
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : new Date();
}

/**
 * Preenche a etiqueta simulada seguindo o desenho da etiqueta real da Shopee
 * (destinatário, rota de triagem, coleta, remetente e DANFE simplificada).
 * Endereço, rota, NF e chave são inventados e estáveis por pedido: o contrato
 * real entrega esse arquivo pronto (docs/spec-etiquetas-shopee.md, seção 7).
 */
export function dadosDaEtiqueta(p: Pedido): DadosEtiqueta {
  const r = gerador(p.id);
  const sorteio = (n: number) => Math.floor(r() * n);
  const dia = dataDoPedido(p.data);
  const previsto = new Date(dia);
  previsto.setDate(previsto.getDate() + 2);
  const item = p.itens[0];
  const descricao = item ? `${item.qtd}x ${item.nome} - ${item.qtd}un` : `${p.qtd}x ${p.produto} - ${p.qtd}un`;

  return {
    destinatario: {
      nome: p.comprador,
      endereco: `${RUAS[sorteio(RUAS.length)]}, ${100 + sorteio(900)}`,
      bairro: BAIRROS[sorteio(BAIRROS.length)],
      cep: p.destinoCep,
      pedido: p.id.slice(-8) + 'SHP' + String(sorteio(900) + 100),
    },
    rota: {
      cidade: p.destinoCidade.split(',')[0].trim(),
      codigo1: `SP${10 + sorteio(20)} -${1 + sorteio(5)}`,
      codigo2: `LMS-${doisDigitos(1 + sorteio(20))}`,
    },
    rastreio: p.envioCodigo,
    remetente: {
      nome: p.conta,
      endereco: 'Rua das Oficinas, 120, Centro, Joinville, Santa Catarina',
      cep: '89201-000',
      envioPrevisto: formatarDia(previsto),
      hub1: 'SOC',
      hub2: `PR${1 + sorteio(3)}`,
    },
    danfe: {
      nf: String(10000 + sorteio(9000)),
      serie: '2',
      emissao: `${doisDigitos(dia.getDate())}-${doisDigitos(dia.getMonth() + 1)}-${dia.getFullYear()} 18:59:00`,
      chave: Array.from({ length: 44 }, () => sorteio(10)).join(''),
      item: descricao.length > 74 ? descricao.slice(0, 71) + '...' : descricao,
    },
  };
}

export type StatusEtiqueta = 'a-emitir' | 'emitida' | 'indisponivel';

/**
 * Status da coluna Etiquetas. Null para pedido de outro marketplace.
 * Emitida vence os demais: o selo some só se o histórico for apagado, e a
 * reemissão continua liberada enquanto o pedido for elegível.
 */
export function statusEtiqueta(p: Pedido, impressas: Record<string, string>): StatusEtiqueta | null {
  if (!ehPedidoShopee(p)) return null;
  if (impressas[p.id]) return 'emitida';
  return motivoInelegivel(p) ? 'indisponivel' : 'a-emitir';
}

/**
 * Simula a geração. Pedido cujo id termina em 2 devolve "código ainda não
 * gerado" na primeira tentativa, pra exercitar o lote parcial. Na nova
 * tentativa tudo passa.
 */
export function gerarEtiquetasMock(pedidos: Pedido[], novaTentativa: boolean): Promise<ResultadoEtiqueta[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        pedidos.map((p) => ({
          id: p.id,
          erro: !novaTentativa && p.id.endsWith('2') ? 'codigo' : null,
        })),
      );
    }, 900);
  });
}

function lerJson<T>(chave: string, vazio: T): T {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : vazio;
  } catch (erro) {
    console.warn(`[etiquetasShopee] não foi possível ler "${chave}"`, erro);
    return vazio;
  }
}

function gravarJson(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    console.warn(`[etiquetasShopee] não foi possível gravar "${chave}"`, erro);
  }
}

/** id do pedido -> data ISO da última impressão. */
export function lerImpressas(): Record<string, string> {
  const dados = lerJson<unknown>(CHAVE_IMPRESSAS, {});
  if (typeof dados !== 'object' || dados === null || Array.isArray(dados)) return {};
  const limpo: Record<string, string> = {};
  for (const [id, data] of Object.entries(dados)) {
    if (typeof data === 'string') limpo[id] = data;
  }
  return limpo;
}

export function gravarImpressas(impressas: Record<string, string>) {
  gravarJson(CHAVE_IMPRESSAS, impressas);
}

export function lerFormato(): FormatoEtiqueta {
  const dado = lerJson<unknown>(CHAVE_FORMATO, 'termica-a6');
  return dado === 'a4' ? 'a4' : 'termica-a6';
}

export function gravarFormato(formato: FormatoEtiqueta) {
  gravarJson(CHAVE_FORMATO, formato);
}
