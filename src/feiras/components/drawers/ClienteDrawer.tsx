import { useState } from 'react';
import { useStore, totalPedido } from '../../lib/store';
import { useUi } from '../../lib/ui';
import { brl, dataLonga, mascaraTel, waLink } from '../../lib/format';
import { TIPOS_CONTATO, type TipoContato } from '../../lib/types';
import { Drawer, Field } from '../ui';
import Icon from '../Icon';
import { useFeirasT, CHAVE_STATUS } from '../../lib/i18n';

export default function ClienteDrawer() {
  const { drawer, fechar, abrir, avisar } = useUi();
  const s = useStore();
  const { t } = useFeirasT();
  const { db } = s;
  const ex = db.clientes.find((c) => c.id === drawer?.id);
  const [f, setF] = useState({
    nome: ex?.nome ?? '', empresa: ex?.empresa ?? '', categoria: ex?.categoria ?? '', telefone: ex?.telefone ?? '',
    email: ex?.email ?? '', cidade: ex?.cidade ?? '', obs: ex?.obs ?? '',
  });
  const [tipo, setTipo] = useState<TipoContato>('whatsapp');
  const [nota, setNota] = useState('');
  const [erro, setErro] = useState('');
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  const negocios = db.negocios.filter((n) => n.clienteId === ex?.id);
  const pedidos = db.pedidos.filter((p) => p.clienteId === ex?.id);
  const feira = db.feiras.find((x) => x.id === ex?.feiraId);

  function salvar() {
    if (!f.nome.trim()) return setErro(t('feiras.cliente.erroNome'));
    const id = s.salvarCliente({ id: ex?.id, ...f, nome: f.nome.trim() });
    avisar(t('feiras.cliente.salvo'));
    if (!ex) abrir('cliente', id); else fechar();
  }

  return (
    <Drawer aberto largo titulo={ex ? ex.nome : t('feiras.cliente.novo')} subtitulo={ex ? [ex.empresa, feira && t('feiras.cliente.conheceuEm', { nome: feira.nome })].filter(Boolean).join(' · ') : undefined} onClose={fechar}
      rodape={<>
        {ex && <button className="fe-btn fe-btn-danger" onClick={() => { if (confirm(t('feiras.cliente.confirmarExcluir', { nome: ex.nome }))) { s.excluirCliente(ex.id); fechar(); } }}><Icon name="trash" size={16} /></button>}
        <button className="fe-btn fe-btn-primary fe-grow" onClick={salvar}>{ex ? t('feiras.cliente.salvarAlt') : t('feiras.cliente.cadastrar')}</button></>}>
      {erro && <div className="fe-notice" role="alert">{erro}</div>}
      {ex?.telefone && <div><a className="fe-btn fe-btn-wa" href={waLink(ex.telefone)} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={16} /> {t('feiras.comum.whatsappNome', { nome: ex.telefone })}</a></div>}
      <div className="fe-form-grid">
        <Field label={t('feiras.cliente.nome')} className="fe-full"><input value={f.nome} onChange={set('nome')} placeholder={t('feiras.cliente.nomeCompleto')} /></Field>
        <Field label={t('feiras.cliente.empresa')}><input value={f.empresa} onChange={set('empresa')} /></Field>
        <Field label={t('feiras.cliente.segmento')}><input value={f.categoria} onChange={set('categoria')} placeholder={t('feiras.cliente.segmentoEx')} /></Field>
        <Field label={t('feiras.cliente.whatsapp')}><input value={f.telefone} onChange={(e) => setF((x) => ({ ...x, telefone: mascaraTel(e.target.value) }))} inputMode="tel" placeholder={t('feiras.comum.telPlaceholder')} /></Field>
        <Field label={t('feiras.cliente.email')}><input type="email" value={f.email} onChange={set('email')} inputMode="email" /></Field>
        <Field label={t('feiras.cliente.cidade')} className="fe-full"><input value={f.cidade} onChange={set('cidade')} /></Field>
        <Field label={t('feiras.cliente.obs')} className="fe-full"><textarea value={f.obs} onChange={set('obs')} placeholder={t('feiras.cliente.obsEx')} /></Field>
      </div>

      {ex && (
        <>
          <div>
            <div className="fe-sec-title">{t('feiras.cliente.negociacoes', { n: negocios.length })}</div>
            {negocios.length === 0 ? <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{t('feiras.cliente.nenhumaNeg')}</p> : (
              <div className="fe-list">{negocios.map((n) => (
                <button key={n.id} className="fe-list-item" onClick={() => abrir('negocio', n.id)}>
                  <div className="fe-grow"><div className="fe-t">{n.titulo}</div><div className="fe-s">{t('feiras.etapa.' + n.etapa)} · {brl(n.valor)}</div></div><Icon name="chevron" size={16} />
                </button>))}</div>
            )}
            <button className="fe-btn fe-btn-outline fe-btn-sm" style={{ marginTop: 10 }} onClick={() => abrir('negocio', null, ex.id)}><Icon name="plus" size={14} /> {t('feiras.cliente.novaNeg')}</button>
          </div>

          {pedidos.length > 0 && (
            <div>
              <div className="fe-sec-title">{t('feiras.cliente.pedidos', { n: pedidos.length })}</div>
              <div className="fe-list">{pedidos.map((p) => (
                <button key={p.id} className="fe-list-item" onClick={() => abrir('pedido', p.id)}>
                  <div className="fe-grow"><div className="fe-t">{brl(totalPedido(p))}</div><div className="fe-s">{t(CHAVE_STATUS[p.status])} · {dataLonga(p.dataPedido)}</div></div><Icon name="chevron" size={16} />
                </button>))}</div>
            </div>
          )}

          <div>
            <div className="fe-sec-title">{t('feiras.cliente.historico')}</div>
            <div className="fe-inline-add" style={{ marginBottom: 14 }}>
              <div className="fe-seg">{TIPOS_CONTATO.map((tc) => <button key={tc.id} type="button" className={tipo === tc.id ? 'fe-on' : ''} onClick={() => setTipo(tc.id)}>{t('feiras.contato.' + tc.id)}</button>)}</div>
              <input className="fe-input" value={nota} onChange={(e) => setNota(e.target.value)} placeholder={t('feiras.cliente.oQueConversado')} />
              <div><button className="fe-btn fe-btn-outline fe-btn-sm" disabled={!nota.trim()} onClick={() => { s.registrarContato(ex.id, tipo, nota.trim()); setNota(''); avisar(t('feiras.cliente.contatoRegistrado')); }}>{t('feiras.cliente.registrar')}</button></div>
            </div>
            <div className="fe-timeline">
              {ex.contatos.map((c) => (
                <div className="fe-tl" key={c.id}><span className="fe-pt" /><div style={{ flex: 1 }}>
                  <div className="fe-h">{dataLonga(c.data)} · {t('feiras.contato.' + c.tipo)}<button className="fe-del" onClick={() => s.excluirContato(ex.id, c.id)}>{t('feiras.comum.excluir')}</button></div>
                  <div className="fe-n">{c.nota}</div></div></div>
              ))}
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
