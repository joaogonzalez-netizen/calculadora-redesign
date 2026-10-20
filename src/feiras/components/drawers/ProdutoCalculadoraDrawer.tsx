import { useMemo, useState } from 'react';
import { useStore } from '../../lib/store';
import { useUi } from '../../lib/ui';
import { brl } from '../../lib/format';
import { getHistorico, saveHistoricoArr } from '../../../lib/storage';
import { useLibrarias } from '../../../context/LibrariasContext';
import type { HistoricoEntry } from '../../../types';
import { Drawer, Field, Seg } from '../ui';
import { useFeirasT, decimalLocal } from '../../lib/i18n';
import { idiomaDoFormato } from '../../../lib/format';

type Pgto = 'debito' | 'credito' | 'pix' | 'outra';

// Cadastra, no catálogo de Vendas físicas, um produto que já foi calculado na
// Calculadora (histórico, normalmente para um marketplace): o usuário escolhe
// o cálculo e informa as taxas da VENDA DIRETA (pagamento, imposto, frete e
// margem). O preço é calculado na hora e o resultado é salvo no histórico da
// calculadora como um cálculo de Venda direta, é ele que aparece no catálogo.
export default function ProdutoCalculadoraDrawer() {
  const { fechar, avisar } = useUi();
  const { t } = useFeirasT();
  const nomeCanal = (m: string) => (m === 'Venda direta' ? t('feiras.pc.vendaDireta') : m);
  const { recarregarProdutos, db } = useStore();
  const { prefs } = useLibrarias();

  // Um cálculo por nome de produto (o mais recente), sem repetir o que já é de venda direta.
  const opcoes = useMemo(() => {
    const porNome = new Map<string, HistoricoEntry>();
    for (const h of getHistorico()) {
      const nome = (h.nome || '').trim();
      if (!nome) continue;
      const k = nome.toLowerCase();
      const atual = porNome.get(k);
      if (!atual || h.id > atual.id) porNome.set(k, h);
    }
    return [...porNome.values()].sort((a, b) => a.nome.localeCompare(b.nome, idiomaDoFormato() === 'en' ? 'en-US' : 'pt-BR', { sensitivity: 'base' }));
  }, []);
  const jaNoCatalogo = new Set(db.produtos.map((p) => p.nome.toLowerCase()));

  const [id, setId] = useState<string>('');
  const base = opcoes.find((h) => String(h.id) === id) ?? null;

  const taxaDebito = prefs.taxaDebito ?? 1.99;
  const taxaCredito = prefs.taxaCredito ?? 2.99;
  const [pgto, setPgto] = useState<Pgto>('debito');
  const [taxaOutra, setTaxaOutra] = useState('');
  const [imposto, setImposto] = useState('');
  const [frete, setFrete] = useState('');
  const [margem, setMargem] = useState('');
  const [erro, setErro] = useState('');

  function escolher(v: string) {
    setId(v);
    const h = opcoes.find((x) => String(x.id) === v);
    if (h) {
      setImposto(String(h.imposto ?? 0));
      setMargem(String(Math.round((h.margem || 30) * 10) / 10));
      setFrete('');
    }
  }

  const taxaPct = pgto === 'debito' ? taxaDebito : pgto === 'credito' ? taxaCredito : pgto === 'pix' ? 0 : Number(taxaOutra) || 0;
  const numImposto = Number(imposto) || 0;
  const numFrete = Number(frete) || 0;
  const numMargem = Number(margem) || 0;

  // Mesma fórmula da calculadora para Venda direta: o preço cobre custo + frete,
  // imposto, taxa de pagamento e a margem desejada.
  const calc = useMemo(() => {
    if (!base) return null;
    const custo = (base.custoUnit || 0) + numFrete;
    const den = 1 - numMargem / 100 - numImposto / 100 - taxaPct / 100;
    if (den <= 0.01) return null;
    const preco = custo / den;
    const taxaValor = preco * (taxaPct / 100);
    const lucroBruto = preco - custo;
    const lucroLiquido = lucroBruto - preco * (numImposto / 100) - taxaValor;
    return { custo, preco, taxaValor, lucroBruto, lucroLiquido, margem: preco > 0 ? (lucroLiquido / preco) * 100 : 0 };
  }, [base, numFrete, numMargem, numImposto, taxaPct]);

  function salvar() {
    if (!base) return setErro(t('feiras.pc.erroEscolher'));
    if (!calc) return setErro(t('feiras.pc.erroTaxas'));
    const razaoPot = base.precoConsumidor > 0 ? base.potMensal / base.precoConsumidor : 0;
    const entry: HistoricoEntry = {
      ...JSON.parse(JSON.stringify(base)),
      id: Date.now(),
      marketplace: 'Venda direta',
      custoUnit: calc.custo,
      precoConsumidor: calc.preco,
      precoVarejo: calc.preco * 0.5,
      lucroBruto: calc.lucroBruto,
      lucroLiquido: calc.lucroLiquido,
      margem: calc.margem,
      potMensal: razaoPot * calc.preco,
      imposto: numImposto,
      modoPrec: 'margem',
      margemDesejada: numMargem,
      precoVenda: calc.preco,
      comPromo: false,
      origemCatalogo: true,
    };
    const hist = getHistorico();
    hist.unshift(entry);
    saveHistoricoArr(hist);
    recarregarProdutos();
    avisar(t('feiras.pc.cadastrado'));
    fechar();
  }

  return (
    <Drawer aberto titulo={t('feiras.pc.titulo')} subtitulo={t('feiras.pc.sub')} onClose={fechar}
      rodape={<button className="fe-btn fe-btn-primary fe-grow" onClick={salvar}>{t('feiras.pc.cadastrar')}</button>}>
      {erro && <div className="fe-notice" role="alert">{erro}</div>}

      <Field label={t('feiras.pc.produtoCalculado')} hint={opcoes.length === 0 ? t('feiras.pc.nenhumCalculo') : undefined}>
        <select value={id} onChange={(e) => escolher(e.target.value)}>
          <option value="">{t('feiras.pc.selecione')}</option>
          {opcoes.map((h) => (
            <option key={h.id} value={h.id}>{h.nome}, {nomeCanal(h.marketplace)}{jaNoCatalogo.has(h.nome.toLowerCase()) ? t('feiras.pc.jaNoCatalogo') : ''}</option>
          ))}
        </select>
      </Field>

      {base && (
        <>
          <div className="fe-totals"><div><small>{t('feiras.pc.custoUnidade')}</small><br /><b>{brl(base.custoUnit)}</b></div><small style={{ maxWidth: 210, textAlign: 'right' }}>{t('feiras.pc.precoNoCanal', { canal: nomeCanal(base.marketplace), v: brl(base.precoConsumidor) })}</small></div>

          <div>
            <div className="fe-sec-title">{t('feiras.pc.taxasTitulo')}</div>
            <Field label={t('feiras.pc.formaPgto')}>
              <Seg<Pgto> valor={pgto} onChange={setPgto} opcoes={[
                { id: 'debito', label: t('feiras.pc.debito', { p: decimalLocal(taxaDebito) }) },
                { id: 'credito', label: t('feiras.pc.credito', { p: decimalLocal(taxaCredito) }) },
                { id: 'pix', label: t('feiras.pc.pix') },
                { id: 'outra', label: t('feiras.pc.outra') },
              ]} />
            </Field>
            <div className="fe-form-grid" style={{ marginTop: 12 }}>
              {pgto === 'outra' && <Field label={t('feiras.pc.taxaOperacao')}><input type="number" inputMode="decimal" step="0.01" min={0} value={taxaOutra} onChange={(e) => setTaxaOutra(e.target.value)} /></Field>}
              <Field label={t('feiras.pc.imposto')}><input type="number" inputMode="decimal" step="0.1" min={0} value={imposto} onChange={(e) => setImposto(e.target.value)} /></Field>
              <Field label={t('feiras.pc.frete')} hint={t('feiras.pc.freteHint')}><input type="number" inputMode="decimal" step="0.01" min={0} value={frete} onChange={(e) => setFrete(e.target.value)} placeholder={t('feiras.comum.zero')} /></Field>
              <Field label={t('feiras.pc.margem')}><input type="number" inputMode="decimal" step="0.1" min={0} value={margem} onChange={(e) => setMargem(e.target.value)} /></Field>
            </div>
          </div>

          <div className="fe-totals">
            <div><small>{t('feiras.pc.precoVendaDireta')}</small><br /><b>{calc ? brl(calc.preco) : t('feiras.comum.nd')}</b></div>
            <small style={{ maxWidth: 210, textAlign: 'right' }}>{calc ? t('feiras.pc.resumo', { t: brl(calc.taxaValor), l: brl(calc.lucroLiquido), m: decimalLocal(calc.margem.toFixed(1)) }) : t('feiras.pc.ajuste')}</small>
          </div>
        </>
      )}
    </Drawer>
  );
}
