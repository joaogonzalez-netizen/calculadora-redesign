// Duas experiências pra organizar o Histórico (comparação A/B, PRD a definir):
// Pastas (1 cálculo pertence a no máximo 1 pasta) e Marcadores (N marcadores por
// cálculo). No fim só uma delas fica — o modo ativo é uma chave própria em
// localStorage pra dar pra alternar sem perder o que já foi organizado.
import { readJson, writeJson } from './storage';

export interface Pasta {
  id: string;
  nome: string;
  cor: string;
}

export interface Marcador {
  id: string;
  nome: string;
  cor: string;
}

export type ModoCluster = 'pastas' | 'marcadores';

export const PASTAS_KEY = 'stlseller_hist_pastas';
export const HIST_PASTA_KEY = 'stlseller_hist_pasta_vinculo';
export const MARCADORES_KEY = 'stlseller_hist_marcadores';
export const HIST_MARCADORES_KEY = 'stlseller_hist_marcadores_vinculo';
export const HIST_MODO_KEY = 'stlseller_hist_modo_cluster';

export const CORES_CLUSTER = ['#00955a', '#06b2a1', '#3b6fd4', '#8a3bd4', '#c58a00', '#d4633b', '#d43b6f'];

export function corAleatoria(usadas: string[]): string {
  const livre = CORES_CLUSTER.find((c) => !usadas.includes(c));
  return livre ?? CORES_CLUSTER[usadas.length % CORES_CLUSTER.length];
}

export function getPastas(): Pasta[] {
  return readJson<Pasta[]>(PASTAS_KEY, []);
}
export function savePastas(arr: Pasta[]): void {
  writeJson(PASTAS_KEY, arr);
}

export function getHistPastaVinculo(): Record<string, string> {
  return readJson<Record<string, string>>(HIST_PASTA_KEY, {});
}
export function saveHistPastaVinculo(v: Record<string, string>): void {
  writeJson(HIST_PASTA_KEY, v);
}

export function getMarcadores(): Marcador[] {
  return readJson<Marcador[]>(MARCADORES_KEY, []);
}
export function saveMarcadores(arr: Marcador[]): void {
  writeJson(MARCADORES_KEY, arr);
}

// Um cálculo tem no máximo 1 marcador — mesma regra de cardinalidade das pastas.
export function getHistMarcadorVinculo(): Record<string, string> {
  return readJson<Record<string, string>>(HIST_MARCADORES_KEY, {});
}
export function saveHistMarcadorVinculo(v: Record<string, string>): void {
  writeJson(HIST_MARCADORES_KEY, v);
}

export function getModoCluster(): ModoCluster {
  return readJson<ModoCluster>(HIST_MODO_KEY, 'pastas');
}
export function saveModoCluster(m: ModoCluster): void {
  writeJson(HIST_MODO_KEY, m);
}

/** Remove a pasta e limpa o vínculo de quem apontava pra ela. */
export function removerPasta(id: string): void {
  savePastas(getPastas().filter((p) => p.id !== id));
  const v = getHistPastaVinculo();
  const next = Object.fromEntries(Object.entries(v).filter(([, pid]) => pid !== id));
  saveHistPastaVinculo(next);
}

/** Remove o marcador e limpa o vínculo de quem apontava pra ele. */
export function removerMarcador(id: string): void {
  saveMarcadores(getMarcadores().filter((m) => m.id !== id));
  const v = getHistMarcadorVinculo();
  const next = Object.fromEntries(Object.entries(v).filter(([, mid]) => mid !== id));
  saveHistMarcadorVinculo(next);
}
