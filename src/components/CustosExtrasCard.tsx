import { useState } from 'react';
import { useCalculadora, novoAccItem } from '../context/CalculadoraContext';
import { useI18n } from '../context/I18nContext';
import type { AccItem, CustoCategoria, CustoExtra } from '../types';
import Card from './Card';
import CustoExtraDrawer from './drawers/CustoExtraDrawer';

const CATS: CustoCategoria[] = ['Embalagem', 'Mão de obra', 'Acabamento', 'Outro', 'Outras'];
const CATS_LABEL_KEYS: Record<CustoCategoria, string> = {
  'Embalagem': 'calc.catEmbalagem',
  'Mão de obra': 'calc.catMaoDeObra',
  'Acabamento': 'calc.catAcabamento',
  'Outro': 'calc.catOutro',
  'Outras': 'calc.catOutras',
};

const PRESETS: { nome: string; labelKey: string; valor: number; categoria: CustoCategoria }[] = [
  { nome: 'Caixa de papelão', labelKey: 'calc.presetCaixaPapelao', valor: 1.20, categoria: 'Embalagem' },
  { nome: 'Plástico bolha', labelKey: 'calc.presetPlasticoBolha', valor: 0.60, categoria: 'Embalagem' },
  { nome: 'Etiqueta', labelKey: 'calc.presetEtiqueta', valor: 0.15, categoria: 'Embalagem' },
  { nome: 'Fita adesiva', labelKey: 'calc.presetFitaAdesiva', valor: 0.30, categoria: 'Embalagem' },
  { nome: 'Saco plástico', labelKey: 'calc.presetSacoPlastico', valor: 0.25, categoria: 'Embalagem' },
  { nome: 'Mão de obra', labelKey: 'calc.catMaoDeObra', valor: 3.00, categoria: 'Mão de obra' },
];

export default function CustosExtrasCard() {
  const { state, set } = useCalculadora();
  const { t } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function addItem(nome: string, valor: number, categoria: CustoCategoria) {
    const ordenado = [...state.accItems, novoAccItem(nome, valor, categoria)].sort((a, b) => b.valor - a.valor);
    set('accItems', ordenado);
  }
  function updateItem(id: string, patch: Partial<AccItem>) {
    set('accItems', state.accItems.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }
  function removeItem(id: string) {
    set('accItems', state.accItems.filter((a) => a.id !== id));
  }
  function usarDaBiblioteca(c: CustoExtra) {
    addItem(c.nome, c.valor, c.categoria || 'Embalagem');
  }

  return (
    <Card icon="▢" title={t('calc.custosExtras')}>
      <div className="acc-desc">{t('calc.custosExtrasDesc')}</div>

      <div className="field">
        <label style={{ fontSize: 12.5, color: 'var(--text-3)', fontWeight: 700 }}>{t('calc.adicionarRapido')}</label>
        <div className="preset-row">
          {PRESETS.map((p) => (
            <button key={p.nome} type="button" className="preset-chip" onClick={() => addItem(p.nome, p.valor, p.categoria)}>+ {t(p.labelKey)}</button>
          ))}
        </div>
      </div>

      <div>
        {state.accItems.map((a) => (
          <div className="acc-item-row" key={a.id}>
            <input type="text" placeholder={t('calc.nomeDoExtra')} value={a.nome} onChange={(e) => updateItem(a.id, { nome: e.target.value })} />
            <input type="number" step="0.01" placeholder="R$" value={a.valor || ''} onChange={(e) => updateItem(a.id, { valor: parseFloat(e.target.value) || 0 })} />
            <select value={a.categoria} onChange={(e) => updateItem(a.id, { categoria: e.target.value as CustoCategoria })}>
              {CATS.map((c) => <option key={c} value={c}>{t(CATS_LABEL_KEYS[c])}</option>)}
            </select>
            <button type="button" className="acc-remove" onClick={() => removeItem(a.id)}>✕</button>
          </div>
        ))}
      </div>

      <div className="divider-label">{t('calc.adicionarManualmente')}</div>
      <div className="add-item-row">
        <button type="button" className="btn-outline" onClick={() => addItem('', 0, 'Embalagem')}>+ {t('calc.adicionarItem')}</button>
        <button type="button" className="lib-btn" onClick={() => setDrawerOpen(true)}>+ {t('calc.biblioteca')}</button>
      </div>

      <CustoExtraDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onUse={usarDaBiblioteca} />
    </Card>
  );
}
