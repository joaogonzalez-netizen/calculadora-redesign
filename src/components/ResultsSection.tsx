import { useCalculadora } from '../context/CalculadoraContext';
import { useMoeda } from '../context/MoedaContext';
import { fmtMoeda } from '../lib/format';

export default function ResultsSection() {
  const { state, resultado } = useCalculadora();
  const { moeda } = useMoeda();

  if (!resultado) return null;
  const r = resultado;

  const margemClass = r.margem < 25 ? 'm-red' : r.margem <= 35 ? 'm-gold' : 'm-green';

  const rows: { label: string; v: number; cor: string }[] = [
    { label: 'Material', v: r.cMaterial, cor: 'bar-green' },
    { label: 'Energia', v: r.cEnergia, cor: 'bar-green' },
    { label: 'Res. falha', v: r.cFalha, cor: 'bar-green' },
    { label: 'Extras', v: r.cAcc, cor: 'bar-green' },
  ];
  if (state.imposto > 0) rows.push({ label: 'Imposto', v: r.precoConsumidor * (state.imposto / 100), cor: 'bar-gold' });
  if (state.canalAtivo === 'Venda direta' && state.taxaCartaoPct > 0) rows.push({ label: 'Taxa pgto.', v: r.precoConsumidor * (state.taxaCartaoPct / 100), cor: 'bar-gold' });
  if (state.canalAtivo !== 'Venda direta') rows.push({ label: 'Comissão ' + state.canalAtivo, v: r.taxaValor, cor: 'bar-red' });
  const maxV = Math.max(...rows.map((row) => row.v), 0.01);

  return (
    <div id="resultsSection">
      <div className="res-grid">
        <div className="res-price card" style={{ boxShadow: 'none' }}>
          <div className="lbl">Preço ao consumidor</div>
          <div className="val">{fmtMoeda(r.precoConsumidor, moeda)}</div>
          <div className="sub">Custo unitário: <span>{fmtMoeda(r.custoUnit, moeda)}</span></div>
          <div className="split"><span>Referência de varejo (50%)</span><b>{fmtMoeda(r.precoVarejo, moeda)}</b></div>
          {state.comPromo && (
            <div className="split"><span>Preço com desconto aplicado</span><b>{fmtMoeda(r.precoComPromo, moeda)}</b></div>
          )}
        </div>
        <div className={'res-margem card ' + margemClass} style={{ boxShadow: 'none' }}>
          <div className="lbl">Margem de contribuição</div>
          <div className="val">{r.margem.toFixed(1).replace('.', ',')}%</div>
          <div className="rows">
            <div>Lucro bruto <b>{fmtMoeda(r.lucroBruto, moeda)}</b></div>
            <div>Lucro líquido <b>{fmtMoeda(r.lucroLiquido, moeda)}</b></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingTop: 22 }}>
          <h4 style={{ marginBottom: 4 }}>Composição de custos</h4>
          <div><span className="canal-tag">📦 {state.canalAtivo}</span></div>
          <div>
            {rows.map((row) => (
              <div className="comp-row" key={row.label}>
                <div className="lbl"><span>{row.label}</span><b>{fmtMoeda(row.v, moeda)}</b></div>
                <div className="bar-bg"><div className={'bar-fill ' + row.cor} style={{ width: Math.min(100, (row.v / maxV) * 100) + '%' }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingTop: 22 }}>
          <h4>Capacidade produtiva</h4>
          <div className="hint" style={{ marginBottom: 4 }}>Base: 20h/dia de impressora ligada</div>
          <div className="cap-row"><div className="t">Potencial diário</div><div className="v"><b>{fmtMoeda(r.potDiario, moeda)}</b><span className="s">{r.pecasDia} peças × {r.ciclosDia.toFixed(1)} ciclos/dia</span></div></div>
          <div className="cap-row"><div className="t">Potencial mensal</div><div className="v"><b>{fmtMoeda(r.potMensal, moeda)}</b><span className="s">{r.pecasDia * 30} peças em 30 dias</span></div></div>
        </div>
      </div>
    </div>
  );
}
