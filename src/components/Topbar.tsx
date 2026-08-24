import type { View } from '../App';
import { CREDITOS } from '../lib/dashboardMock';
import Icon from './Icon';

const TITLES: Record<View, string> = {
  dashboard: 'Painel',
  produtos: 'Produtos',
  calculadora: 'Calculadora de preços',
  historico: 'Histórico',
  preferencias: 'Preferências',
};

export default function Topbar({ view }: { view: View }) {
  return (
    <div className="topbar">
      <h2>{TITLES[view]}</h2>
      <div className="top-actions">
        <div className="credits-pill">
          <Icon name="creditos" size={15} />
          <b>{CREDITOS}</b> <span>créditos</span>
        </div>
        <button type="button" className="bell" aria-label="Notificações">
          <Icon name="sino" size={17} />
          <span className="bell-dot" />
        </button>
      </div>
    </div>
  );
}
