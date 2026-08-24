import { createContext, useContext, type ReactNode } from 'react';
import type { CustoExtra, Filamento, Impressora, Preferencias } from '../types';
import {
  DEFAULT_CUSTOS_PADRAO, DEFAULT_FILAMENTOS, DEFAULT_IMPRESSORAS, DEFAULT_PREFERENCIAS,
  PREF_CUSTO_KEY, PREF_FIL_KEY, PREF_IMP_KEY, PREF_KEY,
  usePersistedState,
} from '../lib/storage';

// Bibliotecas reutilizáveis (PRD seção 5) — impressoras, filamentos e custos extras.
// Fonte de dado única: editar em Preferências reflete na calculadora, e vice-versa,
// porque ambos leem/escrevem o mesmo estado global aqui.
interface Ctx {
  impressoras: Impressora[];
  setImpressoras: (v: Impressora[] | ((p: Impressora[]) => Impressora[])) => void;
  filamentos: Filamento[];
  setFilamentos: (v: Filamento[] | ((p: Filamento[]) => Filamento[])) => void;
  custosPadrao: CustoExtra[];
  setCustosPadrao: (v: CustoExtra[] | ((p: CustoExtra[]) => CustoExtra[])) => void;
  prefs: Preferencias;
  setPrefs: (v: Preferencias | ((p: Preferencias) => Preferencias)) => void;
}

const LibrariasCtx = createContext<Ctx | null>(null);

export function LibrariasProvider({ children }: { children: ReactNode }) {
  const [impressoras, setImpressoras] = usePersistedState<Impressora[]>(PREF_IMP_KEY, DEFAULT_IMPRESSORAS);
  const [filamentos, setFilamentos] = usePersistedState<Filamento[]>(PREF_FIL_KEY, DEFAULT_FILAMENTOS);
  const [custosPadrao, setCustosPadrao] = usePersistedState<CustoExtra[]>(PREF_CUSTO_KEY, DEFAULT_CUSTOS_PADRAO);
  const [prefs, setPrefs] = usePersistedState<Preferencias>(PREF_KEY, DEFAULT_PREFERENCIAS);

  const value: Ctx = { impressoras, setImpressoras, filamentos, setFilamentos, custosPadrao, setCustosPadrao, prefs, setPrefs };
  return <LibrariasCtx.Provider value={value}>{children}</LibrariasCtx.Provider>;
}

export function useLibrarias() {
  const ctx = useContext(LibrariasCtx);
  if (!ctx) throw new Error('useLibrarias deve ser usado dentro de LibrariasProvider');
  return ctx;
}
