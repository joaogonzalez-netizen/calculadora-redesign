import { TOP_PRODUTOS } from '../../lib/dashboardMock';
import { useI18n } from '../../context/I18nContext';

export default function TopProdutos() {
  const { t } = useI18n();
  return (
    <div className="card list-card">
      <div className="card-body list-body">
        <div className="list-head">
          <h4>{t('dashboard.topProdutos')}</h4>
          <a href="#catalogo">{t('dashboard.catalogo')}</a>
        </div>
        {TOP_PRODUTOS.map((p) => (
          <div className="prod-row" key={p.rank}>
            <span className="prod-rank">#{p.rank}</span>
            <div className="prod-main">
              <div className="prod-nome">{p.nome}</div>
              <div className="prod-meta">{t('dashboard.vendasMargem').replace('{vendas}', String(p.vendas)).replace('{margem}', String(p.margemPct))}</div>
              <div className="prod-bar"><span style={{ width: p.barra + '%' }} /></div>
            </div>
            <span className="prod-valor">{p.valor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
