import { useCalculadora } from '../context/CalculadoraContext';
import { useI18n } from '../context/I18nContext';
import Card from './Card';
import InfoDot from './InfoDot';

export default function PrecificacaoCard() {
  const { state, set, errorIds } = useCalculadora();
  const { t } = useI18n();

  return (
    <Card icon="$" title={t('calc.precificacao')}>
      <div className="field">
        <label>{t('calc.comoPreferePrecificar')}</label>
        <div className="toggle-cards cols-2">
          <div className={'toggle-card' + (state.modoPrec === 'preco' ? ' active' : '')} onClick={() => set('modoPrec', 'preco')}>
            <b>{t('calc.tenhoPrecoAlvo')}</b><span>{t('calc.tenhoPrecoAlvoDesc')}</span>
          </div>
          <div className={'toggle-card' + (state.modoPrec === 'margem' ? ' active' : '')} onClick={() => set('modoPrec', 'margem')}>
            <b>{t('calc.queroMargemMinima')}</b><span>{t('calc.queroMargemMinimaDesc')}</span>
          </div>
        </div>
      </div>

      {state.modoPrec === 'preco' && (
        <div className="field">
          <label>{t('calc.precoDeVenda')}</label>
          <div className="prefix-wrap">
            <span className="pfx">R$</span>
            <input
              type="number" step="0.01" placeholder={t('calc.placeholderPrecoVenda')}
              value={state.precoVenda || ''}
              onChange={(e) => set('precoVenda', parseFloat(e.target.value) || 0)}
              className={errorIds.has('precoVenda') ? 'input-error' : ''}
            />
          </div>
        </div>
      )}
      {state.modoPrec === 'margem' && (
        <div className="field">
          <label>{t('calc.margemDesejada')}</label>
          <div className="suffix-wrap"><input type="number" value={state.margemDesejada} onChange={(e) => set('margemDesejada', parseFloat(e.target.value) || 0)} /><span className="sfx">%</span></div>
        </div>
      )}

      <div className="field">
        <label>{t('calc.impostoPct')}</label>
        <div className="suffix-wrap"><input type="number" step="0.1" value={state.imposto} onChange={(e) => set('imposto', parseFloat(e.target.value) || 0)} /><span className="sfx">%</span></div>
        <div className="hint">Ex: Simples Nacional 6–12%</div>
      </div>

      <div className="switch-row">
        <label>{t('calc.calcularComPromocao')}</label>
        <label className="switch">
          <input type="checkbox" checked={state.comPromo} onChange={(e) => set('comPromo', e.target.checked)} />
          <span className="track" />
        </label>
      </div>
      {state.comPromo && (
        <div className="field">
          <label>{t('calc.descontoDaPromocao')} <InfoDot text='O preço de tabela sai "inflado" por esse %, pra que depois do desconto aplicado na promoção, o valor líquido recebido continue protegendo a margem calculada.' /></label>
          <div className="suffix-wrap"><input type="number" step="0.1" value={state.descontoPromo} onChange={(e) => set('descontoPromo', parseFloat(e.target.value) || 0)} /><span className="sfx">%</span></div>
          <div className="hint">Ex: cupom de 10% off, campanha de aniversário, Black Friday...</div>
        </div>
      )}
    </Card>
  );
}
