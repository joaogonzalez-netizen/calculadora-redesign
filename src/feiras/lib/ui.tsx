import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export type View = 'painel' | 'negocios' | 'clientes' | 'pedidos' | 'catalogo' | 'eventos' | 'prospeccao';
export type DrawerTipo = 'lead' | 'negocio' | 'cliente' | 'pedido' | 'produto' | 'produto-calc';
export interface DrawerState { tipo: DrawerTipo; id: string | null; ctx?: string | null }

interface Toast { msg: string; acao?: { label: string; fn: () => void } }

interface UiCtx {
  view: View;
  ir: (v: View) => void;
  drawer: DrawerState | null;
  abrir: (tipo: DrawerTipo, id?: string | null, ctx?: string | null) => void;
  fechar: () => void;
  toast: Toast | null;
  avisar: (msg: string, acao?: Toast['acao']) => void;
  irParaCalculadora: () => void;
}

const Ctx = createContext<UiCtx | null>(null);

/** A navegação pertence ao App do STLSeller: aqui só repassamos view e onNavigate. */
export function UiProvider({ view, onNavigate, onIrParaCalculadora, children }: { view: View; onNavigate: (v: View) => void; onIrParaCalculadora: () => void; children: ReactNode }) {
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const ir = useCallback((v: View) => { setDrawer(null); onNavigate(v); window.scrollTo(0, 0); }, [onNavigate]);
  const abrir = useCallback((tipo: DrawerTipo, id: string | null = null, ctx: string | null = null) => setDrawer({ tipo, id, ctx }), []);
  const fechar = useCallback(() => setDrawer(null), []);
  const avisar = useCallback((msg: string, acao?: Toast['acao']) => {
    setToast({ msg, acao });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), acao ? 6000 : 2800);
  }, []);

  const value = useMemo(() => ({ view, ir, drawer, abrir, fechar, toast, avisar, irParaCalculadora: onIrParaCalculadora }), [view, ir, drawer, abrir, fechar, toast, avisar, onIrParaCalculadora]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUi() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useUi fora do UiProvider');
  return c;
}
