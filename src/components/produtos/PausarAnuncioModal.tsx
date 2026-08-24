import type { Produto } from '../../lib/produtosMock';

export default function PausarAnuncioModal({ produto, onClose, onConfirm }: { produto: Produto; onClose: () => void; onConfirm: () => void }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="modal-center">
        <h4>Pausar este anúncio?</h4>
        <p>O anúncio <b>{produto.nome}</b> ficará invisível para compradores no {produto.marketplace}.</p>
        <div className="alert" style={{ marginTop: 4 }}>
          Você pode reativar a qualquer momento sem perder histórico, estoque ou avaliações. Produto em outros marketplaces continuará funcionando normalmente.
        </div>
        <div className="cl-footer" style={{ marginTop: 18 }}>
          <button type="button" className="btn-outline" onClick={onClose}>Manter ativo</button>
          <button type="button" className="btn-dark cl-btn-sm" onClick={onConfirm}>Pausar anúncio</button>
        </div>
      </div>
    </>
  );
}
