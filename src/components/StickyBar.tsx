import { useCalculadora } from '../context/CalculadoraContext';
import { useMoeda } from '../context/MoedaContext';
import { useI18n } from '../context/I18nContext';
import { fmtMoeda } from '../lib/format';

export default function StickyBar({ onCalcular, onVerResumo }: { onCalcular: () => void; onVerResumo: () => void }) {
  const { resultado } = useCalculadora();
  const { moeda } = useMoeda();
  const { t } = useI18n();
  if (!resultado) return null;

  return (
    <div className="sticky-bar show">
      <div className="sb-metrics">
        <div className="sb-price"><span>{t('calc.precoParaOConsumidor')}</span><b>{fmtMoeda(resultado.precoConsumidor, moeda)}</b></div>
        <div className="sb-div" />
        <div className="sb-price"><span>{t('calc.custoPorUnidade')}</span><b>{fmtMoeda(resultado.custoUnit, moeda)}</b></div>
        <div className="sb-div" />
        <div className="sb-price"><span>{t('calc.margemDeContribuicao')}</span><b>{fmtMoeda(resultado.lucroLiquido, moeda)}</b> <span className="pct">· {resultado.margem.toFixed(1).replace('.', ',')}%</span></div>
      </div>
      <div className="sb-actions">
        <button type="button" className="btn-calc-sticky" onClick={onCalcular}>{t('calc.calcular')}</button>
        <button type="button" className="sb-resumo" onClick={onVerResumo}>{t('calc.verResumo')} ↓</button>
      </div>
    </div>
  );
}
