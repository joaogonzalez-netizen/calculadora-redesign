import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Cliente, Contato, Db, Etapa, Feira, ItemPedido, Negocio, Pedido, Produto, Prospecto, StatusPedido, Temperatura, TipoContato } from './types';
import { addDias, hoje, uid } from './format';
import { tf } from './i18n';
import { idiomaDoFormato } from '../../lib/format';
import { dbExemplo, dbVazio } from './seed';
import { precoAtacado, precoVarejo, custoProduto } from './pricing';
import { produtosDaCalculadora } from './produtosCalculadora';

export interface LeadRapido {
  nome: string;
  telefone: string;
  interesse: string;
  valor: number;
  temperatura: Temperatura;
  nota: string;
  proximoContato: string | null;
}

interface Store {
  db: Db;
  pronto: boolean;
  erroSync: string | null;
  feiraAtiva: Feira | null;
  setFeiraAtiva: (id: string | null) => void;
  salvarFeira: (f: Partial<Feira> & { nome: string }) => string;
  excluirFeira: (id: string) => void;

  capturarLead: (l: LeadRapido) => { clienteId: string; negocioId: string; existente: boolean };
  salvarCliente: (c: Partial<Cliente> & { nome: string }) => string;
  excluirCliente: (id: string) => void;
  registrarContato: (clienteId: string, tipo: TipoContato, nota: string, data?: string) => void;
  excluirContato: (clienteId: string, contatoId: string) => void;

  salvarNegocio: (n: Partial<Negocio> & { clienteId: string; titulo: string }) => string;
  moverNegocio: (id: string, etapa: Etapa, motivoPerda?: string) => void;
  excluirNegocio: (id: string) => void;
  fecharNegocio: (id: string, itens: ItemPedido[], entrega: string) => string;

  salvarPedido: (p: Partial<Pedido> & { clienteId: string; itens: ItemPedido[] }) => string;
  statusPedido: (id: string, s: StatusPedido) => void;
  excluirPedido: (id: string) => void;

  salvarProduto: (p: Partial<Produto> & { nome: string }) => string;
  excluirProduto: (id: string) => void;
  setConfig: (c: Partial<Db['config']>) => void;
  itemDoProduto: (p: Produto, tipo: 'atacado' | 'varejo', qtd?: number) => ItemPedido;

  adicionarProspecto: (l: { placeId: string; nome: string; telefone: string; endereco: string; bairro: string; tipo: string; site: string }) => { clienteId: string; existente: boolean };
  descartarProspecto: (placeId: string, nome: string) => void;
  restaurarProspecto: (placeId: string) => void;

  recarregarProdutos: () => void;
  carregarExemplo: () => void;
  limpar: () => void;
}

const Ctx = createContext<Store | null>(null);

const KEY = 'stlseller.feiras.v1';

// "Rua X, 10 - Bairro, Cidade - UF" (PT) ou "10 Main St, Cidade, ST" (EN).
function cidadeDoEndereco(endereco: string): string {
  const partes = endereco.split(',').map((p) => p.trim());
  const ultima = partes[partes.length - 1] ?? '';
  if (/^[A-Z]{2}$/.test(ultima) && partes.length > 1) return partes[partes.length - 2];
  return ultima.replace(/\s*-\s*[A-Z]{2}$/, '').trim();
}

// Primeira abertura (sem nada salvo e sem nunca ter carregado o exemplo): já vem com dados de exemplo
// pra ver as telas preenchidas. Depois de "limpar", o banco vazio é respeitado.
const KEY_SEMENTE = 'stlseller.feiras.exemplo.v1';

function carregar(): Db {
  try {
    const raw = localStorage.getItem(KEY);
    const salvo = raw ? { ...dbVazio(), ...JSON.parse(raw) } : null;
    const vazio = !salvo || (!salvo.clientes.length && !salvo.negocios.length && !salvo.pedidos.length && !salvo.feiras.length);
    if (!vazio) return salvo;
    if (!localStorage.getItem(KEY_SEMENTE)) { localStorage.setItem(KEY_SEMENTE, '1'); return dbExemplo(idiomaDoFormato()); }
    return salvo ?? dbVazio();
  } catch { return dbVazio(); }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Db>(carregar);
  // Produtos de venda vêm da Calculadora (Histórico); relê quando o usuário volta à aba/tela.
  const [produtosCalc, setProdutosCalc] = useState(produtosDaCalculadora);
  useEffect(() => {
    const atualizar = () => setProdutosCalc(produtosDaCalculadora());
    atualizar();
    window.addEventListener('focus', atualizar);
    window.addEventListener('storage', atualizar);
    return () => { window.removeEventListener('focus', atualizar); window.removeEventListener('storage', atualizar); };
  }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(db)); }, [db]);
  const pronto = true;
  const erroSync = null;

  const up = useCallback((fn: (d: Db) => Db) => setDb(fn), []);

  const store = useMemo<Store>(() => {
    const touch = (n: Negocio): Negocio => ({ ...n, atualizadoEm: hoje() });
    // Catálogo = produtos da Calculadora + os do exemplo que ela não tem (por nome). Pontos de venda que apontam
    // pra um produto do exemplo repetido na Calculadora passam a apontar pro da Calculadora.
    const nomeCalc = new Map(produtosCalc.map((p) => [p.nome.trim().toLowerCase(), p.id]));
    const remap = new Map<string, string>();
    const extras = db.produtos.filter((p) => { const igual = nomeCalc.get(p.nome.trim().toLowerCase()); if (igual && igual !== p.id) remap.set(p.id, igual); return !igual && !produtosCalc.some((c) => c.id === p.id); });
    const dbView: Db = {
      ...db,
      produtos: [...produtosCalc, ...extras],
      feiras: remap.size ? db.feiras.map((f) => (f.produtos ? { ...f, produtos: f.produtos.map((x) => ({ ...x, produtoId: remap.get(x.produtoId) ?? x.produtoId })) } : f)) : db.feiras,
    };
    return {
      db: dbView, pronto, erroSync,
      recarregarProdutos: () => setProdutosCalc(produtosDaCalculadora()),
      feiraAtiva: db.feiras.find((f) => f.id === db.feiraAtivaId) ?? null,
      setFeiraAtiva: (id) => up((d) => ({ ...d, feiraAtivaId: id })),
      salvarFeira: (f) => {
        const id = f.id ?? uid();
        up((d) => {
          const ex = d.feiras.find((x) => x.id === id);
          const nova: Feira = { id, nome: f.nome, local: f.local ?? ex?.local ?? '', inicio: f.dias?.length ? [...f.dias].sort()[0] : f.inicio ?? ex?.inicio ?? hoje(), regra: 'regra' in f ? f.regra : ex?.regra, dias: f.dias ?? ex?.dias, fim: f.dias ? undefined : ex?.fim, produtos: f.produtos ?? ex?.produtos ?? [] };
          return { ...d, feiras: ex ? d.feiras.map((x) => (x.id === id ? nova : x)) : [nova, ...d.feiras], feiraAtivaId: ex ? d.feiraAtivaId : id };
        });
        return id;
      },
      excluirFeira: (id) => up((d) => ({
        ...d,
        feiras: d.feiras.filter((f) => f.id !== id),
        feiraAtivaId: d.feiraAtivaId === id ? null : d.feiraAtivaId,
        clientes: d.clientes.map((c) => (c.feiraId === id ? { ...c, feiraId: null } : c)),
        negocios: d.negocios.map((n) => (n.feiraId === id ? { ...n, feiraId: null } : n)),
        pedidos: d.pedidos.map((p) => (p.feiraId === id ? { ...p, feiraId: null } : p)),
      })),

      capturarLead: (l) => {
        const tel = l.telefone.replace(/\D/g, '');
        let clienteId = '';
        let existente = false;
        const negocioId = uid();
        up((d) => {
          const ja = tel ? d.clientes.find((c) => c.telefone.replace(/\D/g, '') === tel) : undefined;
          existente = !!ja;
          clienteId = ja?.id ?? uid();
          const contato: Contato = { id: uid(), data: hoje(), tipo: 'presencial', nota: l.nota || (l.interesse ? tf('feiras.lead.notaInteresse', { interesse: l.interesse }) : tf('feiras.lead.notaPadrao')) };
          const clientes = ja
            ? d.clientes.map((c) => (c.id === ja.id ? { ...c, contatos: [contato, ...c.contatos] } : c))
            : [{ id: clienteId, nome: l.nome, empresa: '', categoria: '', telefone: l.telefone, email: '', cidade: '', obs: '', feiraId: d.feiraAtivaId, criadoEm: hoje(), contatos: [contato] }, ...d.clientes];
          const n: Negocio = {
            id: negocioId, clienteId, titulo: l.interesse || tf('feiras.lead.interesseADefinir'), valor: l.valor, etapa: 'novo', temperatura: l.temperatura,
            feiraId: d.feiraAtivaId, proximoContato: l.proximoContato, motivoPerda: '', criadoEm: hoje(), atualizadoEm: hoje(), pedidoId: null,
          };
          return { ...d, clientes, negocios: [n, ...d.negocios] };
        });
        return { clienteId, negocioId, existente };
      },
      salvarCliente: (c) => {
        const id = c.id ?? uid();
        up((d) => {
          const ex = d.clientes.find((x) => x.id === id);
          const novo: Cliente = {
            id, nome: c.nome, empresa: c.empresa ?? ex?.empresa ?? '', categoria: c.categoria ?? ex?.categoria ?? '', telefone: c.telefone ?? ex?.telefone ?? '',
            email: c.email ?? ex?.email ?? '', cidade: c.cidade ?? ex?.cidade ?? '', obs: c.obs ?? ex?.obs ?? '', feiraId: c.feiraId ?? ex?.feiraId ?? d.feiraAtivaId,
            criadoEm: ex?.criadoEm ?? hoje(), contatos: ex?.contatos ?? [],
          };
          return { ...d, clientes: ex ? d.clientes.map((x) => (x.id === id ? novo : x)) : [novo, ...d.clientes] };
        });
        return id;
      },
      excluirCliente: (id) => up((d) => ({
        ...d,
        clientes: d.clientes.filter((c) => c.id !== id),
        negocios: d.negocios.filter((n) => n.clienteId !== id),
        pedidos: d.pedidos.filter((p) => p.clienteId !== id),
      })),
      registrarContato: (clienteId, tipo, nota, data = hoje()) => up((d) => ({
        ...d,
        clientes: d.clientes.map((c) => (c.id === clienteId ? { ...c, contatos: [{ id: uid(), data, tipo, nota }, ...c.contatos].sort((a, b) => b.data.localeCompare(a.data)) } : c)),
      })),
      excluirContato: (clienteId, contatoId) => up((d) => ({
        ...d,
        clientes: d.clientes.map((c) => (c.id === clienteId ? { ...c, contatos: c.contatos.filter((x) => x.id !== contatoId) } : c)),
      })),

      salvarNegocio: (n) => {
        const id = n.id ?? uid();
        up((d) => {
          const ex = d.negocios.find((x) => x.id === id);
          const novo: Negocio = {
            id, clienteId: n.clienteId, titulo: n.titulo, valor: n.valor ?? ex?.valor ?? 0, etapa: n.etapa ?? ex?.etapa ?? 'novo',
            temperatura: n.temperatura ?? ex?.temperatura ?? 'morno', feiraId: n.feiraId !== undefined ? n.feiraId : ex ? ex.feiraId : d.feiraAtivaId,
            proximoContato: n.proximoContato !== undefined ? n.proximoContato : ex?.proximoContato ?? null, motivoPerda: n.motivoPerda ?? ex?.motivoPerda ?? '',
            criadoEm: ex?.criadoEm ?? hoje(), atualizadoEm: hoje(), pedidoId: ex?.pedidoId ?? null,
            itens: n.itens !== undefined ? n.itens : ex?.itens,
            combinado: n.combinado !== undefined ? n.combinado : ex?.combinado,
          };
          return { ...d, negocios: ex ? d.negocios.map((x) => (x.id === id ? novo : x)) : [novo, ...d.negocios] };
        });
        return id;
      },
      moverNegocio: (id, etapa, motivoPerda) => up((d) => ({
        ...d,
        negocios: d.negocios.map((n) => (n.id === id ? touch({
          ...n, etapa, motivoPerda: etapa === 'perdido' ? motivoPerda ?? n.motivoPerda : '',
          proximoContato: etapa === 'fechado' || etapa === 'perdido' ? null : n.proximoContato,
        }) : n)),
      })),
      excluirNegocio: (id) => up((d) => ({ ...d, negocios: d.negocios.filter((n) => n.id !== id) })),
      fecharNegocio: (id, itens, entrega) => {
        const pedidoId = uid();
        up((d) => {
          const n = d.negocios.find((x) => x.id === id);
          if (!n) return d;
          const pedido: Pedido = { id: pedidoId, clienteId: n.clienteId, negocioId: id, feiraId: n.feiraId, itens, status: 'Na fila', dataPedido: hoje(), entrega, obs: '' };
          const total = itens.reduce((s, i) => s + i.qtd * i.unit, 0);
          return {
            ...d,
            pedidos: [pedido, ...d.pedidos],
            negocios: d.negocios.map((x) => (x.id === id ? touch({ ...x, etapa: 'fechado', valor: total, proximoContato: null, pedidoId, motivoPerda: '' }) : x)),
          };
        });
        return pedidoId;
      },

      salvarPedido: (p) => {
        const id = p.id ?? uid();
        up((d) => {
          const ex = d.pedidos.find((x) => x.id === id);
          const novo: Pedido = {
            id, clienteId: p.clienteId, negocioId: p.negocioId ?? ex?.negocioId ?? null, feiraId: p.feiraId !== undefined ? p.feiraId : ex ? ex.feiraId : d.feiraAtivaId,
            itens: p.itens, status: p.status ?? ex?.status ?? 'Na fila', dataPedido: p.dataPedido ?? ex?.dataPedido ?? hoje(), entrega: p.entrega ?? ex?.entrega ?? addDias(7), obs: p.obs ?? ex?.obs ?? '',
          };
          return { ...d, pedidos: ex ? d.pedidos.map((x) => (x.id === id ? novo : x)) : [novo, ...d.pedidos] };
        });
        return id;
      },
      statusPedido: (id, s) => up((d) => ({ ...d, pedidos: d.pedidos.map((p) => (p.id === id ? { ...p, status: s } : p)) })),
      excluirPedido: (id) => up((d) => ({
        ...d,
        pedidos: d.pedidos.filter((p) => p.id !== id),
        negocios: d.negocios.map((n) => (n.pedidoId === id ? { ...n, pedidoId: null, etapa: 'negociando' as Etapa } : n)),
      })),

      salvarProduto: (p) => {
        const id = p.id ?? uid();
        up((d) => {
          const ex = d.produtos.find((x) => x.id === id);
          const novo: Produto = {
            id, nome: p.nome, sku: p.sku ?? ex?.sku ?? '', categoria: p.categoria ?? ex?.categoria ?? '', material: p.material ?? ex?.material ?? 'PLA',
            tempoH: p.tempoH ?? ex?.tempoH ?? 0, pesoG: p.pesoG ?? ex?.pesoG ?? 0, acessorio: p.acessorio ?? ex?.acessorio ?? 0,
            atacadoManual: p.atacadoManual !== undefined ? p.atacadoManual : ex?.atacadoManual ?? null,
            varejoManual: p.varejoManual !== undefined ? p.varejoManual : ex?.varejoManual ?? null,
          };
          return { ...d, produtos: ex ? d.produtos.map((x) => (x.id === id ? novo : x)) : [...d.produtos, novo] };
        });
        return id;
      },
      excluirProduto: (id) => up((d) => ({ ...d, produtos: d.produtos.filter((p) => p.id !== id) })),
      setConfig: (c) => up((d) => ({ ...d, config: { ...d.config, ...c } })),
      itemDoProduto: (p, tipo, qtd = 1) => ({
        produtoId: p.id, nome: p.nome, qtd,
        unit: Math.round((tipo === 'atacado' ? precoAtacado(p, db.config) : precoVarejo(p, db.config)) * 100) / 100,
        custoUnit: Math.round(custoProduto(p, db.config) * 100) / 100, tempoH: p.tempoH,
      }),

      adicionarProspecto: (l) => {
        const tel = l.telefone.replace(/\D/g, '');
        let clienteId = '';
        let existente = false;
        up((d) => {
          const ja = tel ? d.clientes.find((c) => c.telefone.replace(/\D/g, '') === tel) : undefined;
          existente = !!ja;
          clienteId = ja?.id ?? uid();
          const contato: Contato = { id: uid(), data: hoje(), tipo: 'prospeccao', nota: tf('feiras.store.encontradoGoogle', { tipo: l.tipo || tf('feiras.store.lojaPadrao'), endereco: l.endereco }) };
          const clientes = ja ? d.clientes.map((c) => (c.id === ja.id ? { ...c, contatos: [contato, ...c.contatos] } : c)) : [{
            id: clienteId, nome: l.nome, empresa: l.nome, categoria: l.tipo, telefone: l.telefone, email: '', cidade: cidadeDoEndereco(l.endereco),
            obs: l.site ? tf('feiras.store.site', { site: l.site }) : '', feiraId: null, criadoEm: hoje(), contatos: [contato],
          } as Cliente, ...d.clientes];
          const neg: Negocio = {
            id: uid(), clienteId, titulo: tf('feiras.store.prospeccao', { nome: l.nome }), valor: 0, etapa: 'novo', temperatura: 'frio', feiraId: null,
            proximoContato: addDias(1), motivoPerda: '', criadoEm: hoje(), atualizadoEm: hoje(), pedidoId: null,
          };
          const pr: Prospecto = { id: uid(), placeId: l.placeId, nome: l.nome, status: 'lead', clienteId, atualizadoEm: hoje() };
          return { ...d, clientes, negocios: [neg, ...d.negocios], prospectos: [pr, ...(d.prospectos ?? []).filter((x) => x.placeId !== l.placeId)] };
        });
        return { clienteId, existente };
      },
      descartarProspecto: (placeId, nome) => up((d) => ({
        ...d, prospectos: [{ id: uid(), placeId, nome, status: 'descartado' as const, clienteId: null, atualizadoEm: hoje() }, ...(d.prospectos ?? []).filter((x) => x.placeId !== placeId)],
      })),
      restaurarProspecto: (placeId) => up((d) => ({ ...d, prospectos: (d.prospectos ?? []).filter((x) => x.placeId !== placeId) })),

      carregarExemplo: () => setDb(dbExemplo(idiomaDoFormato())),
      limpar: () => setDb(dbVazio()),
    };
  }, [db, produtosCalc, up, pronto, erroSync]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useStore fora do StoreProvider');
  return c;
}

export const totalPedido = (p: Pedido) => p.itens.reduce((s, i) => s + i.qtd * i.unit, 0);
export const custoPedido = (p: Pedido) => p.itens.reduce((s, i) => s + i.qtd * i.custoUnit, 0);
export const horasPedido = (p: Pedido) => p.itens.reduce((s, i) => s + i.qtd * i.tempoH, 0);
