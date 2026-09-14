import { useState } from 'react';
import type { HistoricoEntry } from '../../types';
import { corAleatoria, LIMITE_CLUSTER, type Pasta } from '../../lib/cluster';
import { useI18n } from '../../context/I18nContext';
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
  const { t } = useI18n();
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
        <span>{t('calc.todos')}</span>
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
        <span>{t('calc.semPasta')}</span>
        <span className="pasta-count">{contagem('sem-pasta')}</span>
      </div>

      {criando ? (
        <div className="pasta-nova-form">
          <input
            type="text"
            autoFocus
            placeholder={t('calc.nomeDaPasta')}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmarCriar(); if (e.key === 'Escape') setCriando(false); }}
          />
          <ColorSwatches value={cor} onChange={setCor} />
          <div className="pasta-nova-actions">
            <button type="button" className="btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setCriando(false)}>{t('calc.cancelar')}</button>
            <button type="button" className="btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={confirmarCriar}>{t('calc.criar')}</button>
          </div>
        </div>
      ) : pastas.length >= LIMITE_CLUSTER ? (
        <div className="hint" style={{ padding: '8px 10px', color: 'var(--text-3)', fontSize: 12 }}>{t('calc.limiteDe')} {LIMITE_CLUSTER} {t('calc.pastasAtingido')}.</div>
      ) : (
        <button type="button" className="pasta-item pasta-nova-btn" onClick={() => setCriando(true)}>
          <Icon name="plus" size={15} />
          <span>{t('calc.novaPasta')}</span>
        </button>
      )}
    </div>
  );
}
