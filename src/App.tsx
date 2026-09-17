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
import MeusAnunciosView from './views/MeusAnunciosView';
import PedidosView from './views/PedidosView';
import BuscadorView from './views/BuscadorView';
import { LibrariasProvider } from './context/LibrariasContext';
import { MoedaProvider } from './context/MoedaContext';
import { CalculadoraProvider } from './context/CalculadoraContext';
import { I18nProvider, useI18n } from './context/I18nContext';
import { MOSTRAR_PASSO_MARKETPLACE } from './lib/versoes';
import { seedHistoricoExemplo, getHistorico } from './lib/storage';
import { getOnboardingManual, marcarOnboardingManual } from './lib/onboarding';

export type View = 'dashboard' | 'produtos' | 'calculadora' | 'historico' | 'preferencias' | 'configuracoes' | 'primeirospassos' | 'gerador-criar' | 'gerador-meus' | 'pedidos' | 'buscador';

function AppShell() {
  const { idioma } = useI18n();
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

  // Passo "Calculadora" só conta quando o usuário de fato salva um cálculo —
  // os 10 exemplos que vêm no seed não valem, senão o passo já nasceria feito.
  const aoSalvarCalculo = () => {
    marcarOnboardingManual('calculadora');
    refreshHistCount();
  };

  // Passo "Buscador" só conta quando o usuário favorita um produto de verdade
  // na tela — mesmo padrão do passo "Calculadora" acima.
  const aoFavoritarBuscador = () => {
    marcarOnboardingManual('buscador');
    refreshOnboarding();
  };

  // onboardingTick não é lido diretamente — mudar o state força este componente
  // a re-renderizar, e as leituras de localStorage abaixo já saem atualizadas.
  void onboardingTick;
  const onboardingManual = getOnboardingManual();
  const passosCompletos = {
    buscador: onboardingManual.buscador,
    calculadora: onboardingManual.calculadora,
    gerador: onboardingManual.gerador,
    marketplace: onboardingManual.marketplace,
    video: onboardingManual.video,
  };
  // Nas versões ES/EN o passo "marketplace" nem aparece no checklist (não há
  // conexão de marketplace pra fazer), então ele não deve travar o "tudo
  // completo" — do contrário "Primeiros passos" nunca sumiria da sidebar.
  const passosConsiderados = MOSTRAR_PASSO_MARKETPLACE[idioma]
    ? passosCompletos
    : { ...passosCompletos, marketplace: true };
  const todosPassosCompletos = Object.values(passosConsiderados).every(Boolean);

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
        <div className={'content' + (view === 'dashboard' || view === 'produtos' || view === 'primeirospassos' || view === 'gerador-criar' || view === 'gerador-meus' || view === 'pedidos' || view === 'buscador' ? ' content-wide' : '')}>
          {view === 'primeirospassos' && (
            <PrimeirosPassosView
              passosCompletos={passosCompletos}
              onIrParaCalculadora={() => setView('calculadora')}
              onIrParaConfiguracoes={() => setView('configuracoes')}
              onIrParaBuscador={() => setView('buscador')}
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
          {view === 'calculadora' && <CalculadoraView onSaved={aoSalvarCalculo} />}
          {view === 'historico' && <HistoricoView onChange={refreshHistCount} onAbrirNaCalculadora={() => setView('calculadora')} />}
          {view === 'preferencias' && <PreferenciasView />}
          {view === 'configuracoes' && <ConfiguracoesView onChange={refreshOnboarding} />}
          {view === 'gerador-criar' && <CriarAnuncioView onIrParaConfiguracoes={() => setView('configuracoes')} />}
          {view === 'gerador-meus' && <MeusAnunciosView onCriarAnuncio={() => setView('gerador-criar')} />}
          {view === 'buscador' && <BuscadorView onFavoritar={aoFavoritarBuscador} />}
        </div>
        <AppFooter />
      </div>
    </div>
  );
}

function App() {
  return (
    <PasswordGate>
      <I18nProvider>
        <LibrariasProvider>
          <MoedaProvider>
            <CalculadoraProvider>
              <AppShell />
            </CalculadoraProvider>
          </MoedaProvider>
        </LibrariasProvider>
      </I18nProvider>
    </PasswordGate>
  );
}

export default App;
