import type { Kpi } from '../../lib/dashboardMock';
import InfoDot from '../InfoDot';

export default function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="kpi-card">
      <div className="kpi-head">
        <span>{kpi.label}</span>
        <InfoDot text={kpi.tooltip} />
      </div>
      <div className="kpi-value">
        {kpi.prefixo && <span className="kpi-prefix">{kpi.prefixo}</span>}
        <span className="kpi-int">{kpi.inteiro}</span>
        {kpi.decimal && <span className="kpi-dec">{kpi.decimal}</span>}
      </div>
      <div className="kpi-foot">
        <span className={'kpi-delta' + (kpi.deltaPositivo ? '' : ' down')}>{kpi.deltaPct}</span>
        <span className="kpi-comp">{kpi.comparativo}</span>
      </div>
    </div>
  );
}
