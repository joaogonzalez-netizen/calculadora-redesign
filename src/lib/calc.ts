// Núcleo de cálculo, porte fiel de calcular() do protótipo HTML.
// Fórmulas críticas (PRD seção 4) preservadas exatamente, inclusive o solver
// de ponto fixo do modo "margem mínima" e as regras de canal da seção 4/11.

import type {
  CalculoResultado,
  CalculoState,
  CanalTaxas,
  MlFreteInfo,
} from '../types';

// Preço que a loja paga por peça: o valor digitado, ou (em branco) o preço calculado
// pela margem, para a pessoa não precisar redigitar.
export function precoParaLojaEfetivo(state: CalculoState, r: CalculoResultado | null): number {
  if (state.canalAtivo !== 'Venda direta' || !state.revendaAtiva) return 0;
  if (state.precoParaLoja > 0) return state.precoParaLoja;
  if (!r) return 0;
  return Math.round(r.precoConsumidor * 100) / 100;
}

export function getMlFreteEstimado(pesoKg: number, preco: number): MlFreteInfo {
  const bandasPeso = [0.3, 0.5, 1, 2, 3, 5, 9, 13, 17, 25];
  const labelsPeso = [
    'Até 0,3 kg', '0,3 a 0,5 kg', '0,5 a 1 kg', '1 a 2 kg', '2 a 3 kg',
    '3 a 5 kg', '5 a 9 kg', '9 a 13 kg', '13 a 17 kg', 'Acima de 17 kg',
  ];
  let idx = bandasPeso.findIndex((b) => pesoKg <= b);
  if (idx === -1) idx = bandasPeso.length - 1;
  const faixaPesoLabel = labelsPeso[idx];

  let faixaPrecoLabel: string;
  let custoBase: number;
  if (preco < 19) { faixaPrecoLabel = 'Até R$ 19'; custoBase = Math.min(preco * 0.5, 3 + idx * 1.2); }
  else if (preco < 50) { faixaPrecoLabel = 'R$ 19 a R$ 49,99'; custoBase = 5 + idx * 1.6; }
  else if (preco < 79) { faixaPrecoLabel = 'R$ 50 a R$ 78,99'; custoBase = 7 + idx * 2.0; }
  else if (preco < 120) { faixaPrecoLabel = 'R$ 79 a R$ 119,99'; custoBase = 9 + idx * 2.4; }
  else if (preco < 200) { faixaPrecoLabel = 'R$ 120 a R$ 199,99'; custoBase = 11 + idx * 2.8; }
  else if (preco < 350) { faixaPrecoLabel = 'R$ 200 a R$ 349,99'; custoBase = 13 + idx * 3.2; }
  else if (preco < 600) { faixaPrecoLabel = 'R$ 350 a R$ 599,99'; custoBase = 15 + idx * 3.6; }
  else { faixaPrecoLabel = 'Acima de R$ 600'; custoBase = 18 + idx * 4.0; }

  // até 70% de desconto por reputação verde, usamos 50% como estimativa conservadora
  const custoComDesconto = custoBase * 0.5;
  return { faixaPesoLabel, faixaPrecoLabel, custo: Math.max(0, custoComDesconto) };
}

// Shopee BR, regras de comissão vigentes desde 01/10/2026 (artigo publicado em
// 18/09/2026): a taxa fixa por item até R$ 79,99 passou de R$ 4,00 para
// R$ 4,50; o limite da regra de baixo valor do CNPJ passou de R$ 8 para R$ 9.
// Percentuais, demais faixas e subsídio Pix não mudaram.
// https://seller.br.shopee.cn/edu/article/26839/Comissao-para-vendedores-CNPJ-e-CPF-em-2026
export function getShopeeFaixa(preco: number) {
  if (preco <= 79.99) return { pct: 0.20, fixo: 4.50, subFrete: 20, subPix: 0 };
  if (preco <= 99.99) return { pct: 0.14, fixo: 16.00, subFrete: 30, subPix: 5 };
  if (preco <= 199.99) return { pct: 0.14, fixo: 20.00, subFrete: 30, subPix: 5 };
  if (preco <= 499.99) return { pct: 0.14, fixo: 26.00, subFrete: 40, subPix: 5 };
  return { pct: 0.14, fixo: 26.00, subFrete: 40, subPix: 8 };
}

export function getShopeeFixo(preco: number, faixaFixo: number, shopeeTipo: 'cnpj' | 'cpf') {
  if (shopeeTipo === 'cnpj') {
    // abaixo de R$ 9 o adicional é metade do preço (em R$ 9 já dá os R$ 4,50 da faixa)
    if (preco < 9) return preco * 0.5;
    return faixaFixo;
  }
  if (preco < 12) {
    if (preco <= 8) return 6.00;
    return 6.50;
  }
  return faixaFixo;
}

// TikTok Shop (regras de 14/09/2026, print de João): comissão + tarifa por
// item variam pela faixa de preço após desconto do vendedor, mais uma taxa
// de serviço do Programa de taxa de envio (6%, limitada a R$ 50/item) —
// todo vendedor BR entra automaticamente nesse programa.
export function getTiktokFaixa(preco: number) {
  if (preco < 50) return { pct: 0.10, fixo: 4.00 };
  return { pct: 0.06, fixo: 6.00 };
}

export function getTiktokTaxaServicoFrete(preco: number) {
  return Math.min(preco * 0.06, 50);
}

// Mercado Livre Argentina, custo por unidade vendida (Envíos Full, correio,
// coleta e pontos de despacho), por faixa de peso × faixa de preço (AR$).
// Fonte oficial: mercadolibre.com.ar/knowledge-hub/42400 (capturado 16/09/2026),
// válida pra produtos abaixo de $33.000. Não há tabela oficial pra preços a
// partir de $33.000, por decisão do time, reaplicamos os valores da faixa
// "$24.000 a $32.999" pra qualquer preço igual ou acima disso.
const ML_AR_FRETE_TABELA: { max: number; label: string; ate15k: number; de15ka24k: number; de24kAcima: number }[] = [
  { max: 0.3, label: 'Até 0,3 kg', ate15k: 1330, de15ka24k: 2740, de24kAcima: 3320 },
  { max: 0.5, label: '0,3 a 0,5 kg', ate15k: 1370, de15ka24k: 2760, de24kAcima: 3340 },
  { max: 1, label: '0,5 a 1 kg', ate15k: 1390, de15ka24k: 2780, de24kAcima: 3360 },
  { max: 1.5, label: '1 a 1,5 kg', ate15k: 1410, de15ka24k: 2800, de24kAcima: 3380 },
  { max: 2, label: '1,5 a 2 kg', ate15k: 1430, de15ka24k: 2820, de24kAcima: 3400 },
  { max: 3, label: '2 a 3 kg', ate15k: 1450, de15ka24k: 2860, de24kAcima: 3470 },
  { max: 4, label: '3 a 4 kg', ate15k: 1470, de15ka24k: 2910, de24kAcima: 3520 },
  { max: 5, label: '4 a 5 kg', ate15k: 1500, de15ka24k: 3040, de24kAcima: 3670 },
  { max: 8, label: '5 a 8 kg', ate15k: 1520, de15ka24k: 3130, de24kAcima: 3760 },
  { max: 10, label: '8 a 10 kg', ate15k: 1560, de15ka24k: 3180, de24kAcima: 3910 },
  { max: 13, label: '10 a 13 kg', ate15k: 1590, de15ka24k: 3220, de24kAcima: 4020 },
  { max: 15, label: '13 a 15 kg', ate15k: 1620, de15ka24k: 3280, de24kAcima: 4060 },
  { max: 20, label: '15 a 20 kg', ate15k: 1640, de15ka24k: 3320, de24kAcima: 4100 },
  { max: 25, label: '20 a 25 kg', ate15k: 1660, de15ka24k: 3380, de24kAcima: 4170 },
  { max: 30, label: '25 a 30 kg', ate15k: 1680, de15ka24k: 3410, de24kAcima: 4210 },
  { max: 40, label: '30 a 40 kg', ate15k: 1700, de15ka24k: 3440, de24kAcima: 4250 },
  { max: 50, label: '40 a 50 kg', ate15k: 1720, de15ka24k: 3460, de24kAcima: 4300 },
  { max: 60, label: '50 a 60 kg', ate15k: 1740, de15ka24k: 3480, de24kAcima: 4320 },
  { max: 70, label: '60 a 70 kg', ate15k: 1760, de15ka24k: 3510, de24kAcima: 4350 },
  { max: 80, label: '70 a 80 kg', ate15k: 1780, de15ka24k: 3530, de24kAcima: 4370 },
  { max: 90, label: '80 a 90 kg', ate15k: 1800, de15ka24k: 3560, de24kAcima: 4400 },
  { max: 100, label: '90 a 100 kg', ate15k: 1820, de15ka24k: 3580, de24kAcima: 4420 },
  { max: 120, label: '100 a 120 kg', ate15k: 1840, de15ka24k: 3600, de24kAcima: 4450 },
  { max: 140, label: '120 a 140 kg', ate15k: 1860, de15ka24k: 3620, de24kAcima: 4470 },
  { max: 160, label: '140 a 160 kg', ate15k: 1880, de15ka24k: 3650, de24kAcima: 4500 },
  { max: 180, label: '160 a 180 kg', ate15k: 1900, de15ka24k: 3680, de24kAcima: 4520 },
  { max: Infinity, label: 'Acima de 180 kg', ate15k: 1920, de15ka24k: 3700, de24kAcima: 4550 },
];

export function getMlArFreteEstimado(pesoKg: number, preco: number): MlFreteInfo {
  const faixa = ML_AR_FRETE_TABELA.find((f) => pesoKg <= f.max) ?? ML_AR_FRETE_TABELA[ML_AR_FRETE_TABELA.length - 1];
  let faixaPrecoLabel: string;
  let custo: number;
  if (preco < 15000) { faixaPrecoLabel = 'Até $ 14.999'; custo = faixa.ate15k; }
  else if (preco < 24000) { faixaPrecoLabel = '$ 15.000 a $ 23.999'; custo = faixa.de15ka24k; }
  else { faixaPrecoLabel = 'A partir de $ 24.000'; custo = faixa.de24kAcima; }
  return { faixaPesoLabel: faixa.label, faixaPrecoLabel, custo };
}

// Mercado Livre México, custo dos Envíos por faixa de peso × faixa de preço (MX$).
// Fonte oficial: mercadolibre.com.mx/ayuda/40538 (capturado 04/11/2026), vale pra
// produtos novos, MercadoLíderes e reputação verde (valores já com 50% de desconto).
// O frete é cobrado em toda venda. Abaixo de $299 o frete grátis é opcional e,
// ligado, usa só a tarifa por peso da faixa "$299 a $498,99".
const ML_MX_FAIXAS_PRECO: { max: number; label: string }[] = [
  { max: 98.99, label: 'Até $ 98,99' },
  { max: 198.99, label: '$ 99 a $ 198,99' },
  { max: 298.99, label: '$ 199 a $ 298,99' },
  { max: 498.99, label: '$ 299 a $ 498,99' },
  { max: 998.99, label: '$ 499 a $ 998,99' },
  { max: Infinity, label: 'A partir de $ 999' },
];
const ML_MX_FRETE_TABELA: { max: number; label: string; v: number[] }[] = [
  { max: 0.3, label: 'Até 0,3 kg', v: [25, 32, 35, 52.4, 65.5, 65.5] },
  { max: 0.5, label: '0,3 a 0,5 kg', v: [28.5, 34, 38, 56, 70, 70] },
  { max: 1, label: '0,5 a 1 kg', v: [33, 38, 39, 59.6, 74.5, 74.5] },
  { max: 2, label: '1 a 2 kg', v: [35, 40, 41, 67.6, 84.5, 84.5] },
  { max: 3, label: '2 a 3 kg', v: [37, 46, 48, 76, 88.5, 95] },
  { max: 4, label: '3 a 4 kg', v: [39, 50, 54, 82.4, 95.5, 103] },
  { max: 5, label: '4 a 5 kg', v: [40, 53, 59, 88, 102.5, 110] },
  { max: 7, label: '5 a 7 kg', v: [45, 59, 70, 98, 122.5, 122.5] },
  { max: 9, label: '7 a 9 kg', v: [51, 67, 81, 111.6, 139.5, 139.5] },
  { max: 12, label: '9 a 12 kg', v: [59, 78, 96, 129.2, 161.5, 161.5] },
  { max: 15, label: '12 a 15 kg', v: [69, 92, 113, 152, 190, 190] },
  { max: 20, label: '15 a 20 kg', v: [81, 108, 140, 178, 222.5, 222.5] },
  { max: 30, label: '20 a 30 kg', v: [102, 137, 195, 225.2, 281.5, 281.5] },
  { max: 40, label: '30 a 40 kg', v: [126, 170, 250, 279.2, 349, 349] },
  { max: 50, label: '40 a 50 kg', v: [163, 220, 305, 361.2, 451.5, 451.5] },
  { max: 60, label: '50 a 60 kg', v: [183, 247, 334, 405.6, 507, 507] },
  { max: 70, label: '60 a 70 kg', v: [188, 254, 363, 416.4, 520.5, 520.5] },
  { max: 80, label: '70 a 80 kg', v: [196, 264, 392, 433.6, 542, 542] },
  { max: 90, label: '80 a 90 kg', v: [220, 297, 421, 487.6, 609.5, 609.5] },
  { max: 100, label: '90 a 100 kg', v: [254, 343, 450, 562.4, 703, 703] },
  { max: 125, label: '100 a 125 kg', v: [288, 389, 523, 637.2, 796.5, 796.5] },
  { max: 150, label: '125 a 150 kg', v: [382, 516, 694, 846, 1057.5, 1057.5] },
  { max: 175, label: '150 a 175 kg', v: [476, 643, 865, 1054.8, 1318.5, 1318.5] },
  { max: 200, label: '175 a 200 kg', v: [570, 770, 1036, 1263.6, 1579.5, 1579.5] },
  { max: 225, label: '200 a 225 kg', v: [664, 897, 1207, 1472.4, 1840.5, 1840.5] },
  { max: 250, label: '225 a 250 kg', v: [758, 1024, 1378, 1681.2, 2101.5, 2101.5] },
  { max: 275, label: '250 a 275 kg', v: [852, 1151, 1549, 1890, 2362.5, 2362.5] },
  { max: 300, label: '275 a 300 kg', v: [946, 1278, 1720, 2098.4, 2623, 2623] },
  { max: 325, label: '300 a 325 kg', v: [1040, 1406, 1892, 2308, 2885, 2885] },
  { max: 350, label: '325 a 350 kg', v: [1134, 1533, 2063, 2516.8, 3146, 3146] },
  { max: Infinity, label: 'Acima de 350 kg', v: [1134, 1533, 2063, 2516.8, 3146, 3146] },
];
export const ML_MX_FRETE_GRATIS_MAX = 299;

export function getMlMxFreteEstimado(pesoKg: number, preco: number, freteGratis: boolean): MlFreteInfo {
  const faixa = ML_MX_FRETE_TABELA.find((f) => pesoKg <= f.max) ?? ML_MX_FRETE_TABELA[ML_MX_FRETE_TABELA.length - 1];
  let idxPreco = ML_MX_FAIXAS_PRECO.findIndex((f) => preco <= f.max);
  if (idxPreco === -1) idxPreco = ML_MX_FAIXAS_PRECO.length - 1;
  // Frete grátis opcional: tarifa fixa por peso (a da faixa $299 a $498,99), sem faixa de preço.
  if (freteGratis && preco < ML_MX_FRETE_GRATIS_MAX) {
    return { faixaPesoLabel: faixa.label, faixaPrecoLabel: 'Frete grátis (< $ 299)', custo: faixa.v[3] };
  }
  return { faixaPesoLabel: faixa.label, faixaPrecoLabel: ML_MX_FAIXAS_PRECO[idxPreco].label, custo: faixa.v[idxPreco] };
}

// "Ropa, Bolsas y Calzado" Premium: 19,5% até $999 e 18% a partir de $1.000.
export const ML_MX_ROPA_ID = 'ropa';
export const ML_MX_ROPA_PREMIUM_PCT_ALTO = 18;
export const ML_MX_ROPA_QUEBRA = 1000;

function taxasDoCanal(preco: number, s: CalculoState): CanalTaxas {
  if (s.canalAtivo === 'Venda direta') {
    return { pct: s.taxaCartaoPct / 100, fixo: 0 };
  }
  if (s.canalAtivo === 'Mercado Livre Argentina') {
    const comissaoPct = s.mlArComissao / 100;
    const frete = getMlArFreteEstimado(s.mlArPesoEmbalagem, preco);
    return { pct: comissaoPct, fixo: frete.custo, freteInfo: frete };
  }
  if (s.canalAtivo === 'Mercado Livre México') {
    // Sem cargo fijo: só comissão + frete, mesma estrutura de Brasil e Argentina.
    const ropaPremiumAlto = !s.mlMxComissaoManual && s.mlMxCategoria.split('|')[0] === ML_MX_ROPA_ID
      && s.mlMxTipo === 'premium' && preco >= ML_MX_ROPA_QUEBRA;
    const comissaoPct = (ropaPremiumAlto ? ML_MX_ROPA_PREMIUM_PCT_ALTO : s.mlMxComissao) / 100;
    const frete = getMlMxFreteEstimado(s.mlMxPesoEmbalagem, preco, s.mlMxFreteGratis);
    return { pct: comissaoPct, fixo: frete.custo, freteInfo: frete };
  }
  if (s.canalAtivo === 'Mercado Livre') {
    const comissaoPct = s.mlComissao / 100;
    const adsPct = s.mlAds / 100;
    const tarifaFixa = preco < 79 ? 6 : 0;
    const frete = getMlFreteEstimado(s.mlPesoEmbalagem, preco);
    return { pct: comissaoPct + adsPct, fixo: tarifaFixa + frete.custo + s.mlExtras, freteInfo: frete };
  }
  if (s.canalAtivo === 'Shopee') {
    const faixa = getShopeeFaixa(preco);
    const fixo = getShopeeFixo(preco, faixa.fixo, s.shopeeTipo);
    const cpfExtra = s.shopeeTipo === 'cpf' && s.shopeeCpfAlto ? 3 : 0;
    // Subsídio de frete/Pix da tabela é só informativo, não entra no cálculo.
    const campanhaExtraPct = s.shopeeCampanhaDestaque ? s.shopeeComissaoExtra / 100 : 0;
    const cupomExtra = s.shopeeCupomProprio ? s.shopeeCupomValor : 0;
    return { pct: faixa.pct + campanhaExtraPct, fixo: fixo + cpfExtra + s.shopeeFrete + cupomExtra };
  }
  if (s.canalAtivo === 'Etsy') {
    return { pct: 0.065 + 0.03, fixo: 0.20 + 0.25 + s.etsyFrete };
  }
  if (s.canalAtivo === 'TikTok Shop') {
    const faixa = getTiktokFaixa(preco);
    const comissaoPct = s.tiktokNovoVendedor ? 0 : faixa.pct;
    const taxaServicoFrete = getTiktokTaxaServicoFrete(preco);
    return { pct: comissaoPct, fixo: faixa.fixo + taxaServicoFrete + s.tiktokFrete };
  }
  return { pct: 0, fixo: 0 };
}

export interface ValidacaoFaltando {
  labelKey: string;
  id: string;
  idExtra?: string;
}

export function validar(s: CalculoState): ValidacaoFaltando[] {
  const faltando: ValidacaoFaltando[] = [];
  if (!s.nomePeca.trim()) faltando.push({ labelKey: 'calc.campoNomeDaPeca', id: 'nomePeca' });
  if (s.horasImpressao === 0 && s.minutosImpressao === 0) {
    faltando.push({ labelKey: 'calc.campoTempoDeImpressao', id: 'horasImpressao', idExtra: 'minutosImpressao' });
  }
  const pesoTotalFil = s.filamentoItems.reduce((sum, f) => sum + (f.pesoG || 0), 0);
  if (pesoTotalFil === 0) faltando.push({ labelKey: 'calc.campoPesoDoFilamento', id: 'filamentoList' });
  const semPreco = s.filamentoItems.length === 0 || s.filamentoItems.some((f) => (f.precoKg || 0) === 0);
  if (semPreco) faltando.push({ labelKey: 'calc.campoPrecoDoFilamento', id: 'filamentoList' });
  if (s.modoPrec === 'preco' && s.precoVenda === 0) faltando.push({ labelKey: 'calc.campoPrecoDeVenda', id: 'precoVenda' });
  if (s.canalAtivo === 'Mercado Livre Argentina' && !s.mlArCategoria) faltando.push({ labelKey: 'calc.campoCategoriaMercadoLivre', id: 'mlArCategoria' });
  if (s.canalAtivo === 'Mercado Livre México' && !s.mlMxCategoria) faltando.push({ labelKey: 'calc.campoCategoriaMercadoLivre', id: 'mlMxCategoria' });
  if (s.canalAtivo === 'Mercado Livre' && !s.mlCategoria) faltando.push({ labelKey: 'calc.campoCategoriaMercadoLivre', id: 'mlCategoria' });
  return faltando;
}

export function calcular(s: CalculoState): CalculoResultado {
  const qtd = Math.max(1, s.quantidade);
  const tempoH = s.horasImpressao + s.minutosImpressao / 60;
  const taxaFalhaPct = s.taxaFalha / 100;
  const impostoPct = s.imposto / 100;

  const cMaterialTotal = s.filamentoItems.reduce((sum, f) => sum + ((f.pesoG || 0) / 1000) * (f.precoKg || 0), 0);
  const cEnergiaTotal = s.custoKwh * tempoH * s.precoKwh * 0.5; // 0.5 = fator de consumo médio real
  const cMaterial = cMaterialTotal / qtd;
  const cEnergia = cEnergiaTotal / qtd;
  const cFalha = (cMaterial + cEnergia) * taxaFalhaPct;

  const cFreteDireto = s.canalAtivo === 'Venda direta' ? s.freteDiretoCusto : 0;
  const cAcc = s.accItems.reduce((sum, a) => sum + (a.valor || 0), 0) + cFreteDireto;
  const custoUnit = cMaterial + cEnergia + cFalha + cAcc;

  let precoConsumidor: number;
  let lucroBruto: number;
  let lucroLiquido: number;
  let margem: number;

  if (s.modoPrec === 'preco') {
    precoConsumidor = s.precoVenda;
    const t = taxasDoCanal(precoConsumidor, s);
    const taxaValor = precoConsumidor * t.pct + t.fixo;
    lucroBruto = precoConsumidor - custoUnit;
    lucroLiquido = lucroBruto - precoConsumidor * impostoPct - taxaValor;
    margem = precoConsumidor > 0 ? (lucroLiquido / precoConsumidor) * 100 : 0;
  } else {
    const margemPct = s.margemDesejada / 100;
    let preco = custoUnit / Math.max(0.01, 1 - margemPct - impostoPct - (s.canalAtivo === 'Venda direta' ? s.taxaCartaoPct / 100 : 0));
    for (let i = 0; i < 20; i++) {
      const t = taxasDoCanal(preco, s);
      const den = 1 - margemPct - impostoPct - t.pct;
      if (den <= 0.01) break;
      const novoPreco = (custoUnit + t.fixo) / den;
      if (Math.abs(novoPreco - preco) < 0.001) { preco = novoPreco; break; }
      preco = novoPreco;
    }
    precoConsumidor = preco;
    const t = taxasDoCanal(precoConsumidor, s);
    const taxaValor = precoConsumidor * t.pct + t.fixo;
    lucroBruto = precoConsumidor - custoUnit;
    lucroLiquido = lucroBruto - precoConsumidor * impostoPct - taxaValor;
    margem = precoConsumidor > 0 ? (lucroLiquido / precoConsumidor) * 100 : 0;
  }

  // "Calcular com promoção": infla o preço de tabela ANTES de aplicar taxas/imposto,
  // pra que depois do desconto promocional no checkout, o valor líquido recebido
  // continue perto da margem calculada. Taxa/imposto/margem recalculados sobre o preço inflado.
  let precoComPromo = 0;
  if (s.comPromo) {
    const descPromo = s.descontoPromo / 100;
    precoConsumidor = precoConsumidor * (1 + descPromo);
    const tPromo = taxasDoCanal(precoConsumidor, s);
    const taxaValorPromo = precoConsumidor * tPromo.pct + tPromo.fixo;
    lucroBruto = precoConsumidor - custoUnit;
    lucroLiquido = lucroBruto - precoConsumidor * impostoPct - taxaValorPromo;
    margem = precoConsumidor > 0 ? (lucroLiquido / precoConsumidor) * 100 : 0;
    // NOTA matemática: (1+d)(1-d) = 1-d², não volta ao preço original, intencional.
    precoComPromo = precoConsumidor * (1 - descPromo);
  }

  const precoVarejo = precoConsumidor * 0.5;
  const t = taxasDoCanal(precoConsumidor, s);
  const taxaValor = precoConsumidor * t.pct + t.fixo;

  const pecasDia = tempoH > 0 ? Math.floor(20 / tempoH) * qtd : 0;
  const potDiario = pecasDia * precoConsumidor;
  const potMensal = potDiario * 30;
  const ciclosDia = tempoH > 0 ? 20 / tempoH : 0;

  return {
    custoUnit, cMaterial, cEnergia, cFalha, cAcc,
    precoConsumidor, precoVarejo, precoComPromo,
    lucroBruto, lucroLiquido, margem,
    taxaValor, taxas: t,
    pecasDia, ciclosDia, potDiario, potMensal,
  };
}

/* ============================================================
   ADS / METAS DE ROAS
   Calculado só a partir da margem do último cálculo (PRD seção 8).
   ============================================================ */
export interface RoasMeta {
  labelKey: string;
  valor: number | null; // null = "Inatingível"
  alvoPct: number;
  lucroAlvo: number;
  descKey: string;
}

export function calcularRoas(precoFinal: number, margemPct: number): RoasMeta[] {
  const mf = margemPct / 100;
  const roasMin = mf > 0 ? 1 / mf : null;
  const roasIdeal = mf > 0.15 ? 1 / (mf - 0.15) : null;
  const roasExcelente = mf > 0.30 ? 1 / (mf - 0.30) : null;

  const meta = (labelKey: string, valor: number | null, alvoPct: number, descKey: string): RoasMeta => ({
    labelKey, valor, alvoPct, lucroAlvo: precoFinal * (alvoPct / 100), descKey,
  });

  return [
    meta('calc.roasMinimoLabel', roasMin, 0, 'calc.roasMinimoDesc'),
    meta('calc.roasIdealLabel', roasIdeal, 15, 'calc.roasIdealDesc'),
    meta('calc.roasExcelenteLabel', roasExcelente, 30, 'calc.roasExcelenteDesc'),
  ];
}
