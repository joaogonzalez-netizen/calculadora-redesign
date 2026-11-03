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
