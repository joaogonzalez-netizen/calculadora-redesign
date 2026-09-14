// Núcleo de cálculo — porte fiel de calcular() do protótipo HTML.
// Fórmulas críticas (PRD seção 4) preservadas exatamente, inclusive o solver
// de ponto fixo do modo "margem mínima" e as regras de canal da seção 4/11.

import type {
  CalculoResultado,
  CalculoState,
  CanalTaxas,
  MlFreteInfo,
} from '../types';

export function getMlFreteEstimado(pesoKg: number, preco: number): MlFreteInfo {
  const bandasPeso = [0.3, 0.5, 1, 2, 3, 5, 9, 13, 17, 25];
  const labelsPeso = [
    'Até 0,3 kg', '0,3–0,5 kg', '0,5–1 kg', '1–2 kg', '2–3 kg',
    '3–5 kg', '5–9 kg', '9–13 kg', '13–17 kg', 'Acima de 17 kg',
  ];
  let idx = bandasPeso.findIndex((b) => pesoKg <= b);
  if (idx === -1) idx = bandasPeso.length - 1;
  const faixaPesoLabel = labelsPeso[idx];

  let faixaPrecoLabel: string;
  let custoBase: number;
  if (preco < 19) { faixaPrecoLabel = 'Até R$ 19'; custoBase = Math.min(preco * 0.5, 3 + idx * 1.2); }
  else if (preco < 50) { faixaPrecoLabel = 'R$ 19 – R$ 49,99'; custoBase = 5 + idx * 1.6; }
  else if (preco < 79) { faixaPrecoLabel = 'R$ 50 – R$ 78,99'; custoBase = 7 + idx * 2.0; }
  else if (preco < 120) { faixaPrecoLabel = 'R$ 79 – R$ 119,99'; custoBase = 9 + idx * 2.4; }
  else if (preco < 200) { faixaPrecoLabel = 'R$ 120 – R$ 199,99'; custoBase = 11 + idx * 2.8; }
  else if (preco < 350) { faixaPrecoLabel = 'R$ 200 – R$ 349,99'; custoBase = 13 + idx * 3.2; }
  else if (preco < 600) { faixaPrecoLabel = 'R$ 350 – R$ 599,99'; custoBase = 15 + idx * 3.6; }
  else { faixaPrecoLabel = 'Acima de R$ 600'; custoBase = 18 + idx * 4.0; }

  // até 70% de desconto por reputação verde, usamos 50% como estimativa conservadora
  const custoComDesconto = custoBase * 0.5;
  return { faixaPesoLabel, faixaPrecoLabel, custo: Math.max(0, custoComDesconto) };
}

export function getShopeeFaixa(preco: number) {
  if (preco <= 79.99) return { pct: 0.20, fixo: 4.00, subFrete: 20, subPix: 0 };
  if (preco <= 99.99) return { pct: 0.14, fixo: 16.00, subFrete: 30, subPix: 5 };
  if (preco <= 199.99) return { pct: 0.14, fixo: 20.00, subFrete: 30, subPix: 5 };
  if (preco <= 499.99) return { pct: 0.14, fixo: 26.00, subFrete: 40, subPix: 5 };
  return { pct: 0.14, fixo: 26.00, subFrete: 40, subPix: 8 };
}

export function getShopeeFixo(preco: number, faixaFixo: number, shopeeTipo: 'cnpj' | 'cpf') {
  if (shopeeTipo === 'cnpj') {
    if (preco < 8) return preco * 0.5;
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

function taxasDoCanal(preco: number, s: CalculoState): CanalTaxas {
  if (s.canalAtivo === 'Venda direta') {
    return { pct: s.taxaCartaoPct / 100, fixo: 0 };
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
    const freteLiquido = Math.max(0, s.shopeeFrete - faixa.subFrete);
    return { pct: faixa.pct, fixo: fixo + cpfExtra + freteLiquido };
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
  label: string;
  id: string;
  idExtra?: string;
}

export function validar(s: CalculoState): ValidacaoFaltando[] {
  const faltando: ValidacaoFaltando[] = [];
  if (!s.nomePeca.trim()) faltando.push({ label: 'Nome da peça', id: 'nomePeca' });
  if (s.horasImpressao === 0 && s.minutosImpressao === 0) {
    faltando.push({ label: 'Tempo de impressão', id: 'horasImpressao', idExtra: 'minutosImpressao' });
  }
  const pesoTotalFil = s.filamentoItems.reduce((sum, f) => sum + (f.pesoG || 0), 0);
  if (pesoTotalFil === 0) faltando.push({ label: 'Peso do filamento', id: 'filamentoList' });
  const semPreco = s.filamentoItems.length === 0 || s.filamentoItems.some((f) => (f.precoKg || 0) === 0);
  if (semPreco) faltando.push({ label: 'Preço do filamento (R$/kg)', id: 'filamentoList' });
  if (s.modoPrec === 'preco' && s.precoVenda === 0) faltando.push({ label: 'Preço de venda', id: 'precoVenda' });
  if (s.canalAtivo === 'Mercado Livre' && !s.mlCategoria) faltando.push({ label: 'Categoria do Mercado Livre', id: 'mlCategoria' });
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
    // NOTA matemática: (1+d)(1-d) = 1-d², não volta ao preço original — intencional.
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
  label: string;
  valor: number | null; // null = "Inatingível"
  alvoPct: number;
  lucroAlvo: number;
  desc: string;
}

export function calcularRoas(precoFinal: number, margemPct: number): RoasMeta[] {
  const mf = margemPct / 100;
  const roasMin = mf > 0 ? 1 / mf : null;
  const roasIdeal = mf > 0.15 ? 1 / (mf - 0.15) : null;
  const roasExcelente = mf > 0.30 ? 1 / (mf - 0.30) : null;

  const meta = (label: string, valor: number | null, alvoPct: number, desc: string): RoasMeta => ({
    label, valor, alvoPct, lucroAlvo: precoFinal * (alvoPct / 100), desc,
  });

  return [
    meta('🔴 ROAS Mínimo', roasMin, 0, 'Abaixo disso, você tem prejuízo com Ads'),
    meta('🟡 ROAS Ideal', roasIdeal, 15, 'Mantém 15% de margem depois dos anúncios'),
    meta('🟢 ROAS Excelente', roasExcelente, 30, 'Mantém 30% de margem depois dos anúncios'),
  ];
}
