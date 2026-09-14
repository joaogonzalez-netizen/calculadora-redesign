import { useCalculadora } from '../context/CalculadoraContext';
import { calcularRoas } from '../lib/calc';
import { useMoeda } from '../context/MoedaContext';
import { useI18n } from '../context/I18nContext';
import { fmtMoeda } from '../lib/format';
import Card from './Card';

export default function AdsCard() {
  const { state, set, resultado } = useCalculadora();
  const { moeda } = useMoeda();
  const { t } = useI18n();

  const metas = resultado && resultado.margem > 0 ? calcularRoas(resultado.precoConsumidor, resultado.margem) : null;

  return (
    <Card icon="📣" title={t('calc.adsTrafegoPago')}>
      <div className="acc-desc">Usa a margem que você já calculou, sem precisar informar investimento, CPC ou conversão.</div>
      <div className="switch-row">
        <label>{t('calc.mostrarMetasRoas')}</label>
        <label className="switch">
          <input type="checkbox" checked={state.adsAtivo} onChange={(e) => set('adsAtivo', e.target.checked)} />
          <span className="track" />
        </label>
      </div>
      {state.adsAtivo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!metas && <div className="hint">Calcule o preço com margem positiva pra ver as metas de ROAS.</div>}
          {metas && (
            <>
              <div className="hint" style={{ marginBottom: 2 }}>
                Retorno mínimo sobre cada R$1 investido, com base na margem atual ({resultado!.margem.toFixed(1).replace('.', ',')}%):
              </div>
              {metas.map((m) => {
                const corClass = m.alvoPct === 0 ? 'm-red' : m.alvoPct === 15 ? 'm-gold' : 'm-green';
                return (
                  <div className={'roas-card ' + corClass} key={m.label}>
                    <div><div className="rc-label">{m.label}</div><div className="rc-desc">{m.desc}</div></div>
                    <div className="rc-right">
                      <div className="rc-val">{m.valor !== null ? m.valor.toFixed(2) + 'x' : t('calc.inatingivel')}</div>
                      <div className="rc-sub">{m.valor !== null ? fmtMoeda(m.lucroAlvo, moeda) + ' ' + t('calc.deLucroPorPedido') : t('calc.margemPrecisaSerMaiorQue') + ' ' + m.alvoPct + '%'}</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
