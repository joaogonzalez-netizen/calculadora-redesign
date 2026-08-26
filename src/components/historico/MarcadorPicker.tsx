import { useState } from 'react';
import type { Marcador } from '../../lib/cluster';
import Icon from '../Icon';

interface Props {
  marcadores: Marcador[];
  selecionados: string[];
  onToggle: (id: string) => void;
}

export default function MarcadorPicker({ marcadores, selecionados, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const atuais = marcadores.filter((m) => selecionados.includes(m.id));

  return (
    <div className="popover-wrap marcador-picker">
      <div className="marcador-picker-chips" onClick={() => setOpen((o) => !o)}>
        {atuais.map((m) => (
          <span key={m.id} className="marcador-chip-mini" style={{ background: m.cor }}>{m.nome}</span>
        ))}
        <button type="button" className="marcador-add-btn"><Icon name="plus" size={12} /></button>
      </div>
      {open && (
        <>
          <div className="popover-scrim" onClick={() => setOpen(false)} />
          <div className="popover-list">
            {marcadores.map((m) => (
              <div key={m.id} className={'popover-item' + (selecionados.includes(m.id) ? ' active' : '')} onClick={() => onToggle(m.id)}>
                <span className="pasta-dot" style={{ background: m.cor }} /> {m.nome}
              </div>
            ))}
            {!marcadores.length && <div className="popover-item" style={{ color: 'var(--text-3)', cursor: 'default' }}>Crie um marcador acima</div>}
          </div>
        </>
      )}
    </div>
  );
}
