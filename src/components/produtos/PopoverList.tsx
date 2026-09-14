import { useState } from 'react';

interface Props {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  /** Traduz um valor da lista (que continua sendo a chave real usada nos filtros/comparações)
   * pro texto exibido — usado quando `options` guarda valores vindos de mocks/lógica que não
   * podem mudar com o idioma, mas o rótulo mostrado precisa. */
  getLabel?: (v: string) => string;
}

/** Botão que abre uma lista simples — usado pra Período e Ordem, no lugar do
 * calendário de duas colunas do Figma (peso de implementação alto pra um mock). */
export default function PopoverList({ label, options, value, onChange, getLabel }: Props) {
  const [open, setOpen] = useState(false);
  const exibirValor = getLabel ? getLabel(value) : value;
  return (
    <div className="popover-wrap">
      <button type="button" className="ctl-btn" onClick={() => setOpen((o) => !o)}>
        {label ? <span className="popover-label">{label}:</span> : null} {exibirValor} <span className="ctl-caret">▾</span>
      </button>
      {open && (
        <>
          <div className="popover-scrim" onClick={() => setOpen(false)} />
          <div className="popover-list">
            {options.map((o) => (
              <div key={o} className={'popover-item' + (o === value ? ' active' : '')} onClick={() => { onChange(o); setOpen(false); }}>{getLabel ? getLabel(o) : o}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
