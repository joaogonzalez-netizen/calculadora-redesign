import { useEffect, useState } from 'react';
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
import { limparOrigemCatalogo, marcarOrigemCatalogo, veioDoCatalogo } from '../lib/origemCalculadora';

// Layout de coluna única, igual ao da tela de produção (captura de 14/10/2026):
// cartões do formulário em sequência, botão "Calcular preço de venda" e, por
// último, o cartão "Resumo". O painel fixo "mesa de impressão" (PrecoPanel,
// ver .impeccable/surfaces/src-views-calculadoraview-tsx.md) segue no
// repositório, mas fora de uso.
export default function CalculadoraView({ onSaved, onVoltarCatalogo }: { onSaved: () => void; onVoltarCatalogo?: () => void }) {
  const { faltando, calcularClick, salvarHistorico } = useCalculadora();
  const { t } = useI18n();
  // Veio do catálogo de Vendas físicas? Mostra o aviso e o atalho de volta.
  const [doCatalogo, setDoCatalogo] = useState(veioDoCatalogo);
  // Saiu da calculadora: o que for salvo depois não vai para o catálogo.
  // (re-marca ao montar, porque o StrictMode monta/desmonta/monta em desenvolvimento)
  useEffect(() => {
    if (doCatalogo) marcarOrigemCatalogo();
    return () => limparOrigemCatalogo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function voltarAoCatalogo() {
    limparOrigemCatalogo();
    setDoCatalogo(false);
    onVoltarCatalogo?.();
  }

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

      {doCatalogo && onVoltarCatalogo && (
        <div className="calc-origem-catalogo">
          <div>
            <b>{t('calc.origemCatalogoTitulo')}</b>
            <span>{t('calc.origemCatalogoTexto')}</span>
          </div>
          <button type="button" className="btn-outline" onClick={voltarAoCatalogo}>{t('calc.voltarAoCatalogo')}</button>
        </div>
      )}

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
