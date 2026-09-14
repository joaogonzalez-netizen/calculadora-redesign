import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';
import KpiCard from './KpiCard';
import InsightCard from './InsightCard';
import LucroChart from './LucroChart';
import TopProdutos from './TopProdutos';
import PedidosRecentes from './PedidosRecentes';
import DreCard from './DreCard';
import { INSIGHTS, KPIS } from '../../lib/dashboardMock';

function semAcao() { /* preview borrado — nada é clicável aqui */ }

// Variante B do empty state — teste pra validar a hipótese do funil de adoção
// (Gerador de anúncios e Calculadora têm muito mais uso do que a conexão de
// marketplace). Preview do painel completo, na mesma ordem de seções do "Com
// dados" (KPIs → insights → gráfico → top produtos/pedidos → DRE). Os KPIs
// ficam inteiros e visíveis (sem o popup por cima) — o popup fica só sobre a
// seção de insights, logo abaixo, com fundo sólido pra se destacar do blur.
export default function EmptyStateFerramentas({ onIrParaConfiguracoes }: { onIrParaConfiguracoes: () => void }) {
  const { t } = useI18n();
  return (
    <div className="onb-preview-section">
      <div className="onb-preview-label">{t('dashboard.vejaComoFicaDepois')}</div>

      <div className="onb-preview-blur">
        <div className="kpi-grid">
          {KPIS.map((k) => <KpiCard key={k.id} kpi={k} />)}
        </div>
      </div>

      <div className="onb-preview-chart-anchor">
        <div className="onb-preview-blur">
          <div className="insight-grid">
            {INSIGHTS.map((i) => <InsightCard key={i.id} insight={i} />)}
          </div>
        </div>
        <div className="onb-preview-popup">
          <Icon name="lock" size={20} />
          <p>{t('dashboard.conecteMarketplaceParaVerNumeros')}</p>
          <button type="button" className="btn-calc" style={{ width: 'auto', padding: '12px 24px' }} onClick={onIrParaConfiguracoes}>{t('dashboard.conectarMarketplaces')}</button>
        </div>
      </div>

      <div className="onb-preview-blur">
        <LucroChart />

        <div className="dash-bottom">
          <TopProdutos />
          <PedidosRecentes />
        </div>

        <DreCard onVerProdutosSemCusto={semAcao} />
      </div>
    </div>
  );
}
