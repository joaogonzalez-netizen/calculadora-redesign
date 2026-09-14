import { createContext, useContext, useState, type ReactNode } from 'react';
import { IDIOMA_PADRAO, IDIOMA_STORAGE_KEY, traduzir, type Idioma } from '../lib/i18n';

interface Ctx {
  idioma: Idioma;
  setIdioma: (i: Idioma) => void;
  t: (chave: string) => string;
}

const I18nCtx = createContext<Ctx | null>(null);

function lerIdiomaSalvo(): Idioma {
  const salvo = localStorage.getItem(IDIOMA_STORAGE_KEY);
  return salvo === 'pt' || salvo === 'en' || salvo === 'es' ? salvo : IDIOMA_PADRAO;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdiomaState] = useState<Idioma>(lerIdiomaSalvo);

  function setIdioma(i: Idioma) {
    setIdiomaState(i);
    localStorage.setItem(IDIOMA_STORAGE_KEY, i);
  }

  function t(chave: string): string {
    return traduzir(idioma, chave);
  }

  return <I18nCtx.Provider value={{ idioma, setIdioma, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error('useI18n deve ser usado dentro de I18nProvider');
  return ctx;
}
