import type { Feira, ProdutoDaFeira, RegraRepete } from './types';
import { addDias, diasEntre, hoje } from './format';
import { tf } from './i18n';

export interface Ocorrencia { inicio: string; fim: string }

const pad = (n: number) => String(n).padStart(2, '0');
const dt = (iso: string) => new Date(iso + 'T12:00:00');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const diasNoMes = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

/** Posição do dia na semana dentro do mês: 1..4, ou -1 para a última (5ª) ocorrência. */
export const nesimoDoMes = (inicio: string) => { const n = Math.ceil(dt(inicio).getDate() / 7); return n >= 5 ? -1 : n; };

function nesimoDiaSemana(y: number, m: number, wd: number, n: number): string | null {
  const dia = n > 0
    ? 1 + ((wd - new Date(y, m, 1).getDay() + 7) % 7) + 7 * (n - 1)
    : diasNoMes(y, m) - ((new Date(y, m, diasNoMes(y, m)).getDay() - wd + 7) % 7);
  return dia >= 1 && dia <= diasNoMes(y, m) ? `${y}-${pad(m + 1)}-${pad(dia)}` : null;
}

/** Datas candidatas em ordem crescente (sem aplicar o fim da repetição). */
function* candidatas(inicio: string, r: RegraRepete): Generator<string> {
  const base = dt(inicio);
  const cada = Math.max(1, r.cada);
  for (let k = 0; k < 5000; k++) {
    if (r.freq === 'dia') yield addDias(k * cada, inicio);
    else if (r.freq === 'semana') {
      const domingo = new Date(base.getFullYear(), base.getMonth(), base.getDate() - base.getDay() + 7 * cada * k);
      for (const wd of [...(r.diasSemana?.length ? r.diasSemana : [base.getDay()])].sort((a, b) => a - b)) {
        const d = new Date(domingo.getFullYear(), domingo.getMonth(), domingo.getDate() + wd);
        if (iso(d) >= inicio) yield iso(d);
      }
    } else if (r.freq === 'mes') {
      const alvo = new Date(base.getFullYear(), base.getMonth() + k * cada, 1);
      const y = alvo.getFullYear(); const m = alvo.getMonth();
      const d = r.mensal === 'nesimo' ? nesimoDiaSemana(y, m, base.getDay(), nesimoDoMes(inicio)) : `${y}-${pad(m + 1)}-${pad(Math.min(base.getDate(), diasNoMes(y, m)))}`;
      if (d && d >= inicio) yield d;
    } else {
      const y = base.getFullYear() + k * cada; const m = base.getMonth();
      yield `${y}-${pad(m + 1)}-${pad(Math.min(base.getDate(), diasNoMes(y, m)))}`;
    }
  }
}

export const regraEfetiva = (f: Feira): RegraRepete | undefined => f.regra;

/** Dias da primeira edição, em ordem. Feiras antigas (início–fim) viram todos os dias do período. */
export function diasDaFeira(f: Feira): string[] {
  if (f.dias?.length) return [...f.dias].sort();
  const n = f.fim && f.fim > f.inicio ? diasEntre(f.inicio, f.fim) : 0;
  return Array.from({ length: n + 1 }, (_, i) => addDias(i, f.inicio));
}

/** Dias de feira dentro de [de, ate]. Cada data é um dia de feira (feiraId + data identificam onde e quando vendeu). */
export function ocorrencias(f: Feira, de: string, ate: string): Ocorrencia[] {
  const dias = diasDaFeira(f);
  const r = f.regra;
  const noIntervalo = (d: string) => d >= de && d <= ate;
  if (!r) return dias.filter(noIntervalo).map((d) => ({ inicio: d, fim: d }));
  const primeiro = dias[0];
  const desloc = dias.map((d) => diasEntre(primeiro, d));
  const limite = r.termina?.tipo === 'data' && r.termina.data < ate ? r.termina.data : ate;
  const max = r.termina?.tipo === 'vezes' ? r.termina.vezes : Infinity;
  const out = new Set<string>();
  let n = 0;
  for (const s of candidatas(primeiro, r)) {
    if (s > limite || ++n > max) break;
    for (const o of desloc) { const d = addDias(o, s); if (noIntervalo(d)) out.add(d); }
  }
  return [...out].sort().map((d) => ({ inicio: d, fim: d }));
}

/** Dia de feira de hoje ou o próximo; null se já acabou de vez. */
export function proximaOcorrencia(f: Feira): Ocorrencia | null {
  const h = hoje();
  return ocorrencias(f, h, addDias(800, h))[0] ?? null;
}

// ---- Opções do "Repete" (mesma ideia do Google Agenda, sem horas) ----

export type Preset = 'nao' | 'dia' | 'semana' | 'mes-dia' | 'mes-nesimo' | 'ano' | 'uteis' | 'custom';
export const PRESETS: Preset[] = ['nao', 'dia', 'semana', 'mes-dia', 'mes-nesimo', 'ano', 'uteis', 'custom'];

export function regraDoPreset(p: Preset, inicio: string): RegraRepete | undefined {
  switch (p) {
    case 'dia': return { freq: 'dia', cada: 1 };
    case 'semana': return { freq: 'semana', cada: 1, diasSemana: [dt(inicio).getDay()] };
    case 'mes-dia': return { freq: 'mes', cada: 1, mensal: 'dia' };
    case 'mes-nesimo': return { freq: 'mes', cada: 1, mensal: 'nesimo' };
    case 'ano': return { freq: 'ano', cada: 1 };
    case 'uteis': return { freq: 'semana', cada: 1, diasSemana: [1, 2, 3, 4, 5] };
    default: return undefined;
  }
}

export function presetDe(r: RegraRepete | undefined, inicio: string): Preset {
  if (!r) return 'nao';
  const a = JSON.stringify(r);
  return (['dia', 'semana', 'mes-dia', 'mes-nesimo', 'ano', 'uteis'] as Preset[]).find((p) => JSON.stringify(regraDoPreset(p, inicio)) === a) ?? 'custom';
}

const locale = () => (tf('feiras.rep.locale') === 'en' ? 'en-US' : 'pt-BR');
export const nomeDiaSemana = (wd: number, estilo: 'long' | 'short' | 'narrow' = 'long') => new Date(2023, 0, 1 + wd).toLocaleDateString(locale(), { weekday: estilo });
const nomeMes = (m: number) => new Date(2023, m, 1).toLocaleDateString(locale(), { month: 'long' });

/** Texto de cada opção do seletor, calculado a partir da data de início. */
export function rotuloPreset(p: Preset, inicio: string): string {
  const d = dt(inicio);
  const wd = nomeDiaSemana(d.getDay());
  switch (p) {
    case 'nao': return tf('feiras.rep.nao');
    case 'dia': return tf('feiras.rep.dia');
    case 'semana': return tf('feiras.rep.semana', { dia: wd });
    case 'mes-dia': return tf('feiras.rep.mesDia', { n: d.getDate() });
    case 'mes-nesimo': return tf('feiras.rep.mesNesimo', { n: tf('feiras.rep.ord' + nesimoDoMes(inicio)), dia: wd });
    case 'ano': return tf('feiras.rep.ano', { data: `${nomeMes(d.getMonth())} ${d.getDate()}` });
    case 'uteis': return tf('feiras.rep.uteis');
    default: return tf('feiras.rep.custom');
  }
}

/** Resumo curto da repetição de uma feira, para o card. */
export function resumoRegra(f: Feira): string {
  const r = regraEfetiva(f);
  const p = presetDe(r, f.inicio);
  let txt: string;
  if (!r) return '';
  if (p !== 'custom') txt = rotuloPreset(p, f.inicio);
  else {
    const un = tf('feiras.rep.un.' + r.freq + (r.cada === 1 ? '1' : 'N'));
    txt = r.cada === 1 ? tf('feiras.rep.cada1', { un }) : tf('feiras.rep.cadaN', { n: r.cada, un });
    if (r.freq === 'semana' && r.diasSemana?.length) txt += ' · ' + r.diasSemana.map((w) => nomeDiaSemana(w, 'short')).join(', ');
    if (r.freq === 'mes') txt += ' · ' + rotuloPreset(r.mensal === 'nesimo' ? 'mes-nesimo' : 'mes-dia', f.inicio);
  }
  if (r.termina?.tipo === 'vezes') txt += ' · ' + tf('feiras.rep.vezes', { n: r.termina.vezes });
  return txt;
}

/** O que levar num dia de feira: o que foi lançado para aquela data, ou o modelo "costumo levar" do ponto. */
export function levarDoDia(f: Feira, data: string): ProdutoDaFeira[] {
  const r = f.registros?.[data];
  // Dia já lançado: vale o que foi levado naquele dia (pode diferir do modelo e até ser zero).
  if (r) return r.itens.filter((i) => i.levou > 0).map((i) => ({ produtoId: i.produtoId, qtd: i.levou, unit: i.unit }));
  return f.produtos ?? [];
}

/** Totais lançados em todos os dias de feira (ou só em um dia, se `data` vier).
 *  levou/valorInvestido = o que foi para a feira (lançado no dia ou, sem lançamento, o modelo da próxima edição), a custo de produção; vendeu/receita = o que vendeu. */
export function totaisDaFeira(f: Feira, data?: string, custoDe?: (produtoId: string) => number) {
  let datas = data ? (f.registros?.[data] ? [data] : []) : Object.keys(f.registros ?? {});
  // Sem nenhum lançamento, o card já mostra o planejado (produtos cadastrados) para a próxima edição.
  if (!data && !datas.length && f.produtos?.length) datas = [proximaOcorrencia(f)?.inicio ?? f.inicio];
  const t = { receita: 0, levou: 0, valorInvestido: 0, vendeu: 0, quebra: 0, cortesia: 0, sobra: 0 };
  datas.forEach((d) => {
    f.registros?.[d]?.itens.forEach((i) => {
      t.receita += i.vendeu * i.unit; t.vendeu += i.vendeu; t.quebra += i.quebra; t.cortesia += i.cortesia;
      t.sobra += i.levou - i.vendeu - i.quebra - i.cortesia;
    });
    levarDoDia(f, d).forEach((p) => { t.levou += p.qtd; t.valorInvestido += p.qtd * (custoDe ? custoDe(p.produtoId) : (p.unit ?? 0)); });
  });
  return t;
}

/** Dias de feira para lançar: os últimos meses e as próximas semanas, mais os que já têm lançamento. */
export function diasParaLancar(f: Feira): string[] {
  const h = hoje();
  const base = ocorrencias(f, addDias(-180, h), addDias(60, h)).map((o) => o.inicio);
  return [...new Set([...base, ...Object.keys(f.registros ?? {})])].sort();
}
