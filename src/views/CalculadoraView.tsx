import { useCalculadora } from '../context/CalculadoraContext';
import { useI18n } from '../context/I18nContext';
import MoedaTopoCard from '../components/MoedaTopoCard';
import ModeloCard from '../components/ModeloCard';
import ImpressaoCard from '../components/ImpressaoCard';
import PrecificacaoCard from '../components/PrecificacaoCard';
import CanalCard from '../components/CanalCard';
import CustosExtrasCard from '../components/CustosExtrasCard';
import AdsCard from '../components/AdsCard';
import ResumoCard from '../components/ResumoCard';

// Layout de coluna única, igual ao da tela de produção (captura de 14/10/2026):
// cartões do formulário em sequência, botão "Calcular preço de venda" e, por
// último, o cartão "Resumo". O painel fixo "mesa de impressão" (PrecoPanel,
// ver .impeccable/surfaces/src-views-calculadoraview-tsx.md) segue no
// repositório, mas fora de uso.
export default function CalculadoraView({ onSaved }: { onSaved: () => void }) {
  const { faltando, calcularClick, salvarHistorico } = useCalculadora();
  const { t } = useI18n();

  function handleCalcular() {
    calcularClick();
    const alvo = faltando.length > 0
      ? document.getElementById(faltando[0].id)
      : document.getElementById('resultsSection');
    alvo?.scrollIntoView({ behavior: 'smooth', block: faltando.length > 0 ? 'center' : 'start' });
    if (faltando.length > 0) setTimeout(() => (alvo as HTMLElement | null)?.focus?.({ preventScroll: true }), 350);
  }

  function handleSalvar() {
    if (faltando.length > 0) { handleCalcular(); return; }
    salvarHistorico();
    onSaved();
  }

  return (
    <div className="calc-coluna">
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

      <div className="card calc-calcular">
        <div className="card-body">
          <p className="calc-calcular-hint">{t('calc.preencherCamposCalcular')}</p>
          <button type="button" className="btn-calc" onClick={handleCalcular}>{t('calc.calcularPrecoDeVenda')}</button>
          <span className="required-hint">{t('calc.camposObrigatorios')}</span>
        </div>
      </div>

      <ResumoCard onSalvar={handleSalvar} />
    </div>
  );
}
