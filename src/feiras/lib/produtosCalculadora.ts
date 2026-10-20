import { getHistorico } from '../../lib/storage';
import type { HistoricoEntry } from '../../types';
import type { Produto } from './types';
import { idiomaDoFormato } from '../../lib/format';

// Produtos de venda do módulo Vendas físicas = os cálculos de VENDA DIRETA
// salvos na Calculadora de preços (Histórico), de qualquer tela. Cálculos de marketplace não
// entram: as taxas deles (comissão, frete) não valem no balcão. Custo e preços
// vêm do cálculo, não de uma tabela própria:
//  - custo         = custo por unidade calculado;
//  - varejo (B2C)  = preço para o consumidor;
//  - atacado (B2B) = referência de varejo (50% do preço ao consumidor) da calculadora.
// Se o mesmo produto tem mais de um cálculo de venda direta, vale o mais recente.
export function produtosDaCalculadora(): Produto[] {
  const maisRecentePorNome = new Map<string, HistoricoEntry>();
  for (const h of getHistorico()) {
    // Tudo que é Venda direta na calculadora entra no catálogo, de onde quer que tenha sido salvo.
    if (h.marketplace !== 'Venda direta') continue;
    const nome = (h.nome || '').trim();
    if (!nome) continue;
    const chave = nome.toLowerCase();
    const atual = maisRecentePorNome.get(chave);
    if (!atual || h.id > atual.id) maisRecentePorNome.set(chave, h);
  }
  return [...maisRecentePorNome.values()]
    .sort((a, b) => a.nome.localeCompare(b.nome, idiomaDoFormato() === 'en' ? 'en-US' : 'pt-BR', { sensitivity: 'base' }))
    .map((h) => ({
      id: 'calc-' + h.id,
      calcId: h.id,
      nome: h.nome.trim(),
      sku: '',
      categoria: '',
      material: h.filamentoItems?.[0]?.nome || 'PLA',
      tempoH: h.tempoH || 0,
      pesoG: h.peso || 0,
      acessorio: 0,
      custoManual: h.custoUnit,
      atacadoManual: h.precoVarejo,
      varejoManual: h.precoConsumidor,
    }));
}
