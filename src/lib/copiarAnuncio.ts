import type { Produto } from './produtosMock';
import type { RascunhoShopee } from './rascunhosShopee';
import fotoProduto from '../assets/gerador-produto-mock.jpg';

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

// "Reescrever com o Seller": o Gerador abre já com as imagens e os dados do
// anúncio original, no fluxo completo (IA). Como o mock de Produtos não tem as
// fotos de verdade, a foto de exemplo do Gerador faz o papel de cada imagem salva.
export function rascunhoDoProduto(produto: Produto): RascunhoShopee {
  const preco = parseFloat(produto.preco.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
  return {
    id: 'produto-' + produto.id,
    titulo: produto.nome,
    descricao: `${produto.nome}\nCategoria: ${produto.categoria} > ${produto.categoriaSub}`,
    preco: isNaN(preco) ? 0 : preco,
    estoque: produto.estoque,
    categoria: produto.categoria,
    atributos: [],
    imagens: Array.from({ length: Math.min(Math.max(produto.imagensQtd, 1), 5) }, () => fotoProduto),
    origemUrl: '',
    criadoEm: Date.now(),
    modo: 'ia',
    origem: 'produto',
  };
}
