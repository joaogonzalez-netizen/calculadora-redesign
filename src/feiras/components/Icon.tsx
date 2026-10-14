import type { ReactElement } from 'react';

export type IconName =
  | 'painel' | 'funil' | 'clientes' | 'pedidos' | 'produtos' | 'feira' | 'plus' | 'close' | 'search' | 'whatsapp'
  | 'phone' | 'check' | 'clock' | 'alert' | 'trash' | 'chevron' | 'logout' | 'pin' | 'flame' | 'pencil' | 'arrow' | 'settings';

const P: Record<IconName, ReactElement> = {
  painel: (<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>),
  funil: (<><rect x="3" y="4" width="5" height="16" rx="1.5" /><rect x="10" y="4" width="5" height="10" rx="1.5" /><rect x="17" y="4" width="4" height="6" rx="1.5" /></>),
  clientes: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.500 20c.5-3.600 3.100-5.500 6.500-5.500s6 1.900 6.500 5.500" /><path d="M16 4.800a3.500 3.500 0 0 1 0 6.400M18.500 14.800c1.600.9 2.700 2.600 3 5.200" /></>),
  pedidos: (<><path d="M6 3h12l2 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7l2-4Z" /><path d="M4 7h16M9 11h6" /></>),
  produtos: (<><path d="M21 8.500 12 3 3 8.500v7L12 21l9-5.500v-7Z" /><path d="m3 8.500 9 5.500 9-5.500M12 14v7" /></>),
  feira: (<><path d="M3 9.500 5 4h14l2 5.500" /><path d="M3 9.500c0 1.400 1.100 2.500 2.500 2.500S8 10.900 8 9.500c0 1.400 1.100 2.500 2.500 2.500h3c1.400 0 2.500-1.100 2.500-2.500 0 1.400 1.100 2.500 2.500 2.500S21 10.900 21 9.500" /><path d="M5 12v8h14v-8M10 20v-4h4v4" /></>),
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  search: (<><circle cx="11" cy="11" r="6.500" /><path d="m20 20-4.200-4.200" /></>),
  whatsapp: (<><path d="M4 20l1.300-4.200A8 8 0 1 1 8.300 18.800L4 20Z" /><path d="M9 9.500c.3 2 2.200 4 4.500 4.700l1.200-1.200-1.800-1-.8.600c-.8-.4-1.500-1.100-1.900-1.900l.6-.8-1-1.800L9 9.500Z" /></>),
  phone: <path d="M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />,
  check: <path d="m5 12.500 4.500 4.500L19 7.500" />,
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  alert: (<><path d="M12 3.500 2.500 20h19L12 3.500Z" /><path d="M12 10v4.500M12 17.500v.01" /></>),
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  logout: <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h10" />,
  pin: (<><path d="M12 21s7-6.100 7-11.500a7 7 0 0 0-14 0C5 14.900 12 21 12 21Z" /><circle cx="12" cy="9.500" r="2.500" /></>),
  flame: <path d="M12 3c1 3.500 5 5.500 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .2 1.500 1 2.200 2 2.500C10.500 8 11 5.500 12 3Z" />,
  pencil: <path d="M4 20h4L19 9a2.800 2.800 0 0 0-4-4L4 16v4Z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M5.600 18.400l1.800-1.800M16.600 7.400l1.800-1.800" /></>),
};

export default function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  );
}

export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 4.500c-4.600-.6-8.400.7-11.300 3.200C6.400 9.700 5.200 12 5 14.600l3-2.600c2.300-2 5.200-3.100 8.300-3.100-2.700 1-5 2.500-6.900 4.400-2.200 2.200-3.700 4.800-4.400 7.200" stroke="var(--primary)" strokeWidth="2.100" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
