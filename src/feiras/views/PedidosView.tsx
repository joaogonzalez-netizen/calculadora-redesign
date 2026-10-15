import { useMemo, useState } from 'react';
import { useStore, totalPedido, horasPedido } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl, brlCurto, dataCurta } from '../lib/format';
import { STATUS_PEDIDO, type StatusPedido } from '../lib/types';
import { Pagina, Vazio } from '../components/ui';
import Icon from '../components/Icon';

const COR: Record<StatusPedido, string> = { 'Na fila': 'amber', Imprimindo: 'blue', Pronto: 'green', Entregue: 'green', Pago: 'green', Cancelado: 'red' };

type Modo = 'lista' | 'kanban';
const MODO_KEY = 'fe.pedidosModo';
const modoInicial = (): Modo => { try { return localStorage.getItem(MODO_KEY) === 'kanban' ? 'kanban' : 'lista'; } catch { return 'lista'; } };

export default function PedidosView() {
  const { db, statusPedido } = useStore();
  const { abrir } = useUi();
  const [modo, setModo] = useState<Modo>(modoInicial);
  const [statusM, setStatusM] = useState<StatusPedido>('Na fila');
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<StatusPedido | null>(null);
  function trocarModo(m: Modo) { setModo(m); try { localStorage.setItem(MODO_KEY, m); } catch { /* sem storage */ } }
  const soltar = (st: StatusPedido) => {
    const p = db.pedidos.find((x) => x.id === arrastando);
    setArrastando(null); setSobre(null);
    if (p && p.status !== st) statusPedido(p.id, st);
  };
  const [filtro, setFiltro] = useState<StatusPedido | 'todos'>('todos');
  const lista = useMemo(() => db.pedidos.filter((p) => filtro === 'todos' || p.status === filtro), [db.pedidos, filtro]);
  const nome = (id: string) => db.clientes.find((c) => c.id === id)?.nome ?? '—';
  const resumo = (p: (typeof db.pedidos)[number]) => p.itens.map((i) => `${i.qtd}× ${i.nome}`).join(', ');
  const seletor = (p: (typeof db.pedidos)[number]) => (
    <select className="fe-select-sm" value={p.status} onClick={(e) => e.stopPropagation()} onChange={(e) => statusPedido(p.id, e.target.value as StatusPedido)} aria-label="Status do pedido" style={{ minHeight: 34, padding: '5px 8px', fontSize: 13 }}>
      {STATUS_PEDIDO.map((s) => <option key={s}>{s}</option>)}
    </select>
  );

  return (
    <Pagina titulo="Encomendas" sub="Tudo que foi fechado nos pontos de venda e está em produção ou entrega." acoes={<button className="fe-btn fe-btn-primary" onClick={() => abrir('pedido')}><Icon name="plus" /> Novo pedido</button>}>
      <div className="fe-toolbar">
        <div className="fe-seg" role="group" aria-label="Visualização">
          <button type="button" className={modo === 'lista' ? 'fe-on' : ''} onClick={() => trocarModo('lista')}>Lista</button>
          <button type="button" className={modo === 'kanban' ? 'fe-on' : ''} onClick={() => trocarModo('kanban')}>Kanban</button>
        </div>
        {modo === 'lista' && <div className="fe-chips">
          {(['todos', ...STATUS_PEDIDO] as const).map((s) => <button key={s} className={'fe-chip' + (filtro === s ? ' fe-on' : '')} onClick={() => setFiltro(s)}>{s === 'todos' ? 'Todos' : s}</button>)}
        </div>}
      </div>

      {modo === 'kanban' && (
        <>
          <div className="fe-stage-tabs" role="tablist">
            {STATUS_PEDIDO.map((st) => <button key={st} role="tab" aria-selected={statusM === st} className={statusM === st ? 'fe-on' : ''} onClick={() => setStatusM(st)}>{st}<b>{db.pedidos.filter((p) => p.status === st).length}</b></button>)}
          </div>
          <div className="fe-kanban">
            {STATUS_PEDIDO.map((st) => {
              const col = db.pedidos.filter((p) => p.status === st).sort((a, b) => a.entrega.localeCompare(b.entrega));
              return (
                <section key={st} className={'fe-col' + (sobre === st ? ' fe-over' : '') + (statusM === st ? ' fe-m-on' : '')} aria-label={st}
                  onDragOver={(ev) => { ev.preventDefault(); setSobre(st); }} onDragLeave={() => setSobre((x) => (x === st ? null : x))} onDrop={() => soltar(st)}>
                  <div className="fe-col-head"><h3>{st}</h3><span className="fe-n">{col.length}</span></div>
                  <div className="fe-col-sum">{col.length ? brlCurto(col.reduce((sum, p) => sum + totalPedido(p), 0)) : 'Nada por aqui'}</div>
                  {col.length === 0 && <div className="fe-col-empty">Arraste um pedido para cá</div>}
                  {col.map((p) => (
                    <div key={p.id} className={'fe-deal' + (arrastando === p.id ? ' fe-dragging' : '')} draggable onDragStart={() => setArrastando(p.id)} onDragEnd={() => setArrastando(null)}
                      role="button" tabIndex={0} onClick={() => abrir('pedido', p.id)} onKeyDown={(e) => e.key === 'Enter' && abrir('pedido', p.id)} style={{ cursor: 'pointer' }}>
                      <div className="fe-row"><span className="fe-who">{nome(p.clienteId)}</span><span className={'fe-badge fe-' + COR[p.status]}>{p.status}</span></div>
                      <div className="fe-what">{resumo(p)}</div>
                      <div className="fe-row"><span className="fe-val">{brl(totalPedido(p))}</span></div>
                      <div className="fe-follow"><Icon name="clock" size={13} />Entrega {dataCurta(p.entrega)}</div>
                    </div>
                  ))}
                </section>
              );
            })}
          </div>
        </>
      )}

      {modo === 'lista' && <div className="fe-card">
        {lista.length === 0 ? <Vazio titulo="Nenhum pedido" texto="Ao fechar uma negociação, o pedido é criado aqui automaticamente." /> : (
          <>
            <div className="fe-tbl-wrap"><table className="fe-tbl">
              <thead><tr><th>Cliente</th><th>Itens</th><th>Status</th><th>Entrega</th><th className="fe-num">Horas</th><th className="fe-num">Total</th></tr></thead>
              <tbody>{lista.map((p) => (
                <tr key={p.id} onClick={() => abrir('pedido', p.id)}>
                  <td className="fe-nm">{nome(p.clienteId)}</td><td style={{ maxWidth: 280 }}><div className="fe-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resumo(p)}</div></td>
                  <td>{seletor(p)}</td><td>{dataCurta(p.entrega)}</td><td className="fe-num">{horasPedido(p).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</td><td className="fe-num"><b>{brl(totalPedido(p))}</b></td>
                </tr>))}</tbody></table></div>
            <div className="fe-cards-m" style={{ padding: 12 }}>
              {lista.map((p) => (
                <div key={p.id} className="fe-list-item" role="button" tabIndex={0} onClick={() => abrir('pedido', p.id)} style={{ cursor: 'pointer' }}>
                  <div className="fe-grow"><div className="fe-t">{nome(p.clienteId)}</div><div className="fe-s">{resumo(p)}</div><div style={{ marginTop: 6 }}><span className={'fe-badge fe-' + COR[p.status]}>{p.status}</span> <span className="fe-s">· entrega {dataCurta(p.entrega)}</span></div></div>
                  <b>{brl(totalPedido(p))}</b>
                </div>))}
            </div>
          </>
        )}
      </div>}
    </Pagina>
  );
}
