import { useState } from 'react';
import { useLibrarias } from '../../context/LibrariasContext';
import { useI18n } from '../../context/I18nContext';
import type { CustoCategoria, CustoExtra } from '../../types';
import { brl } from '../../lib/format';
import Drawer from './Drawer';

const CATS: CustoCategoria[] = ['Embalagem', 'Mão de obra', 'Acabamento', 'Outro', 'Outras'];
const CATS_LABEL_KEYS: Record<CustoCategoria, string> = {
  'Embalagem': 'calc.catEmbalagem',
  'Mão de obra': 'calc.catMaoDeObra',
  'Acabamento': 'calc.catAcabamento',
  'Outro': 'calc.catOutro',
  'Outras': 'calc.catOutras',
};

export default function CustoExtraDrawer({ open, onClose, onUse }: { open: boolean; onClose: () => void; onUse: (c: CustoExtra) => void }) {
  const { custosPadrao, setCustosPadrao } = useLibrarias();
  const { t } = useI18n();
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState<CustoCategoria>('Embalagem');

  function cadastrar() {
    const n = nome.trim();
    if (!n) return;
    const item: CustoExtra = { nome: n, valor: parseFloat(valor) || 0, categoria, ativo: false };
    setCustosPadrao((prev) => [...prev, item]);
    onUse(item);
    setNome(''); setValor('');
  }

  return (
    <Drawer open={open} onClose={onClose} title={t('calc.bibliotecaDeCustosExtras')} hint="Clique em &quot;+&quot; pra adicionar um item direto no cálculo.">
      <div>
        {custosPadrao.length ? custosPadrao.map((i, idx) => (
          <div key={idx} className="drawer-lib-row">
            <span>{i.nome} <b style={{ color: 'var(--primary-dark)' }}>{brl(i.valor)}</b><br /><span style={{ color: 'var(--text-3)', fontSize: 11.5 }}>{i.categoria ? t(CATS_LABEL_KEYS[i.categoria]) : t('calc.catEmbalagem')}{i.ativo ? ' · ' + t('calc.padrao') : ''}</span></span>
            <button type="button" className="btn-outline" style={{ padding: '5px 10px', fontSize: 12, flex: '0 0 auto' }} onClick={() => onUse(i)}>+</button>
          </div>
        )) : <div className="hint">Nenhum custo extra na biblioteca ainda. Cadastre um abaixo.</div>}
      </div>
      <div className="divider-label" style={{ marginTop: 18 }}>{t('calc.cadastrarNovo')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        <input type="text" placeholder={t('calc.placeholderNomeCustoExemplo')} value={nome} onChange={(e) => setNome(e.target.value)} />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value as CustoCategoria)}>
          {CATS.map((c) => <option key={c} value={c}>{t(CATS_LABEL_KEYS[c])}</option>)}
        </select>
        <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" placeholder="0,00" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} /></div>
        <button type="button" className="btn-outline" onClick={cadastrar}>+ {t('calc.cadastrarEAdicionar')}</button>
      </div>
    </Drawer>
  );
}
