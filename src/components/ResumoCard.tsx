import { useEffect, useState } from 'react';
import { useCalculadora } from '../context/CalculadoraContext';
import { useMoeda } from '../context/MoedaContext';
import { useI18n } from '../context/I18nContext';
import { fmtMoeda } from '../lib/format';
import { CANAL_LABEL_KEYS } from '../lib/canal';
import type { CustoCategoria } from '../types';
import Icon from './Icon';

// Cartão "Resumo" da Calculadora, no visual da tela de produção (captura de
// 14/10/2026): preço para o consumidor, três métricas (custo, margem, markup),
// composição do custo com barras, potencial diário/mensal e as ações finais.
// Substitui o painel fixo "mesa de impressão" (PrecoPanel), que continua no
// repositório mas fora de uso — ver CalculadoraView.

const CATS_LABEL_KEYS: Record<CustoCategoria, string> = {
  'Embalagem': 'calc.catEmbalagem',
  'Mão de obra': 'calc.catMaoDeObra',
  'Acabamento': 'calc.catAcabamento',
  'Outro': 'calc.catOutro',
  'Outras': 'calc.catOutras',
};

interface Props {
  onSalvar: () => void;
}

export default function ResumoCard({ onSalvar }: Props) {
  const { state, resultado, faltando, calcularClick, resetCalculadora } = useCalculadora();
  const { moeda } = useMoeda();
  const { t } = useI18n();
  const [confirmacao, setConfirmacao] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmacao) return;
    const id = setTimeout(() => setConfirmacao(null), 2800);
    return () => clearTimeout(id);
  }, [confirmacao]);

  function irParaCampo(id: string) {
    calcularClick();
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => (el as HTMLElement | null)?.focus?.({ preventScroll: true }), 350);
  }

  function handleSalvar() {
    onSalvar();
    setConfirmacao(t('calc.calculoSalvoNoHistorico'));
  }

  const cabecalho = (pronto: boolean) => (
    <div className="resumo-head">
      <div className="htitle">
        <div className="ic-badge"><Icon name="calculadora" size={16} /></div>
        <h3>{t('calc.resumo')}</h3>
        <span className={'resumo-status' + (pronto ? ' pronto' : '')}>
          <i className="resumo-status-dot" />{pronto ? t('calc.resumoPronto') : t('calc.resumoIncompleto')}
        </span>
      </div>
      <button type="button" className="resumo-limpar" onClick={resetCalculadora}>
        <Icon name="trash" size={13} /> {t('calc.limpar')}
      </button>
    </div>
  );

  // Ainda falta preencher algo: lista os campos pendentes, clicáveis.
  if (!resultado) {
    return (
      <div className="card resumo-card" id="resultsSection">
        {cabecalho(false)}
        <div className="resumo-corpo">
          <p className="hint" style={{ margin: 0 }}>{t('calc.painelVazioDesc')}</p>
          {faltando.length > 0 && (
            <ul className="resumo-faltando">
              {faltando.map((f) => (
                <li key={f.id}><button type="button" onClick={() => irParaCampo(f.id)}>{t(f.labelKey)}</button></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  const r = resultado;
  const fmt = (v: number) => fmtMoeda(v, moeda);
  const pct = (v: number) => v.toFixed(1).replace('.', ',');
  const markup = r.custoUnit > 0 ? r.precoConsumidor / r.custoUnit : 0;
  const margemClasse = r.margem < 25 ? 'm-red' : r.margem <= 35 ? 'm-gold' : 'm-green';

  // Extras (custos extras) separados por categoria, como na tela de produção.
  const porCategoria = new Map<CustoCategoria, number>();
  for (const a of state.accItems) porCategoria.set(a.categoria, (porCategoria.get(a.categoria) ?? 0) + (a.valor || 0));
  const somaExtras = [...porCategoria.values()].reduce((s, v) => s + v, 0);
  const freteDireto = Math.max(0, r.cAcc - somaExtras); // frete próprio da venda direta

  const linhas: { label: string; v: number; cor: 'verde' | 'vermelho' | 'ambar' }[] = [
    { label: t('calc.rowMaterial'), v: r.cMaterial, cor: 'verde' },
    { label: t('calc.rowEnergia'), v: r.cEnergia, cor: 'verde' },
    { label: t('calc.rowResFalha'), v: r.cFalha, cor: 'verde' },
    ...[...porCategoria.entries()].filter(([, v]) => v > 0).map(([cat, v]) => ({ label: t(CATS_LABEL_KEYS[cat]), v, cor: 'vermelho' as const })),
  ];
  if (freteDireto > 0) linhas.push({ label: t('calc.frete'), v: freteDireto, cor: 'vermelho' });
  const imposto = r.precoConsumidor * (state.imposto / 100);
  if (state.imposto > 0) linhas.push({ label: t('calc.rowImposto'), v: imposto, cor: 'ambar' });
  const maxV = Math.max(...linhas.map((l) => l.v), r.taxaValor, 0.01);

  const taxaPct = r.precoConsumidor * r.taxas.pct;
  const legendaCapacidade = t('calc.pecasPorMesaXCiclos')
    .replace('{q}', String(state.quantidade))
    .replace('{c}', r.ciclosDia.toFixed(1).replace('.', ','))
    .replace('{t}', String(r.pecasDia));

  return (
    <div className="card resumo-card" id="resultsSection">
      {cabecalho(true)}

      <div className="resumo-corpo">
        <div className="resumo-preco">
          <span className="resumo-rotulo">{t('calc.precoParaOConsumidor')}</span>
          <div className="resumo-preco-valor">{fmt(r.precoConsumidor)}</div>
          {state.comPromo && <div className="resumo-sub">{t('calc.precoComDescontoAplicado')}: <b>{fmt(r.precoComPromo)}</b></div>}
        </div>

        <div className="resumo-metricas">
          <div className="resumo-tile">
            <span className="resumo-rotulo">{t('calc.custoPorUnidade')}</span>
            <b className="resumo-tile-valor">{fmt(r.custoUnit)}</b>
          </div>
          <div className={'resumo-tile destaque ' + margemClasse}>
            <span className="resumo-rotulo">{t('calc.margemDeContribuicao')}</span>
            <b className="resumo-tile-valor verde">{fmt(r.lucroLiquido)}</b>
            <span className="resumo-pill">{pct(r.margem)}%</span>
          </div>
          <div className="resumo-tile">
            <span className="resumo-rotulo">{t('calc.markup')}</span>
            <b className="resumo-tile-valor">{markup.toFixed(2).replace('.', ',')}×</b>
          </div>
        </div>

        <h4 className="resumo-subtitulo">{t('calc.composicaoDoCusto')}</h4>

        {r.taxaValor > 0 && (
          <div className="resumo-taxas">
            <div className="resumo-taxas-topo">
              <span className="resumo-rotulo">{t('calc.totalTaxasCanal')}</span>
              <span className="resumo-taxas-canal">{t(CANAL_LABEL_KEYS[state.canalAtivo])}</span>
            </div>
            <b className="resumo-taxas-valor">{fmt(r.taxaValor)}</b>
            <div className="resumo-taxas-linhas">
              {r.taxas.pct > 0 && <div><span>{t('calc.comissaoPrefix')} ({pct(r.taxas.pct * 100)}%)</span><span>{fmt(taxaPct)}</span></div>}
              {r.taxas.fixo > 0 && <div><span>{t('calc.taxasFixasEFrete')}</span><span>{fmt(r.taxas.fixo)}</span></div>}
            </div>
          </div>
        )}

        <div className="resumo-linhas">
          {linhas.map((l) => (
            <div className="resumo-linha" key={l.label}>
              <div className="resumo-linha-topo"><span>{l.label}</span><b>{fmt(l.v)}</b></div>
              <div className="resumo-barra"><div className={'resumo-barra-fill ' + l.cor} style={{ width: Math.min(100, (l.v / maxV) * 100) + '%' }} /></div>
            </div>
          ))}
        </div>

        <div className="resumo-total"><span>{t('calc.custoPorUnidade')}</span><b>{fmt(r.custoUnit)}</b></div>

        <div className="resumo-potencial">
          <div className="resumo-potencial-titulo">{t('calc.potencialRentabilidade')}</div>
          <div className="resumo-potencial-grid">
            <div className="resumo-potencial-card">
              <span className="resumo-rotulo">{t('calc.potencialDiario')}</span>
              <b>{fmt(r.potDiario)}</b>
              <small>{legendaCapacidade} · {t('calc.base20hDiaCurto')}</small>
            </div>
            <div className="resumo-potencial-card">
              <span className="resumo-rotulo">{t('calc.potencialMensal')}</span>
              <b>{fmt(r.potMensal)}</b>
              <small>{r.pecasDia * 30} {t('calc.pecasEm30Dias')}</small>
            </div>
          </div>
        </div>
      </div>

      <div className="resumo-acoes">
        <button type="button" className="btn-calc" onClick={handleSalvar}>{t('calc.salvarNoHistorico')}</button>
        <button type="button" className="resumo-gerar" disabled>
          <Icon name="bolt" size={14} /> {t('calc.gerarAnuncio')} <span className="resumo-embreve">{t('nav.emBreveBadge')}</span>
        </button>
        {confirmacao && <div className="resumo-confirmacao" role="status">{confirmacao}</div>}
      </div>
    </div>
  );
}
