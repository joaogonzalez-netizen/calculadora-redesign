import { useState } from 'react';
import { INSIGHTS, KPIS } from '../lib/dashboardMock';
import { useI18n } from '../context/I18nContext';
import SyncBar from '../components/dashboard/SyncBar';
import MarketplaceFilter from '../components/dashboard/MarketplaceFilter';
import KpiCard from '../components/dashboard/KpiCard';
import InsightCard from '../components/dashboard/InsightCard';
import LucroChart from '../components/dashboard/LucroChart';
import TopProdutos from '../components/dashboard/TopProdutos';
import PedidosRecentes from '../components/dashboard/PedidosRecentes';
import DreCard from '../components/dashboard/DreCard';
import EmptyStateDashboard from '../components/dashboard/EmptyStateDashboard';
import EmptyStateFerramentas from '../components/dashboard/EmptyStateFerramentas';

type ModoPainel = 'populado' | 'vazio_marketplace' | 'vazio_ferramentas';
const PAINEL_MODO_KEY = 'stlseller_painel_modo';

const MODOS: { key: ModoPainel; chaveLabel: string }[] = [
  { key: 'populado', chaveLabel: 'dashboard.comDados' },
  { key: 'vazio_marketplace', chaveLabel: 'dashboard.vazioMarketplace' },
  { key: 'vazio_ferramentas', chaveLabel: 'dashboard.vazioFerramentas' },
];

interface Props {
  onVerProdutosSemCusto: () => void;
  onIrParaCalculadora: () => void;
  onIrParaConfiguracoes: () => void;
}

export default function DashboardView({ onVerProdutosSemCusto, onIrParaCalculadora, onIrParaConfiguracoes }: Props) {
  const { t } = useI18n();
  const [modo, setModo] = useState<ModoPainel>(() => {
    const salvo = localStorage.getItem(PAINEL_MODO_KEY) as ModoPainel | null;
    return salvo && MODOS.some((m) => m.key === salvo) ? salvo : 'populado';
  });

  function trocarModo(m: ModoPainel) {
    setModo(m);
    localStorage.setItem(PAINEL_MODO_KEY, m);
  }

  return (
    <div>
      <div className="cluster-modo-row">
        <span className="hint">{t('dashboard.visualizacao')}</span>
        <div className="cluster-modo-toggle painel-modo-toggle">
          {MODOS.map((m) => (
            <button key={m.key} type="button" className={modo === m.key ? 'active' : ''} onClick={() => trocarModo(m.key)}>{t(m.chaveLabel)}</button>
          ))}
        </div>
      </div>

      {modo === 'vazio_marketplace' && <EmptyStateDashboard onIrParaCalculadora={onIrParaCalculadora} />}
      {modo === 'vazio_ferramentas' && <EmptyStateFerramentas onIrParaConfiguracoes={onIrParaConfiguracoes} />}
      {modo === 'populado' && (
        <>
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
        </>
      )}
    </div>
  );
}
