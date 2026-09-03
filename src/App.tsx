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
import ConfiguracoesView from './views/ConfiguracoesView';
import PrimeirosPassosView from './views/PrimeirosPassosView';
import CriarAnuncioView from './views/CriarAnuncioView';
import PedidosView from './views/PedidosView';
import { LibrariasProvider } from './context/LibrariasContext';
import { MoedaProvider } from './context/MoedaContext';
import { CalculadoraProvider } from './context/CalculadoraContext';
import { seedHistoricoExemplo, getHistorico } from './lib/storage';
import { getOnboardingManual, getMarketplaceConectado } from './lib/onboarding';

export type View = 'dashboard' | 'produtos' | 'calculadora' | 'historico' | 'preferencias' | 'configuracoes' | 'primeirospassos' | 'gerador-criar' | 'pedidos';

function AppShell() {
  const [view, setView] = useState<View>('dashboard');
  const [histCount, setHistCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [produtosFiltroSemCusto, setProdutosFiltroSemCusto] = useState(false);
  const [onboardingTick, setOnboardingTick] = useState(0);

  const irParaProdutosSemCusto = () => { setProdutosFiltroSemCusto(true); setView('produtos'); };
  const refreshOnboarding = () => setOnboardingTick((t) => t + 1);

  useEffect(() => {
    seedHistoricoExemplo(Date.now());
    setHistCount(getHistorico().length);
  }, []);

  const refreshHistCount = () => { setHistCount(getHistorico().length); refreshOnboarding(); };

  // onboardingTick não é lido diretamente — mudar o state força este componente
  // a re-renderizar, e as leituras de localStorage abaixo já saem atualizadas.
  void onboardingTick;
  const onboardingManual = getOnboardingManual();
  const passosCompletos = {
    buscador: onboardingManual.buscador,
    calculadora: histCount > 0,
    gerador: onboardingManual.gerador,
    marketplace: getMarketplaceConectado(),
  };
  const todosPassosCompletos = Object.values(passosCompletos).every(Boolean);

  return (
    <div className={'app' + (collapsed ? ' sidebar-collapsed' : '')}>
      <Sidebar
        view={view}
        onNavigate={setView}
        histCount={histCount}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        mostrarPrimeirosPassos={!todosPassosCompletos}
      />
      <div className="main">
        <Topbar view={view} />
        {/* O dashboard usa faixa larga; as telas da calculadora seguem em 900px. */}
        <div className={'content' + (view === 'dashboard' || view === 'produtos' || view === 'primeirospassos' || view === 'gerador-criar' || view === 'pedidos' ? ' content-wide' : '')}>
          {view === 'primeirospassos' && (
            <PrimeirosPassosView
              passosCompletos={passosCompletos}
              onIrParaCalculadora={() => setView('calculadora')}
              onIrParaConfiguracoes={() => setView('configuracoes')}
              onAtualizarPassos={refreshOnboarding}
            />
          )}
          {view === 'dashboard' && (
            <DashboardView
              onVerProdutosSemCusto={irParaProdutosSemCusto}
              onIrParaCalculadora={() => setView('calculadora')}
              onIrParaConfiguracoes={() => setView('configuracoes')}
            />
          )}
          {view === 'pedidos' && <PedidosView />}
          {view === 'produtos' && (
            <ProdutosView
              filtroSemCustoInicial={produtosFiltroSemCusto}
              onFiltroSemCustoConsumido={() => setProdutosFiltroSemCusto(false)}
            />
          )}
          {view === 'calculadora' && <CalculadoraView onSaved={refreshHistCount} />}
          {view === 'historico' && <HistoricoView onChange={refreshHistCount} onAbrirNaCalculadora={() => setView('calculadora')} />}
          {view === 'preferencias' && <PreferenciasView />}
          {view === 'configuracoes' && <ConfiguracoesView onChange={refreshOnboarding} />}
          {view === 'gerador-criar' && <CriarAnuncioView />}
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
