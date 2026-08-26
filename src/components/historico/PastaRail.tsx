import { useState } from 'react';
import type { HistoricoEntry } from '../../types';
import { corAleatoria, type Pasta } from '../../lib/cluster';
import Icon from '../Icon';
import ColorSwatches from './ColorSwatches';

interface Props {
  pastas: Pasta[];
  vinculo: Record<string, string>;
  hist: HistoricoEntry[];
  ativa: string | null; // null = todas, 'sem-pasta' = sem pasta
  onSelecionar: (id: string | null) => void;
  onCriar: (p: Pasta) => void;
}

export default function PastaRail({ pastas, vinculo, hist, ativa, onSelecionar, onCriar }: Props) {
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(() => corAleatoria(pastas.map((p) => p.cor)));

  const contagem = (pastaId: string | 'sem-pasta') =>
    hist.filter((h) => (pastaId === 'sem-pasta' ? !vinculo[h.id] : vinculo[h.id] === pastaId)).length;

  function confirmarCriar() {
    if (!nome.trim()) { setCriando(false); return; }
    const p: Pasta = { id: 'pasta_' + Date.now(), nome: nome.trim(), cor };
    onCriar(p);
    setNome('');
    setCor(corAleatoria([...pastas.map((x) => x.cor), cor]));
    setCriando(false);
  }

  return (
    <div className="pasta-rail">
      <div className={'pasta-item' + (ativa === null ? ' active' : '')} onClick={() => onSelecionar(null)}>
        <Icon name="folder" size={15} />
        <span>Todos</span>
        <span className="pasta-count">{hist.length}</span>
      </div>
      {pastas.map((p) => (
        <div key={p.id} className={'pasta-item' + (ativa === p.id ? ' active' : '')} onClick={() => onSelecionar(p.id)}>
          <span className="pasta-dot" style={{ background: p.cor }} />
          <span>{p.nome}</span>
          <span className="pasta-count">{contagem(p.id)}</span>
        </div>
      ))}
      <div className={'pasta-item' + (ativa === 'sem-pasta' ? ' active' : '')} onClick={() => onSelecionar('sem-pasta')}>
        <span className="pasta-dot" style={{ background: 'var(--border-strong)' }} />
        <span>Sem pasta</span>
        <span className="pasta-count">{contagem('sem-pasta')}</span>
      </div>

      {criando ? (
        <div className="pasta-nova-form">
          <input
            type="text"
            autoFocus
            placeholder="Nome da pasta"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmarCriar(); if (e.key === 'Escape') setCriando(false); }}
          />
          <ColorSwatches value={cor} onChange={setCor} />
          <div className="pasta-nova-actions">
            <button type="button" className="btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setCriando(false)}>Cancelar</button>
            <button type="button" className="btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={confirmarCriar}>Criar</button>
          </div>
        </div>
      ) : (
        <button type="button" className="pasta-item pasta-nova-btn" onClick={() => setCriando(true)}>
          <Icon name="plus" size={15} />
          <span>Nova pasta</span>
        </button>
      )}
    </div>
  );
}
