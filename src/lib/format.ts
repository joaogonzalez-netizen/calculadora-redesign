import type { Moeda } from '../types';

export function brl(v: number): string {
  const n = isNaN(v) || v === null ? 0 : v;
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Moeda de exibição é só o símbolo (PRD seção 7) — nunca há conversão de valor.
export function fmtMoeda(v: number, moeda: Moeda): string {
  const n = isNaN(v) || v === null ? 0 : v;
  const num = n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (moeda === 'USD') return 'US$ ' + num;
  if (moeda === 'EUR') return '€ ' + num;
  if (moeda === 'ARS') return 'AR$ ' + num;
  return 'R$ ' + num;
}

export function moedaSimbolo(moeda: Moeda): string {
  if (moeda === 'USD') return 'US$';
  if (moeda === 'EUR') return '€';
  if (moeda === 'ARS') return 'AR$';
  return 'R$';
}
