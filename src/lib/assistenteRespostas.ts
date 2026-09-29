// Respostas do Assistente (v2). Ainda sem IA: as 4 perguntas sugeridas — e
// perguntas digitadas que batem com elas por palavra-chave — respondem com os
// mesmos dados mock do Painel e de Produtos (dashboardMock/produtosMock), então
// os números do chat sempre fecham com o que o maker vê nas outras telas.
import type { Idioma } from './i18n';
import { DRE_LINHAS, DRE_MARGEM_LIQUIDA, INSIGHTS, KPIS } from './dashboardMock';
import { PRODUTOS, PRODUTOS_KPIS, contarProdutosSemVinculo } from './produtosMock';

export type PerguntaId = 'operacao' | 'dre' | 'taxas' | 'estoque';
export const PERGUNTAS: PerguntaId[] = ['operacao', 'dre', 'taxas', 'estoque'];

export type Destaque = 'subtotal' | 'resultado';
export interface LinhaTabela { label: string; valor: string; detalhe?: string; destaque?: Destaque; sub?: boolean }
export type Bloco =
  | { tipo: 'p'; texto: string } // aceita **negrito**
  | { tipo: 'tabela'; linhas: LinhaTabela[] }
  | { tipo: 'lista'; itens: string[] }
  | { tipo: 'acao'; label: string; destino: 'dashboard' | 'produtos' | 'calculadora' };

export interface Resposta { blocos: Bloco[]; sugerir?: boolean }

const LOCALE: Record<Idioma, string> = { pt: 'pt-BR', es: 'es-AR', en: 'en-US' };

function brl(v: number, idioma: Idioma): string {
  const sinal = v < 0 ? '− ' : '';
  return sinal + 'R$ ' + Math.abs(v).toLocaleString(LOCALE[idioma], { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct(v: number, idioma: Idioma): string {
  return v.toLocaleString(LOCALE[idioma], { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
}

// Os mocks do Painel estão em português; aqui só o que aparece no chat.
const DRE_LABEL: Record<string, Record<Idioma, string>> = {
  'Receita bruta': { pt: 'Receita bruta', es: 'Ingresos brutos', en: 'Gross revenue' },
  'Impostos sobre vendas': { pt: 'Impostos sobre vendas', es: 'Impuestos sobre ventas', en: 'Sales taxes' },
  'Taxas de marketplace': { pt: 'Taxas de marketplace', es: 'Tarifas de marketplace', en: 'Marketplace fees' },
  'Receita líquida': { pt: 'Receita líquida', es: 'Ingresos netos', en: 'Net revenue' },
  'Custo de produção': { pt: 'Custo de produção', es: 'Costo de producción', en: 'Production cost' },
  'Lucro bruto': { pt: 'Lucro bruto', es: 'Ganancia bruta', en: 'Gross profit' },
  'Despesas operacionais': { pt: 'Despesas operacionais', es: 'Gastos operativos', en: 'Operating expenses' },
  'Lucro líquido': { pt: 'Lucro líquido', es: 'Ganancia neta', en: 'Net profit' },
};
const KPI_LABEL: Record<string, Record<Idioma, string>> = {
  faturamento: { pt: 'Faturamento', es: 'Facturación', en: 'Revenue' },
  pedidos: { pt: 'Pedidos', es: 'Pedidos', en: 'Orders' },
  lucro: { pt: 'Lucro líquido', es: 'Ganancia neta', en: 'Net profit' },
  ticket: { pt: 'Ticket médio', es: 'Ticket promedio', en: 'Average order' },
};

const receita = DRE_LINHAS.find((l) => l.tipo === 'receita')!.valor;
const linha = (label: string) => DRE_LINHAS.find((l) => l.label === label)!;

function respostaOperacao(idioma: Idioma): Resposta {
  const tx = {
    pt: { intro: 'Seu mês está **positivo**: todos os indicadores cresceram em relação aos 30 dias anteriores.', atencao: '**Ponto de atenção:** o faturamento cresceu {f}, mas o lucro líquido só {l}. Os custos estão subindo mais rápido que as vendas. Vale abrir o DRE pra ver onde.', rep: '**Reputação:** sua reputação no Mercado Livre caiu de verde para amarelo. Há 4 reclamações sem resposta há mais de 24h.', acao: 'Ver no Painel', vs: 'vs. mês anterior' },
    es: { intro: 'Tu mes viene **positivo**: todos los indicadores crecieron respecto a los 30 días anteriores.', atencao: '**Atención:** la facturación creció {f}, pero la ganancia neta solo {l}. Los costos suben más rápido que las ventas. Conviene revisar el estado de resultados.', rep: '**Reputación:** tu reputación en Mercado Libre bajó de verde a amarillo. Hay 4 reclamos sin responder hace más de 24 h.', acao: 'Ver en el Panel', vs: 'vs. mes anterior' },
    en: { intro: 'Your month is **up**: every indicator grew compared to the previous 30 days.', atencao: '**Heads-up:** revenue grew {f}, but net profit only {l}. Costs are rising faster than sales. Check the P&L to see where.', rep: '**Reputation:** your Mercado Livre reputation dropped from green to yellow. There are 4 complaints unanswered for over 24h.', acao: 'Open Dashboard', vs: 'vs. last month' },
  }[idioma];
  const kpi = (id: string) => KPIS.find((k) => k.id === id)!;
  const valorKpi = (id: string) => { const k = kpi(id); return `${k.prefixo ? k.prefixo + ' ' : ''}${k.inteiro}${k.decimal ?? ''}`; };
  const temReputacao = INSIGHTS.some((i) => i.id === 'reputacao');
  return {
    blocos: [
      { tipo: 'p', texto: tx.intro },
      { tipo: 'tabela', linhas: ['faturamento', 'pedidos', 'lucro', 'ticket'].map((id) => ({
        label: KPI_LABEL[id][idioma], valor: valorKpi(id), detalhe: `${kpi(id).deltaPct} ${tx.vs}`,
      })) },
      { tipo: 'p', texto: tx.atencao.replace('{f}', kpi('faturamento').deltaPct).replace('{l}', kpi('lucro').deltaPct) },
      ...(temReputacao ? [{ tipo: 'p', texto: tx.rep } as Bloco] : []),
      { tipo: 'acao', label: tx.acao, destino: 'dashboard' },
    ],
  };
}

function respostaDre(idioma: Idioma): Resposta {
  const tx = {
    pt: { intro: 'Este é o seu DRE do mês. O **lucro líquido** ficou em **{lucro}**, com **margem de {margem}**.', maior: '**O que mais pesa:** o custo de produção leva **{pct}** da receita. É o primeiro lugar pra buscar margem (material, tempo de impressão e taxa de falha).', vinculo: '**Atenção:** {n} de {total} produtos ainda não têm custo vinculado. Eles entram no DRE com custo zero, então o custo de produção pode estar **subestimado**.', acao: 'Ver DRE no Painel', daReceita: 'da receita' },
    es: { intro: 'Este es tu estado de resultados del mes. La **ganancia neta** quedó en **{lucro}**, con **margen de {margem}**.', maior: '**Lo que más pesa:** el costo de producción se lleva **{pct}** de los ingresos. Es el primer lugar para buscar margen (material, tiempo de impresión y tasa de falla).', vinculo: '**Atención:** {n} de {total} productos todavía no tienen costo vinculado. Entran con costo cero, así que el costo de producción puede estar **subestimado**.', acao: 'Ver en el Panel', daReceita: 'de los ingresos' },
    en: { intro: "Here's your P&L for the month. **Net profit** was **{lucro}**, a **{margem} margin**.", maior: '**Biggest cost:** production takes **{pct}** of revenue. That\'s the first place to look for margin (material, print time and failure rate).', vinculo: '**Heads-up:** {n} of {total} products still have no linked cost. They count as zero cost, so production cost may be **understated**.', acao: 'Open P&L in Dashboard', daReceita: 'of revenue' },
  }[idioma];
  const lucro = linha('Lucro líquido').valor;
  const custo = Math.abs(linha('Custo de produção').valor);
  const { semVinculo, total } = contarProdutosSemVinculo();
  return {
    blocos: [
      { tipo: 'p', texto: tx.intro.replace('{lucro}', brl(lucro, idioma)).replace('{margem}', DRE_MARGEM_LIQUIDA) },
      { tipo: 'tabela', linhas: DRE_LINHAS.map((l) => ({
        label: DRE_LABEL[l.label]?.[idioma] ?? l.label,
        valor: brl(l.valor, idioma),
        detalhe: l.tipo === 'receita' ? undefined : `${pct((Math.abs(l.valor) / receita) * 100, idioma)} ${tx.daReceita}`,
        destaque: l.tipo === 'subtotal' ? 'subtotal' : l.tipo === 'resultado' ? 'resultado' : undefined,
      })) },
      { tipo: 'p', texto: tx.maior.replace('{pct}', pct((custo / receita) * 100, idioma)) },
      ...(semVinculo > 0 ? [{ tipo: 'p', texto: tx.vinculo.replace('{n}', String(semVinculo)).replace('{total}', String(total)) } as Bloco] : []),
      { tipo: 'acao', label: tx.acao, destino: 'dashboard' },
    ],
  };
}

function respostaTaxas(idioma: Idioma): Resposta {
  const tx = {
    pt: { intro: 'Neste mês você pagou **{total}** em taxas de marketplace (comissão, frete e tarifas fixas), o que dá **{pct} do faturamento**.', maior: 'O **{mk}** concentra **{share}** de tudo que você pagou em taxas.', dica: '**Pra conferir se a taxa está certa:** simule o anúncio na Calculadora de preços com a categoria e o tipo de anúncio corretos e compare a taxa calculada com a cobrada. Categoria errada é a causa mais comum de comissão maior.', acao: 'Abrir Calculadora de preços', doTotal: 'do total de taxas' },
    es: { intro: 'Este mes pagaste **{total}** en tarifas de marketplace (comisión, envío y cargos fijos), o sea **{pct} de la facturación**.', maior: '**{mk}** concentra **{share}** de todo lo que pagaste en tarifas.', dica: '**Para verificar si la tarifa es correcta:** simulá la publicación en la Calculadora de precios con la categoría y el tipo de publicación correctos y compará la tarifa calculada con la cobrada. Una categoría equivocada es la causa más común de comisión mayor.', acao: 'Abrir Calculadora de precios', doTotal: 'del total de tarifas' },
    en: { intro: 'This month you paid **{total}** in marketplace fees (commission, shipping and fixed fees), which is **{pct} of revenue**.', maior: '**{mk}** accounts for **{share}** of all fees you paid.', dica: '**To check a fee is right:** simulate the listing in the Pricing Calculator with the correct category and listing type, and compare the calculated fee with what was charged. A wrong category is the most common cause of a higher commission.', acao: 'Open Pricing Calculator', doTotal: 'of total fees' },
  }[idioma];
  const taxas = linha('Taxas de marketplace');
  const total = Math.abs(taxas.valor);
  const subs = [...(taxas.subitens ?? [])].sort((a, b) => a.valor - b.valor);
  const maior = subs[0];
  return {
    blocos: [
      { tipo: 'p', texto: tx.intro.replace('{total}', brl(total, idioma)).replace('{pct}', pct((total / receita) * 100, idioma)) },
      { tipo: 'tabela', linhas: subs.map((s) => ({
        label: s.label, valor: brl(Math.abs(s.valor), idioma), detalhe: `${pct((Math.abs(s.valor) / total) * 100, idioma)} ${tx.doTotal}`,
      })) },
      ...(maior ? [{ tipo: 'p', texto: tx.maior.replace('{mk}', maior.label).replace('{share}', pct((Math.abs(maior.valor) / total) * 100, idioma)) } as Bloco] : []),
      { tipo: 'p', texto: tx.dica },
      { tipo: 'acao', label: tx.acao, destino: 'calculadora' },
    ],
  };
}

function respostaEstoque(idioma: Idioma): Resposta {
  const tx = {
    pt: { intro: 'No seu catálogo há **{sem} produtos sem estoque** e **{baixo} com estoque baixo**. Entre os seus produtos, estes pedem atenção primeiro:', sem: '**{nome}**: sem estoque, e já vendeu {v} unidades. Reponha antes de perder posição no anúncio.', baixo: '**{nome}**: só {e} unidades em estoque ({v} vendidas).', parado: '**{nome}**: anúncio pausado, com só {v} vendas. Vale revisar preço e fotos ou encerrar.', acao: 'Ver em Produtos' },
    es: { intro: 'En tu catálogo hay **{sem} productos sin stock** y **{baixo} con stock bajo**. De tus productos, estos necesitan atención primero:', sem: '**{nome}**: sin stock, y ya vendió {v} unidades. Reponé antes de perder posición en la publicación.', baixo: '**{nome}**: solo {e} unidades en stock ({v} vendidas).', parado: '**{nome}**: publicación pausada, con solo {v} ventas. Conviene revisar precio y fotos o finalizarla.', acao: 'Ver en Productos' },
    en: { intro: 'Your catalog has **{sem} products out of stock** and **{baixo} with low stock**. Among your products, these need attention first:', sem: '**{nome}**: out of stock, with {v} units already sold. Restock before losing listing rank.', baixo: '**{nome}**: only {e} units left ({v} sold).', parado: '**{nome}**: listing paused, only {v} sales. Review price and photos, or close it.', acao: 'Open Products' },
  }[idioma];
  const preencher = (s: string, p: (typeof PRODUTOS)[number]) => s.replace('{nome}', p.nome).replace('{v}', String(p.vendidos)).replace('{e}', String(p.estoque));
  const semEstoque = PRODUTOS.filter((p) => p.estoqueSituacao === 'Sem estoque').sort((a, b) => b.vendidos - a.vendidos);
  const baixo = PRODUTOS.filter((p) => p.estoqueSituacao === 'Estoque baixo').sort((a, b) => a.estoque - b.estoque);
  const parados = PRODUTOS.filter((p) => p.status === 'Pausado').sort((a, b) => a.vendidos - b.vendidos);
  return {
    blocos: [
      { tipo: 'p', texto: tx.intro.replace('{sem}', PRODUTOS_KPIS.semEstoque.valor).replace('{baixo}', PRODUTOS_KPIS.estoqueBaixo.valor) },
      { tipo: 'lista', itens: [
        ...semEstoque.map((p) => preencher(tx.sem, p)),
        ...baixo.map((p) => preencher(tx.baixo, p)),
        ...parados.map((p) => preencher(tx.parado, p)),
      ] },
      { tipo: 'acao', label: tx.acao, destino: 'produtos' },
    ],
  };
}

const FALLBACK: Record<Idioma, string> = {
  pt: 'Ainda não consigo responder essa pergunta. Por enquanto, sei te ajudar com a visão geral do mês, o DRE, as taxas dos marketplaces e o estoque:',
  es: 'Todavía no puedo responder esa pregunta. Por ahora te puedo ayudar con el resumen del mes, el estado de resultados, las tarifas de los marketplaces y el stock:',
  en: "I can't answer that one yet. For now I can help with your monthly overview, P&L, marketplace fees and inventory:",
};

export function responder(id: PerguntaId, idioma: Idioma): Resposta {
  if (id === 'operacao') return respostaOperacao(idioma);
  if (id === 'dre') return respostaDre(idioma);
  if (id === 'taxas') return respostaTaxas(idioma);
  return respostaEstoque(idioma);
}

export function respostaFallback(idioma: Idioma): Resposta {
  return { blocos: [{ tipo: 'p', texto: FALLBACK[idioma] }], sugerir: true };
}

// Pergunta digitada → uma das 4 respostas, por palavra-chave (sem acento, minúsculo).
// A ordem importa: "lucro do DRE" é DRE, não visão geral.
const PALAVRAS: [PerguntaId, string[]][] = [
  ['dre', ['dre', 'demonstrativo', 'resultado', 'p&l', 'pnl', 'estado de resultados', 'despesa', 'gasto', 'dinheiro']],
  ['taxas', ['taxa', 'tarifa', 'comiss', 'fee', 'cobran']],
  ['estoque', ['estoque', 'stock', 'inventor', 'parad', 'faltar', 'acabar', 'repor', 'reponer', 'restock']],
  ['operacao', ['operac', 'mes', 'month', 'faturamento', 'facturac', 'revenue', 'venda', 'venta', 'sales', 'lucro', 'ganancia', 'profit', 'pedido', 'order', 'resumo', 'resumen', 'overview']],
];

export function identificarPergunta(texto: string): PerguntaId | null {
  const t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const [id, palavras] of PALAVRAS) if (palavras.some((p) => t.includes(p))) return id;
  return null;
}
