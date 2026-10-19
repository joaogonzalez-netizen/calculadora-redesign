import { useCallback } from 'react';
import './feiras.css';
import { StoreProvider, useStore } from './lib/store';
import { UiProvider, useUi, type View } from './lib/ui';
import Icon from './components/Icon';
import PainelView from './views/PainelView';
import NegociosView from './views/NegociosView';
import ClientesView from './views/ClientesView';
import PedidosView from './views/PedidosView';
import CatalogoView from './views/CatalogoView';
import FeirasView from './views/FeirasView';
import ProspeccaoView from './views/ProspeccaoView';
import LeadRapido from './components/drawers/LeadRapido';
import NegocioDrawer from './components/drawers/NegocioDrawer';
import ClienteDrawer from './components/drawers/ClienteDrawer';
import PedidoDrawer from './components/drawers/PedidoDrawer';
import ProdutoCalculadoraDrawer from './components/drawers/ProdutoCalculadoraDrawer';

export type { View as FeirasView } from './lib/ui';

interface Props { view: View; onNavigate: (v: View) => void; onIrParaCalculadora: () => void }

/** Módulo de vendas físicas (feiras, eventos e lojas) dentro do STLSeller. Só PT por enquanto; dados em localStorage (mesma camada do resto do protótipo). */
export default function FeirasModule({ view, onNavigate, onIrParaCalculadora }: Props) {
  const nav = useCallback((v: View) => onNavigate(v), [onNavigate]);
  return (
    <StoreProvider>
      <UiProvider view={view} onNavigate={nav} onIrParaCalculadora={onIrParaCalculadora}>
        <Conteudo />
      </UiProvider>
    </StoreProvider>
  );
}

function Conteudo() {
  const { feiraAtiva } = useStore();
  const { view, ir, drawer, abrir, toast } = useUi();
  return (
    <div className="fe">
      <div className="fe-bar">
        <button type="button" className={'fe-pill' + (feiraAtiva ? ' fe-on' : '')} onClick={() => ir('eventos')} title="Trocar ponto de venda ativo">
          <span className="fe-dot" />
          <span className="fe-t">{feiraAtiva ? feiraAtiva.nome : 'Nenhum ponto de venda ativo'}</span>
        </button>
        <button className="fe-btn fe-btn-primary" onClick={() => abrir('lead')}><Icon name="plus" /> Contato rápido</button>
      </div>

      {view === 'painel' && <PainelView />}
      {view === 'negocios' && <NegociosView />}
      {view === 'clientes' && <ClientesView />}
      {view === 'pedidos' && <PedidosView />}
      {view === 'catalogo' && <CatalogoView />}
      {view === 'eventos' && <FeirasView />}
      {view === 'prospeccao' && <ProspeccaoView />}

      {drawer?.tipo === 'lead' && <LeadRapido />}
      {drawer?.tipo === 'negocio' && <NegocioDrawer key={drawer.id ?? 'novo'} />}
      {drawer?.tipo === 'cliente' && <ClienteDrawer key={drawer.id ?? 'novo'} />}
      {drawer?.tipo === 'pedido' && <PedidoDrawer key={drawer.id ?? 'novo'} />}
      {drawer?.tipo === 'produto-calc' && <ProdutoCalculadoraDrawer />}

      {toast && (
        <div className="fe-toast" role="status">
          {toast.msg}
          {toast.acao && <button onClick={toast.acao.fn}>{toast.acao.label}</button>}
        </div>
      )}
    </div>
  );
}

