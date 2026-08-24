import { useState } from 'react';
import { useLibrarias } from '../../context/LibrariasContext';
import type { Filamento } from '../../types';
import { brl } from '../../lib/format';
import Drawer from './Drawer';

const TIPOS = ['PLA', 'PETG', 'ABS', 'TPU', 'Resina'];

export default function FilamentoDrawer({ open, onClose, onUse }: { open: boolean; onClose: () => void; onUse: (f: Filamento) => void }) {
  const { filamentos, setFilamentos } = useLibrarias();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [cor, setCor] = useState('');
  const [preco, setPreco] = useState('');

  function cadastrar() {
    const n = nome.trim();
    if (!n) return;
    const item: Filamento = { nome: n, tipo, cor: cor.trim(), preco: parseFloat(preco) || 0 };
    setFilamentos((prev) => [...prev, item]);
    onUse(item);
    setNome(''); setCor(''); setPreco('');
    onClose();
  }

  return (
    <Drawer open={open} onClose={onClose} title="Biblioteca de filamentos" hint="Clique em &quot;+&quot; pra usar esse filamento no cálculo atual.">
      <div>
        {filamentos.length ? filamentos.map((f, idx) => (
          <div key={idx} className="drawer-lib-row">
            <span>{f.nome} <b style={{ color: 'var(--primary-dark)' }}>{brl(f.preco)}/kg</b><br /><span style={{ color: 'var(--text-3)', fontSize: 11.5 }}>{f.tipo}{f.cor ? ' · ' + f.cor : ''}</span></span>
            <button type="button" className="btn-outline" style={{ padding: '5px 10px', fontSize: 12, flex: '0 0 auto' }} onClick={() => { onUse(f); onClose(); }}>+</button>
          </div>
        )) : <div className="hint">Nenhum filamento na biblioteca ainda. Cadastre um abaixo.</div>}
      </div>
      <div className="divider-label" style={{ marginTop: 18 }}>Cadastrar novo</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        <input type="text" placeholder="Marca (ex: STLFlix PLA)" value={nome} onChange={(e) => setNome(e.target.value)} />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <input type="text" placeholder="Cor (ex: Preto)" value={cor} onChange={(e) => setCor(e.target.value)} />
        <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" placeholder="0,00/kg" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} /></div>
        <button type="button" className="btn-outline" onClick={cadastrar}>+ Cadastrar e usar</button>
      </div>
    </Drawer>
  );
}
