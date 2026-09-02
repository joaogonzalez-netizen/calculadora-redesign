import { useEffect, useState } from 'react';
import PasswordGate from './components/PasswordGate';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AppFooter from './components/AppFooter';
import DashboardView from './views/DashboardView';
import ProdutosView from './views/ProdutosView';
import CalculadoraView from './views/CalculadoraView';
import HistoricoView from './views/HistoricoView';
import PreferenciasView from './views/PreferenciasView';
import { LibrariasProvider } from './context/LibrariasContext';
import { MoedaProvider } from './context/MoedaContext';
import { CalculadoraProvider } from './context/CalculadoraContext';
import { seedHistoricoExemplo, getHistorico } from './lib/storage';

export type View = 'dashboard' | 'produtos' | 'calculadora' | 'historico' | 'preferencias';

function AppShell() {
  const [view, setView] = useState<View>('dashboard');
  const [histCount, setHistCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [produtosFiltroSemCusto, setProdutosFiltroSemCusto] = useState(false);

  const irParaProdutosSemCusto = () => { setProdutosFiltroSemCusto(true); setView('produtos'); };

  useEffect(() => {
    seedHistoricoExemplo(Date.now());
    setHistCount(getHistorico().length);
  }, []);

  const refreshHistCount = () => setHistCount(getHistorico().length);

  return (
    <div className={'app' + (collapsed ? ' sidebar-collapsed' : '')}>
      <Sidebar
        view={view}
        onNavigate={setView}
        histCount={histCount}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />
      <div className="main">
        <Topbar view={view} />
        {/* O dashboard usa faixa larga; as telas da calculadora seguem em 900px. */}
        <div className={'content' + (view === 'dashboard' || view === 'produtos' ? ' content-wide' : '')}>
          {view === 'dashboard' && <DashboardView onVerProdutosSemCusto={irParaProdutosSemCusto} onIrParaCalculadora={() => setView('calculadora')} />}
          {view === 'produtos' && (
            <ProdutosView
              filtroSemCustoInicial={produtosFiltroSemCusto}
              onFiltroSemCustoConsumido={() => setProdutosFiltroSemCusto(false)}
            />
          )}
          {view === 'calculadora' && <CalculadoraView onSaved={refreshHistCount} />}
          {view === 'historico' && <HistoricoView onChange={refreshHistCount} onAbrirNaCalculadora={() => setView('calculadora')} />}
          {view === 'preferencias' && <PreferenciasView />}
        </div>
        <AppFooter />
      </div>
    </div>
  );
}

function App() {
  return (
    <PasswordGate>
      <LibrariasProvider>
        <MoedaProvider>
          <CalculadoraProvider>
            <AppShell />
          </CalculadoraProvider>
        </MoedaProvider>
      </LibrariasProvider>
    </PasswordGate>
  );
}

export default App;
