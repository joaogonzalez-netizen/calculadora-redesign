// Três "versões" do app, uma por idioma — cada mercado-alvo vê só os menus e
// canais de venda relevantes pra ele. Fonte única de verdade: trocar aqui
// reflete em Sidebar (menus PRINCIPAL), Gerador de anúncios (marketplaces
// do passo 2) e Calculadora (chips de Canal de venda).
import type { Idioma } from './i18n';
import type { Canal } from '../types';

// PRINCIPAL (Painel/Pedidos/Produtos) só existe na versão PT — as versões
// ES/EN ainda não têm dado real de vendas/pedidos pro mercado internacional.
export const MOSTRAR_MENUS_PRINCIPAIS: Record<Idioma, boolean> = {
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
