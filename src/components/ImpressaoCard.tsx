import { useState } from 'react';
import { useCalculadora, novoFilamentoItem } from '../context/CalculadoraContext';
import { useLibrarias } from '../context/LibrariasContext';
import { useI18n } from '../context/I18nContext';
import Card from './Card';
import InfoDot from './InfoDot';
import ImpressoraDrawer from './drawers/ImpressoraDrawer';
import FilamentoDrawer from './drawers/FilamentoDrawer';
import type { Impressora } from '../types';

export default function ImpressaoCard() {
  const { state, set, errorIds } = useCalculadora();
  const { impressoras } = useLibrarias();
  const { t } = useI18n();
  const [impDrawerOpen, setImpDrawerOpen] = useState(false);
  const [filDrawerOpen, setFilDrawerOpen] = useState(false);

  function onImpressoraChange(v: string) {
    set('impressoraIdx', v);
    if (v === 'custom') { set('custoKwh', 0); setImpDrawerOpen(true); return; }
    if (v === '') return;
    const printer = impressoras[parseInt(v, 10)];
    if (printer) set('custoKwh', printer.kwh);
  }

  function usarImpressora(idx: number, imp: Impressora) {
    set('impressoraIdx', String(idx));
    set('custoKwh', imp.kwh);
  }

  function updateFilamento(id: string, patch: Partial<typeof state.filamentoItems[0]>) {
    set('filamentoItems', state.filamentoItems.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }
  function removeFilamento(id: string) {
    set('filamentoItems', state.filamentoItems.filter((f) => f.id !== id));
  }
  function addFilamento() {
    set('filamentoItems', [...state.filamentoItems, novoFilamentoItem()]);
  }
  function usarFilamentoDrawer(f: { nome: string; cor: string; preco: number }) {
    set('filamentoItems', [...state.filamentoItems, novoFilamentoItem(f.nome, f.cor, f.preco, 0)]);
  }

  const filamentoListError = errorIds.has('filamentoList');
  const tempoTotal = state.horasImpressao + state.minutosImpressao / 60;

  return (
    <Card icon="🖶" title={t('calc.impressao')}>
      <div className="subsection-head"><div className="ic-badge" style={{ width: 28, height: 28, fontSize: 14 }}>🖶</div><h4>{t('calc.impressora')}</h4></div>
      <div className="row3">
        <div className="field">
          <label>{t('calc.modeloImpressora')}</label>
          <select value={state.impressoraIdx} onChange={(e) => onImpressoraChange(e.target.value)}>
            <option value="">{t('calc.selecioneImpressora')}</option>
            {impressoras.map((i, idx) => <option key={idx} value={idx}>{i.nome}: {i.kwh} kWh/h</option>)}
            <option value="custom">{t('calc.outraImpressora')}</option>
          </select>
        </div>
        <div className="field">
          <label>{t('calc.consumoKwh')} <InfoDot text="Preenchido automaticamente ao selecionar a impressora. Editável." /></label>
          <input type="number" step="0.01" placeholder={t('calc.placeholderConsumoKwh')} value={state.custoKwh || ''} onChange={(e) => set('custoKwh', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="field">
          <label>{t('calc.energiaPrecoKwh')} <InfoDot text="Preço pago à distribuidora pelo kWh consumido." /></label>
          <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" step="0.01" value={state.precoKwh} onChange={(e) => set('precoKwh', parseFloat(e.target.value) || 0)} /></div>
        </div>
      </div>
      <div className="row3">
        <div className="field">
          <label>{t('calc.pecasPorMesa')} <InfoDot text="Quantidade de peças impressas juntas na mesma impressão." /></label>
          <input type="number" min={1} value={state.quantidade} onChange={(e) => set('quantidade', parseInt(e.target.value, 10) || 1)} />
        </div>
        <div className="field">
          <label>{t('calc.tempoImpressao')}</label>
          <div className="row2">
            <input
              type="number" placeholder={t('calc.horas')}
              value={state.horasImpressao || ''}
              onChange={(e) => set('horasImpressao', parseFloat(e.target.value) || 0)}
              className={errorIds.has('horasImpressao') ? 'input-error' : ''}
            />
            <input
              type="number" placeholder={t('calc.minutos')} max={59}
              value={state.minutosImpressao || ''}
              onChange={(e) => set('minutosImpressao', parseFloat(e.target.value) || 0)}
              className={errorIds.has('minutosImpressao') ? 'input-error' : ''}
            />
          </div>
          <div className="hint">{t('calc.total')}: {tempoTotal.toFixed(2).replace('.', ',')}h</div>
        </div>
        <div className="field">
          <label>{t('calc.taxaDeFalha')} <InfoDot text="Farm otimizada: 1–1,5%. Uso doméstico: 3–5%. Aplicada sobre material + energia." /></label>
          <div className="suffix-wrap"><input type="number" step="0.1" value={state.taxaFalha} onChange={(e) => set('taxaFalha', parseFloat(e.target.value) || 0)} /><span className="sfx">%</span></div>
        </div>
      </div>

      <div className="subsection-head" style={{ marginTop: 8, paddingTop: 22, borderTop: '1px solid var(--border)' }}>
        <div className="ic-badge" style={{ width: 28, height: 28, fontSize: 14 }}>◆</div><h4>{t('calc.filamento')}</h4>
      </div>
      <div className="hint" style={{ marginBottom: 10 }}>Peça com mais de uma cor/material? Adicione um filamento por vez. O custo de material soma todos.</div>
      <div className="fil-item-row" style={{ marginBottom: 2 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{t('calc.filamento')}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{t('calc.cor')}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{t('calc.pesoG')}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{t('calc.precoPorKg')}</span>
        <span />
      </div>
      <div id="filamentoList" className={filamentoListError ? 'input-error' : ''} style={filamentoListError ? { borderRadius: 12, padding: 6 } : undefined}>
        {state.filamentoItems.map((f) => (
          <div className="fil-item-row" key={f.id}>
            <input type="text" placeholder={t('calc.nomeMarca')} value={f.nome} onChange={(e) => updateFilamento(f.id, { nome: e.target.value })} />
            <input type="text" placeholder={t('calc.cor')} value={f.cor} onChange={(e) => updateFilamento(f.id, { cor: e.target.value })} />
            <input type="number" placeholder="0" value={f.pesoG || ''} onChange={(e) => updateFilamento(f.id, { pesoG: parseFloat(e.target.value) || 0 })} />
            <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" step="0.01" value={f.precoKg || ''} onChange={(e) => updateFilamento(f.id, { precoKg: parseFloat(e.target.value) || 0 })} /></div>
            <button type="button" className="acc-remove" onClick={() => removeFilamento(f.id)}>✕</button>
          </div>
        ))}
      </div>
      <div className="add-item-row">
        <button type="button" className="btn-outline" onClick={addFilamento}>+ {t('calc.adicionarFilamento')}</button>
        <button type="button" className="lib-btn" onClick={() => setFilDrawerOpen(true)}>+ {t('calc.biblioteca')}</button>
      </div>

      <ImpressoraDrawer open={impDrawerOpen} onClose={() => setImpDrawerOpen(false)} onUse={usarImpressora} />
      <FilamentoDrawer open={filDrawerOpen} onClose={() => setFilDrawerOpen(false)} onUse={usarFilamentoDrawer} />
    </Card>
  );
}
