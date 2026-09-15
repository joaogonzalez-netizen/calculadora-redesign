import { useCalculadora } from '../context/CalculadoraContext';
import { useMoeda } from '../context/MoedaContext';
import { useI18n } from '../context/I18nContext';
import { fmtMoeda } from '../lib/format';
import type { Canal } from '../types';

const CANAL_LABEL_KEYS: Record<Canal, string> = {
  'Venda direta': 'calc.canalVendaDireta',
  'Mercado Livre': 'calc.canalMercadoLivre',
  'Mercado Livre Argentina': 'calc.canalMercadoLivreArgentina',
  'Shopee': 'calc.canalShopee',
  'Etsy': 'calc.canalEtsy',
  'TikTok Shop': 'calc.canalTiktokShop',
};

export default function ResultsSection() {
  const { state, resultado } = useCalculadora();
  const { moeda } = useMoeda();
  const { t } = useI18n();

  if (!resultado) return null;
  const r = resultado;

  const margemClass = r.margem < 25 ? 'm-red' : r.margem <= 35 ? 'm-gold' : 'm-green';

  const rows: { label: string; labelKey: string; v: number; cor: string }[] = [
    { label: 'Material', labelKey: 'calc.rowMaterial', v: r.cMaterial, cor: 'bar-green' },
    { label: 'Energia', labelKey: 'calc.rowEnergia', v: r.cEnergia, cor: 'bar-green' },
    { label: 'Res. falha', labelKey: 'calc.rowResFalha', v: r.cFalha, cor: 'bar-green' },
    { label: 'Extras', labelKey: 'calc.rowExtras', v: r.cAcc, cor: 'bar-green' },
  ];
  if (state.imposto > 0) rows.push({ label: 'Imposto', labelKey: 'calc.rowImposto', v: r.precoConsumidor * (state.imposto / 100), cor: 'bar-gold' });
  if (state.canalAtivo === 'Venda direta' && state.taxaCartaoPct > 0) rows.push({ label: 'Taxa pgto.', labelKey: 'calc.rowTaxaPgto', v: r.precoConsumidor * (state.taxaCartaoPct / 100), cor: 'bar-gold' });
  if (state.canalAtivo !== 'Venda direta') rows.push({ label: 'Comissão ' + state.canalAtivo, labelKey: '', v: r.taxaValor, cor: 'bar-red' });
  const maxV = Math.max(...rows.map((row) => row.v), 0.01);

  return (
    <div id="resultsSection">
      <div className="res-grid">
        <div className="res-price card" style={{ boxShadow: 'none' }}>
          <div className="lbl">{t('calc.precoAoConsumidor')}</div>
          <div className="val">{fmtMoeda(r.precoConsumidor, moeda)}</div>
          <div className="sub">{t('calc.custoUnitario')}: <span>{fmtMoeda(r.custoUnit, moeda)}</span></div>
          <div className="split"><span>{t('calc.referenciaVarejo50')}</span><b>{fmtMoeda(r.precoVarejo, moeda)}</b></div>
          {state.comPromo && (
            <div className="split"><span>{t('calc.precoComDescontoAplicado')}</span><b>{fmtMoeda(r.precoComPromo, moeda)}</b></div>
          )}
        </div>
        <div className={'res-margem card ' + margemClass} style={{ boxShadow: 'none' }}>
          <div className="lbl">{t('calc.margemDeContribuicao')}</div>
          <div className="val">{r.margem.toFixed(1).replace('.', ',')}%</div>
          <div className="rows">
            <div>{t('calc.lucroBruto')} <b>{fmtMoeda(r.lucroBruto, moeda)}</b></div>
            <div>{t('calc.lucroLiquido')} <b>{fmtMoeda(r.lucroLiquido, moeda)}</b></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingTop: 22 }}>
          <h4 style={{ marginBottom: 4 }}>{t('calc.composicaoDeCustos')}</h4>
          <div><span className="canal-tag">📦 {t(CANAL_LABEL_KEYS[state.canalAtivo])}</span></div>
          <div>
            {rows.map((row) => (
              <div className="comp-row" key={row.label}>
                <div className="lbl"><span>{row.labelKey ? t(row.labelKey) : t('calc.comissaoPrefix') + ' ' + t(CANAL_LABEL_KEYS[state.canalAtivo])}</span><b>{fmtMoeda(row.v, moeda)}</b></div>
                <div className="bar-bg"><div className={'bar-fill ' + row.cor} style={{ width: Math.min(100, (row.v / maxV) * 100) + '%' }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingTop: 22 }}>
          <h4>{t('calc.capacidadeProdutiva')}</h4>
          <div className="hint" style={{ marginBottom: 4 }}>Base: 20h/dia de impressora ligada</div>
          <div className="cap-row"><div className="t">{t('calc.potencialDiario')}</div><div className="v"><b>{fmtMoeda(r.potDiario, moeda)}</b><span className="s">{r.pecasDia} {t('calc.pecas')} × {r.ciclosDia.toFixed(1)} {t('calc.ciclosDia')}</span></div></div>
          <div className="cap-row"><div className="t">{t('calc.potencialMensal')}</div><div className="v"><b>{fmtMoeda(r.potMensal, moeda)}</b><span className="s">{r.pecasDia * 30} {t('calc.pecasEm30Dias')}</span></div></div>
        </div>
      </div>
    </div>
  );
}
