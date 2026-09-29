import { useState } from 'react';
import { corAleatoria, LIMITE_CLUSTER, MAX_POR_CALCULO, type Marcador } from '../../lib/cluster';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';
import ColorSwatches from './ColorSwatches';

interface Props {
  open: boolean;
  marcadores: Marcador[];
  selecionados: string[];
  onClose: () => void;
  onAlternar: (id: string) => void;
  onCriar: (m: Marcador) => void; // cria e já aplica no cálculo
}

/** Drawer dos marcadores de um cálculo: marca/desmarca até MAX_POR_CALCULO
 * (cada clique já salva) e cria marcadores novos, que entram aplicados. */
export default function MarcadoresDrawer({ open, marcadores, selecionados, onClose, onAlternar, onCriar }: Props) {
  const { t } = useI18n();
  const [busca, setBusca] = useState('');
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(() => corAleatoria(marcadores.map((m) => m.cor)));

  if (!open) return null;

  const cheio = selecionados.length >= MAX_POR_CALCULO;
  const noLimite = marcadores.length >= LIMITE_CLUSTER;
  const filtrados = marcadores.filter((m) => m.nome.toLowerCase().includes(busca.trim().toLowerCase()));
  const nomeRepetido = marcadores.some((m) => m.nome.toLowerCase() === nome.trim().toLowerCase());

  function fechar() {
    setBusca('');
    setCriando(false);
    setNome('');
    onClose();
  }

  function confirmarCriar() {
    if (!nome.trim() || nomeRepetido || cheio) return;
    onCriar({ id: 'tag_' + Date.now(), nome: nome.trim(), cor });
    setNome('');
    setCor(corAleatoria([...marcadores.map((m) => m.cor), cor]));
    setCriando(false);
  }

  return (
    <>
      <div className="drawer-overlay" onClick={fechar} />
      <div className="drawer marcadores-drawer" style={{ width: 360 }}>
        <div className="marcadores-drawer-head">
          <h4>{t('calc.marcadoresDoCalculo')}</h4>
          <span className={'marcadores-contador' + (cheio ? ' cheio' : '')}>
            {selecionados.length} {t('calc.de')} {MAX_POR_CALCULO}
          </span>
        </div>
        <div className="hint" style={{ marginBottom: 16 }}>{t('calc.escolhaAte3Marcadores')}</div>

        <div className="cl-search" style={{ marginBottom: 12 }}>
          <Icon name="search" size={15} />
          <input type="text" placeholder={t('calc.buscarMarcador')} value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>

        <div className="cluster-drawer-list">
          {filtrados.map((m) => {
            const marcado = selecionados.includes(m.id);
            const bloqueado = !marcado && cheio;
            return (
              <button
                key={m.id} type="button" disabled={bloqueado}
                className={'cluster-drawer-item marcador-opcao' + (marcado ? ' active' : '')}
                onClick={() => onAlternar(m.id)} aria-pressed={marcado}
              >
                <span className={'marcador-check' + (marcado ? ' marcado' : '')}>{marcado && <Icon name="check" size={11} />}</span>
                <span className="pasta-dot" style={{ background: m.cor }} />
                <span className="marcador-opcao-nome">{m.nome}</span>
              </button>
            );
          })}
          {!filtrados.length && <div className="hint" style={{ padding: '10px 2px' }}>{t('calc.nenhumMarcadorEncontrado')}</div>}
        </div>
        {cheio && <div className="hint marcadores-aviso-cheio">{t('calc.maximoMarcadoresAtingido')}</div>}

        <div className="divider-label" style={{ margin: '20px 0 14px' }}>{t('calc.novoMarcador')}</div>

        {criando ? (
          <div className="pasta-nova-form" style={{ padding: 0 }}>
            <input
              type="text" autoFocus maxLength={24} placeholder={t('calc.nomeDoMarcador')} value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmarCriar(); if (e.key === 'Escape') setCriando(false); }}
            />
            {nomeRepetido && <div className="hint" style={{ color: 'var(--red)' }}>{t('calc.marcadorJaExiste')}</div>}
            <ColorSwatches value={cor} onChange={setCor} />
            <div className="pasta-nova-actions">
              <button type="button" className="btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setCriando(false)}>{t('calc.cancelar')}</button>
              <button type="button" className="btn-calc" style={{ width: 'auto', padding: '8px 16px' }} disabled={!nome.trim() || nomeRepetido} onClick={confirmarCriar}>{t('calc.criarEAplicar')}</button>
            </div>
          </div>
        ) : noLimite ? (
          <div className="hint cluster-drawer-limite">{t('calc.limiteDe')} {LIMITE_CLUSTER} {t('calc.marcadoresAtingido')}. {t('calc.excluaUmParaCriarOutro')}</div>
        ) : (
          <button type="button" className="btn-outline cluster-drawer-novo" disabled={cheio} onClick={() => setCriando(true)}>
            <Icon name="plus" size={14} /> {t('calc.novoMarcador')}
          </button>
        )}

        <button type="button" className="btn-calc marcadores-concluir" onClick={fechar}>{t('calc.concluir')}</button>
      </div>
    </>
  );
}
