import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Moeda } from '../types';
import { useLibrarias } from './LibrariasContext';
import { useI18n } from './I18nContext';
import { moedaDasPrefs } from '../lib/versoes';

interface Ctx {
  moeda: Moeda;
  setMoeda: (m: Moeda) => void;
}

const MoedaCtx = createContext<Ctx | null>(null);

export function MoedaProvider({ children }: { children: ReactNode }) {
  const { prefs } = useLibrarias();
  const { idioma } = useI18n();
  const moedaPadrao = moedaDasPrefs(prefs, idioma);
  const [moeda, setMoeda] = useState<Moeda>(moedaPadrao);
  // Trocar de idioma (AR$ no ES) ou salvar outra moeda nas Preferências volta o seletor pro padrão.
  useEffect(() => setMoeda(moedaPadrao), [moedaPadrao]);
  return <MoedaCtx.Provider value={{ moeda, setMoeda }}>{children}</MoedaCtx.Provider>;
}

export function useMoeda() {
  const ctx = useContext(MoedaCtx);
  if (!ctx) throw new Error('useMoeda deve ser usado dentro de MoedaProvider');
  return ctx;
}
