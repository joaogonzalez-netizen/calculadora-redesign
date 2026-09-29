// Organização do Histórico por marcadores (tags). A experiência de pastas foi
// descontinuada: cada cálculo aceita até MAX_POR_CALCULO marcadores, e o
// Histórico filtra por um ou mais deles. Pastas antigas viram marcadores na
// primeira leitura (migrarPastas), pra não perder o que já estava organizado.
import type { HistoricoEntry } from '../types';
import { readJson, writeJson } from './storage';

export interface Marcador {
  id: string;
  nome: string;
  cor: string;
}

export const MARCADORES_KEY = 'stlseller_hist_marcadores';
export const HIST_MARCADORES_KEY = 'stlseller_hist_marcadores_vinculo';
// Chaves da experiência de pastas — só lidas pra migrar.
const PASTAS_KEY = 'stlseller_hist_pastas';
const HIST_PASTA_KEY = 'stlseller_hist_pasta_vinculo';
const MIGRACAO_KEY = 'stlseller_hist_pastas_migradas';

export const CORES_CLUSTER = ['#00955a', '#06b2a1', '#3b6fd4', '#8a3bd4', '#c58a00', '#d4633b', '#d43b6f'];

/** Teto de marcadores criados — cada um é um filtro rápido, não uma taxonomia. */
export const LIMITE_CLUSTER = 10;
/** Quantos marcadores um mesmo cálculo pode ter. */
export const MAX_POR_CALCULO = 3;

/** id do cálculo → ids dos marcadores dele (na ordem em que foram aplicados). */
export type VinculoMarcadores = Record<string, string[]>;

export function corAleatoria(usadas: string[]): string {
  const livre = CORES_CLUSTER.find((c) => !usadas.includes(c));
  return livre ?? CORES_CLUSTER[usadas.length % CORES_CLUSTER.length];
}

export function getMarcadores(): Marcador[] {
  return readJson<Marcador[]>(MARCADORES_KEY, []);
}
export function saveMarcadores(arr: Marcador[]): void {
  writeJson(MARCADORES_KEY, arr);
}

// Antes era 1 marcador por cálculo (valor string) — lê os dois formatos.
export function getHistMarcadores(): VinculoMarcadores {
  const bruto = readJson<Record<string, string | string[]>>(HIST_MARCADORES_KEY, {});
  return Object.fromEntries(
    Object.entries(bruto).map(([id, v]) => [id, (Array.isArray(v) ? v : [v]).slice(0, MAX_POR_CALCULO)]),
  );
}
export function saveHistMarcadores(v: VinculoMarcadores): void {
  writeJson(HIST_MARCADORES_KEY, v);
}

/** Remove o marcador e tira ele de todos os cálculos que o usavam. */
export function removerMarcador(id: string): void {
  saveMarcadores(getMarcadores().filter((m) => m.id !== id));
  const v = getHistMarcadores();
  saveHistMarcadores(Object.fromEntries(Object.entries(v).map(([calc, ids]) => [calc, ids.filter((m) => m !== id)])));
}

export function contarUsos(vinculo: VinculoMarcadores, marcadorId: string): number {
  return Object.values(vinculo).filter((ids) => ids.includes(marcadorId)).length;
}

/** Roda uma vez: cada pasta vira marcador (reaproveitando um de mesmo nome) e
 * cada cálculo ganha o marcador da pasta dele, se ainda tiver espaço. */
export function migrarPastas(): void {
  if (localStorage.getItem(MIGRACAO_KEY)) return;
  localStorage.setItem(MIGRACAO_KEY, '1');
  const pastas = readJson<Marcador[]>(PASTAS_KEY, []);
  if (!pastas.length) return;
  const marcadores = getMarcadores();
  const vinculo = getHistMarcadores();
  const pastaParaMarcador: Record<string, string> = {};
  for (const p of pastas) {
    const existente = marcadores.find((m) => m.nome.toLowerCase() === p.nome.toLowerCase());
    if (existente) pastaParaMarcador[p.id] = existente.id;
    else if (marcadores.length < LIMITE_CLUSTER) {
      const novo = { id: 'tag_' + p.id, nome: p.nome, cor: p.cor };
      marcadores.push(novo);
      pastaParaMarcador[p.id] = novo.id;
    }
  }
  for (const [calc, pastaId] of Object.entries(readJson<Record<string, string>>(HIST_PASTA_KEY, {}))) {
    const tag = pastaParaMarcador[pastaId];
    const atuais = vinculo[calc] ?? [];
    if (tag && !atuais.includes(tag) && atuais.length < MAX_POR_CALCULO) vinculo[calc] = [...atuais, tag];
  }
  saveMarcadores(marcadores);
  saveHistMarcadores(vinculo);
}

// Primeira visita sem nenhum marcador: 4 de exemplo aplicados nos cálculos de
// exemplo do Histórico (casados por nome), pra dar pra testar o filtro na hora.
const EXEMPLOS: { marcador: Marcador; calculos: string[] }[] = [
  { marcador: { id: 'tag_ex_decoracao', nome: 'Decoração', cor: '#00955a' }, calculos: ['Vaso geométrico facetado', 'Letreiro decorativo - resina 12cm', 'Letreiro decorativo - PETG 15cm', 'Letreiro decorativo - mini 8cm'] },
  { marcador: { id: 'tag_ex_kit', nome: 'Kit', cor: '#3b6fd4' }, calculos: ['Letreiro decorativo - resina 12cm', 'Letreiro decorativo - PETG 15cm'] },
  { marcador: { id: 'tag_ex_mais_vendido', nome: 'Mais vendido', cor: '#d4633b' }, calculos: ['Dragão articulado 20cm', 'Letreiro decorativo - resina 12cm'] },
  { marcador: { id: 'tag_ex_revisar', nome: 'Revisar preço', cor: '#c58a00' }, calculos: ['Suporte de celular articulado'] },
];

export function seedMarcadoresExemplo(hist: HistoricoEntry[]): void {
  if (localStorage.getItem(MARCADORES_KEY) !== null) return;
  const vinculo: VinculoMarcadores = {};
  for (const { marcador, calculos } of EXEMPLOS) {
    for (const h of hist.filter((x) => calculos.includes(x.nome))) {
      vinculo[h.id] = [...(vinculo[h.id] ?? []), marcador.id].slice(0, MAX_POR_CALCULO);
    }
  }
  saveMarcadores(EXEMPLOS.map((e) => e.marcador));
  saveHistMarcadores(vinculo);
}
