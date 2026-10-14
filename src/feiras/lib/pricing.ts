import type { Config, Produto } from './types';

export const CONFIG_PADRAO: Config = { custoKg: 100, custoHora: 1.2, markupAtacado: 3, markupVarejo: 1.8 };

export const custoProduto = (p: Produto, c: Config) =>
  p.custoManual ?? ((p.pesoG / 1000) * c.custoKg + p.tempoH * c.custoHora + p.acessorio);
export const atacadoAuto = (p: Produto, c: Config) => custoProduto(p, c) * c.markupAtacado;
export const varejoAuto = (p: Produto, c: Config) => atacadoAuto(p, c) * c.markupVarejo;
export const precoAtacado = (p: Produto, c: Config) => p.atacadoManual ?? atacadoAuto(p, c);
export const precoVarejo = (p: Produto, c: Config) => p.varejoManual ?? varejoAuto(p, c);
