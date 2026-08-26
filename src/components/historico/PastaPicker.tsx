import { useState } from 'react';
import type { Pasta } from '../../lib/cluster';
import Icon from '../Icon';

interface Props {
  pastas: Pasta[];
  pastaId: string | undefined;
  onEscolher: (pastaId: string | undefined) => void;
}

export default function PastaPicker({ pastas, pastaId, onEscolher }: Props) {
  const [open, setOpen] = useState(false);
  const atual = pastas.find((p) => p.id === pastaId);

  return (
    <div className="popover-wrap">
      <button type="button" className="pasta-picker-btn" onClick={() => setOpen((o) => !o)}>
        {atual
          ? <><span className="pasta-dot" style={{ background: atual.cor }} />{atual.nome}</>
          : <span className="pasta-picker-empty"><Icon name="folder" size={13} /> Sem pasta</span>}
      </button>
      {open && (
        <>
          <div className="popover-scrim" onClick={() => setOpen(false)} />
          <div className="popover-list">
            <div className="popover-item" onClick={() => { onEscolher(undefined); setOpen(false); }}>Sem pasta</div>
            {pastas.map((p) => (
              <div key={p.id} className={'popover-item' + (p.id === pastaId ? ' active' : '')} onClick={() => { onEscolher(p.id); setOpen(false); }}>
                <span className="pasta-dot" style={{ background: p.cor }} /> {p.nome}
              </div>
            ))}
            {!pastas.length && <div className="popover-item" style={{ color: 'var(--text-3)', cursor: 'default' }}>Crie uma pasta na coluna à esquerda</div>}
          </div>
        </>
      )}
    </div>
  );
}
