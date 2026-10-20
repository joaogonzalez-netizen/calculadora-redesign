// Origem da Calculadora quando aberta a partir do catálogo de Venda direta:
// mostra um aviso (taxas de venda direta) e o atalho "Voltar ao catálogo".
const KEY = 'stlseller_calc_origem_catalogo';

export function marcarOrigemCatalogo() {
  try { sessionStorage.setItem(KEY, '1'); } catch { /* sem storage */ }
}
export function veioDoCatalogo(): boolean {
  try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
}
export function limparOrigemCatalogo() {
  try { sessionStorage.removeItem(KEY); } catch { /* sem storage */ }
}
