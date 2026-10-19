import { useMemo, useState } from 'react';
import { useStore, horasPedido, totalPedido } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl, brlCurto, dataCurta, hoje } from '../lib/format';
import type { StatusPedido } from '../lib/types';
import { PEDIDOS, type Pedido as PedidoMarketplace } from '../../lib/pedidosMock';
import PedidoMarketplaceDrawer from '../../components/pedidos/PedidoDrawer';
import { Pagina } from '../components/ui';
import Icon from '../components/Icon';

type Etapa = 'fila' | 'imprimindo' | 'preparacao' | 'pronto' | 'concluido';
type Origem = 'Mercado Livre' | 'Shopee' | 'Venda física';

const ETAPAS: { id: Etapa; label: string; hint: string }[] = [
  { id: 'fila', label: 'Na fila', hint: 'Pedidos novos de todos os canais' },
  { id: 'imprimindo', label: 'Imprimindo', hint: 'Na mesa agora' },
  { id: 'preparacao', label: 'Em preparação para envio', hint: 'Acabamento, embalagem e etiqueta' },
  { id: 'pronto', label: 'Pronto para envio', hint: 'Impresso, falta despachar ou entregar' },
  { id: 'concluido', label: 'Concluídos', hint: 'Enviados ou entregues' },
];

// Venda física: etapa da fila <-> status do pedido da feira.
const STATUS_DA_ETAPA: Record<Etapa, StatusPedido> = { fila: 'Na fila', imprimindo: 'Imprimindo', preparacao: 'Em preparação para envio', pronto: 'Pronto', concluido: 'Entregue' };
const ETAPA_DO_STATUS: Partial<Record<StatusPedido, Etapa>> = { 'Na fila': 'fila', Imprimindo: 'imprimindo', 'Em preparação para envio': 'preparacao', Pronto: 'pronto', Entregue: 'concluido', Pago: 'concluido' };

// Marketplace: o mock só conhece Pago/Enviado/Entregue. Mover o cartão guarda a etapa aqui.
const KEY_ETAPAS = 'stlseller.fila.etapas.v1';
const lerEtapas = (): Record<string, Etapa> => { try { return JSON.parse(localStorage.getItem(KEY_ETAPAS) || '{}'); } catch { return {}; } };
// Todo pedido novo do marketplace cai direto na fila (pago ou com pagamento pendente). Cancelado não entra.
// Quando o marketplace marca Enviado/Entregue, o pedido vai para Concluídos sozinho, mesmo que o cartão tenha sido movido à mão.
const etapaMarketplace = (p: PedidoMarketplace, manual?: Etapa): Etapa | null => {
  if (p.status === 'Cancelado') return null;
  if (p.status === 'Enviado' || p.status === 'Entregue') return 'concluido';
  return manual ?? 'fila';
};
const isoDeBr = (d: string) => { const [dd, mm, aa] = d.split('/'); return `${aa}-${mm}-${dd}`; };
const somaDias = (iso: string, n: number) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

interface Cartao {
  chave: string;
  id: string;
  origem: Origem;
  cliente: string;
  resumo: string;
  pecas: number;
  horas: number | null;
  prazo: string;
  valor: number;
  etapa: Etapa;
  pagamentoPendente?: boolean;
}

const COR_ORIGEM: Record<Origem, string> = { 'Mercado Livre': 'fe-amber', Shopee: 'fe-red', 'Venda física': 'fe-green' };
type FiltroOrigem = 'todas' | 'marketplace' | 'fisica';

export default function FilaView() {
  const { db, statusPedido } = useStore();
  const { abrir, avisar } = useUi();
  const [etapas, setEtapas] = useState(lerEtapas);
  const [filtro, setFiltro] = useState<FiltroOrigem>('todas');
  const [verConcluidos, setVerConcluidos] = useState(false);
  const [etapaM, setEtapaM] = useState<Etapa>('fila');
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<Etapa | null>(null);
  const [aberto, setAberto] = useState<PedidoMarketplace | null>(null);

  const cartoes = useMemo<Cartao[]>(() => {
    const fisicos = db.pedidos.flatMap((p): Cartao[] => {
      const etapa = ETAPA_DO_STATUS[p.status];
      if (!etapa) return [];
      return [{
        chave: 'f:' + p.id, id: p.id, origem: 'Venda física', cliente: db.clientes.find((c) => c.id === p.clienteId)?.nome ?? 'N/D',
        resumo: p.itens.map((i) => `${i.qtd}× ${i.nome}`).join(', '), pecas: p.itens.reduce((s, i) => s + i.qtd, 0), horas: horasPedido(p),
        prazo: p.entrega, valor: totalPedido(p), etapa,
      }];
    });
    const mkt = PEDIDOS.flatMap((p): Cartao[] => {
      const etapa = etapaMarketplace(p, etapas[p.id]);
      if (!etapa) return [];
      return [{
        chave: 'm:' + p.id, id: p.id, origem: p.marketplace, cliente: p.comprador, resumo: `${p.qtd}× ${p.produto}`, pecas: p.qtd, horas: null,
        prazo: somaDias(isoDeBr(p.data), 2), valor: p.valorTotal, etapa, pagamentoPendente: p.status === 'Pendente',
      }];
    });
    return [...fisicos, ...mkt].sort((a, b) => a.prazo.localeCompare(b.prazo));
  }, [db.pedidos, db.clientes, etapas]);

  const visiveis = cartoes.filter((c) => filtro === 'todas' || (filtro === 'fisica') === (c.origem === 'Venda física'));
  const colunas = verConcluidos ? ETAPAS : ETAPAS.filter((e) => e.id !== 'concluido');
  const ativos = visiveis.filter((c) => c.etapa !== 'concluido');
  const atrasados = ativos.filter((c) => c.prazo < hoje()).length;
  const horasFila = visiveis.filter((c) => c.etapa === 'fila' || c.etapa === 'imprimindo').reduce((s, c) => s + (c.horas ?? 0), 0);

  function mover(c: Cartao, etapa: Etapa) {
    if (c.etapa === etapa) return;
    if (c.origem === 'Venda física') statusPedido(c.id, STATUS_DA_ETAPA[etapa]);
    else {
      const novo = { ...etapas, [c.id]: etapa };
      setEtapas(novo);
      try { localStorage.setItem(KEY_ETAPAS, JSON.stringify(novo)); } catch { /* sem storage */ }
    }
    avisar(`Pedido de ${c.cliente} movido para “${ETAPAS.find((e) => e.id === etapa)!.label}”`);
  }
  const soltar = (etapa: Etapa) => {
    const c = cartoes.find((x) => x.chave === arrastando);
    setArrastando(null); setSobre(null);
    if (c) mover(c, etapa);
  };
  const abrirCartao = (c: Cartao) => {
    if (c.origem === 'Venda física') abrir('pedido', c.id);
    else setAberto(PEDIDOS.find((p) => p.id === c.id) ?? null);
  };

  return (
    <Pagina titulo="Fila de pedidos" sub="O que precisa ser impresso e despachado, de todos os canais num lugar só."
      acoes={<button className="fe-btn fe-btn-primary" onClick={() => abrir('pedido')}><Icon name="plus" /> Novo pedido de venda física</button>}>
      <div className="fe-grid-kpi">
        <div className="fe-card fe-kpi fe-hi"><div className="fe-l">Na fila agora</div><div className="fe-v">{visiveis.filter((c) => c.etapa === 'fila').length}</div><div className="fe-s">pedidos esperando para imprimir</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">Horas de impressão</div><div className="fe-v">{horasFila.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h</div><div className="fe-s">na fila e imprimindo (só vendas físicas)</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">Atrasados</div><div className="fe-v" style={{ color: atrasados ? 'var(--red)' : undefined }}>{atrasados}</div><div className="fe-s">prazo vencido e ainda não concluídos</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">Prontos para envio</div><div className="fe-v">{visiveis.filter((c) => c.etapa === 'pronto').length}</div><div className="fe-s">impressos, falta despachar</div></div>
      </div>

      <div className="fe-toolbar">
        <div className="fe-chips">
          {([['todas', 'Todos os canais'], ['marketplace', 'Marketplaces'], ['fisica', 'Vendas físicas']] as const).map(([id, l]) => (
            <button key={id} className={'fe-chip' + (filtro === id ? ' fe-on' : '')} onClick={() => setFiltro(id)}>{l}</button>
          ))}
          <button className={'fe-chip' + (verConcluidos ? ' fe-on' : '')} onClick={() => setVerConcluidos(!verConcluidos)}>Mostrar concluídos</button>
        </div>
      </div>

      <div className="fe-stage-tabs" role="tablist">
        {colunas.map((e) => <button key={e.id} role="tab" aria-selected={etapaM === e.id} className={etapaM === e.id ? 'fe-on' : ''} onClick={() => setEtapaM(e.id)}>{e.label}<b>{visiveis.filter((c) => c.etapa === e.id).length}</b></button>)}
      </div>

      <div className="fe-kanban" style={{ gridTemplateColumns: `repeat(${colunas.length}, minmax(250px, 1fr))` }}>
        {colunas.map((e) => {
          const col = visiveis.filter((c) => c.etapa === e.id);
          return (
            <section key={e.id} className={'fe-col' + (sobre === e.id ? ' fe-over' : '') + (etapaM === e.id ? ' fe-m-on' : '')} aria-label={e.label}
              onDragOver={(ev) => { ev.preventDefault(); setSobre(e.id); }} onDragLeave={() => setSobre((x) => (x === e.id ? null : x))} onDrop={() => soltar(e.id)}>
              <div className="fe-col-head"><h3>{e.label}</h3><span className="fe-n">{col.length}</span></div>
              <div className="fe-col-sum">{col.length ? brlCurto(col.reduce((s, c) => s + c.valor, 0)) : e.hint}</div>
              {col.length === 0 && <div className="fe-col-empty">Nenhum pedido aqui</div>}
              {col.map((c) => {
                const atraso = c.etapa !== 'concluido' && c.prazo < hoje();
                return (
                  <div key={c.chave} className={'fe-deal' + (arrastando === c.chave ? ' fe-dragging' : '')} draggable onDragStart={() => setArrastando(c.chave)} onDragEnd={() => setArrastando(null)}
                    role="button" tabIndex={0} onClick={() => abrirCartao(c)} onKeyDown={(ev) => ev.key === 'Enter' && abrirCartao(c)} style={{ cursor: 'pointer' }}>
                    <div className="fe-row"><span className="fe-who">{c.cliente}</span><span className={'fe-badge ' + COR_ORIGEM[c.origem]}>{c.origem}</span></div>
                    <div className="fe-what">{c.resumo}</div>
                    <div className="fe-row"><span className="fe-val">{brl(c.valor)}</span><span className="fe-sub" style={{ color: 'var(--text-3)', fontSize: 12 }}>{c.pagamentoPendente ? 'Pagamento pendente · ' : ''}{c.pecas} {c.pecas === 1 ? 'peça' : 'peças'}{c.horas ? ` · ${c.horas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h` : ''}</span></div>
                    {c.etapa !== 'concluido' && <div className={'fe-follow' + (atraso ? ' fe-late' : '')}><Icon name={atraso ? 'alert' : 'clock'} size={13} />Prazo {dataCurta(c.prazo)}</div>}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>

      {aberto && <PedidoMarketplaceDrawer pedido={aberto} onClose={() => setAberto(null)} />}
    </Pagina>
  );
}
