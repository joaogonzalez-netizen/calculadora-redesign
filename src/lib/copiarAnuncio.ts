import type { Produto } from './produtosMock';

// "Levar para outro marketplace": o destino é sempre o outro canal do anúncio
// (Shopee vai pro Mercado Livre e vice-versa). `chave` casa com o id do
// marketplace em Configurações (ml, shopee) e com o sufixo das chaves de i18n.
export interface DestinoCopia {
  nome: 'Mercado Livre' | 'Shopee';
  id: 'ml' | 'shopee';
  sufixo: 'Ml' | 'Shopee';
}

export function destinoDaCopia(produto: Produto): DestinoCopia {
  return produto.marketplace === 'Shopee'
    ? { nome: 'Mercado Livre', id: 'ml', sufixo: 'Ml' }
    : { nome: 'Shopee', id: 'shopee', sufixo: 'Shopee' };
}
