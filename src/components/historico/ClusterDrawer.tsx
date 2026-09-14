import { useState } from 'react';
import { corAleatoria, LIMITE_CLUSTER } from '../../lib/cluster';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';
import ColorSwatches from './ColorSwatches';

export interface ClusterItem {
  id: string;
  nome: string;
  cor: string;
}

interface Props {
  open: boolean;
  tipo: 'pasta' | 'marcador';
  itens: ClusterItem[];
  selecionadoId?: string;
  onClose: () => void;
  onSelecionar: (id: string | undefined) => void;
  onCriar: (item: ClusterItem) => void;
}

/** Drawer compartilhado pelas duas experiências do Histórico: busca + escolha de
 * um item já existente, ou criação de um novo — sempre com vínculo único (1 pasta
 * ou 1 marcador por cálculo). */
export default function ClusterDrawer({ open, tipo, itens, selecionadoId, onClose, onSelecionar, onCriar }: Props) {
  const { t } = useI18n();
  const [busca, setBusca] = useState('');
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(() => corAleatoria(itens.map((i) => i.cor)));

  if (!open) return null;

  const label = tipo === 'pasta' ? t('calc.substPasta') : t('calc.substMarcador');
  const filtrados = itens.filter((i) => i.nome.toLowerCase().includes(busca.trim().toLowerCase()));
  const noLimite = itens.length >= LIMITE_CLUSTER;

  function fecharEResetar() {
    setBusca('');
    setCriando(false);
    setNome('');
    onClose();
  }

  function selecionar(id: string | undefined) {
    onSelecionar(id);
    fecharEResetar();
  }

  function confirmarCriar() {
    if (!nome.trim()) return;
    const item: ClusterItem = { id: (tipo === 'pasta' ? 'pasta_' : 'tag_') + Date.now(), nome: nome.trim(), cor };
    onCriar(item);
    fecharEResetar();
  }

  return (
    <>
      <div className="drawer-overlay" onClick={fecharEResetar} />
      <div className="drawer" style={{ width: 360 }}>
        <h4 style={{ marginBottom: 6 }}>{tipo === 'pasta' ? t('calc.escolherPasta') : t('calc.escolherMarcador')}</h4>
        <div className="hint" style={{ marginBottom: 16 }}>
          Cada cálculo pode ter só {tipo === 'pasta' ? 'uma pasta vinculada' : 'um marcador vinculado'}. Escolha um já existente ou crie um novo.
        </div>

        {criando ? (
          <div className="pasta-nova-form" style={{ padding: 0, marginBottom: 20 }}>
            <input
              type="text"
              autoFocus
              placeholder={`${t('calc.nomeDoPrefix')} ${label}`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmarCriar(); if (e.key === 'Escape') setCriando(false); }}
            />
            <ColorSwatches value={cor} onChange={setCor} />
            <div className="pasta-nova-actions">
              <button type="button" className="btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setCriando(false)}>{t('calc.cancelar')}</button>
              <button type="button" className="btn-calc" style={{ width: 'auto', padding: '8px 16px' }} onClick={confirmarCriar}>{t('calc.criarEAplicar')}</button>
            </div>
          </div>
        ) : noLimite ? (
          <div className="hint cluster-drawer-limite">{t('calc.limiteDe')} {LIMITE_CLUSTER} {tipo === 'pasta' ? t('calc.pastasAtingido') : t('calc.marcadoresAtingido')}. {t('calc.excluaUmParaCriarOutro')}</div>
        ) : (
          <button type="button" className="btn-outline cluster-drawer-novo" onClick={() => setCriando(true)}>
            <Icon name="plus" size={14} /> {tipo === 'pasta' ? t('calc.novaPasta') : t('calc.novoMarcador')}
          </button>
        )}

        <div className="divider-label" style={{ margin: '20px 0 14px' }}>{t('calc.escolherExistente')}</div>

        <div className="cl-search" style={{ marginBottom: 14 }}>
          <Icon name="search" size={15} />
          <input type="text" placeholder={`${t('calc.buscarPrefix')} ${label}...`} value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        <div className="cluster-drawer-list">
          <div className={'cluster-drawer-item' + (!selecionadoId ? ' active' : '')} onClick={() => selecionar(undefined)}>
            <span className="pasta-dot" style={{ background: 'var(--border-strong)' }} />
            {tipo === 'pasta' ? t('calc.semPasta') : t('calc.semMarcador')}
          </div>
          {filtrados.map((i) => (
            <div key={i.id} className={'cluster-drawer-item' + (i.id === selecionadoId ? ' active' : '')} onClick={() => selecionar(i.id)}>
              <span className="pasta-dot" style={{ background: i.cor }} />
              {i.nome}
            </div>
          ))}
          {!filtrados.length && <div className="hint" style={{ padding: '10px 2px' }}>{tipo === 'pasta' ? t('calc.nenhumaPastaEncontrada') : t('calc.nenhumMarcadorEncontrado')}</div>}
        </div>
      </div>
    </>
  );
}
