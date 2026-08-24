import { INSIGHTS, KPIS, USUARIO } from '../lib/dashboardMock';
import SyncBar from '../components/dashboard/SyncBar';
import MarketplaceFilter from '../components/dashboard/MarketplaceFilter';
import KpiCard from '../components/dashboard/KpiCard';
import InsightCard from '../components/dashboard/InsightCard';
import LucroChart from '../components/dashboard/LucroChart';
import TopProdutos from '../components/dashboard/TopProdutos';
import PedidosRecentes from '../components/dashboard/PedidosRecentes';
import DreCard from '../components/dashboard/DreCard';

export default function DashboardView({ onVerProdutosSemCusto }: { onVerProdutosSemCusto: () => void }) {
  return (
    <div>
      <div className="hero">
        <h1>Bem-vindo, <span className="accent">{USUARIO.primeiroNome}</span></h1>
        <p>Configure seu primeiro marketplace para começar a sincronizar pedidos e analisar lucratividade. Leva menos de 2 minutos.</p>
      </div>

      <div className="sync-row">
        <SyncBar />
        <MarketplaceFilter />
      </div>

      <div className="kpi-grid">
        {KPIS.map((k) => <KpiCard key={k.id} kpi={k} />)}
      </div>

      <div className="insight-grid">
        {INSIGHTS.map((i) => <InsightCard key={i.id} insight={i} />)}
      </div>

      <LucroChart />

      <div className="dash-bottom">
        <TopProdutos />
        <PedidosRecentes />
      </div>

      <DreCard onVerProdutosSemCusto={onVerProdutosSemCusto} />
    </div>
  );
}
