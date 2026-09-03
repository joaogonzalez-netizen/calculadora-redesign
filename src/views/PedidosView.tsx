import { useMemo, useState } from 'react';
import { PEDIDOS, PEDIDOS_KPIS, type Pedido } from '../lib/pedidosMock';
import { brl } from '../lib/format';
import Icon from '../components/Icon';
import PopoverList from '../components/produtos/PopoverList';
import PedidoDrawer from '../components/pedidos/PedidoDrawer';

const PERIODOS = ['Maio 2026', 'Abril 2026', 'Março 2026'];
const CONTAS = ['Todas', 'Mercado Livre', 'Shopee'];
const STATUS_OPTS = ['Todos', 'Pago', 'Enviado', 'Pendente', 'Cancelado', 'Entregue'];

const STATUS_CLASSE: Record<Pedido['status'], string> = {
  Pago: 'ped-status-pago',
  Enviado: 'ped-status-enviado',
  Pendente: 'ped-status-pendente',
  Cancelado: 'ped-status-cancelado',
  Entregue: 'ped-status-entregue',
};
const PAGAMENTO_CLASSE: Record<Pedido['pagamento'], string> = {
  Aprovado: 'ped-status-entregue',
  Pendente: 'ped-status-pendente',
  Reembolsado: 'ped-status-cancelado',
};

function alertaEmBreve(acao: string) {
  alert(`Em breve: ${acao}.`);
}

export default function PedidosView() {
  const [busca, setBusca] = useState('');
  const [periodo, setPeriodo] = useState(PERIODOS[0]);
  const [conta, setConta] = useState(CONTAS[1]);
  const [status, setStatus] = useState(STATUS_OPTS[0]);
  const [selecionado, setSelecionado] = useState<Pedido | null>(null);

  const pedidos = useMemo(() => {
    let lista = [...PEDIDOS];
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      lista = lista.filter((p) => p.produto.toLowerCase().includes(termo) || p.comprador.toLowerCase().includes(termo) || p.codigoMlb.toLowerCase().includes(termo));
    }
    if (conta !== 'Todas') lista = lista.filter((p) => p.marketplace === conta);
    if (status !== 'Todos') lista = lista.filter((p) => p.status === status);
    return lista;
  }, [busca, conta, status]);

  const exibidos = pedidos.slice(0, 10);

  return (
    <div>
      <div className="hero">
        <h1>Pedidos</h1>
        <p>Acompanhe vendas, pagamentos, envio e margem estimada dos marketplaces conectados.</p>
      </div>

      <div className="prod-actions-row">
        <button type="button" className="btn-outline" onClick={() => alertaEmBreve('exportar pedidos em CSV')}>Exportar CSV</button>
        <button type="button" className="btn-dark" onClick={() => alertaEmBreve('sincronização de pedidos')}>Sincronizar pedidos</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-head"><span>Pedidos</span></div>
          <div className="kpi-value"><span className="kpi-int">{PEDIDOS_KPIS.total}</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head"><span>Faturamento</span></div>
          <div className="kpi-value"><span className="kpi-dec">R$</span><span className="kpi-int">{PEDIDOS_KPIS.faturamento.toLocaleString('pt-BR')}</span><span className="kpi-dec">,00</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head"><span>Aguardando envio</span></div>
          <div className="kpi-value"><span className="kpi-int">{PEDIDOS_KPIS.aguardandoEnvio}</span><span className="kpi-dec">pedidos</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head"><span>Taxas estimadas</span></div>
          <div className="kpi-value"><span className="kpi-dec">R$</span><span className="kpi-int">{PEDIDOS_KPIS.taxasEstimadas.toLocaleString('pt-BR')}</span><span className="kpi-dec">,00</span></div>
        </div>
      </div>

      <div className="prod-filters-row">
        <div className="cl-search prod-search"><Icon name="search" size={15} /><input type="text" placeholder="Buscar por pedido, comprador, produto ou código de rastreio" value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
        <PopoverList label="Período" options={PERIODOS} value={periodo} onChange={setPeriodo} />
        <PopoverList label="Conta" options={CONTAS} value={conta} onChange={setConta} />
        <PopoverList label="Status" options={STATUS_OPTS} value={status} onChange={setStatus} />
        <button type="button" className="ctl-btn" onClick={() => alertaEmBreve('filtros avançados')}>▽ Filtros</button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="prod-table">
            <thead>
              <tr>
                <th>Pedido</th><th>Marketplace</th><th>Comprador</th><th>Status</th><th>Pagamento</th><th>Valor (total)</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {exibidos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="prod-name">{p.produto}</div>
                    <div className="prod-sku">#{p.codigoMlb} · {p.qtd} un. · {p.data}</div>
                  </td>
                  <td><span className="mp-tag">{p.marketplace}</span></td>
                  <td>
                    <div className="prod-name">{p.comprador}</div>
                    <div className="prod-sku">{p.compradorHandle}</div>
                  </td>
                  <td><span className={'ped-status ' + STATUS_CLASSE[p.status]}>{p.status}</span></td>
                  <td><span className={'ped-status ' + PAGAMENTO_CLASSE[p.pagamento]}>{p.pagamento}</span></td>
                  <td>
                    <b>{brl(p.valorTotal)}</b>
                    <div className="ped-taxa-inline">Taxa: {brl(p.valorTotal * p.taxaPct)}</div>
                  </td>
                  <td>
                    <div className="prod-acoes">
                      <button type="button" title="Ver pedido" onClick={() => setSelecionado(p)}><Icon name="eye" size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!exibidos.length && <div className="hint" style={{ textAlign: 'center', padding: 24 }}>Nenhum pedido encontrado.</div>}
          <div className="prod-pagination">
            <span>Exibindo 1–{exibidos.length} de {PEDIDOS_KPIS.total} pedidos</span>
            <div className="prod-pages">
              <button type="button" className="page-btn">‹</button>
              <button type="button" className="page-btn active">1</button>
              <button type="button" className="page-btn">2</button>
              <button type="button" className="page-btn">3</button>
              <button type="button" className="page-btn">4</button>
              <span>…</span>
              <button type="button" className="page-btn">9</button>
              <button type="button" className="page-btn">›</button>
            </div>
          </div>
        </div>
      </div>

      {selecionado && <PedidoDrawer pedido={selecionado} onClose={() => setSelecionado(null)} />}
    </div>
  );
}
