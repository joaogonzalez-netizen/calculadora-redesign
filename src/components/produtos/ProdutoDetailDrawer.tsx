import type { Produto } from '../../lib/produtosMock';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

function traduzirStatusProduto(t: (chave: string) => string, s: string) {
  if (s === 'Ativo') return t('produtos.statusAtivo');
  if (s === 'Pausado') return t('produtos.statusPausado');
  if (s === 'Esgotado') return t('produtos.statusEsgotado');
  return s;
}

export default function ProdutoDetailDrawer({ produto, onClose }: { produto: Produto; onClose: () => void }) {
  const { t } = useI18n();
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
              <span className={'status-tag status-' + produto.status.toLowerCase()}>{traduzirStatusProduto(t, produto.status)}</span>
            </div>
          </div>
          <button type="button" className="cl-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>

        <div className="pd-section-title">{t('produtos.galeriaDoAnuncio')}</div>
        <div className="pd-gallery">
          {Array.from({ length: 2 }).map((_, i) => <div className="pd-img-ph" key={i} />)}
          <div className="pd-img-add">+ {produto.imagensQtd - 2} {t('produtos.fotosPlural')}</div>
        </div>

        <div className="pd-section-title">{t('produtos.informacoesPrincipais')}</div>
        <div className="pd-info-grid">
          <div className="pd-info-cell"><span>{t('produtos.colunaPreco')}</span><b>{produto.preco}</b><small>BRL</small></div>
          <div className="pd-info-cell"><span>{t('produtos.estoqueTotal')}</span><b>{produto.estoque} {t('produtos.unidades')}</b><small>{t('produtos.comVariacoes')}</small></div>
          <div className="pd-info-cell"><span>{t('produtos.colunaVendidos')}</span><b>{produto.vendidos} {t('produtos.unidades')}</b><small>{t('produtos.historicoDoAnuncio')}</small></div>
          <div className="pd-info-cell"><span>{t('produtos.categoria')}</span><b>{produto.categoria}</b><small>{produto.categoriaSub}</small></div>
        </div>

        <div className="pd-section-title">{t('produtos.configuracoesDoAnuncio')}</div>
        <div className="pd-config-list">
          <div><span>{t('produtos.controladoPeloCatalogoMl')}</span><b>{produto.controladoCatalogoMl ? t('produtos.sim') : t('produtos.nao')}</b></div>
          <div><span>{t('produtos.inventarioMercadoLivre')}</span><b>{produto.inventarioMl ? t('produtos.sim') : t('produtos.nao')}</b></div>
          <div><span>{t('produtos.possuiVariacoes')}</span><b>{produto.variacoes.length > 0 ? t('produtos.sim') : t('produtos.nao')}</b></div>
          <div><span>{t('produtos.linkPublico')}</span><b>{produto.linkPublico ? t('produtos.disponivel') : t('produtos.indisponivel')}</b></div>
        </div>

        <div className="pd-section-title">{t('produtos.variacoes')} <span className="pd-count">{produto.variacoes.length} {t('produtos.cadastradas')}</span></div>
        {produto.variacoes.map((v) => (
          <div className="pd-var-row" key={v.sku}>
            <div className="pd-var-top">
              <span className="pd-swatch" style={{ background: v.cor, borderColor: v.cor === '#e7e9e8' ? '#d7dad8' : v.cor }} />
              <div className="pd-var-main"><b>{v.nome}</b><small>{v.sku}</small></div>
              <b className="pd-var-preco">{v.preco}</b>
            </div>
            <div className="pd-var-nums"><span>{t('produtos.colunaEstoque')}<br /><b>{v.estoque} un.</b></span><span>{t('produtos.colunaVendidos')}<br /><b>{v.vendidos} un.</b></span></div>
            <div className="bar-bg"><div className="bar-fill bar-green" style={{ width: v.participacaoPct + '%' }} /></div>
            <div className="pd-var-pct">{t('produtos.participacaoNasVendas')} <b>{v.participacaoPct}%</b></div>
          </div>
        ))}

        <div className="pd-footer">
          <button type="button" className="btn-outline">{t('produtos.editarAnuncio')}</button>
          <button type="button" className="btn-dark">{t('produtos.atualizarEstoque')}</button>
        </div>
      </div>
    </>
  );
}
