import { useState } from 'react';
import { useStore } from '../../lib/store';
import { useUi } from '../../lib/ui';
import { brl } from '../../lib/format';
import { atacadoAuto, custoProduto, varejoAuto } from '../../lib/pricing';
import type { Produto } from '../../lib/types';
import { Drawer, Field } from '../ui';
import Icon from '../Icon';

export default function ProdutoDrawer() {
  const { drawer, fechar, avisar } = useUi();
  const s = useStore();
  const { db } = s;
  const ex = db.produtos.find((p) => p.id === drawer?.id);
  const [f, setF] = useState({
    nome: ex?.nome ?? '', sku: ex?.sku ?? '', categoria: ex?.categoria ?? '', material: ex?.material ?? 'PLA',
    tempoH: String(ex?.tempoH ?? ''), pesoG: String(ex?.pesoG ?? ''), acessorio: String(ex?.acessorio ?? ''),
    atacado: ex?.atacadoManual != null ? String(ex.atacadoManual) : '', varejo: ex?.varejoManual != null ? String(ex.varejoManual) : '',
  });
  const [erro, setErro] = useState('');
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  const prev: Produto = {
    id: '', nome: '', sku: '', categoria: '', material: '', tempoH: Number(f.tempoH) || 0, pesoG: Number(f.pesoG) || 0, acessorio: Number(f.acessorio) || 0,
    atacadoManual: f.atacado ? Number(f.atacado) : null, varejoManual: f.varejo ? Number(f.varejo) : null,
  };
  const custo = custoProduto(prev, db.config);

  function salvar() {
    if (!f.nome.trim()) return setErro('Dê um nome ao produto.');
    s.salvarProduto({
      id: ex?.id, nome: f.nome.trim(), sku: f.sku.trim(), categoria: f.categoria.trim(), material: f.material.trim() || 'PLA',
      tempoH: prev.tempoH, pesoG: prev.pesoG, acessorio: prev.acessorio, atacadoManual: prev.atacadoManual, varejoManual: prev.varejoManual,
    });
    avisar('Produto salvo');
    fechar();
  }

  return (
    <Drawer aberto titulo={ex ? 'Editar produto' : 'Novo produto'} onClose={fechar}
      rodape={<>
        {ex && <button className="fe-btn fe-btn-danger" onClick={() => { if (confirm('Excluir este produto? Pedidos antigos continuam intactos.')) { s.excluirProduto(ex.id); fechar(); } }}><Icon name="trash" size={16} /></button>}
        <button className="fe-btn fe-btn-primary fe-grow" onClick={salvar}>Salvar produto</button></>}>
      {erro && <div className="fe-notice" role="alert">{erro}</div>}
      <div className="fe-form-grid">
        <Field label="Nome" className="fe-full"><input value={f.nome} onChange={set('nome')} placeholder="Ex: Vaso Espiral M" /></Field>
        <Field label="SKU"><input value={f.sku} onChange={set('sku')} placeholder="DEC-001" /></Field>
        <Field label="Categoria"><input value={f.categoria} onChange={set('categoria')} placeholder="Decoração" /></Field>
        <Field label="Material"><input value={f.material} onChange={set('material')} /></Field>
        <Field label="Tempo de impressão (h)"><input type="number" inputMode="decimal" step="0.1" min={0} value={f.tempoH} onChange={set('tempoH')} /></Field>
        <Field label="Peso (g)"><input type="number" inputMode="decimal" min={0} value={f.pesoG} onChange={set('pesoG')} /></Field>
        <Field label="Acessório (R$)"><input type="number" inputMode="decimal" step="0.01" min={0} value={f.acessorio} onChange={set('acessorio')} /></Field>
      </div>
      <div>
        <div className="fe-sec-title">Preços</div>
        <div className="fe-form-grid">
          <Field label="Atacado (B2B)" hint={`Sugerido ${brl(atacadoAuto(prev, db.config))} · deixe vazio para usar`}><input type="number" inputMode="decimal" step="0.01" min={0} value={f.atacado} onChange={set('atacado')} placeholder={atacadoAuto(prev, db.config).toFixed(2)} /></Field>
          <Field label="Varejo (B2C)" hint={`Sugerido ${brl(varejoAuto(prev, db.config))}`}><input type="number" inputMode="decimal" step="0.01" min={0} value={f.varejo} onChange={set('varejo')} placeholder={varejoAuto(prev, db.config).toFixed(2)} /></Field>
        </div>
      </div>
      <div className="fe-totals"><div><small>Custo de produção</small><br /><b>{brl(custo)}</b></div><small style={{ maxWidth: 190, textAlign: 'right' }}>Material + energia + acessório, conforme as configurações de custo</small></div>
    </Drawer>
  );
}
