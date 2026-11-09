import type { Idioma } from './i18n';

// Links do header para o ecossistema STLFLIX, por idioma (pt = pt-BR, en = raiz).
export type EcoLinkId = 'stlflix' | 'stlai' | 'academy' | 'cursos';

const LINKS: Record<EcoLinkId, Record<Idioma, string>> = {
  stlflix: {
    pt: 'https://platform.stlflix.com/pt-BR',
    es: 'https://platform.stlflix.com/es',
    en: 'https://platform.stlflix.com/',
  },
  stlai: {
    pt: 'https://ai.stlflix.com/pt-BR',
    es: 'https://ai.stlflix.com/es',
    en: 'https://ai.stlflix.com/',
  },
  academy: {
    pt: 'https://platform.stlflix.com/pt-BR/stlacademy',
    es: 'https://platform.stlflix.com/es/stlacademy',
    en: 'https://platform.stlflix.com/stlacademy',
  },
  cursos: {
    pt: 'https://platform.stlflix.com/pt-BR/stlacademy/live',
    es: 'https://platform.stlflix.com/es/stlacademy/live',
    en: 'https://platform.stlflix.com/stlacademy/live',
  },
};

export function linkEcossistema(id: EcoLinkId, idioma: Idioma): string {
  return LINKS[id][idioma];
}
