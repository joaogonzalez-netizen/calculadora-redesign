import { PEDIDOS_RECENTES } from '../../lib/dashboardMock';

export default function PedidosRecentes() {
  return (
    <div className="card list-card">
      <div className="card-body list-body">
        <div className="list-head">
          <h4>Pedidos recentes</h4>
          <a href="#pedidos">Ver todos</a>
        </div>
        {PEDIDOS_RECENTES.map((p) => (
          <div className="pedido-row" key={p.id}>
            <span className="pedido-canal">{p.canalSigla}</span>
            <div className="pedido-main">
              <div className="pedido-nome">{p.produto}</div>
              <div className="pedido-meta">{p.quando} · {p.codigo}</div>
            </div>
            <span className="pedido-comprador">{p.comprador}</span>
            <span className="pedido-valor">{p.valor}</span>
            <span className="pedido-status">• {p.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
