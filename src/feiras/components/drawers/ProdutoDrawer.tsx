import { useState } from 'react';
import { useStore } from '../../lib/store';
import { useUi } from '../../lib/ui';
import { brl } from '../../lib/format';
import { atacadoAuto, custoProduto, varejoAuto } from '../../lib/pricing';
import type { Produto } from '../../lib/types';
import { Drawer, Field } from '../ui';
import Icon from '../Icon';
import { useFeirasT } from '../../lib/i18n';

export default function ProdutoDrawer() {
  const { drawer, fechar, avisar } = useUi();
  const s = useStore();
  const { t } = useFeirasT();
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
    if (!f.nome.trim()) return setErro(t('feiras.produto.erroNome'));
    s.salvarProduto({
      id: ex?.id, nome: f.nome.trim(), sku: f.sku.trim(), categoria: f.categoria.trim(), material: f.material.trim() || 'PLA',
      tempoH: prev.tempoH, pesoG: prev.pesoG, acessorio: prev.acessorio, atacadoManual: prev.atacadoManual, varejoManual: prev.varejoManual,
    });
    avisar(t('feiras.produto.salvo'));
    fechar();
  }

  return (
    <Drawer aberto titulo={ex ? t('feiras.produto.editar') : t('feiras.produto.novo')} onClose={fechar}
      rodape={<>
        {ex && <button className="fe-btn fe-btn-danger" onClick={() => { if (confirm(t('feiras.produto.confirmarExcluir'))) { s.excluirProduto(ex.id); fechar(); } }}><Icon name="trash" size={16} /></button>}
        <button className="fe-btn fe-btn-primary fe-grow" onClick={salvar}>{t('feiras.produto.salvar')}</button></>}>
      {erro && <div className="fe-notice" role="alert">{erro}</div>}
      <div className="fe-form-grid">
        <Field label={t('feiras.produto.nome')} className="fe-full"><input value={f.nome} onChange={set('nome')} placeholder={t('feiras.produto.nomeEx')} /></Field>
        <Field label={t('feiras.produto.sku')}><input value={f.sku} onChange={set('sku')} placeholder="DEC-001" /></Field>
        <Field label={t('feiras.produto.categoria')}><input value={f.categoria} onChange={set('categoria')} placeholder={t('feiras.produto.categoriaEx')} /></Field>
        <Field label={t('feiras.produto.material')}><input value={f.material} onChange={set('material')} /></Field>
        <Field label={t('feiras.produto.tempo')}><input type="number" inputMode="decimal" step="0.1" min={0} value={f.tempoH} onChange={set('tempoH')} /></Field>
        <Field label={t('feiras.produto.peso')}><input type="number" inputMode="decimal" min={0} value={f.pesoG} onChange={set('pesoG')} /></Field>
        <Field label={t('feiras.produto.acessorio')}><input type="number" inputMode="decimal" step="0.01" min={0} value={f.acessorio} onChange={set('acessorio')} /></Field>
      </div>
      <div>
        <div className="fe-sec-title">{t('feiras.produto.precos')}</div>
        <div className="fe-form-grid">
          <Field label={t('feiras.produto.atacado')} hint={t('feiras.produto.atacadoHint', { v: brl(atacadoAuto(prev, db.config)) })}><input type="number" inputMode="decimal" step="0.01" min={0} value={f.atacado} onChange={set('atacado')} placeholder={atacadoAuto(prev, db.config).toFixed(2)} /></Field>
          <Field label={t('feiras.produto.varejo')} hint={t('feiras.produto.varejoHint', { v: brl(varejoAuto(prev, db.config)) })}><input type="number" inputMode="decimal" step="0.01" min={0} value={f.varejo} onChange={set('varejo')} placeholder={varejoAuto(prev, db.config).toFixed(2)} /></Field>
        </div>
      </div>
      <div className="fe-totals"><div><small>{t('feiras.produto.custoProducao')}</small><br /><b>{brl(custo)}</b></div><small style={{ maxWidth: 190, textAlign: 'right' }}>{t('feiras.produto.custoNota')}</small></div>
    </Drawer>
  );
}
