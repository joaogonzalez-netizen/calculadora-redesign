import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { mascaraTel } from '../lib/format';
import Icon from './Icon';

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
    if (!cli.nome.trim()) return setErro('Informe o nome do cliente.');
    const id = s.salvarCliente({ nome: cli.nome.trim(), telefone: cli.telefone, empresa: cli.empresa.trim() });
    onChange(id);
    setCadastrando(false);
    setBusca('');
    onAvisar?.('Cliente cadastrado e selecionado');
  }

  if (selecionado && !cadastrando) {
    return (
      <div className="fe-cli-sel">
        <div>
          <b>{selecionado.nome}</b>
          {(selecionado.empresa || selecionado.telefone) && <span>{[selecionado.empresa, selecionado.telefone].filter(Boolean).join(' · ')}</span>}
        </div>
        {!disabled && <button type="button" className="fe-btn fe-btn-outline fe-btn-sm" onClick={() => onChange('')}>Trocar</button>}
      </div>
    );
  }

  if (cadastrando) {
    return (
      <div className="fe-card fe-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="fe-sec-title" style={{ margin: 0 }}>Cadastrar novo cliente</div>
        {erro && <div className="fe-notice" role="alert">{erro}</div>}
        <div className="fe-form-grid">
          <label className="fe-field fe-full"><span className="fe-lbl">Nome</span><input autoFocus value={cli.nome} onChange={(e) => setCli((x) => ({ ...x, nome: e.target.value }))} placeholder="Nome completo" /></label>
          <label className="fe-field"><span className="fe-lbl">WhatsApp</span><input value={cli.telefone} onChange={(e) => setCli((x) => ({ ...x, telefone: mascaraTel(e.target.value) }))} inputMode="tel" placeholder="(47) 99999-9999" /></label>
          <label className="fe-field"><span className="fe-lbl">Empresa / loja</span><input value={cli.empresa} onChange={(e) => setCli((x) => ({ ...x, empresa: e.target.value }))} /></label>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="fe-btn fe-btn-primary" onClick={cadastrar}>Cadastrar cliente</button>
          <button type="button" className="fe-btn fe-btn-outline" onClick={() => setCadastrando(false)}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fe-cli-busca">
      <input
        type="text" value={busca} placeholder="Digite o nome do cliente" autoComplete="off"
        onChange={(e) => { setBusca(e.target.value); setFoco(true); }}
        onFocus={() => setFoco(true)}
        onBlur={() => setTimeout(() => setFoco(false), 120)}
      />
      {foco && (
        <div className="fe-cli-lista" role="listbox">
          {termo.length > 0 && termo.length < MIN_LETRAS && <div className="fe-cli-dica">Digite mais {MIN_LETRAS - termo.length} {MIN_LETRAS - termo.length === 1 ? 'letra' : 'letras'} para buscar</div>}
          {termo.length === 0 && <div className="fe-cli-dica">Digite 3 letras do nome, empresa ou telefone para buscar</div>}
          {termo.length >= MIN_LETRAS && resultados.length === 0 && <div className="fe-cli-dica">Nenhum cliente encontrado para “{termo}”</div>}
          {resultados.map((c) => (
            <button type="button" key={c.id} className="fe-cli-item" role="option" onMouseDown={(e) => e.preventDefault()} onClick={() => escolher(c.id)}>
              <b>{c.nome}</b>
              {(c.empresa || c.telefone) && <span>{[c.empresa, c.telefone].filter(Boolean).join(' · ')}</span>}
            </button>
          ))}
          <button type="button" className="fe-cli-novo" onMouseDown={(e) => e.preventDefault()} onClick={abrirCadastro}>
            <Icon name="plus" size={14} /> {termo ? <>Cadastrar “{termo}” como novo cliente</> : 'Cadastrar novo cliente'}
          </button>
        </div>
      )}
    </div>
  );
}
