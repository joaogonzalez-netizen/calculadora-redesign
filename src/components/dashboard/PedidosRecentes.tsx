import { PEDIDOS_RECENTES } from '../../lib/dashboardMock';
import { useI18n } from '../../context/I18nContext';

export default function PedidosRecentes() {
  const { t } = useI18n();
  return (
    <div className="card list-card">
      <div className="card-body list-body">
        <div className="list-head">
          <h4>{t('dashboard.pedidosRecentes')}</h4>
          <a href="#pedidos">{t('dashboard.verTodos')}</a>
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
