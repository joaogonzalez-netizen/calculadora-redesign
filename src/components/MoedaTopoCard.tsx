import type { Moeda } from '../types';
import { useMoeda } from '../context/MoedaContext';
import { useI18n } from '../context/I18nContext';

const OPTS: { m: Moeda; label: string }[] = [
  { m: 'BRL', label: 'R$' },
  { m: 'USD', label: 'US$' },
  { m: 'EUR', label: '€' },
  { m: 'ARS', label: 'AR$' },
];

export default function MoedaTopoCard() {
  const { moeda, setMoeda } = useMoeda();
  const { t } = useI18n();
  return (
    <div className="card">
      <div className="card-body" style={{ padding: '14px 24px', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 16 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap' }}>{t('calc.moedaDeExibicao')}</label>
        <div className="chip-row sm">
          {OPTS.map((o) => (
            <button key={o.m} type="button" className={'chip sm' + (moeda === o.m ? ' active' : '')} onClick={() => setMoeda(o.m)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
