// Ícones de linha usados na sidebar e na topbar. SVG inline pra não adicionar
// dependência e pra herdarem a cor do contexto (currentColor).

import type { CSSProperties, ReactElement } from 'react';

export type IconName =
  | 'dashboard' | 'pedidos' | 'produtos'
  | 'gerador' | 'calculadora' | 'buscador' | 'otimizador'
  | 'config' | 'integracoes'
  | 'sino' | 'creditos' | 'chevron' | 'sync'
  | 'eye' | 'dots' | 'search' | 'close' | 'upload'
  | 'folder' | 'tag' | 'plus' | 'clock' | 'lock' | 'flag' | 'check' | 'bolt' | 'crown' | 'volume'
  | 'copy' | 'message' | 'thumbUp' | 'home' | 'leaf' | 'alert' | 'box'
  | 'instagram' | 'facebook' | 'tiktok' | 'pinterest' | 'play';

const PATHS: Record<IconName, ReactElement> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  pedidos: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
    </>
  ),
  produtos: (
    <>
      <path d="M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7Z" />
      <path d="m3 8.5 9 5.5 9-5.5" />
    </>
  ),
  gerador: (
    <>
      <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.8L12 18l-1.7-5.5L4.8 10.7 10.3 9 12 3.5Z" />
      <path d="M18.5 16.5 19.2 19l2.3.8-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.8.7-2.5Z" />
    </>
  ),
  calculadora: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 12h3M8 16h3M15 12h1M15 16h1" />
    </>
  ),
  buscador: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  otimizador: (
    <>
      <path d="M20.6 12.6 12.6 20.6a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1-.6-1.5l.3-5.6a2 2 0 0 1 1.9-1.9l5.6-.3a2 2 0 0 1 1.5.6l6.4 6.4a2 2 0 0 1 0 2.7Z" />
      <circle cx="8.5" cy="8.5" r="1.2" />
    </>
  ),
  config: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H2a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V2a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </>
  ),
  integracoes: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <path d="M10 6.5h2.5a1.5 1.5 0 0 1 1.5 1.5V14" />
    </>
  ),
  sino: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7Z" />
      <path d="M13.7 20a2 2 0 0 1-3.4 0" />
    </>
  ),
  creditos: (
    <>
      <circle cx="9" cy="9" r="6" />
      <path d="M14.2 4.3a6 6 0 1 1 0 13.4" />
    </>
  ),
  chevron: <path d="m15 18-6-6 6-6" />,
  eye: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  dots: (
    <>
      <circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  upload: (
    <>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </>
  ),
  sync: (
    <>
      <path d="M20 11a8 8 0 0 0-14-4.5L3 9" />
      <path d="M4 13a8 8 0 0 0 14 4.5L21 15" />
      <path d="M3 4v5h5M21 20v-5h-5" />
    </>
  ),
  folder: (
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
  ),
  tag: (
    <>
      <path d="M12.6 3H7a2 2 0 0 0-2 2v5.6a2 2 0 0 0 .6 1.4l8.4 8.4a2 2 0 0 0 2.8 0l5.2-5.2a2 2 0 0 0 0-2.8L13.6 3.6a2 2 0 0 0-1-.6Z" />
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
    </>
  ),
  flag: (
    <>
      <path d="M5 3v18" />
      <path d="M5 4.5c2.5-1.5 5-1.5 7.5 0s5 1.5 7.5 0v9c-2.5 1.5-5 1.5-7.5 0s-5-1.5-7.5 0Z" />
    </>
  ),
  check: <path d="M4 12.5 9.5 18 20 6" />,
  bolt: <path d="M12.5 3 5 13.5h5.5L11 21l7.5-10.5H13L12.5 3Z" />,
  crown: (
    <>
      <path d="m3 8 3.5 3L12 5l5.5 6L21 8l-1.6 9.5a1 1 0 0 1-1 .8H5.6a1 1 0 0 1-1-.8L3 8Z" />
      <path d="M5.6 18.3h12.8" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M17 8.5a5 5 0 0 1 0 7" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </>
  ),
  message: (
    <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" fill="currentColor" stroke="none" />
  ),
  thumbUp: (
    <>
      <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Z" />
      <path d="M7 11l4.5-8a2 2 0 0 1 2.7 1.8V9h4.4a2 2 0 0 1 2 2.4l-1.6 7A2 2 0 0 1 17 20H9a2 2 0 0 1-2-2v-7Z" />
    </>
  ),
  home: (
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c8.5 0 14-5.5 14-14 0 0-13-2-14 8-.4 3 1 5 1 5" />
      <path d="M5 19c0-4 2-7 6-9" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 2.5 20h19L12 3.5Z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17.3" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  box: (
    <>
      <path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z" />
      <path d="M3 8.5V16l9 4.5 9-4.5V8.5" />
      <path d="M12 13v7.5" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path d="M14.5 21v-7.2h2.4l.4-2.8h-2.8v-1.8c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.2H9.5v2.8h2.3V21" />
  ),
  tiktok: (
    <path d="M13 3v11.5a2.8 2.8 0 1 1-2-2.7M13 3c.3 2 1.8 3.6 4 4v2.2c-1.5 0-2.9-.4-4-1.2" />
  ),
  pinterest: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 19c.6-2.4 1.3-5.3 1.9-7.7a2.4 2.4 0 0 1 4.7.7c0 2-1.2 3.7-2.9 3.7-.8 0-1.4-.4-1.7-1" />
      <path d="M11.4 11.3a2.4 2.4 0 0 0 .1 2.7" />
    </>
  ),
  play: <path d="M7 4.8v14.4a1 1 0 0 0 1.5.87l12-7.2a1 1 0 0 0 0-1.74l-12-7.2A1 1 0 0 0 7 4.8Z" fill="currentColor" stroke="none" />,
};

interface Props {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export default function Icon({ name, size = 18, className, style }: Props) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

/** Marca do STLSeller (swoosh) usada no topo da sidebar. */
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 4.5c-4.6-.6-8.4.7-11.3 3.2C6.4 9.7 5.2 12 5 14.6l3-2.6c2.3-2 5.2-3.1 8.3-3.1-2.7 1-5 2.5-6.9 4.4-2.2 2.2-3.7 4.8-4.4 7.2"
        stroke="var(--primary)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
