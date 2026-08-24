import { useCalculadora } from '../context/CalculadoraContext';
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
    alert('Cálculo salvo no histórico.');
  }

  function handleGerarAnuncio() {
    alert('Redirecionando ao Gerador de anúncios com IA · nome_produto="' + (state.nomePeca || 'produto') + '"');
  }

  function verResumo() {
    document.getElementById('resultsSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div>
      <div className="hero">
        <h1>Calcule o preço <span className="accent">justo</span> de cada peça.</h1>
        <p>Insira os dados do modelo, custos da impressão e configurações de venda: a calculadora monta o preço sugerido pra você na hora.</p>
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
        <div className="placeholder" style={{ display: faltando.length ? 'block' : 'none' }}>Preencha os campos acima e calcule o preço sugerido.</div>
        <button className="btn-calc" onClick={handleCalcular}>Calcular preço de venda</button>
        <div className="validation-hint">{faltando.length ? 'Falta preencher: ' + faltando.map((f) => f.label).join(', ') : ''}</div>
        <div className="required-hint">* Campos obrigatórios para o cálculo</div>
        <div className="actions-secondary">
          <button type="button" className="btn-outline" onClick={handleSalvar}>💾 Salvar no histórico</button>
          <button type="button" className="btn-outline" onClick={handleGerarAnuncio}>✨ Gerar anúncio com IA</button>
        </div>
      </div>

      <StickyBar onCalcular={handleCalcular} onVerResumo={verResumo} />
    </div>
  );
}
