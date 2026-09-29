// Três "versões" do app, uma por idioma — cada mercado-alvo vê só os menus e
// canais de venda relevantes pra ele. Fonte única de verdade: trocar aqui
// reflete em Sidebar (menus PRINCIPAL), Gerador de anúncios (marketplaces
// do passo 2) e Calculadora (chips de Canal de venda).
import type { Idioma } from './i18n';
import type { Canal, Moeda, Preferencias } from '../types';

// PRINCIPAL (Painel/Pedidos/Produtos) existe em PT e ES — a versão EN ainda
// não tem dado de vendas/pedidos pro mercado dela.
export const MOSTRAR_MENUS_PRINCIPAIS: Record<Idioma, boolean> = {
  pt: true,
  en: false,
  es: true,
};

// Configurações hoje é só a tela de conexão de marketplaces — ES/EN ainda
// não têm nenhuma integração de marketplace pra conectar, então o menu
// fica sem função nessas versões.
export const MOSTRAR_CONFIGURACOES: Record<Idioma, boolean> = {
  pt: true,
  en: false,
  es: false,
};

// Mesmo motivo: o passo "Conectar marketplace" de Primeiros Passos leva pra
// Configurações, que não existe nas versões ES/EN.
export const MOSTRAR_PASSO_MARKETPLACE: Record<Idioma, boolean> = {
  pt: true,
  en: false,
  es: false,
};

// ids batem com os de MARKETPLACES em src/components/gerador/MarketplaceStep.tsx
export const GERADOR_MARKETPLACES_VISIVEIS: Record<Idioma, string[]> = {
  pt: ['ml', 'shopee', 'outros'],
  es: ['ml', 'outros'],
  en: ['etsy', 'outros'],
};

// valores batem com o tipo Canal em src/types.ts. "Mercado Livre Argentina"
// é o canal com marca "Mercado Libre" e fórmula de frete por peso própria —
// é o que aparece pras versões ES/EN, não o canal Brasil relabelado.
export const CALC_CANAIS_VISIVEIS: Record<Idioma, Canal[]> = {
  pt: ['Venda direta', 'Mercado Livre', 'Shopee', 'TikTok Shop'],
  es: ['Venda direta', 'Mercado Livre Argentina'],
  en: ['Venda direta', 'Mercado Livre Argentina'],
};

// Padrões de precificação da versão ES (Argentina): IVA de 21% e peso argentino.
// Ficam em campos próprios das Preferências (impostoEs/moedaEs) pra que mexer
// neles em ES não mude o padrão das versões PT/EN, e vice-versa.
export const IVA_ARGENTINA = 21;

export function impostoDasPrefs(prefs: Preferencias, idioma: Idioma): number {
  return idioma === 'es' ? (prefs.impostoEs ?? IVA_ARGENTINA) : prefs.imposto;
}

export function moedaDasPrefs(prefs: Preferencias, idioma: Idioma): Moeda {
  return idioma === 'es' ? (prefs.moedaEs ?? 'ARS') : (prefs.moeda || 'BRL');
}
