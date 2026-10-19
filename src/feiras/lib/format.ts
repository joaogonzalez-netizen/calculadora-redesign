export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const brlCurto = (n: number) =>
  n >= 10000 ? 'R$ ' + (n / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' : brl(n);

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const hoje = () => new Date().toISOString().slice(0, 10);

export function addDias(dias: number, base = hoje()) {
  const d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function diasEntre(a: string, b: string) {
  return Math.round((new Date(b + 'T12:00:00').getTime() - new Date(a + 'T12:00:00').getTime()) / 86400000);
}

export function dataCurta(iso: string | null) {
  if (!iso) return 'N/D';
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export function dataLonga(iso: string | null) {
  if (!iso) return 'N/D';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** "hoje", "amanhã", "em 3 dias", "há 2 dias" */
export function relativo(iso: string) {
  const n = diasEntre(hoje(), iso);
  if (n === 0) return 'hoje';
  if (n === 1) return 'amanhã';
  if (n === -1) return 'ontem';
  return n > 0 ? `em ${n} dias` : `há ${-n} dias`;
}

export function waLink(tel: string, msg?: string) {
  let d = tel.replace(/\D/g, '');
  if (!d) return '';
  if (d.length <= 11) d = '55' + d;
  return `https://wa.me/${d}` + (msg ? `?text=${encodeURIComponent(msg)}` : '');
}

export function mascaraTel(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const iniciais = (nome: string) =>
  nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
