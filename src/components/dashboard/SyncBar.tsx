import { MARKETPLACES, ULTIMA_SINCRONIZACAO } from '../../lib/dashboardMock';
import Icon from '../Icon';

export default function SyncBar() {
  return (
    <div className="sync-bar">
      <span className="sync-dot" />
      <div className="mp-stack">
        {MARKETPLACES.map((m) => (
          <span key={m.id} className="mp-avatar" style={{ background: m.bg, color: m.fg }}>{m.sigla}</span>
        ))}
      </div>
      <div className="sync-text">
        <b>{MARKETPLACES.length} marketplaces conectados</b>
        <span> · {ULTIMA_SINCRONIZACAO}</span>
      </div>
      <button type="button" className="sync-btn">
        <Icon name="sync" size={15} /> Sincronizar agora
      </button>
    </div>
  );
}
