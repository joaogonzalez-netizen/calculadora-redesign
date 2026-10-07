// Lista canônica de canais de venda — única fonte, usada pelo seletor da
// Calculadora (CanalCard), pelo painel de preço (PrecoPanel) e pelo filtro
// por canal do Histórico (CanalFiltro).
import type { Canal } from '../types';

export const CANAIS: Canal[] = ['Venda direta', 'Mercado Livre', 'Mercado Livre Argentina', 'Shopee', 'Etsy', 'TikTok Shop'];

export const CANAL_LABEL_KEYS: Record<Canal, string> = {
  'Venda direta': 'calc.canalVendaDireta',
  'Mercado Livre': 'calc.canalMercadoLivre',
  'Mercado Livre Argentina': 'calc.canalMercadoLivreArgentina',
  'Shopee': 'calc.canalShopee',
  'Etsy': 'calc.canalEtsy',
  'TikTok Shop': 'calc.canalTiktokShop',
};

// Cores do badge de canal no Histórico: fundo claro + texto escuro (contraste
// ≥ 5,8:1, WCAG AA). Um matiz por canal para distinguir de relance.
export const CANAL_COR: Record<Canal, { bg: string; fg: string }> = {
  'Venda direta': { bg: '#E3F5EC', fg: '#0B6B43' },
  'Mercado Livre': { bg: '#FFF3BF', fg: '#6B5200' },
  'Mercado Livre Argentina': { bg: '#DCEBFA', fg: '#154C85' },
  'Shopee': { bg: '#FFE5D6', fg: '#9A3A0A' },
  'Etsy': { bg: '#EBE3FA', fg: '#4F2A9A' },
  'TikTok Shop': { bg: '#FCE1EC', fg: '#A01653' },
};
