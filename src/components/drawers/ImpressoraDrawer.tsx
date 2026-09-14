import { useState } from 'react';
import { useLibrarias } from '../../context/LibrariasContext';
import { useI18n } from '../../context/I18nContext';
import type { Impressora } from '../../types';
import Drawer from './Drawer';

export default function ImpressoraDrawer({ open, onClose, onUse }: { open: boolean; onClose: () => void; onUse: (idx: number, imp: Impressora) => void }) {
  const { impressoras, setImpressoras } = useLibrarias();
  const { t } = useI18n();
  const [nome, setNome] = useState('');
  const [kwh, setKwh] = useState('');

  function cadastrar() {
    const n = nome.trim();
    if (!n) return;
    const item: Impressora = { nome: n, kwh: parseFloat(kwh) || 0 };
    setImpressoras((prev) => [...prev, item]);
    onUse(impressoras.length, item);
    setNome(''); setKwh('');
    onClose();
  }

  return (
    <Drawer open={open} onClose={onClose} title={t('calc.bibliotecaDeImpressoras')} hint="Clique em &quot;+&quot; pra usar essa impressora no cálculo atual.">
      <div>
        {impressoras.length ? impressoras.map((i, idx) => (
          <div key={idx} className="drawer-lib-row">
            <span>{i.nome} <b style={{ color: 'var(--primary-dark)' }}>{i.kwh} kWh/h</b></span>
            <button type="button" className="btn-outline" style={{ padding: '5px 10px', fontSize: 12, flex: '0 0 auto' }} onClick={() => { onUse(idx, i); onClose(); }}>+</button>
          </div>
        )) : <div className="hint">Nenhuma impressora na biblioteca ainda. Cadastre uma abaixo.</div>}
      </div>
      <div className="divider-label" style={{ marginTop: 18 }}>{t('calc.cadastrarNovo')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        <input type="text" placeholder={t('calc.placeholderNomeImpressora')} value={nome} onChange={(e) => setNome(e.target.value)} />
        <input type="number" placeholder={t('calc.placeholderConsumoKwhDrawer')} step="0.01" value={kwh} onChange={(e) => setKwh(e.target.value)} />
        <button type="button" className="btn-outline" onClick={cadastrar}>+ {t('calc.cadastrarEUsar')}</button>
      </div>
    </Drawer>
  );
}
