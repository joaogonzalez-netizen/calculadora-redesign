// Mock das categorias do Finder por marketplace (mockup de UX, sem backend).
// Cada marketplace tem a sua lista nativa (como o coletor grava hoje) e há uma
// taxonomia própria do Finder (CATEGORIAS_FINDER) que unifica as três.

import type { ProdutoBusca } from './buscadorMock';
import { CATEGORIAS_FINDER, sugerirCategorias } from './finderReports';

export type MarketplaceBusca = ProdutoBusca['marketplace'];
export const MARKETPLACES_BUSCA: MarketplaceBusca[] = ['Mercado Livre', 'Shopee', 'Etsy'];
export const SEM_CATEGORIA = '(sem categoria)';

type CategoriaFinder = (typeof CATEGORIAS_FINDER)[number];

// Macro-categorias nativas (ilustrativas): várias categorias do Finder caem na
// mesma macro do marketplace, e "Outros" fica sem categoria, como acontece hoje.
const NATIVAS: Record<MarketplaceBusca, Record<CategoriaFinder, string>> = {
  'Mercado Livre': {
    Decoração: 'Casa, Móveis e Decoração',
    'Vasos e plantas': 'Casa, Móveis e Decoração',
    Organizadores: 'Casa, Móveis e Decoração',
    Escritório: 'Informática',
    Luminárias: 'Casa, Móveis e Decoração',
    Suportes: 'Celulares e Telefones',
    'Joias e acessórios': 'Joias e Relógios',
    'Brinquedos e jogos': 'Brinquedos e Hobbies',
    Chaveiros: 'Festas e Lembrancinhas',
    Outros: SEM_CATEGORIA,
  },
  Shopee: {
    Decoração: 'Casa e Decoração',
    'Vasos e plantas': 'Jardinagem',
    Organizadores: 'Organização Doméstica',
    Escritório: 'Papelaria e Escritório',
    Luminárias: 'Casa e Decoração',
    Suportes: 'Acessórios de Celular',
    'Joias e acessórios': 'Joias e Bijuterias',
    'Brinquedos e jogos': 'Brinquedos e Hobbies',
    Chaveiros: 'Acessórios de Moda',
    Outros: SEM_CATEGORIA,
  },
  Etsy: {
    Decoração: 'Home & Living',
    'Vasos e plantas': 'Home & Living',
    Organizadores: 'Home & Living',
    Escritório: 'Electronics & Accessories',
    Luminárias: 'Home & Living',
    Suportes: 'Electronics & Accessories',
    'Joias e acessórios': 'Jewelry',
    'Brinquedos e jogos': 'Toys & Games',
    Chaveiros: 'Accessories',
    Outros: SEM_CATEGORIA,
  },
};

/** Categoria do Finder (taxonomia própria) do item. */
export function categoriaFinder(p: ProdutoBusca): CategoriaFinder {
  return sugerirCategorias(p.nome)[0] as CategoriaFinder;
}

/** Categoria nativa do marketplace do item. */
export function categoriaNativa(p: ProdutoBusca): string {
  return NATIVAS[p.marketplace][categoriaFinder(p)];
}

/** Contagem por categoria, da maior pra menor ("sem categoria" sempre por último). */
export function contarCategorias(lista: ProdutoBusca[], extrair: (p: ProdutoBusca) => string): { nome: string; total: number }[] {
  const mapa = new Map<string, number>();
  for (const p of lista) mapa.set(extrair(p), (mapa.get(extrair(p)) ?? 0) + 1);
  return [...mapa.entries()]
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => (a.nome === SEM_CATEGORIA ? 1 : b.nome === SEM_CATEGORIA ? -1 : b.total - a.total));
}
