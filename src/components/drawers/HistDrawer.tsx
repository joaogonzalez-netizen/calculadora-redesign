import { useEffect, useState } from 'react';
import type { HistoricoEntry } from '../../types';
import { brl } from '../../lib/format';
import { getHistorico, saveHistoricoArr } from '../../lib/storage';
import { useCalculadora } from '../../context/CalculadoraContext';

interface Props {
  entry: HistoricoEntry | null;
  onClose: () => void;
  onChange: () => void;
  onAbrirNaCalculadora: () => void;
}

export default function HistDrawer({ entry, onClose, onChange, onAbrirNaCalculadora }: Props) {
  const { restaurarHistorico } = useCalculadora();
  const [nome, setNome] = useState('');

  useEffect(() => { setNome(entry?.nome || ''); }, [entry]);

  if (!entry) return null;

  function salvarNome() {
    const all = getHistorico();
    const real = all.find((x) => x.id === entry!.id);
    if (real) { real.nome = nome.trim(); saveHistoricoArr(all); }
    onChange();
    onClose();
  }

  function excluir() {
    if (!confirm('Excluir "' + (entry!.nome || 'esse cálculo') + '" do histórico? Essa ação não pode ser desfeita.')) return;
    const all = getHistorico().filter((x) => x.id !== entry!.id);
    saveHistoricoArr(all);
    onChange();
    onClose();
  }

  function abrirNaCalculadora() {
    restaurarHistorico(entry!);
    onAbrirNaCalculadora();
    onClose();
  }

  const filLines = entry.filamentoItems && entry.filamentoItems.length
    ? entry.filamentoItems.map((f, i) => (
      <span key={i}>{f.nome || '-'}{f.cor ? ' (' + f.cor + ')' : ''} · {f.pesoG}g · {brl(f.precoKg)}/kg<br /></span>
    ))
    : <span>{brl(entry.custoFilamento || 0)}/kg</span>;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" style={{ width: 360 }}>
        <h4 style={{ marginBottom: 16 }}>Editar cálculo</h4>

        <div className="field" style={{ marginBottom: 18 }}>
          <label>Nome do cálculo</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
          <button className="btn-outline" style={{ marginTop: 8 }} onClick={salvarNome}>Salvar nome</button>
        </div>

        <div className="divider-label">Ver cálculo completo</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-2)', margin: '10px 0 20px' }}>
          <div><b style={{ color: 'var(--text-1)' }}>Canal:</b> {entry.marketplace || '-'}</div>
          <div><b style={{ color: 'var(--text-1)' }}>Preço sugerido:</b> {brl(entry.precoConsumidor)}</div>
          <div><b style={{ color: 'var(--text-1)' }}>Custo unitário:</b> {brl(entry.custoUnit)}</div>
          <div><b style={{ color: 'var(--text-1)' }}>Margem de contribuição:</b> {(entry.margem || 0).toFixed(1)}%</div>
          <div><b style={{ color: 'var(--text-1)' }}>Lucro líquido:</b> {brl(entry.lucroLiquido)}</div>
          <div><b style={{ color: 'var(--text-1)' }}>Potencial mensal:</b> {brl(entry.potMensal)}</div>
          <div><b style={{ color: 'var(--text-1)' }}>Peso:</b> {entry.peso || '-'} g</div>
          <div><b style={{ color: 'var(--text-1)' }}>Filamento:</b> {filLines}</div>
          <div><b style={{ color: 'var(--text-1)' }}>Tempo de impressão:</b> {(entry.tempoH || 0).toFixed(2)}h</div>
          <div><b style={{ color: 'var(--text-1)' }}>Link da biblioteca:</b> {entry.stlLink ? <a href={entry.stlLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-dark)' }}>{entry.stlLink}</a> : '-'}</div>
          <div><b style={{ color: 'var(--text-1)' }}>Referência concorrente:</b> {entry.concorrenteLink ? <a href={entry.concorrenteLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-dark)' }}>{entry.concorrenteLink}</a> : '-'}</div>
          <div><b style={{ color: 'var(--text-1)' }}>Salvo em:</b> {new Date(entry.id).toLocaleString('pt-BR')}</div>
        </div>

        <div className="divider-label">Ações</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          <button className="btn-outline" onClick={abrirNaCalculadora}>📂 Abrir na calculadora</button>
          <button className="btn-outline" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={excluir}>🗑 Excluir cálculo</button>
        </div>
      </div>
    </>
  );
}
