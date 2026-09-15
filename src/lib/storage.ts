// Persistência em localStorage — mesmas chaves do protótipo (PRD seção 5/6),
// pra facilitar uma migração futura pra API/banco sem quebrar dados existentes.

import { useCallback, useEffect, useState } from 'react';
import type { CustoExtra, Filamento, HistoricoEntry, Impressora, Preferencias } from '../types';

export const HIST_KEY = 'stlseller_history';
export const HIST_SEEDED_KEY = 'stlseller_history_seeded';
export const PREF_KEY = 'stlseller_preferencias';
export const PREF_IMP_KEY = 'stlseller_biblioteca_impressoras';
export const PREF_FIL_KEY = 'stlseller_biblioteca_filamentos';
export const PREF_CUSTO_KEY = 'stlseller_custos_padrao';
export const PRODUTO_VINCULOS_KEY = 'stlseller_produto_vinculos';
export const BUSCADOR_FAVORITOS_KEY = 'stlseller_buscador_favoritos';

/** Vínculo de custo/lucro de um Produto (tela Produtos) — ou aponta pra um cálculo
 * salvo da Calculadora, ou guarda custos digitados manualmente. Sem backend: fica
 * só em localStorage, mesma camada de persistência do resto do app. */
export interface ProdutoVinculo {
  tipo: 'calculo' | 'manual';
  calculoId?: number;
  custoProducao?: number;
  custoAnuncio?: number;
}
export type ProdutoVinculos = Record<string, ProdutoVinculo>;

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Hook genérico: estado sincronizado com localStorage sob a mesma chave. */
export function usePersistedState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(() => readJson(key, fallback));

  const update = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      writeJson(key, next);
      return next;
    });
  }, [key]);

  return [state, update] as const;
}

export const DEFAULT_IMPRESSORAS: Impressora[] = [
  { nome: 'Bambu Lab A1 mini', kwh: 0.10 },
  { nome: 'Bambu Lab A1', kwh: 0.22 },
  { nome: 'Bambu Lab P1S', kwh: 0.20 },
  { nome: 'Bambu Lab X1-Carbon', kwh: 0.20 },
  { nome: 'Bambu Lab H2D', kwh: 0.28 },
  { nome: 'Creality K1', kwh: 0.20 },
  { nome: 'Creality K1 Max', kwh: 0.25 },
  { nome: 'Prusa MK4S', kwh: 0.24 },
  { nome: 'Prusa MINI+', kwh: 0.16 },
];

export const DEFAULT_FILAMENTOS: Filamento[] = [
  { nome: 'STLFlix PLA', tipo: 'PLA', cor: 'Preto', preco: 75 },
];

export const DEFAULT_CUSTOS_PADRAO: CustoExtra[] = [
  { nome: 'Caixa de papelão', valor: 1.20, ativo: true, categoria: 'Embalagem' },
];

export const DEFAULT_PREFERENCIAS: Preferencias = {
  impressora: '',
  kwh: 0.75,
  filamento: '',
  imposto: 0,
  margem: 40,
  descontoPix: 0,
  moeda: 'BRL',
  taxaDebito: 1.99,
  taxaCredito: 2.99,
  taxaPix: 0,
  mlArRegimePadrao: 'monotributista',
  mlArCuotasPadrao: 'sem_cuotas',
};

export function getHistorico(): HistoricoEntry[] {
  return readJson<HistoricoEntry[]>(HIST_KEY, []);
}

export function saveHistoricoArr(arr: HistoricoEntry[]): void {
  writeJson(HIST_KEY, arr);
}

function filItem(nome: string, cor: string, precoKg: number, pesoG: number) {
  return [{ id: 'seed_' + nome.replace(/\s/g, '_'), nome, cor, precoKg, pesoG }];
}

/** Semeia 10 exemplos (cobrindo Venda direta, Mercado Livre e Shopee) na primeira
 * abertura, pra o dropdown de "vincular cálculo salvo" ter itens de sobra pra testar
 * o filtro por canal. Não re-semeia depois que o usuário limpar de propósito. */
export function seedHistoricoExemplo(nowMs: number): void {
  if (localStorage.getItem(HIST_SEEDED_KEY)) return;
  localStorage.setItem(HIST_SEEDED_KEY, '1');
  const exemplos: HistoricoEntry[] = [
    {
      id: nowMs - 172800000, nome: 'Dragão articulado 20cm', marketplace: 'Mercado Livre',
      custoUnit: 8.92, precoConsumidor: 16.40, precoVarejo: 8.20, lucroBruto: 7.48, lucroLiquido: 5.71,
      margem: 34.8, potMensal: 6888.00, taxaFalha: 2, custoKwh: 0.22, peso: 38, custoFilamento: 75,
      filamentoItems: filItem('STLFlix PLA', 'Verde', 75, 38), tempoH: 1.6, qtd: 1, imposto: 0, modoPrec: 'preco', margemDesejada: 40,
      precoVenda: 16.40, stlLink: '', concorrenteLink: '', comPromo: false, descontoPromo: 10,
    },
    {
      id: nowMs - 86400000, nome: 'Vaso geométrico facetado', marketplace: 'Venda direta',
      custoUnit: 5.10, precoConsumidor: 9.90, precoVarejo: 4.95, lucroBruto: 4.80, lucroLiquido: 4.61,
      margem: 46.6, potMensal: 4158.00, taxaFalha: 2, custoKwh: 0.20, peso: 64, custoFilamento: 75,
      filamentoItems: filItem('STLFlix PLA', 'Terracota', 75, 64), tempoH: 2.1, qtd: 1, imposto: 0, modoPrec: 'preco', margemDesejada: 40,
      precoVenda: 9.90, stlLink: '', concorrenteLink: '', comPromo: false, descontoPromo: 10,
    },
    {
      id: nowMs - 3600000, nome: 'Suporte de celular articulado', marketplace: 'Shopee',
      custoUnit: 3.35, precoConsumidor: 7.20, precoVarejo: 3.60, lucroBruto: 3.85, lucroLiquido: 2.49,
      margem: 34.6, potMensal: 3672.00, taxaFalha: 2, custoKwh: 0.10, peso: 22, custoFilamento: 75,
      filamentoItems: filItem('STLFlix PLA', 'Preto', 75, 22), tempoH: 0.9, qtd: 2, imposto: 0, modoPrec: 'preco', margemDesejada: 40,
      precoVenda: 7.20, stlLink: '', concorrenteLink: '', comPromo: false, descontoPromo: 10,
    },
    {
      id: nowMs - 2600000, nome: 'Letreiro decorativo - resina 12cm', marketplace: 'Venda direta',
      custoUnit: 1.89, precoConsumidor: 5.90, precoVarejo: 2.95, lucroBruto: 4.01, lucroLiquido: 3.90,
      margem: 66, potMensal: 3540.00, taxaFalha: 1.5, custoKwh: 0.10, peso: 41, custoFilamento: 75,
      filamentoItems: filItem('STLFlix PLA', 'Branco', 75, 41), tempoH: 0.8, qtd: 2, imposto: 0, modoPrec: 'preco', margemDesejada: 40,
      precoVenda: 5.90, stlLink: '', concorrenteLink: '', comPromo: false, descontoPromo: 10,
    },
    {
      id: nowMs - 2500000, nome: 'Letreiro decorativo - PETG 15cm', marketplace: 'Mercado Livre',
      custoUnit: 1.60, precoConsumidor: 5.20, precoVarejo: 2.60, lucroBruto: 3.60, lucroLiquido: 2.81,
      margem: 54, potMensal: 3120.00, taxaFalha: 1.5, custoKwh: 0.10, peso: 54, custoFilamento: 68,
      filamentoItems: filItem('STLFlix PETG', 'Preto', 68, 54), tempoH: 1.1, qtd: 1, imposto: 0, modoPrec: 'preco', margemDesejada: 40,
      precoVenda: 5.20, stlLink: '', concorrenteLink: '', comPromo: false, descontoPromo: 10,
    },
    {
      id: nowMs - 2400000, nome: 'Letreiro decorativo - mini 8cm', marketplace: 'Shopee',
      custoUnit: 0.75, precoConsumidor: 2.10, precoVarejo: 1.05, lucroBruto: 1.35, lucroLiquido: 0.86,
      margem: 41, potMensal: 1512.00, taxaFalha: 1.5, custoKwh: 0.08, peso: 24, custoFilamento: 75,
      filamentoItems: filItem('STLFlix PLA', 'Dourado', 75, 24), tempoH: 0.5, qtd: 3, imposto: 0, modoPrec: 'preco', margemDesejada: 40,
      precoVenda: 2.10, stlLink: '', concorrenteLink: '', comPromo: false, descontoPromo: 10,
    },
    {
      id: nowMs - 2300000, nome: 'Luminária geométrica de mesa', marketplace: 'Mercado Livre',
      custoUnit: 7.40, precoConsumidor: 19.90, precoVarejo: 9.95, lucroBruto: 12.50, lucroLiquido: 7.56,
      margem: 38, potMensal: 5970.00, taxaFalha: 2, custoKwh: 0.20, peso: 72, custoFilamento: 82,
      filamentoItems: filItem('STLFlix PETG', 'Branco', 82, 72), tempoH: 2.4, qtd: 1, imposto: 0, modoPrec: 'preco', margemDesejada: 40,
      precoVenda: 19.90, stlLink: '', concorrenteLink: '', comPromo: false, descontoPromo: 10,
    },
    {
      id: nowMs - 2200000, nome: 'Porta-chaves parede minimalista', marketplace: 'Shopee',
      custoUnit: 2.10, precoConsumidor: 8.90, precoVarejo: 4.45, lucroBruto: 6.80, lucroLiquido: 4.63,
      margem: 52, potMensal: 2670.00, taxaFalha: 1.5, custoKwh: 0.10, peso: 30, custoFilamento: 75,
      filamentoItems: filItem('STLFlix PLA', 'Preto', 75, 30), tempoH: 0.7, qtd: 2, imposto: 0, modoPrec: 'preco', margemDesejada: 40,
      precoVenda: 8.90, stlLink: '', concorrenteLink: '', comPromo: false, descontoPromo: 10,
    },
    {
      id: nowMs - 2100000, nome: 'Organizador de mesa modular', marketplace: 'Venda direta',
      custoUnit: 6.10, precoConsumidor: 14.90, precoVarejo: 7.45, lucroBruto: 8.80, lucroLiquido: 6.56,
      margem: 44, potMensal: 4470.00, taxaFalha: 2, custoKwh: 0.20, peso: 88, custoFilamento: 75,
      filamentoItems: filItem('STLFlix PLA', 'Cinza', 75, 88), tempoH: 2.8, qtd: 1, imposto: 0, modoPrec: 'preco', margemDesejada: 40,
      precoVenda: 14.90, stlLink: '', concorrenteLink: '', comPromo: false, descontoPromo: 10,
    },
    {
      id: nowMs - 2000000, nome: 'Suporte para fones de ouvido', marketplace: 'Mercado Livre',
      custoUnit: 4.20, precoConsumidor: 11.90, precoVarejo: 5.95, lucroBruto: 7.70, lucroLiquido: 4.64,
      margem: 39, potMensal: 3570.00, taxaFalha: 2, custoKwh: 0.20, peso: 58, custoFilamento: 75,
      filamentoItems: filItem('STLFlix PLA', 'Verde', 75, 58), tempoH: 1.9, qtd: 1, imposto: 0, modoPrec: 'preco', margemDesejada: 40,
      precoVenda: 11.90, stlLink: '', concorrenteLink: '', comPromo: false, descontoPromo: 10,
    },
  ];
  saveHistoricoArr(exemplos);
}

/** Notifica outras abas/componentes quando o histórico muda numa mesma sessão. */
export function useHistoricoBadge(): number {
  const [count, setCount] = useState(() => getHistorico().length);
  useEffect(() => {
    const onStorage = () => setCount(getHistorico().length);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return count;
}
