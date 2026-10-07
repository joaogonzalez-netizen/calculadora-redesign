import { useEffect, useState } from 'react';
import type { HistoricoEntry } from '../../types';
import { brl } from '../../lib/format';
import { getHistorico, saveHistoricoArr } from '../../lib/storage';
import { useCalculadora } from '../../context/CalculadoraContext';
import { useI18n } from '../../context/I18nContext';

interface Props {
  entry: HistoricoEntry | null;
  onClose: () => void;
  onChange: () => void;
  onAbrirNaCalculadora: () => void;
}

export default function HistDrawer({ entry, onClose, onChange, onAbrirNaCalculadora }: Props) {
  const { restaurarHistorico } = useCalculadora();
  const { t } = useI18n();
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
    if (!confirm(t('calc.excluirCalculoHistoricoConfirm').replace('{nome}', entry!.nome || t('calc.esseCalculo')))) return;
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
        <h4 style={{ marginBottom: 16 }}>{t('calc.editarCalculo')}</h4>

        <div className="field" style={{ marginBottom: 18 }}>
          <label>{t('calc.nomeDoCalculo')}</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
          <button className="btn-outline" style={{ marginTop: 8 }} onClick={salvarNome}>{t('calc.salvarNome')}</button>
        </div>

        <div className="divider-label">{t('calc.verCalculoCompleto')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-2)', margin: '10px 0 20px' }}>
          <div><b style={{ color: 'var(--text-1)' }}>{t('calc.thCanal')}:</b> {entry.marketplace || '-'}</div>
          <div><b style={{ color: 'var(--text-1)' }}>{t('calc.precoSugerido')}:</b> {brl(entry.precoConsumidor)}</div>
          <div><b style={{ color: 'var(--text-1)' }}>{t('calc.custoUnitario')}:</b> {brl(entry.custoUnit)}</div>
          <div><b style={{ color: 'var(--text-1)' }}>{t('calc.margemDeContribuicao')}:</b> {(entry.margem || 0).toFixed(1)}%</div>
          <div><b style={{ color: 'var(--text-1)' }}>{t('calc.lucroLiquido')}:</b> {brl(entry.lucroLiquido)}</div>
          <div><b style={{ color: 'var(--text-1)' }}>{t('calc.potencialMensal')}:</b> {brl(entry.potMensal)}</div>
          <div><b style={{ color: 'var(--text-1)' }}>{t('calc.peso')}:</b> {entry.peso || '-'} g</div>
          <div><b style={{ color: 'var(--text-1)' }}>{t('calc.filamento')}:</b> {filLines}</div>
          <div><b style={{ color: 'var(--text-1)' }}>{t('calc.tempoImpressao')}:</b> {(entry.tempoH || 0).toFixed(2)}h</div>
          {entry.stlLink && <div><b style={{ color: 'var(--text-1)' }}>{t('calc.linkBiblioteca')}:</b> <a href={entry.stlLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-dark)' }}>{entry.stlLink}</a></div>}
          {entry.concorrenteLink && <div><b style={{ color: 'var(--text-1)' }}>{t('calc.referenciaConcorrente')}:</b> <a href={entry.concorrenteLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-dark)' }}>{entry.concorrenteLink}</a></div>}
          <div><b style={{ color: 'var(--text-1)' }}>{t('calc.linkAnuncioPublicado')}:</b> {entry.anuncioLink ? <a href={entry.anuncioLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-dark)' }}>{entry.anuncioLink}</a> : '-'}</div>
          <div><b style={{ color: 'var(--text-1)' }}>{t('calc.salvoEm')}:</b> {new Date(entry.id).toLocaleString('pt-BR')}</div>
        </div>

        <div className="divider-label">{t('calc.acoes')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          <button className="btn-outline" onClick={abrirNaCalculadora}>📂 {t('calc.abrirNaCalculadora')}</button>
          <button className="btn-outline" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={excluir}>🗑 {t('calc.excluirCalculo')}</button>
        </div>
      </div>
    </>
  );
}
