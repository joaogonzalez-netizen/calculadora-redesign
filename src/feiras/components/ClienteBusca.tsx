import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { mascaraTel } from '../lib/format';
import Icon from './Icon';
import { useFeirasT } from '../lib/i18n';

const MIN_LETRAS = 3;

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

interface Props {
  clienteId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  onAvisar?: (msg: string) => void;
}

// Campo de cliente por busca: a partir de 3 letras lista os clientes que
// combinam (nome, empresa ou telefone) e, em qualquer momento, oferece
// cadastrar um novo cliente com o que foi digitado.
export default function ClienteBusca({ clienteId, onChange, disabled, onAvisar }: Props) {
  const s = useStore();
  const { t } = useFeirasT();
  const { clientes } = s.db;
  const [busca, setBusca] = useState('');
  const [foco, setFoco] = useState(false);
  const [cadastrando, setCadastrando] = useState(false);
  const [cli, setCli] = useState({ nome: '', telefone: '', empresa: '' });
  const [erro, setErro] = useState('');

  const selecionado = clientes.find((c) => c.id === clienteId);
  const termo = busca.trim();
  const resultados = useMemo(() => {
    if (termo.length < MIN_LETRAS) return [];
    const q = norm(termo);
    const digitos = termo.replace(/\D/g, '');
    return clientes
      .filter((c) => norm(c.nome).includes(q) || norm(c.empresa).includes(q) || (digitos.length >= MIN_LETRAS && c.telefone.replace(/\D/g, '').includes(digitos)))
      .slice(0, 6);
  }, [clientes, termo]);

  function escolher(id: string) {
    onChange(id);
    setBusca('');
    setFoco(false);
  }

  function abrirCadastro() {
    setCli({ nome: termo, telefone: '', empresa: '' });
    setCadastrando(true);
    setFoco(false);
    setErro('');
  }

  function cadastrar() {
    if (!cli.nome.trim()) return setErro(t('feiras.cliBusca.informeNome'));
    const id = s.salvarCliente({ nome: cli.nome.trim(), telefone: cli.telefone, empresa: cli.empresa.trim() });
    onChange(id);
    setCadastrando(false);
    setBusca('');
    onAvisar?.(t('feiras.cliBusca.cadastrado'));
  }

  if (selecionado && !cadastrando) {
    return (
      <div className="fe-cli-sel">
        <div>
          <b>{selecionado.nome}</b>
          {(selecionado.empresa || selecionado.telefone) && <span>{[selecionado.empresa, selecionado.telefone].filter(Boolean).join(' · ')}</span>}
        </div>
        {!disabled && <button type="button" className="fe-btn fe-btn-outline fe-btn-sm" onClick={() => onChange('')}>{t('feiras.cliBusca.trocar')}</button>}
      </div>
    );
  }

  if (cadastrando) {
    return (
      <div className="fe-card fe-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="fe-sec-title" style={{ margin: 0 }}>{t('feiras.cliBusca.cadastrarTitulo')}</div>
        {erro && <div className="fe-notice" role="alert">{erro}</div>}
        <div className="fe-form-grid">
          <label className="fe-field fe-full"><span className="fe-lbl">{t('feiras.cliBusca.nome')}</span><input autoFocus value={cli.nome} onChange={(e) => setCli((x) => ({ ...x, nome: e.target.value }))} placeholder={t('feiras.cliBusca.nomeCompleto')} /></label>
          <label className="fe-field"><span className="fe-lbl">{t('feiras.comum.whatsapp')}</span><input value={cli.telefone} onChange={(e) => setCli((x) => ({ ...x, telefone: mascaraTel(e.target.value) }))} inputMode="tel" placeholder={t('feiras.comum.telPlaceholder')} /></label>
          <label className="fe-field"><span className="fe-lbl">{t('feiras.cliBusca.empresa')}</span><input value={cli.empresa} onChange={(e) => setCli((x) => ({ ...x, empresa: e.target.value }))} /></label>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="fe-btn fe-btn-primary" onClick={cadastrar}>{t('feiras.cliBusca.cadastrar')}</button>
          <button type="button" className="fe-btn fe-btn-outline" onClick={() => setCadastrando(false)}>{t('feiras.comum.cancelar')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fe-cli-busca">
      <input
        type="text" value={busca} placeholder={t('feiras.cliBusca.digiteNome')} autoComplete="off"
        onChange={(e) => { setBusca(e.target.value); setFoco(true); }}
        onFocus={() => setFoco(true)}
        onBlur={() => setTimeout(() => setFoco(false), 120)}
      />
      {foco && (
        <div className="fe-cli-lista" role="listbox">
          {termo.length > 0 && termo.length < MIN_LETRAS && <div className="fe-cli-dica">{t(MIN_LETRAS - termo.length === 1 ? 'feiras.cliBusca.maisLetra' : 'feiras.cliBusca.maisLetras', { n: MIN_LETRAS - termo.length })}</div>}
          {termo.length === 0 && <div className="fe-cli-dica">{t('feiras.cliBusca.dica3')}</div>}
          {termo.length >= MIN_LETRAS && resultados.length === 0 && <div className="fe-cli-dica">{t('feiras.cliBusca.nenhum', { termo })}</div>}
          {resultados.map((c) => (
            <button type="button" key={c.id} className="fe-cli-item" role="option" onMouseDown={(e) => e.preventDefault()} onClick={() => escolher(c.id)}>
              <b>{c.nome}</b>
              {(c.empresa || c.telefone) && <span>{[c.empresa, c.telefone].filter(Boolean).join(' · ')}</span>}
            </button>
          ))}
          <button type="button" className="fe-cli-novo" onMouseDown={(e) => e.preventDefault()} onClick={abrirCadastro}>
            <Icon name="plus" size={14} /> {termo ? t('feiras.cliBusca.cadastrarComo', { termo }) : t('feiras.cliBusca.cadastrarNovo')}
          </button>
        </div>
      )}
    </div>
  );
}
