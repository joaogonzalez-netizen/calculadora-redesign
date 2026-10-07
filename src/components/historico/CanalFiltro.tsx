import { useState } from 'react';
import type { Canal } from '../../types';
import { CANAIS, CANAL_LABEL_KEYS } from '../../lib/canal';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

interface Props {
  contagem: Record<Canal, number>;
  selecionados: Set<Canal>;
  onAlternar: (c: Canal) => void;
  onLimpar: () => void;
}

// Filtro do Histórico por canal de venda, em dropdown — mesmo padrão do
// MarcadorFiltro. Cada cálculo tem só um canal, então combinar é sempre
// "qualquer um dos marcados" (união), sem precisar do modo Todos.
export default function CanalFiltro({ contagem, selecionados, onAlternar, onLimpar }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const temFiltro = selecionados.size > 0;

  return (
    <div className="popover-wrap">
      <button type="button" className={'ctl-btn' + (temFiltro ? ' ativo' : '')} onClick={() => setOpen((o) => !o)}>
        <Icon name="box" size={13} /> {t('calc.thCanal')}
        {temFiltro && <span className="marcador-filtro-badge">{selecionados.size}</span>}
        <span className="ctl-caret">▾</span>
      </button>

      {open && (
        <>
          <div className="popover-scrim" onClick={() => setOpen(false)} />
          <div className="popover-list marcador-filtro-panel">
            {CANAIS.map((c) => {
              const ativo = selecionados.has(c);
              return (
                <label key={c} className={'popover-item marcador-filtro-item' + (ativo ? ' active' : '')}>
                  <input type="checkbox" checked={ativo} onChange={() => onAlternar(c)} />
                  <span className="marcador-filtro-item-nome">{t(CANAL_LABEL_KEYS[c])}</span>
                  <span className="marcador-filtro-count">{contagem[c] ?? 0}</span>
                </label>
              );
            })}
            {temFiltro && (
              <button type="button" className="marcador-filtro-limpar" onClick={() => { onLimpar(); setOpen(false); }}>
                {t('calc.limparFiltro')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
