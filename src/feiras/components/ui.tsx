import { useEffect, type ReactNode } from 'react';
import Icon from './Icon';
import { useFeirasT } from '../lib/i18n';

export function Drawer({ aberto, titulo, subtitulo, onClose, children, rodape, largo }: {
  aberto: boolean; titulo: string; subtitulo?: string; onClose: () => void; children: ReactNode; rodape?: ReactNode; largo?: boolean;
}) {
  const { t } = useFeirasT();
  useEffect(() => {
    if (!aberto) return;
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = prev; };
  }, [aberto, onClose]);
  if (!aberto) return null;
  return (
    <div className="fe-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={'fe-drawer' + (largo ? ' fe-wide' : '')} role="dialog" aria-modal="true" aria-label={titulo}>
        <header className="fe-drawer-head">
          <div>
            <h3>{titulo}</h3>
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          <button type="button" className="fe-icon-btn" onClick={onClose} aria-label={t('feiras.comum.fechar')}><Icon name="close" /></button>
        </header>
        <div className="fe-drawer-body">{children}</div>
        {rodape && <footer className="fe-drawer-foot">{rodape}</footer>}
      </aside>
    </div>
  );
}

export function Field({ label, hint, children, className = '' }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={'fe-field ' + className}>
      <span className="fe-lbl">{label}</span>
      {children}
      {hint && <span className="fe-hint">{hint}</span>}
    </label>
  );
}

/** Bloco do drawer com título e borda própria: separa visualmente cada grupo de ações. */
export function Secao({ titulo, desc, acao, children }: { titulo: string; desc?: string; acao?: ReactNode; children: ReactNode }) {
  return (
    <section className="fe-secao">
      <header className="fe-secao-head">
        <div><h4>{titulo}</h4>{desc && <p>{desc}</p>}</div>
        {acao}
      </header>
      <div className="fe-secao-corpo">{children}</div>
    </section>
  );
}

/** Campos opcionais recolhidos, pra o formulário abrir só com o essencial. */
export function Mais({ rotulo, aberto, children }: { rotulo: string; aberto?: boolean; children: ReactNode }) {
  return (
    <details className="fe-mais" open={aberto}>
      <summary>{rotulo}</summary>
      <div className="fe-mais-corpo">{children}</div>
    </details>
  );
}

export function Seg<T extends string>({ valor, opcoes, onChange }: { valor: T; opcoes: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="fe-seg" role="radiogroup">
      {opcoes.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={valor === o.id} className={valor === o.id ? 'fe-on' : ''} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Vazio({ titulo, texto, acao }: { titulo: string; texto: string; acao?: ReactNode }) {
  return (
    <div className="fe-empty">
      <strong>{titulo}</strong>
      <p>{texto}</p>
      {acao}
    </div>
  );
}

export function Pagina({ titulo, sub, acoes, children }: { titulo: string; sub?: string; acoes?: ReactNode; children: ReactNode }) {
  return (
    <div className="fe-page">
      <div className="fe-page-head">
        <div>
          <h1>{titulo}</h1>
          {sub && <p>{sub}</p>}
        </div>
        {acoes && <div className="fe-page-actions">{acoes}</div>}
      </div>
      {children}
    </div>
  );
}
