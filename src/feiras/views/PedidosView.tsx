import { useMemo, useState } from 'react';
import { useStore, totalPedido, horasPedido } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl, dataCurta } from '../lib/format';
import { STATUS_PEDIDO, type StatusPedido } from '../lib/types';
import { Pagina, Vazio } from '../components/ui';
import Icon from '../components/Icon';

const COR: Record<StatusPedido, string> = { 'Na fila': 'amber', Imprimindo: 'blue', Pronto: 'green', Entregue: 'green', Pago: 'green', Cancelado: 'red' };

export default function PedidosView() {
  const { db, statusPedido } = useStore();
  const { abrir } = useUi();
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
      <div className="fe-toolbar"><div className="fe-chips">
        {(['todos', ...STATUS_PEDIDO] as const).map((s) => <button key={s} className={'fe-chip' + (filtro === s ? ' fe-on' : '')} onClick={() => setFiltro(s)}>{s === 'todos' ? 'Todos' : s}</button>)}
      </div></div>
      <div className="fe-card">
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
      </div>
    </Pagina>
  );
}
