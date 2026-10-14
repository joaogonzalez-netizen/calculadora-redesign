import type { Db } from './types';
import { addDias, uid } from './format';
import { CONFIG_PADRAO } from './pricing';

export const dbVazio = (): Db => ({
  clientes: [], negocios: [], produtos: [], pedidos: [], feiras: [], feiraAtivaId: null, config: { ...CONFIG_PADRAO },
});

/** Os ids do exemplo ganham um sufixo único: no Supabase a chave primária é global. */
export function dbExemplo(): Db {
  const suf = '-' + uid().slice(0, 6);
  return JSON.parse(JSON.stringify(exemplo()).replace(/"(f-geek|f-maker|[pcno]\d|c\dc1)"/g, (_, id) => `"${id}${suf}"`));
}

function exemplo(): Db {
  const f1 = 'f-geek', f2 = 'f-maker';
  const prod = (id: string, nome: string, sku: string, categoria: string, material: string, tempoH: number, pesoG: number, acessorio = 0) => ({
    id, nome, sku, categoria, material, tempoH, pesoG, acessorio, atacadoManual: null, varejoManual: null,
  });
  const cli = (id: string, nome: string, empresa: string, categoria: string, telefone: string, cidade: string, feiraId: string | null, dias: number, nota = '') => ({
    id, nome, empresa, categoria, telefone, email: '', cidade, obs: '', feiraId, criadoEm: addDias(-dias),
    contatos: [{ id: id + 'c1', data: addDias(-dias), tipo: 'presencial' as const, nota: nota || 'Visitou o ponto de venda e pegou o catálogo.' }],
  });
  const neg = (id: string, clienteId: string, titulo: string, valor: number, etapa: Db['negocios'][number]['etapa'], temperatura: Db['negocios'][number]['temperatura'], feiraId: string | null, prox: number | null, dias: number, extra: Partial<Db['negocios'][number]> = {}) => ({
    id, clienteId, titulo, valor, etapa, temperatura, feiraId,
    proximoContato: prox === null ? null : addDias(prox), motivoPerda: '', criadoEm: addDias(-dias), atualizadoEm: addDias(-Math.max(0, dias - 1)), pedidoId: null, ...extra,
  });
  return {
    config: { ...CONFIG_PADRAO },
    feiraAtivaId: f1,
    feiras: [
      { id: f1, nome: 'Feira Geek Joinville', local: 'Expoville · Joinville/SC', inicio: addDias(-2), fim: addDias(1) },
      { id: f2, nome: 'Maker Fair Floripa', local: 'Centrosul · Florianópolis/SC', inicio: addDias(-40), fim: addDias(-38) },
    ],
    produtos: [
      prod('p1', 'Vaso Espiral M', 'DEC-001', 'Decoração', 'PLA', 3.5, 85),
      prod('p2', 'Capivara Sentada', 'FIG-001', 'Figuras', 'PLA', 2, 40),
      prod('p3', 'Suporte de Headset', 'ORG-001', 'Organização', 'PETG', 5, 120),
      prod('p4', 'Luminária Lua', 'DEC-002', 'Decoração', 'PLA', 8, 150, 12),
      prod('p5', 'Chaveiro Personalizado', 'ACE-001', 'Acessórios', 'PLA', 0.4, 6, 1.5),
      prod('p6', 'Porta-Lápis Hexagonal', 'ORG-002', 'Organização', 'PLA', 1.8, 55),
    ],
    clientes: [
      cli('c1', 'Marina Costa', 'Presentes & Cia', 'Loja de presentes', '(47) 99181-2210', 'Joinville', f1, 1, 'Lojista. Pediu tabela de atacado das capivaras.'),
      cli('c2', 'Rafael Nunes', '', 'Consumidor final', '(47) 98812-4471', 'Jaraguá do Sul', f1, 1, 'Quer 3 luminárias de presente de casamento.'),
      cli('c3', 'Padaria Central', 'Padaria Central', 'Lanches', '(47) 99703-1180', 'Joinville', f1, 2, 'Dono quer brindes para clientes fiéis.'),
      cli('c4', 'Julia Prado', 'Studio J. Decor', 'Decoração', '(48) 99944-0071', 'Florianópolis', f2, 38, 'Revende decoração. Gostou do vaso espiral.'),
      cli('c5', 'Eduardo Lima', 'Café Origem', 'Cafeteria', '(48) 98501-7733', 'Florianópolis', f2, 38, 'Quer suporte para cardápio.'),
      cli('c6', 'Bianca Schmitt', '', 'Consumidor final', '(47) 99620-5544', 'Blumenau', f1, 0, 'Perguntou de chaveiros personalizados.'),
    ],
    negocios: [
      neg('n1', 'c6', '30 chaveiros personalizados', 180, 'novo', 'morno', f1, 1, 0),
      neg('n2', 'c3', 'Brindes: 100 chaveiros com logo', 650, 'conversa', 'quente', f1, 0, 2),
      neg('n3', 'c1', 'Capivaras para revenda (atacado)', 1480, 'orcamento', 'quente', f1, -1, 1),
      neg('n4', 'c2', '3 luminárias Lua', 690, 'negociando', 'morno', f1, 1, 1),
      neg('n5', 'c4', '20 vasos espiral M', 2100, 'fechado', 'quente', f2, null, 38, { pedidoId: 'o1' }),
      neg('n6', 'c5', '12 suportes de cardápio', 540, 'perdido', 'frio', f2, null, 38, { motivoPerda: 'Achou caro frente à impressão do concorrente' }),
    ],
    pedidos: [
      {
        id: 'o1', clienteId: 'c4', negocioId: 'n5', feiraId: f2, status: 'Pago', dataPedido: addDias(-35), entrega: addDias(-28), obs: 'Pagamento via Pix.',
        itens: [{ produtoId: 'p1', nome: 'Vaso Espiral M', qtd: 20, unit: 105, custoUnit: 36.4, tempoH: 3.5 }],
      },
    ],
  };
}

