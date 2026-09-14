import { useState, type MouseEvent } from 'react';
import { MAX_Y, SERIE_LUCRO, TICKS_Y, type PontoSerie } from '../../lib/dashboardMock';
import { useI18n } from '../../context/I18nContext';

type Serie = 'receita' | 'pedidos' | 'lucro';

const SERIES = [
  { key: 'faturamento' as const, chaveLabel: 'dashboard.faturamento', cor: 'var(--primary)' },
  { key: 'custos' as const, chaveLabel: 'dashboard.custos', cor: 'var(--chart-custos)' },
  { key: 'lucro' as const, chaveLabel: 'dashboard.lucro', cor: 'var(--accent)' },
];

const pontos = SERIE_LUCRO;
const n = pontos.length;

/** Coordenadas em % do viewBox 0–100, pra o SVG poder esticar junto com o card. */
const px = (i: number) => (i / (n - 1)) * 100;
const py = (v: number) => (1 - v / MAX_Y) * 100;

function linha(campo: keyof Pick<PontoSerie, 'faturamento' | 'custos' | 'lucro'>) {
  return pontos.map((p, i) => `${px(i)},${py(p[campo])}`).join(' ');
}

const areaFaturamento =
  `M0,${py(pontos[0].faturamento)} ` +
  pontos.map((p, i) => `L${px(i)},${py(p.faturamento)}`).join(' ') +
  ' L100,100 L0,100 Z';

function fmt(v: number) {
  return 'R$ ' + v.toLocaleString('pt-BR');
}

function fmtTick(v: number) {
  if (v === 0) return 'R$ 0';
  if (v >= 1000) {
    const k = v / 1000;
    return 'R$ ' + (Number.isInteger(k) ? k : k.toFixed(1).replace('.', ',')) + 'k';
  }
  return 'R$ ' + v;
}

export default function LucroChart() {
  const { t } = useI18n();
  const [serie, setSerie] = useState<Serie>('lucro');
  const [hover, setHover] = useState<number | null>(null);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(ratio * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, idx)));
  }

  const ativo = hover !== null ? pontos[hover] : null;
  // Com o ponto na metade direita, o tooltip vira pra esquerda pra não vazar do card.
  const tooltipEsquerda = hover !== null && px(hover) > 40;
  // A linha de faturamento corre na parte alta do gráfico; sem esse limite o balão
  // (centrado no ponto) subiria por cima dos controles do card.
  const tooltipTop = ativo ? Math.min(72, Math.max(28, py(ativo.faturamento))) : 0;

  return (
    <div className="card chart-card">
      <div className="chart-head">
        <div>
          <h4>{t('dashboard.lucroAoLongoDoTempo')}</h4>
          <div className="chart-sub">{t('dashboard.faturamentoCustosTodosMarketplaces')}</div>
        </div>
        <div className="chart-controls">
          <button type="button" className="ctl-btn">⇄ {t('dashboard.comparar')}</button>
          <button type="button" className="ctl-btn">{t('dashboard.ultimos30Dias')} <span className="ctl-caret">▾</span></button>
          <button type="button" className="ctl-btn">{t('dashboard.semanal')} <span className="ctl-caret">▾</span></button>
          <div className="seg">
            {(['receita', 'pedidos', 'lucro'] as Serie[]).map((s) => (
              <button key={s} type="button" className={'seg-btn' + (serie === s ? ' active' : '')} onClick={() => setSerie(s)}>
                {s === 'receita' ? t('dashboard.receita') : s === 'pedidos' ? t('dashboard.pedidos') : t('dashboard.lucro')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-yaxis">
          {TICKS_Y.map((t) => (
            <span key={t} style={{ top: py(t) + '%' }}>{fmtTick(t)}</span>
          ))}
        </div>

        <div className="chart-plot" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="fatFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.16" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {TICKS_Y.map((t) => (
              <line
                key={t} x1="0" x2="100" y1={py(t)} y2={py(t)}
                stroke="var(--chart-grid)" strokeWidth="1" vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={areaFaturamento} fill="url(#fatFill)" />
            {SERIES.map((s) => (
              <polyline
                key={s.key} points={linha(s.key)} fill="none" stroke={s.cor}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {ativo && hover !== null && (
            <>
              <div className="chart-guide" style={{ left: px(hover) + '%' }} />
              <div className="chart-dot" style={{ left: px(hover) + '%', top: py(ativo.faturamento) + '%' }} />
              <div
                className={'chart-tooltip' + (tooltipEsquerda ? ' left' : '')}
                style={{ left: px(hover) + '%', top: tooltipTop + '%' }}
              >
                <div className="tt-title">{ativo.label} · {ativo.periodo}</div>
                {SERIES.map((s) => (
                  <div className="tt-row" key={s.key}>
                    <span className="tt-key"><i style={{ background: s.cor }} />{t(s.chaveLabel)}</span>
                    <b style={{ color: s.cor }}>{fmt(ativo[s.key])}</b>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="chart-xaxis">
          {pontos.map((p) => <span key={p.label}>{p.label}</span>)}
        </div>
      </div>

      <div className="chart-legend">
        {SERIES.map((s) => (
          <span key={s.key}><i style={{ background: s.cor }} />{t(s.chaveLabel)}</span>
        ))}
      </div>
    </div>
  );
}
