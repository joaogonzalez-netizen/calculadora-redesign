import type { Produto } from '../../lib/produtosMock';
import Icon from '../Icon';

export default function ProdutoDetailDrawer({ produto, onClose }: { produto: Produto; onClose: () => void }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer pd-drawer">
        <div className="pd-head">
          <div>
            <h4>{produto.nome}</h4>
            <div className="pd-sub">#{produto.sku}</div>
            <div className="pd-tags">
              <span className="mp-tag">{produto.marketplace}</span>
              <span className={'status-tag status-' + produto.status.toLowerCase()}>{produto.status}</span>
            </div>
          </div>
          <button type="button" className="cl-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>

        <div className="pd-section-title">Galeria do anúncio</div>
        <div className="pd-gallery">
          {Array.from({ length: 2 }).map((_, i) => <div className="pd-img-ph" key={i} />)}
          <div className="pd-img-add">+ {produto.imagensQtd - 2} fotos</div>
        </div>

        <div className="pd-section-title">Informações principais</div>
        <div className="pd-info-grid">
          <div className="pd-info-cell"><span>Preço</span><b>{produto.preco}</b><small>BRL</small></div>
          <div className="pd-info-cell"><span>Estoque total</span><b>{produto.estoque} unidades</b><small>Com variações</small></div>
          <div className="pd-info-cell"><span>Vendidos</span><b>{produto.vendidos} unidades</b><small>Histórico do anúncio</small></div>
          <div className="pd-info-cell"><span>Categoria</span><b>{produto.categoria}</b><small>{produto.categoriaSub}</small></div>
        </div>

        <div className="pd-section-title">Configurações do anúncio</div>
        <div className="pd-config-list">
          <div><span>Controlado pelo catálogo ML</span><b>{produto.controladoCatalogoMl ? 'Sim' : 'Não'}</b></div>
          <div><span>Inventário Mercado Livre</span><b>{produto.inventarioMl ? 'Sim' : 'Não'}</b></div>
          <div><span>Possui variações</span><b>{produto.variacoes.length > 0 ? 'Sim' : 'Não'}</b></div>
          <div><span>Link público</span><b>{produto.linkPublico ? 'Disponível' : 'Indisponível'}</b></div>
        </div>

        <div className="pd-section-title">Variações <span className="pd-count">{produto.variacoes.length} cadastradas</span></div>
        {produto.variacoes.map((v) => (
          <div className="pd-var-row" key={v.sku}>
            <div className="pd-var-top">
              <span className="pd-swatch" style={{ background: v.cor, borderColor: v.cor === '#e7e9e8' ? '#d7dad8' : v.cor }} />
              <div className="pd-var-main"><b>{v.nome}</b><small>{v.sku}</small></div>
              <b className="pd-var-preco">{v.preco}</b>
            </div>
            <div className="pd-var-nums"><span>Estoque<br /><b>{v.estoque} un.</b></span><span>Vendidos<br /><b>{v.vendidos} un.</b></span></div>
            <div className="bar-bg"><div className="bar-fill bar-green" style={{ width: v.participacaoPct + '%' }} /></div>
            <div className="pd-var-pct">Participação nas vendas <b>{v.participacaoPct}%</b></div>
          </div>
        ))}

        <div className="pd-footer">
          <button type="button" className="btn-outline">Editar anúncio</button>
          <button type="button" className="btn-dark">Atualizar estoque</button>
        </div>
      </div>
    </>
  );
}
