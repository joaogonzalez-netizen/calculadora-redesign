import { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { IDIOMAS_DISPONIVEIS } from '../lib/i18n';
import Icon from './Icon';

export default function IdiomaSwitcher() {
  const { idioma, setIdioma, t } = useI18n();
  const [aberto, setAberto] = useState(false);
  const atual = IDIOMAS_DISPONIVEIS.find((i) => i.id === idioma) ?? IDIOMAS_DISPONIVEIS[0];

  return (
    <div className="popover-wrap">
      <button type="button" className="pill-btn idioma-switcher-btn" onClick={() => setAberto((a) => !a)} title={t('idioma.selecionarIdioma')}>
        <span>{atual.bandeira}</span>
        <span>{idioma.toUpperCase()}</span>
        <Icon name="chevron" size={11} style={{ transform: 'rotate(-90deg)' }} />
      </button>
      {aberto && (
        <>
          <div className="popover-scrim" onClick={() => setAberto(false)} />
          <div className="popover-list idioma-switcher-list">
            {IDIOMAS_DISPONIVEIS.map((i) => (
              <div
                key={i.id}
                className={'popover-item' + (i.id === idioma ? ' active' : '')}
                onClick={() => { setIdioma(i.id); setAberto(false); }}
              >
                <span style={{ marginRight: 8 }}>{i.bandeira}</span>{i.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
