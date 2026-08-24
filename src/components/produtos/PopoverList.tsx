import { useState } from 'react';

interface Props {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

/** Botão que abre uma lista simples — usado pra Período e Ordem, no lugar do
 * calendário de duas colunas do Figma (peso de implementação alto pra um mock). */
export default function PopoverList({ label, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="popover-wrap">
      <button type="button" className="ctl-btn" onClick={() => setOpen((o) => !o)}>
        {label ? <span className="popover-label">{label}:</span> : null} {value} <span className="ctl-caret">▾</span>
      </button>
      {open && (
        <>
          <div className="popover-scrim" onClick={() => setOpen(false)} />
          <div className="popover-list">
            {options.map((o) => (
              <div key={o} className={'popover-item' + (o === value ? ' active' : '')} onClick={() => { onChange(o); setOpen(false); }}>{o}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
