export const PAGINA_TAM = 24;

export type ItemPaginacao = number | 'gap-ini' | 'gap-fim';

/** Números do rodapé: primeira, última, atual e 2 vizinhas de cada lado, com reticências. */
export function itensPaginacao(atual: number, total: number): ItemPaginacao[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const ini = Math.max(2, atual - 2);
  const fim = Math.min(total - 1, atual + 2);
  const itens: ItemPaginacao[] = [1];
  if (ini > 2) itens.push('gap-ini');
  for (let p = ini; p <= fim; p++) itens.push(p);
  if (fim < total - 1) itens.push('gap-fim');
  itens.push(total);
  return itens;
}

/** Página inválida ou fora do intervalo cai na mais próxima válida. */
export function limitarPagina(valor: number, total: number): number {
  if (!Number.isInteger(valor) || valor < 1) return 1;
  return Math.min(valor, Math.max(1, total));
}
