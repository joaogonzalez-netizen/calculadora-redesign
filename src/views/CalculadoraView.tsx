import { useCalculadora } from '../context/CalculadoraContext';
import { useI18n } from '../context/I18nContext';
import MoedaTopoCard from '../components/MoedaTopoCard';
import ModeloCard from '../components/ModeloCard';
import ImpressaoCard from '../components/ImpressaoCard';
import PrecificacaoCard from '../components/PrecificacaoCard';
import CanalCard from '../components/CanalCard';
import CustosExtrasCard from '../components/CustosExtrasCard';
import AdsCard from '../components/AdsCard';
import ResultsSection from '../components/ResultsSection';
import StickyBar from '../components/StickyBar';

export default function CalculadoraView({ onSaved }: { onSaved: () => void }) {
  const { faltando, calcularClick, salvarHistorico, state } = useCalculadora();
  const { t } = useI18n();

  function handleCalcular() {
    calcularClick();
    if (faltando.length > 0) {
      const el = document.getElementById(faltando[0].id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => (el as HTMLElement | null)?.focus?.({ preventScroll: true }), 350);
    }
  }

  function handleSalvar() {
    if (faltando.length > 0) { handleCalcular(); return; }
    salvarHistorico();
    onSaved();
    alert(t('calc.calculoSalvoNoHistorico'));
  }

  function handleGerarAnuncio() {
    alert(t('calc.redirecionandoGeradorAnuncios').replace('{nome}', state.nomePeca || 'produto'));
  }

  function verResumo() {
    document.getElementById('resultsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div>
      <div className="hero">
        <h1>{t('calc.heroTitlePart1')} <span className="accent">{t('calc.heroTitleAccent')}</span> {t('calc.heroTitlePart2')}</h1>
        <p>{t('calc.heroSubtitle')}</p>
      </div>

      <MoedaTopoCard />
      <ModeloCard />
      <ImpressaoCard />
      <PrecificacaoCard />
      <CanalCard />
      <CustosExtrasCard />
      <AdsCard />

      <ResultsSection />

      <div className="calc-footer">
        <div className="placeholder" style={{ display: faltando.length ? 'block' : 'none' }}>{t('calc.preencherCamposCalcular')}</div>
        <button className="btn-calc" onClick={handleCalcular}>{t('calc.calcularPrecoDeVenda')}</button>
        <div className="validation-hint">{faltando.length ? t('calc.faltaPreencher') + ' ' + faltando.map((f) => t(f.labelKey)).join(', ') : ''}</div>
        <div className="required-hint">{t('calc.camposObrigatorios')}</div>
        <div className="actions-secondary">
          <button type="button" className="btn-outline" onClick={handleSalvar}>💾 {t('calc.salvarNoHistorico')}</button>
          <button type="button" className="btn-outline" onClick={handleGerarAnuncio}>✨ {t('calc.gerarAnuncioComIA')}</button>
        </div>
      </div>

      <StickyBar onCalcular={handleCalcular} onVerResumo={verResumo} />
    </div>
  );
}
