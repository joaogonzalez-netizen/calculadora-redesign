import { useState } from 'react';
import type { ItemPedido } from '../lib/types';
import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { marcarOrigemCatalogo } from '../../lib/origemCalculadora';
import { brl } from '../lib/format';
import Icon from './Icon';
import { Seg } from './ui';
import { useFeirasT } from '../lib/i18n';

export default function ItensEditor({ itens, onChange, rotuloTotal }: { itens: ItemPedido[]; onChange: (i: ItemPedido[]) => void; rotuloTotal?: string }) {
  const { t } = useFeirasT();
  const { db, itemDoProduto } = useStore();
  const { irParaCalculadora } = useUi();
  const [tipo, setTipo] = useState<'atacado' | 'varejo'>('atacado');
  const avulso = (it: ItemPedido) => !it.produtoId && (!!it.avulso || !!it.nome.trim());
  const total = itens.reduce((s, i) => s + i.qtd * i.unit, 0);
  const custo = itens.reduce((s, i) => s + i.qtd * i.custoUnit, 0);

  const alterar = (idx: number, p: Partial<ItemPedido>) => onChange(itens.map((it, i) => (i === idx ? { ...it, ...p } : it)));
  const trocarProduto = (idx: number, id: string) => {
    if (id === '__avulso') return alterar(idx, { produtoId: null, avulso: true });
    const prod = db.produtos.find((p) => p.id === id);
    if (!prod) return alterar(idx, { produtoId: null, avulso: false, nome: '', unit: 0, custoUnit: 0, tempoH: 0 });
    onChange(itens.map((it, i) => (i === idx ? { ...itemDoProduto(prod, 'atacado', it.qtd || 1) } : it)));
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div className="fe-sec-title">{t('feiras.itens.tipoCliente')}</div>
        <Seg valor={tipo} onChange={setTipo} opcoes={[{ id: 'atacado', label: t('feiras.itens.loja') }, { id: 'varejo', label: t('feiras.itens.clienteFinal') }]} />
      </div>
      {itens.map((it, idx) => (
        <div key={idx} className="fe-item-row">
          <label className="fe-field">
            <span className="fe-lbl">{idx === 0 ? t('feiras.itens.produto') : <span style={{ visibility: 'hidden' }}>.</span>}</span>
            {db.produtos.length > 0 && (
              <select value={it.produtoId ?? (avulso(it) ? '__avulso' : '')} onChange={(e) => trocarProduto(idx, e.target.value)}>
                <option value="">{t('feiras.itens.escolher')}</option>
                {db.produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                <option value="__avulso">{t('feiras.itens.avulsoOpt')}</option>
              </select>
            )}
            {(db.produtos.length === 0 || avulso(it)) && !it.produtoId && <input value={it.nome} onChange={(e) => alterar(idx, { nome: e.target.value, avulso: true })} placeholder={t('feiras.itens.descricao')} />}
          </label>
          <label className="fe-field"><span className="fe-lbl">{idx === 0 ? t('feiras.itens.qtd') : <span style={{ visibility: 'hidden' }}>.</span>}</span>
            <input type="number" inputMode="numeric" min={1} value={it.qtd} onChange={(e) => alterar(idx, { qtd: Math.max(1, Number(e.target.value) || 1) })} /></label>
          <label className="fe-field"><span className="fe-lbl">{idx === 0 ? t('feiras.itens.valorUn') : <span style={{ visibility: 'hidden' }}>.</span>}</span>
            <input type="number" inputMode="decimal" min={0} step="0.01" value={it.unit} onChange={(e) => alterar(idx, { unit: Math.max(0, Number(e.target.value) || 0) })} /></label>
          <button type="button" className="fe-icon-btn" aria-label={t('feiras.itens.remover')} onClick={() => onChange(itens.filter((_, i) => i !== idx))} style={{ marginBottom: 3 }}><Icon name="trash" size={16} /></button>
        </div>
      ))}
      <div><button type="button" className="fe-btn fe-btn-outline fe-btn-sm" onClick={() => onChange([...itens, { produtoId: null, nome: '', qtd: 1, unit: 0, custoUnit: 0, tempoH: 0 }])}><Icon name="plus" size={14} /> {t('feiras.itens.adicionar')}</button>
        <button type="button" className="fe-btn fe-btn-outline fe-btn-sm" style={{ marginLeft: 8 }} onClick={() => { marcarOrigemCatalogo(); irParaCalculadora(); }}><Icon name="plus" size={14} /> {t('feiras.itens.novoProduto')}</button></div>
      <div className="fe-totals"><div><small>{rotuloTotal ?? t('feiras.itens.totalPedido')}</small><br /><b>{brl(total)}</b></div>{custo > 0 && <div style={{ textAlign: 'right' }}><small>{t('feiras.itens.lucro')}</small><br /><b>{brl(total - custo)}</b></div>}</div>
    </div>
  );
}
