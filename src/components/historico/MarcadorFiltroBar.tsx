import { useState } from 'react';
import { corAleatoria, type Marcador } from '../../lib/cluster';
import Icon from '../Icon';
import ColorSwatches from './ColorSwatches';

interface Props {
  marcadores: Marcador[];
  ativos: string[];
  onToggle: (id: string) => void;
  onLimpar: () => void;
  onCriar: (m: Marcador) => void;
}

export default function MarcadorFiltroBar({ marcadores, ativos, onToggle, onLimpar, onCriar }: Props) {
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(() => corAleatoria(marcadores.map((m) => m.cor)));

  function confirmarCriar() {
    if (!nome.trim()) { setCriando(false); return; }
    onCriar({ id: 'tag_' + Date.now(), nome: nome.trim(), cor });
    setNome('');
    setCor(corAleatoria([...marcadores.map((m) => m.cor), cor]));
    setCriando(false);
  }

  return (
    <div className="marcador-filtro-bar">
      {marcadores.map((m) => {
        const on = ativos.includes(m.id);
        return (
          <button
            key={m.id}
            type="button"
            className={'marcador-chip' + (on ? ' active' : '')}
            style={on ? { background: m.cor, borderColor: m.cor } : { borderColor: m.cor, color: m.cor }}
            onClick={() => onToggle(m.id)}
          >
            {m.nome}
          </button>
        );
      })}

      {criando ? (
        <div className="marcador-nova-form">
          <input
            type="text"
            autoFocus
            placeholder="Nome do marcador"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmarCriar(); if (e.key === 'Escape') setCriando(false); }}
          />
          <ColorSwatches value={cor} onChange={setCor} />
          <button type="button" className="btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={confirmarCriar}>Criar</button>
          <button type="button" className="btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => setCriando(false)}>Cancelar</button>
        </div>
      ) : (
        <button type="button" className="marcador-chip marcador-novo-btn" onClick={() => setCriando(true)}>
          <Icon name="plus" size={12} /> Novo marcador
        </button>
      )}

      {ativos.length > 0 && (
        <button type="button" className="marcador-limpar" onClick={onLimpar}>
          <Icon name="close" size={12} /> Limpar filtro
        </button>
      )}
    </div>
  );
}
