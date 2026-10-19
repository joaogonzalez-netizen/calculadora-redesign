import type { Db } from './types';
import { addDias, uid } from './format';
import { CONFIG_PADRAO } from './pricing';

export const dbVazio = (): Db => ({
  clientes: [], negocios: [], prospectos: [], produtos: [], pedidos: [], feiras: [], feiraAtivaId: null, config: { ...CONFIG_PADRAO },
});

/** Os ids do exemplo ganham um sufixo único: no Supabase a chave primária é global. */
export function dbExemplo(): Db {
  const suf = '-' + uid().slice(0, 6);
  return JSON.parse(JSON.stringify(exemplo()).replace(/"(f-geek|f-maker|f-expo|(?:[pcno]|pr)\d+|c\d+c\d)"/g, (_, id) => `"${id}${suf}"`));
}

type Neg = Db['negocios'][number];

function exemplo(): Db {
  const f1 = 'f-geek', f2 = 'f-maker', f3 = 'f-expo';
  const cfg = { ...CONFIG_PADRAO };
  const prod = (id: string, nome: string, sku: string, categoria: string, material: string, tempoH: number, pesoG: number, acessorio = 0) => ({
    id, nome, sku, categoria, material, tempoH, pesoG, acessorio, atacadoManual: null, varejoManual: null,
  });
  const produtos = [
    prod('p1', 'Vaso Espiral M', 'DEC-001', 'Decoração', 'PLA', 3.5, 85),
    prod('p2', 'Capivara Sentada', 'FIG-001', 'Figuras', 'PLA', 2, 40),
    prod('p3', 'Suporte de Headset', 'ORG-001', 'Organização', 'PETG', 5, 120),
    prod('p4', 'Luminária Lua', 'DEC-002', 'Decoração', 'PLA', 8, 150, 12),
    prod('p5', 'Chaveiro Personalizado', 'ACE-001', 'Acessórios', 'PLA', 0.4, 6, 1.5),
    prod('p6', 'Porta-Lápis Hexagonal', 'ORG-002', 'Organização', 'PLA', 1.8, 55),
    prod('p7', 'Vaso Suculenta Mini', 'DEC-003', 'Decoração', 'PLA', 1.2, 30),
    prod('p8', 'Cachepô Geométrico', 'DEC-004', 'Decoração', 'PETG', 4.5, 110),
  ];
  const custo = (id: string) => { const p = produtos.find((x) => x.id === id)!; return (p.pesoG / 1000) * cfg.custoKg + p.tempoH * cfg.custoHora + p.acessorio; };
  const item = (id: string, qtd: number, tipo: 'atacado' | 'varejo' = 'atacado') => {
    const p = produtos.find((x) => x.id === id)!; const c = custo(id);
    const unit = Math.round(c * cfg.markupAtacado * (tipo === 'varejo' ? cfg.markupVarejo : 1) * 100) / 100;
    return { produtoId: id, nome: p.nome, qtd, unit, custoUnit: Math.round(c * 100) / 100, tempoH: p.tempoH };
  };
  const cli = (id: string, nome: string, empresa: string, categoria: string, telefone: string, cidade: string, feiraId: string | null, dias: number, nota: string, extra: { tipo?: 'presencial' | 'whatsapp' | 'ligacao'; obs?: string } = {}) => ({
    id, nome, empresa, categoria, telefone, email: '', cidade, obs: extra.obs ?? '', feiraId, criadoEm: addDias(-dias),
    contatos: [{ id: id + 'c1', data: addDias(-dias), tipo: extra.tipo ?? ('presencial' as const), nota }],
  });
  const neg = (id: string, clienteId: string, titulo: string, valor: number, etapa: Neg['etapa'], temperatura: Neg['temperatura'], feiraId: string | null, prox: number | null, dias: number, extra: Partial<Neg> = {}): Neg => ({
    id, clienteId, titulo, valor, etapa, temperatura, feiraId, proximoContato: prox === null ? null : addDias(prox),
    motivoPerda: '', criadoEm: addDias(-dias), atualizadoEm: addDias(-Math.max(0, dias - 1)), pedidoId: null, ...extra,
  });
  const ped = (id: string, clienteId: string, negocioId: string, feiraId: string | null, status: Db['pedidos'][number]['status'], dataDias: number, entregaDias: number, itens: ReturnType<typeof item>[], obs = '') => ({
    id, clienteId, negocioId, feiraId, status, dataPedido: addDias(dataDias), entrega: addDias(entregaDias), obs, itens,
  });
  const total = (itens: ReturnType<typeof item>[]) => Math.round(itens.reduce((s, i) => s + i.qtd * i.unit, 0));

  const pedidos = [
    ped('o1', 'c4', 'n5', f2, 'Pago', -35, -28, [item('p1', 20)], 'Pagamento via Pix.'),
    ped('o2', 'c7', 'n9', f1, 'Imprimindo', -1, 6, [item('p2', 40), item('p5', 40)], 'Chaveiros com a logo da loja.'),
    ped('o3', 'c8', 'n10', f1, 'Na fila', 0, 9, [item('p7', 30), item('p8', 12)]),
    ped('o4', 'c9', 'n11', f2, 'Em preparação para envio', -3, 1, [item('p6', 24)], 'Falta embalar e colar a etiqueta.'),
    ped('o5', 'c10', 'n12', f3, 'Pronto', -6, 2, [item('p4', 4, 'varejo'), item('p1', 6, 'varejo')], 'Retirada no estande.'),
    ped('o6', 'c5', 'n13', f2, 'Cancelado', -37, -30, [item('p3', 12)], 'Cliente desistiu após o orçamento.'),
  ];

  return {
    config: cfg,
    feiraAtivaId: f1,
    feiras: [
      { id: f1, nome: 'Feira Geek Joinville', local: 'Expoville · Joinville/SC', inicio: addDias(-2), fim: addDias(1) },
      { id: f2, nome: 'Maker Fair Floripa', local: 'Centrosul · Florianópolis/SC', inicio: addDias(-40), fim: addDias(-38) },
      { id: f3, nome: 'Expo Presentes Curitiba', local: 'Expo Barigui · Curitiba/PR', inicio: addDias(-12), fim: addDias(-10) },
    ],
    produtos,
    clientes: [
      cli('c1', 'Marina Costa', 'Presentes & Cia', 'Loja de presentes', '(47) 99181-2210', 'Joinville', f1, 1, 'Lojista. Pediu tabela de atacado das capivaras.'),
      cli('c2', 'Rafael Nunes', '', 'Consumidor final', '(47) 98812-4471', 'Jaraguá do Sul', f1, 1, 'Quer 3 luminárias de presente de casamento.'),
      cli('c3', 'Padaria Central', 'Padaria Central', 'Lanches', '(47) 99703-1180', 'Joinville', f1, 2, 'Dono quer brindes para clientes fiéis.'),
      cli('c4', 'Julia Prado', 'Studio J. Decor', 'Decoração', '(48) 99944-0071', 'Florianópolis', f2, 38, 'Revende decoração. Gostou do vaso espiral.'),
      cli('c5', 'Eduardo Lima', 'Café Origem', 'Cafeteria', '(48) 98501-7733', 'Florianópolis', f2, 38, 'Quer suporte para cardápio.'),
      cli('c6', 'Bianca Schmitt', '', 'Consumidor final', '(47) 99620-5544', 'Blumenau', f1, 0, 'Perguntou de chaveiros personalizados.'),
      cli('c7', 'Thiago Brandão', 'Brandão Brindes', 'Brindes corporativos', '(47) 99888-3012', 'Joinville', f1, 1, 'Fechou lote de chaveiros e capivaras para evento.'),
      cli('c8', 'Larissa Moreira', 'Flor & Folha', 'Floricultura', '(47) 99412-7780', 'Joinville', f1, 2, 'Quer vasos mini para revender com arranjos.'),
      cli('c9', 'Gustavo Reis', 'Escritório Reis', 'Escritório', '(48) 99177-4590', 'São José', f2, 36, 'Comprou porta-lápis para a equipe.'),
      cli('c10', 'Camila Duarte', 'Casa Duarte', 'Decoração', '(41) 99822-1604', 'Curitiba', f3, 7, 'Lojista de decoração, comprou luminárias.'),
      cli('c11', 'Floricultura Jardim das Cores', 'Floricultura Jardim das Cores', 'Floricultura', '(47) 99182-4410', 'Joinville', null, 1, 'Encontrado na busca do Google (Floricultura). Av. Getúlio Vargas, 1150 - Anita Garibaldi, Joinville - SC', { tipo: 'whatsapp' }),
      cli('c12', 'Henrique Alves', 'Alves Games', 'Loja de games', '(41) 99650-3321', 'Curitiba', f3, 8, 'Interessado em figuras para vitrine.'),
      cli('c13', 'Priscila Ramos', '', 'Consumidor final', '(47) 98433-9087', 'Joinville', f1, 0, 'Quer um presente de aniversário personalizado.'),
      cli('c14', 'Rodrigo Fernandes', 'Fernandes Eventos', 'Eventos', '(47) 99301-5546', 'Itajaí', f3, 9, 'Orçou lembrancinhas para um casamento de 120 convidados.', { tipo: 'whatsapp' }),
    ],
    negocios: [
      neg('n1', 'c6', '30 chaveiros personalizados', 180, 'novo', 'morno', f1, 1, 0),
      neg('n2', 'c13', 'Luminária Lua personalizada', 230, 'novo', 'quente', f1, 0, 0),
      neg('n3', 'c11', 'Prospecção: Floricultura Jardim das Cores', 0, 'novo', 'frio', null, 1, 1),
      neg('n4', 'c3', 'Brindes: 100 chaveiros com logo', 650, 'conversa', 'quente', f1, 0, 2),
      neg('n5', 'c4', '20 vasos espiral M', total([item('p1', 20)]), 'fechado', 'quente', f2, null, 38, { pedidoId: 'o1' }),
      neg('n6', 'c5', '12 suportes de cardápio', 540, 'perdido', 'frio', f2, null, 38, { motivoPerda: 'Achou caro frente à impressão do concorrente' }),
      neg('n7', 'c1', 'Capivaras para revenda (atacado)', 1480, 'orcamento', 'quente', f1, -1, 1),
      neg('n8', 'c2', '3 luminárias Lua', 690, 'negociando', 'morno', f1, 1, 1),
      neg('n9', 'c7', '40 capivaras + 40 chaveiros', total([item('p2', 40), item('p5', 40)]), 'fechado', 'quente', f1, null, 2, { pedidoId: 'o2' }),
      neg('n10', 'c8', 'Vasos mini e cachepôs para revenda', total([item('p7', 30), item('p8', 12)]), 'fechado', 'quente', f1, null, 1, { pedidoId: 'o3' }),
      neg('n11', 'c9', '24 porta-lápis', total([item('p6', 24)]), 'fechado', 'morno', f2, null, 36, { pedidoId: 'o4' }),
      neg('n12', 'c10', 'Luminárias e vasos para loja', total([item('p4', 4, 'varejo'), item('p1', 6, 'varejo')]), 'fechado', 'quente', f3, null, 7, { pedidoId: 'o5' }),
      neg('n13', 'c5', '12 suportes de cardápio (2ª proposta)', 520, 'fechado', 'frio', f2, null, 37, { pedidoId: 'o6' }),
      neg('n14', 'c12', '15 figuras para vitrine', 780, 'orcamento', 'morno', f3, 2, 8),
      neg('n15', 'c14', '120 lembrancinhas de casamento', 2400, 'negociando', 'quente', f3, 0, 9),
      neg('n16', 'c3', 'Camisetas + chaveiros para equipe', 900, 'perdido', 'frio', f1, null, 20, { motivoPerda: 'Preferiu fornecedor local de camisetas' }),
    ],
    pedidos,
    prospectos: [
      { id: 'pr1', placeId: 'mock-02', nome: 'Floricultura Jardim das Cores', status: 'lead', clienteId: 'c11', atualizadoEm: addDias(-1) },
      { id: 'pr2', placeId: 'mock-14', nome: 'Canto da Rosa Floricultura', status: 'descartado', clienteId: null, atualizadoEm: addDias(-1) },
    ],
  };
}
