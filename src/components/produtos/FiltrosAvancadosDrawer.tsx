import { useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

export interface FaixaFiltro { min: string; max: string; }

interface Props {
  onClose: () => void;
  onApply: (valor: FaixaFiltro, estoque: FaixaFiltro) => void;
}

export default function FiltrosAvancadosDrawer({ onClose, onApply }: Props) {
  const { t } = useI18n();
  const [valor, setValor] = useState<FaixaFiltro>({ min: '', max: '' });
  const [estoque, setEstoque] = useState<FaixaFiltro>({ min: '', max: '' });

  function limpar() { setValor({ min: '', max: '' }); setEstoque({ min: '', max: '' }); }
  function aplicar() { onApply(valor, estoque); onClose(); }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="cl-head">
          <h4>{t('produtos.filtrosAvancados')}</h4>
          <button type="button" className="cl-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>

        <div className="field" style={{ marginTop: 18 }}>
          <label>{t('produtos.faixaDeValor')}</label>
          <div className="hint">Filtre produtos dentro de uma faixa de preço de venda</div>
          <div className="row2">
            <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" value={valor.min} onChange={(e) => setValor({ ...valor, min: e.target.value })} /></div>
            <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" value={valor.max} onChange={(e) => setValor({ ...valor, max: e.target.value })} /></div>
          </div>
        </div>

        <div className="field" style={{ marginTop: 18 }}>
          <label>{t('produtos.faixaDeEstoque')}</label>
          <div className="hint">Mostre apenas produtos com estoque dentro do intervalo</div>
          <div className="row2">
            <input type="number" placeholder={t('produtos.minimoPlaceholder')} value={estoque.min} onChange={(e) => setEstoque({ ...estoque, min: e.target.value })} />
            <input type="number" placeholder={t('produtos.maximoPlaceholder')} value={estoque.max} onChange={(e) => setEstoque({ ...estoque, max: e.target.value })} />
          </div>
        </div>

        <div className="cl-footer" style={{ position: 'absolute', bottom: 22, left: 22, right: 22 }}>
          <button type="button" className="btn-outline" onClick={limpar}>{t('produtos.limparTudo')}</button>
          <button type="button" className="btn-dark cl-btn-sm" onClick={aplicar}>{t('produtos.aplicarFiltros')}</button>
        </div>
      </div>
    </>
  );
}
