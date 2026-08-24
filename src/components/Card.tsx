import { useState, type ReactNode } from 'react';

interface Props {
  icon: string;
  title: string;
  children: ReactNode;
  defaultClosed?: boolean;
}

export default function Card({ icon, title, children, defaultClosed }: Props) {
  const [closed, setClosed] = useState(!!defaultClosed);
  return (
    <div className={'card' + (closed ? ' closed' : '')}>
      <div className="card-head" onClick={() => setClosed((c) => !c)}>
        <div className="htitle">
          <div className="ic-badge">{icon}</div>
          <h3>{title}</h3>
        </div>
        <div className="chevron">{closed ? '▸' : '▾'}</div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}
