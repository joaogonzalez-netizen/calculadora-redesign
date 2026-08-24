import { useEffect, useState } from 'react';
import type { HistoricoEntry } from '../types';
import { brl } from '../lib/format';
import { getHistorico } from '../lib/storage';
import { useCalculadora } from '../context/CalculadoraContext';
import HistDrawer from '../components/drawers/HistDrawer';

type SortKey = 'nome' | 'precoConsumidor' | 'lucroLiquido' | 'margem' | 'potMensal' | 'id';

export default function HistoricoView({ onChange, onAbrirNaCalculadora }: { onChange: () => void; onAbrirNaCalculadora: () => void }) {
  const { restaurarHistorico } = useCalculadora();
  const [hist, setHist] = useState<HistoricoEntry[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [selected, setSelected] = useState<HistoricoEntry | null>(null);

  function reload() {
    const arr = [...getHistorico()].sort((a, b) => ((a[sortKey] as any) > (b[sortKey] as any) ? 1 : -1) * sortDir);
    setHist(arr);
  }

  useEffect(reload, [sortKey, sortDir]);

  function sortHist(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d * -1) as 1 | -1);
    else { setSortKey(key); setSortDir(-1); }
  }

  function handleChange() {
    reload();
    onChange();
  }

  function abrirNaCalculadora(h: HistoricoEntry) {
    restaurarHistorico(h);
    onAbrirNaCalculadora();
  }

  return (
    <div>
      <div className="hero"><h1>Histórico de <span className="accent">cálculos</span></h1><p>Clique no nome do produto pra abrir o cálculo na calculadora. Use o botão "Ações" pra ver o cálculo completo, renomear ou excluir.</p></div>
      <div className="card">
        <div className="card-body" style={{ paddingTop: 22 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-3)' }}>
                <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('nome')}>Produto</th>
                <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('precoConsumidor')}>Preço final ↕</th>
                <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('lucroLiquido')}>Lucro ↕</th>
                <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('margem')}>Margem ↕</th>
                <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('potMensal')}>Pot. mensal ↕</th>
                <th style={{ padding: 10 }}>Canal</th>
                <th style={{ padding: 10 }}>Fonte STL</th>
                <th style={{ padding: 10 }}>Concorrente</th>
                <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('id')}>Data ↕</th>
                <th style={{ padding: 10 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {hist.map((h) => (
                <tr key={h.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: 10 }}>
                    <button
                      type="button"
                      onClick={() => abrirNaCalculadora(h)}
                      style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary-dark)', fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontSize: 13 }}
                    >
                      {h.nome || '-'}
                    </button>
                  </td>
                  <td style={{ padding: 10 }}>{brl(h.precoConsumidor)}</td>
                  <td style={{ padding: 10 }}>{brl(h.lucroLiquido)}</td>
                  <td style={{ padding: 10 }}>{(h.margem || 0).toFixed(1)}%</td>
                  <td style={{ padding: 10 }}>{brl(h.potMensal)}</td>
                  <td style={{ padding: 10 }}>{h.marketplace || '-'}</td>
                  <td style={{ padding: 10 }}>
                    {h.stlLink
                      ? <button type="button" className="btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => window.open(h.stlLink, '_blank')}>Ver STL</button>
                      : '-'}
                  </td>
                  <td style={{ padding: 10 }}>
                    {h.concorrenteLink
                      ? <button type="button" className="btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => window.open(h.concorrenteLink, '_blank')}>Ver anúncio</button>
                      : '-'}
                  </td>
                  <td style={{ padding: 10 }}>{new Date(h.id).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: 10 }}><button className="btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setSelected(h)}>Ações</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!hist.length && <div className="hint" style={{ textAlign: 'center', padding: 24 }}>Nenhum cálculo salvo ainda.</div>}
        </div>
      </div>

      <HistDrawer entry={selected} onClose={() => setSelected(null)} onChange={handleChange} onAbrirNaCalculadora={onAbrirNaCalculadora} />
    </div>
  );
}
