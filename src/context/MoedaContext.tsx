import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Moeda } from '../types';
import { useLibrarias } from './LibrariasContext';

interface Ctx {
  moeda: Moeda;
  setMoeda: (m: Moeda) => void;
}

const MoedaCtx = createContext<Ctx | null>(null);

export function MoedaProvider({ children }: { children: ReactNode }) {
  const { prefs } = useLibrarias();
  const [moeda, setMoeda] = useState<Moeda>(prefs.moeda || 'BRL');
  return <MoedaCtx.Provider value={{ moeda, setMoeda }}>{children}</MoedaCtx.Provider>;
}

export function useMoeda() {
  const ctx = useContext(MoedaCtx);
  if (!ctx) throw new Error('useMoeda deve ser usado dentro de MoedaProvider');
  return ctx;
}
