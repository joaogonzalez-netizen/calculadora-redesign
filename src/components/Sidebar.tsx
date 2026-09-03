import { useEffect, useState } from 'react';
import type { View } from '../App';
import { USUARIO } from '../lib/dashboardMock';
import Icon, { LogoMark, type IconName } from './Icon';

interface Props {
  view: View;
  onNavigate: (view: View) => void;
  histCount: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mostrarPrimeirosPassos: boolean;
}

/** Grupos de FERRAMENTAS: só o da Calculadora tem telas de verdade hoje. */
type GrupoId = 'gerador' | 'calculadora' | 'buscador';

const GRUPOS: { id: GrupoId; label: string; icon: IconName }[] = [
  { id: 'gerador', label: 'Gerador de anúncios', icon: 'gerador' },
  { id: 'calculadora', label: 'Calculadora de preços', icon: 'calculadora' },
  { id: 'buscador', label: 'Buscador de produtos', icon: 'buscador' },
];

const VIEWS_DA_CALCULADORA: View[] = ['calculadora', 'historico', 'preferencias'];
const VIEWS_DO_GERADOR: View[] = ['gerador-criar'];

export default function Sidebar({ view, onNavigate, histCount, collapsed, onToggleCollapsed, mostrarPrimeirosPassos }: Props) {
  const naCalculadora = VIEWS_DA_CALCULADORA.includes(view);
  const noGerador = VIEWS_DO_GERADOR.includes(view);
  const [aberto, setAberto] = useState<GrupoId | null>(naCalculadora ? 'calculadora' : noGerador ? 'gerador' : null);

  // O grupo da tela ativa abre sozinho ao navegar pra ela.
  useEffect(() => {
    if (naCalculadora) setAberto('calculadora');
    else if (noGerador) setAberto('gerador');
  }, [naCalculadora, noGerador]);

  function toggleGrupo(id: GrupoId) {
    if (collapsed) onToggleCollapsed();
    setAberto((atual) => (atual === id ? null : id));
  }

  return (
    <div className={'sidebar' + (collapsed ? ' collapsed' : '')}>
      <button type="button" className="sidebar-toggle" onClick={onToggleCollapsed} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}>
        <Icon name="chevron" size={14} />
      </button>

      <div className="logo-row">
        <LogoMark />
        <div className="logo-text"><span>STL</span>SELLER</div>
      </div>

      <div className="nav-scroll">
        {mostrarPrimeirosPassos && (
          <>
            <div className="nav-label">Onboarding</div>
            <NavItem icon="flag" label="Primeiros passos" active={view === 'primeirospassos'} collapsed={collapsed} onClick={() => onNavigate('primeirospassos')} />
          </>
        )}

        <div className="nav-label">Principal</div>
        <NavItem icon="dashboard" label="Painel" active={view === 'dashboard'} collapsed={collapsed} onClick={() => onNavigate('dashboard')} />
        <NavItem icon="pedidos" label="Pedidos" active={view === 'pedidos'} collapsed={collapsed} onClick={() => onNavigate('pedidos')} />
        <NavItem icon="produtos" label="Produtos" active={view === 'produtos'} collapsed={collapsed} onClick={() => onNavigate('produtos')} />

        <div className="nav-label">Ferramentas</div>
        {GRUPOS.map((g) => {
          const grupoAtivo = g.id === 'calculadora' && naCalculadora;
          const grupoAtivoGerador = g.id === 'gerador' && noGerador;
          return (
            <div key={g.id}>
              <button type="button" className={'nav-item nav-group' + (grupoAtivo || grupoAtivoGerador ? ' active' : '')} onClick={() => toggleGrupo(g.id)}>
                <span className="ic"><Icon name={g.icon} /></span>
                <span className="nav-text">{g.label}</span>
                <span className={'nav-caret' + (aberto === g.id ? ' open' : '')}>▾</span>
              </button>
              {g.id === 'calculadora' && aberto === 'calculadora' && !collapsed && (
                <div className="nav-sub">
                  <div className={view === 'calculadora' ? 'active' : ''} onClick={() => onNavigate('calculadora')}>Nova calculadora</div>
                  <div className={view === 'historico' ? 'active' : ''} onClick={() => onNavigate('historico')}>
                    <span>Histórico</span> <span className="nav-badge">{histCount}</span>
                  </div>
                  <div className={view === 'preferencias' ? 'active' : ''} onClick={() => onNavigate('preferencias')}>Preferências</div>
                </div>
              )}
              {g.id === 'gerador' && aberto === 'gerador' && !collapsed && (
                <div className="nav-sub">
                  <div className={view === 'gerador-criar' ? 'active' : ''} onClick={() => onNavigate('gerador-criar')}>Criar Anúncio</div>
                  <div onClick={() => alert('Em breve: histórico de anúncios gerados.')}>Meus Anúncios</div>
                </div>
              )}
              {g.id === 'buscador' && aberto === 'buscador' && !collapsed && (
                <div className="nav-sub"><div className="nav-sub-empty">Em breve por aqui</div></div>
              )}
            </div>
          );
        })}
        <NavItem icon="otimizador" label="Otimizador" collapsed={collapsed} muted badge="EM BREVE" />
      </div>

      <div className="nav-label">Sistema</div>
      <NavItem icon="config" label="Configurações" active={view === 'configuracoes'} collapsed={collapsed} onClick={() => onNavigate('configuracoes')} />
      <NavItem icon="integracoes" label="Integrações" collapsed={collapsed} />

      <div className="sidebar-footer">
        <div className="avatar">{USUARIO.iniciais}</div>
        <div className="sidebar-user">
          <div className="name">{USUARIO.nome}</div>
          <div className="plan">{USUARIO.plano}</div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, collapsed, onClick, muted, badge }: {
  icon: IconName;
  label: string;
  active?: boolean;
  collapsed: boolean;
  onClick?: () => void;
  muted?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={'nav-item' + (active ? ' active' : '') + (muted ? ' muted' : '')}
      onClick={onClick}
      title={collapsed ? label : undefined}
    >
      <span className="ic"><Icon name={icon} /></span>
      <span className="nav-text">{label}</span>
      {badge && <span className="nav-soon">{badge}</span>}
    </div>
  );
}
