import { MARKETPLACES, ULTIMA_SINCRONIZACAO } from '../../lib/dashboardMock';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

export default function SyncBar() {
  const { t } = useI18n();
  return (
    <div className="sync-bar">
      <span className="sync-dot" />
      <div className="mp-stack">
        {MARKETPLACES.map((m) => (
          <span key={m.id} className="mp-avatar" style={{ background: m.bg, color: m.fg }}>{m.sigla}</span>
        ))}
      </div>
      <div className="sync-text">
        <b>{t('dashboard.marketplacesConectados').replace('{n}', String(MARKETPLACES.length))}</b>
        <span> · {ULTIMA_SINCRONIZACAO}</span>
      </div>
      <button type="button" className="sync-btn">
        <Icon name="sync" size={15} /> {t('dashboard.sincronizarAgora')}
      </button>
    </div>
  );
}
