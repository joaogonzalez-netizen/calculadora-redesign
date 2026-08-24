import { useCalculadora } from '../context/CalculadoraContext';
import Card from './Card';
import InfoDot from './InfoDot';

export default function PrecificacaoCard() {
  const { state, set, errorIds } = useCalculadora();

  return (
    <Card icon="$" title="Precificação">
      <div className="field">
        <label>Como prefere precificar?</label>
        <div className="toggle-cards cols-2">
          <div className={'toggle-card' + (state.modoPrec === 'preco' ? ' active' : '')} onClick={() => set('modoPrec', 'preco')}>
            <b>Tenho um preço alvo</b><span>Já tenho um teto em mente e gostaria de usá-lo</span>
          </div>
          <div className={'toggle-card' + (state.modoPrec === 'margem' ? ' active' : '')} onClick={() => set('modoPrec', 'margem')}>
            <b>Quero uma margem mínima</b><span>Quero definir meu lucro eu mesmo</span>
          </div>
        </div>
      </div>

      {state.modoPrec === 'preco' && (
        <div className="field">
          <label>Preço de venda (R$)</label>
          <div className="prefix-wrap">
            <span className="pfx">R$</span>
            <input
              type="number" step="0.01" placeholder="Ex: 49,90"
              value={state.precoVenda || ''}
              onChange={(e) => set('precoVenda', parseFloat(e.target.value) || 0)}
              className={errorIds.has('precoVenda') ? 'input-error' : ''}
            />
          </div>
        </div>
      )}
      {state.modoPrec === 'margem' && (
        <div className="field">
          <label>Margem desejada (%)</label>
          <div className="suffix-wrap"><input type="number" value={state.margemDesejada} onChange={(e) => set('margemDesejada', parseFloat(e.target.value) || 0)} /><span className="sfx">%</span></div>
        </div>
      )}

      <div className="field">
        <label>Imposto (%)</label>
        <div className="suffix-wrap"><input type="number" step="0.1" value={state.imposto} onChange={(e) => set('imposto', parseFloat(e.target.value) || 0)} /><span className="sfx">%</span></div>
        <div className="hint">Ex: Simples Nacional 6–12%</div>
      </div>

      <div className="switch-row">
        <label>Calcular com promoção?</label>
        <label className="switch">
          <input type="checkbox" checked={state.comPromo} onChange={(e) => set('comPromo', e.target.checked)} />
          <span className="track" />
        </label>
      </div>
      {state.comPromo && (
        <div className="field">
          <label>Desconto da promoção (%) <InfoDot text='O preço de tabela sai "inflado" por esse %, pra que depois do desconto aplicado na promoção, o valor líquido recebido continue protegendo a margem calculada.' /></label>
          <div className="suffix-wrap"><input type="number" step="0.1" value={state.descontoPromo} onChange={(e) => set('descontoPromo', parseFloat(e.target.value) || 0)} /><span className="sfx">%</span></div>
          <div className="hint">Ex: cupom de 10% off, campanha de aniversário, Black Friday...</div>
        </div>
      )}
    </Card>
  );
}
