import { TOP_PRODUTOS } from '../../lib/dashboardMock';

export default function TopProdutos() {
  return (
    <div className="card list-card">
      <div className="card-body list-body">
        <div className="list-head">
          <h4>Top produtos</h4>
          <a href="#catalogo">Catálogo</a>
        </div>
        {TOP_PRODUTOS.map((p) => (
          <div className="prod-row" key={p.rank}>
            <span className="prod-rank">#{p.rank}</span>
            <div className="prod-main">
              <div className="prod-nome">{p.nome}</div>
              <div className="prod-meta">{p.vendas} vendas · margem {p.margemPct}%</div>
              <div className="prod-bar"><span style={{ width: p.barra + '%' }} /></div>
            </div>
            <span className="prod-valor">{p.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
