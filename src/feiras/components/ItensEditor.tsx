import { useState } from 'react';
import type { ItemPedido } from '../lib/types';
import { useStore } from '../lib/store';
import { brl } from '../lib/format';
import Icon from './Icon';
import { Seg } from './ui';

export default function ItensEditor({ itens, onChange, rotuloTotal = 'Total do pedido' }: { itens: ItemPedido[]; onChange: (i: ItemPedido[]) => void; rotuloTotal?: string }) {
  const { db, itemDoProduto } = useStore();
  const [tipo, setTipo] = useState<'atacado' | 'varejo'>('varejo');
  const avulso = (it: ItemPedido) => !it.produtoId && (!!it.avulso || !!it.nome.trim());
  const total = itens.reduce((s, i) => s + i.qtd * i.unit, 0);
  const custo = itens.reduce((s, i) => s + i.qtd * i.custoUnit, 0);

  const alterar = (idx: number, p: Partial<ItemPedido>) => onChange(itens.map((it, i) => (i === idx ? { ...it, ...p } : it)));
  const trocarProduto = (idx: number, id: string) => {
    if (id === '__avulso') return alterar(idx, { produtoId: null, avulso: true });
    const prod = db.produtos.find((p) => p.id === id);
    if (!prod) return alterar(idx, { produtoId: null, avulso: false, nome: '', unit: 0, custoUnit: 0, tempoH: 0 });
    onChange(itens.map((it, i) => (i === idx ? { ...itemDoProduto(prod, tipo, it.qtd || 1) } : it)));
  };
  const repricing = (t: 'atacado' | 'varejo') => {
    setTipo(t);
    onChange(itens.map((it) => {
      const prod = db.produtos.find((p) => p.id === it.produtoId);
      return prod ? { ...it, unit: itemDoProduto(prod, t, it.qtd).unit } : it;
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div className="fe-sec-title">Tabela de preço</div>
        <Seg valor={tipo} onChange={repricing} opcoes={[{ id: 'varejo', label: 'Cliente final' }, { id: 'atacado', label: 'Loja' }]} />
      </div>
      {itens.map((it, idx) => (
        <div key={idx} className="fe-item-row">
          <label className="fe-field">
            <span className="fe-lbl">{idx === 0 ? 'Produto' : <span style={{ visibility: 'hidden' }}>.</span>}</span>
            {db.produtos.length > 0 && (
              <select value={it.produtoId ?? (avulso(it) ? '__avulso' : '')} onChange={(e) => trocarProduto(idx, e.target.value)}>
                <option value="">Escolher da calculadora…</option>
                {db.produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                <option value="__avulso">Item avulso (digitar)</option>
              </select>
            )}
            {(db.produtos.length === 0 || avulso(it)) && !it.produtoId && <input value={it.nome} onChange={(e) => alterar(idx, { nome: e.target.value, avulso: true })} placeholder="Descrição do item" />}
          </label>
          <label className="fe-field"><span className="fe-lbl">{idx === 0 ? 'Qtd' : <span style={{ visibility: 'hidden' }}>.</span>}</span>
            <input type="number" inputMode="numeric" min={1} value={it.qtd} onChange={(e) => alterar(idx, { qtd: Math.max(1, Number(e.target.value) || 1) })} /></label>
          <label className="fe-field"><span className="fe-lbl">{idx === 0 ? 'Valor un.' : <span style={{ visibility: 'hidden' }}>.</span>}</span>
            <input type="number" inputMode="decimal" min={0} step="0.01" value={it.unit} onChange={(e) => alterar(idx, { unit: Math.max(0, Number(e.target.value) || 0) })} /></label>
          <button type="button" className="fe-icon-btn" aria-label="Remover item" onClick={() => onChange(itens.filter((_, i) => i !== idx))} style={{ marginBottom: 3 }}><Icon name="trash" size={16} /></button>
        </div>
      ))}
      <div><button type="button" className="fe-btn fe-btn-outline fe-btn-sm" onClick={() => onChange([...itens, { produtoId: null, nome: '', qtd: 1, unit: 0, custoUnit: 0, tempoH: 0 }])}><Icon name="plus" size={14} /> Adicionar item da calculadora</button></div>
      <div className="fe-totals"><div><small>{rotuloTotal}</small><br /><b>{brl(total)}</b></div>{custo > 0 && <div style={{ textAlign: 'right' }}><small>Lucro estimado</small><br /><b>{brl(total - custo)}</b></div>}</div>
    </div>
  );
}
