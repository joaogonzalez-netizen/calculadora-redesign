// Cor da tag de marketplace — regra única pro produto inteiro (Produtos,
// Pedidos, Meus Anúncios, Etiquetas...): Mercado Livre fica amarelo, Shopee
// em tons de vermelho, Etsy em tons de laranja, TikTok em tons de azul.
// Qualquer outro marketplace ("Outros", Amazon, Venda direta etc.) cai no
// tom neutro padrão da `.mp-tag`.
export function classeTagMarketplace(nome: string | undefined | null): string {
  const n = (nome ?? '').toLowerCase().trim();
  if (n === 'ml' || n.includes('mercado')) return 'mp-tag-ml';
  if (n === 'shopee' || n.includes('shopee')) return 'mp-tag-shopee';
  if (n === 'etsy' || n.includes('etsy')) return 'mp-tag-etsy';
  if (n === 'tiktok' || n.includes('tiktok')) return 'mp-tag-tiktok';
  return '';
}
