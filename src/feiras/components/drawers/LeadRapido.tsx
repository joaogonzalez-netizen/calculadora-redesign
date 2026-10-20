import { useMemo, useState } from 'react';
import { useStore } from '../../lib/store';
import { useUi } from '../../lib/ui';
import { addDias, mascaraTel } from '../../lib/format';
import type { Temperatura } from '../../lib/types';
import { Drawer, Field } from '../ui';
import { useFeirasT } from '../../lib/i18n';

const PRAZOS = [1, 3, 7, 0];

export default function LeadRapido() {
  const { db, feiraAtiva, capturarLead } = useStore();
  const { fechar, abrir, avisar } = useUi();
  const { t } = useFeirasT();
  const vazio = { nome: '', telefone: '', interesse: '', valor: '', nota: '' };
  const [f, setF] = useState(vazio);
  const [temp, setTemp] = useState<Temperatura>('morno');
  const [prazo, setPrazo] = useState(1);
  const [erro, setErro] = useState('');
  const set = (k: keyof typeof vazio) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const duplicado = useMemo(() => {
    const d = f.telefone.replace(/\D/g, '');
    return d.length >= 10 ? db.clientes.find((c) => c.telefone.replace(/\D/g, '') === d) : undefined;
  }, [f.telefone, db.clientes]);

  function salvar(continuar: boolean) {
    if (!f.nome.trim() && !duplicado) return setErro(t('feiras.lead.erroNome'));
    if (!f.telefone.replace(/\D/g, '') && !f.nome.trim()) return setErro(t('feiras.lead.erroNomeOuTel'));
    const r = capturarLead({
      nome: f.nome.trim() || duplicado!.nome, telefone: f.telefone, interesse: f.interesse.trim(), valor: Number(f.valor) || 0,
      temperatura: temp, nota: f.nota.trim(), proximoContato: prazo ? addDias(prazo) : null,
    });
    if (continuar) {
      setF(vazio); setTemp('morno'); setPrazo(1); setErro('');
      avisar(t('feiras.lead.salvoProximo', { nome: f.nome.trim() || duplicado!.nome }));
    } else {
      fechar();
      avisar(t('feiras.lead.salvoFunil', { nome: f.nome.trim() || duplicado!.nome }), { label: t('feiras.lead.abrir'), fn: () => abrir('negocio', r.negocioId) });
    }
  }

  return (
    <Drawer aberto titulo={t('feiras.lead.titulo')} subtitulo={feiraAtiva ? t('feiras.lead.subAtiva', { nome: feiraAtiva.nome }) : t('feiras.lead.subSem')} onClose={fechar}
      rodape={<><button className="fe-btn fe-btn-outline" onClick={() => salvar(true)}>{t('feiras.lead.salvarNovo')}</button><button className="fe-btn fe-btn-primary fe-grow" onClick={() => salvar(false)}>{t('feiras.lead.salvarLead')}</button></>}>
      {erro && <div className="fe-notice" role="alert">{erro}</div>}
      <div className="fe-form-grid">
        <Field label={t('feiras.lead.nome')} className="fe-full"><input autoFocus value={f.nome} onChange={set('nome')} autoComplete="off" placeholder={t('feiras.lead.nomePlaceholder')} /></Field>
        <Field label={t('feiras.lead.whatsapp')} className="fe-full" hint={duplicado ? undefined : t('feiras.lead.whatsappHint')}>
          <input value={f.telefone} onChange={(e) => setF((s) => ({ ...s, telefone: mascaraTel(e.target.value) }))} inputMode="tel" autoComplete="off" placeholder={t('feiras.comum.telPlaceholder')} />
        </Field>
        {duplicado && <div className="fe-notice fe-full">{t('feiras.lead.dupAntes')} <b>{duplicado.nome}</b> {t('feiras.lead.dupDepois')}</div>}
        <Field label={t('feiras.lead.interesse')} className="fe-full">
          <input list="lead-prod" value={f.interesse} onChange={set('interesse')} autoComplete="off" placeholder={t('feiras.lead.interesseEx')} />
          <datalist id="lead-prod">{db.produtos.map((p) => <option key={p.id} value={p.nome} />)}</datalist>
        </Field>
      </div>
      <div>
        <div className="fe-sec-title">{t('feiras.lead.temperatura')}</div>
        <div className="fe-seg" role="radiogroup">
          {(['frio', 'morno', 'quente'] as const).map((id) => (
            <button key={id} type="button" role="radio" aria-checked={temp === id} data-t={id} className={temp === id ? 'fe-on' : ''} onClick={() => setTemp(id)}>{t('feiras.tempLead.' + id)}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="fe-sec-title">{t('feiras.lead.voltar')}</div>
        <div className="fe-chips">{PRAZOS.map((p) => <button key={p} type="button" className={'fe-chip' + (prazo === p ? ' fe-on' : '')} onClick={() => setPrazo(p)}>{t('feiras.lead.prazo' + p)}</button>)}</div>
      </div>
      <div className="fe-form-grid">
        <Field label={t('feiras.lead.valor')}><input type="number" inputMode="decimal" min={0} value={f.valor} onChange={set('valor')} placeholder={t('feiras.comum.moedaZero')} /></Field>
        <Field label={t('feiras.lead.anotacao')} className="fe-full"><textarea value={f.nota} onChange={set('nota')} placeholder={t('feiras.lead.anotacaoEx')} /></Field>
      </div>
    </Drawer>
  );
}
