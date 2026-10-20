import type { Moeda } from '../types';
import type { Idioma } from './i18n';

// Formato de números e moeda segue o idioma ativo: PT/ES usam "1.234,56", EN usa
// "1,234.56". O I18nProvider chama definirIdiomaFormato a cada troca de idioma, então
// funções puras como brl()/fmtMoeda() não precisam receber o idioma em cada chamada.
let idiomaFormato: Idioma = 'pt';
export function definirIdiomaFormato(idioma: Idioma) { idiomaFormato = idioma; }
export function idiomaDoFormato(): Idioma { return idiomaFormato; }
export function localeNumeros(): string { return idiomaFormato === 'en' ? 'en-US' : 'pt-BR'; }

const duasCasas = (n: number) => n.toLocaleString(localeNumeros(), { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Valores em "reais" do app (mocks, pedidos, histórico): na versão EN o app trabalha em
// dólar, então o mesmo helper devolve "$1,234.56" em vez de "R$ 1.234,56".
export function brl(v: number): string {
  const n = isNaN(v) || v === null ? 0 : v;
  return idiomaFormato === 'en' ? '$' + duasCasas(n) : 'R$ ' + duasCasas(n);
}

// Moeda de exibição é só o símbolo (PRD seção 7), nunca há conversão de valor.
export function fmtMoeda(v: number, moeda: Moeda): string {
  const n = isNaN(v) || v === null ? 0 : v;
  const num = duasCasas(n);
  if (moeda === 'USD') return idiomaFormato === 'en' ? '$' + num : 'US$ ' + num;
  if (moeda === 'EUR') return '€ ' + num;
  if (moeda === 'ARS') return 'AR$ ' + num;
  return 'R$ ' + num;
}

export function moedaSimbolo(moeda: Moeda): string {
  if (moeda === 'USD') return idiomaFormato === 'en' ? '$' : 'US$';
  if (moeda === 'EUR') return '€';
  if (moeda === 'ARS') return 'AR$';
  return 'R$';
}
