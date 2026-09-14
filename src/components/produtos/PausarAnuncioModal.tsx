import type { Produto } from '../../lib/produtosMock';
import { useI18n } from '../../context/I18nContext';

export default function PausarAnuncioModal({ produto, onClose, onConfirm }: { produto: Produto; onClose: () => void; onConfirm: () => void }) {
  const { t } = useI18n();
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="modal-center">
        <h4>{t('produtos.pausarEsteAnuncio')}</h4>
        <p>{t('produtos.oAnuncio')} <b>{produto.nome}</b> {t('produtos.ficaraInvisivel')} {produto.marketplace}.</p>
        <div className="alert" style={{ marginTop: 4 }}>
          Você pode reativar a qualquer momento sem perder histórico, estoque ou avaliações. Produto em outros marketplaces continuará funcionando normalmente.
        </div>
        <div className="cl-footer" style={{ marginTop: 18 }}>
          <button type="button" className="btn-outline" onClick={onClose}>{t('produtos.manterAtivo')}</button>
          <button type="button" className="btn-dark cl-btn-sm" onClick={onConfirm}>{t('produtos.pausarAnuncio')}</button>
        </div>
      </div>
    </>
  );
}
