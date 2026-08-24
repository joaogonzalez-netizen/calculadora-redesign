import { useCalculadora } from '../context/CalculadoraContext';
import { useMoeda } from '../context/MoedaContext';
import { fmtMoeda } from '../lib/format';

export default function StickyBar({ onCalcular, onVerResumo }: { onCalcular: () => void; onVerResumo: () => void }) {
  const { resultado } = useCalculadora();
  const { moeda } = useMoeda();
  if (!resultado) return null;

  return (
    <div className="sticky-bar show">
      <div className="sb-metrics">
        <div className="sb-price"><span>Preço para o consumidor</span><b>{fmtMoeda(resultado.precoConsumidor, moeda)}</b></div>
        <div className="sb-div" />
        <div className="sb-price"><span>Custo por unidade</span><b>{fmtMoeda(resultado.custoUnit, moeda)}</b></div>
        <div className="sb-div" />
        <div className="sb-price"><span>Margem de contribuição</span><b>{fmtMoeda(resultado.lucroLiquido, moeda)}</b> <span className="pct">· {resultado.margem.toFixed(1).replace('.', ',')}%</span></div>
      </div>
      <div className="sb-actions">
        <button type="button" className="btn-calc-sticky" onClick={onCalcular}>Calcular</button>
        <button type="button" className="sb-resumo" onClick={onVerResumo}>Ver resumo ↓</button>
      </div>
    </div>
  );
}
