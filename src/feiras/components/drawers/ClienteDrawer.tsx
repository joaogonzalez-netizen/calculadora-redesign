import { useState } from 'react';

const novoOutro = (): OutroContato => ({ id: Math.random().toString(36).slice(2, 9), nome: '', telefone: '', obs: '' });
import { useStore, totalPedido } from '../../lib/store';
import { useUi } from '../../lib/ui';
import { brl, dataLonga, mascaraTel, waLink } from '../../lib/format';
import { TIPOS_CONTATO, type OutroContato, type TipoContato } from '../../lib/types';
import { Drawer, Field, Secao } from '../ui';
import Icon from '../Icon';
import { useFeirasT, CHAVE_STATUS } from '../../lib/i18n';

const SEGMENTOS = ['presentes', 'decoracao', 'floricultura', 'papelaria', 'games', 'brindes', 'cafeteria', 'escritorio', 'consumidor'];

export default function ClienteDrawer() {
  const { drawer, fechar, abrir, avisar } = useUi();
  const s = useStore();
  const { t } = useFeirasT();
  const { db } = s;
  const ex = db.clientes.find((c) => c.id === drawer?.id);
  const [f, setF] = useState({
    nome: ex?.nome ?? '', empresa: ex?.empresa ?? '', categoria: ex?.categoria ?? '', telefone: ex?.telefone ?? '', telefoneAlt: ex?.telefoneAlt ?? '',
    email: ex?.email ?? '', cidade: ex?.cidade ?? '', obs: ex?.obs ?? '',
  });
  // Segmento: lista pronta + "Outros" com texto livre (valor guardado é o texto exibido).
  const rotulos = SEGMENTOS.map((id) => t('feiras.seg.' + id));
  const [outroSeg, setOutroSeg] = useState(!!f.categoria && !rotulos.includes(f.categoria));
  const [tipo, setTipo] = useState<TipoContato>('whatsapp');
  const [nota, setNota] = useState('');
  const [erro, setErro] = useState('');
  const [faltam, setFaltam] = useState<string[]>([]);
  // Outros contatos ficam escondidos até a pessoa pedir (ou o cliente já ter algum).
  const [outros, setOutros] = useState<OutroContato[]>(ex?.outrosContatos ?? []);
  const atualizarOutro = (id: string, k: keyof OutroContato, v: string) => setOutros((l) => l.map((o) => (o.id === id ? { ...o, [k]: v } : o)));
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  const negocios = db.negocios.filter((n) => n.clienteId === ex?.id);
  const pedidos = db.pedidos.filter((p) => p.clienteId === ex?.id);
  const feira = db.feiras.find((x) => x.id === ex?.feiraId);

  function salvar() {
    const falta: { id: string; label: string }[] = [];
    if (!f.nome.trim()) falta.push({ id: 'nome', label: t('feiras.cliente.nome') });
    if (f.telefone.replace(/\D/g, '').length < 10) falta.push({ id: 'telefone', label: t('feiras.cliente.whatsapp') });
    if (!f.categoria.trim()) falta.push({ id: 'categoria', label: t('feiras.cliente.segmento') });
    setFaltam(falta.map((x) => x.id));
    if (falta.length) return setErro(t('feiras.cliente.erroFaltam', { campos: falta.map((x) => x.label).join(', ') }));
    // Linhas totalmente em branco são descartadas; as com dados precisam de nome.
    const preenchidos = outros.filter((o) => o.nome.trim() || o.telefone.trim() || o.obs.trim());
    if (preenchidos.some((o) => !o.nome.trim())) return setErro(t('feiras.cliente.erroOutroNome'));
    setErro('');
    const id = s.salvarCliente({ id: ex?.id, ...f, nome: f.nome.trim(), outrosContatos: preenchidos.map((o) => ({ ...o, nome: o.nome.trim(), obs: o.obs.trim() })) });
    avisar(t('feiras.cliente.salvo'));
    if (!ex) abrir('cliente', id); else fechar();
  }

  return (
    <Drawer aberto largo titulo={ex ? ex.nome : t('feiras.cliente.novo')} subtitulo={ex ? [ex.empresa, feira && t('feiras.cliente.conheceuEm', { nome: feira.nome })].filter(Boolean).join(' · ') : undefined} onClose={fechar}
      rodape={<>
        {ex && <button className="fe-btn fe-btn-danger" onClick={() => { if (confirm(t('feiras.cliente.confirmarExcluir', { nome: ex.nome }))) { s.excluirCliente(ex.id); fechar(); } }}><Icon name="trash" size={16} /></button>}
        <button className="fe-btn fe-btn-primary fe-grow" onClick={salvar}>{ex ? t('feiras.cliente.salvarAlt') : t('feiras.cliente.cadastrar')}</button></>}>
      {erro && <div className="fe-notice" role="alert">{erro}</div>}
      <Secao titulo={t('feiras.secao.dados')}>
      {ex?.telefone && <div><a className="fe-btn fe-btn-wa" href={waLink(ex.telefone)} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={16} /> {t('feiras.comum.whatsappNome', { nome: ex.telefone })}</a></div>}
      <div className="fe-form-grid">
        <Field label={t('feiras.cliente.nome') + ' *'} className="fe-full"><input value={f.nome} onChange={set('nome')} placeholder={t('feiras.cliente.nomeCompleto')} aria-required="true" aria-invalid={faltam.includes('nome') || undefined} /></Field>
        <Field label={t('feiras.cliente.whatsapp') + ' *'}><input value={f.telefone} onChange={(e) => setF((x) => ({ ...x, telefone: mascaraTel(e.target.value) }))} inputMode="tel" placeholder={t('feiras.comum.telPlaceholder')} aria-required="true" aria-invalid={faltam.includes('telefone') || undefined} /></Field>
        <Field label={t('feiras.cliente.telefone')} hint={t('feiras.cliente.telefoneHint')}><input value={f.telefoneAlt} onChange={(e) => setF((x) => ({ ...x, telefoneAlt: mascaraTel(e.target.value) }))} inputMode="tel" placeholder={t('feiras.comum.telPlaceholder')} /></Field>
        <Field label={t('feiras.cliente.segmento') + ' *'} className="fe-full">
          <select value={outroSeg ? '__outros' : f.categoria} aria-required="true" aria-invalid={faltam.includes('categoria') || undefined} onChange={(e) => {
            if (e.target.value === '__outros') { setOutroSeg(true); setF((x) => ({ ...x, categoria: rotulos.includes(x.categoria) ? '' : x.categoria })); }
            else { setOutroSeg(false); setF((x) => ({ ...x, categoria: e.target.value })); }
          }}>
            <option value="">{t('feiras.cliente.segmentoSelecione')}</option>
            {rotulos.map((r) => <option key={r} value={r}>{r}</option>)}
            <option value="__outros">{t('feiras.seg.outros')}</option>
          </select>
        </Field>
        {outroSeg && <Field label={t('feiras.cliente.segmentoOutro') + ' *'} className="fe-full"><input autoFocus value={f.categoria} onChange={set('categoria')} placeholder={t('feiras.cliente.segmentoEx')} aria-invalid={faltam.includes('categoria') || undefined} /></Field>}
      </div>
      </Secao>

      <Secao titulo={t('feiras.comum.maisDetalhes')}>
        <div className="fe-form-grid">
          <Field label={t('feiras.cliente.empresa')}><input value={f.empresa} onChange={set('empresa')} /></Field>
          <Field label={t('feiras.cliente.cidade')}><input value={f.cidade} onChange={set('cidade')} /></Field>
          <Field label={t('feiras.cliente.email')} className="fe-full"><input type="email" value={f.email} onChange={set('email')} inputMode="email" /></Field>
          <Field label={t('feiras.cliente.obs')} className="fe-full"><textarea value={f.obs} onChange={set('obs')} placeholder={t('feiras.cliente.obsEx')} /></Field>
        </div>

        {outros.length === 0 ? (
          <div><button type="button" className="fe-btn fe-btn-outline fe-btn-sm" onClick={() => setOutros([novoOutro()])}><Icon name="plus" size={14} /> {t('feiras.cliente.addOutroContato')}</button></div>
        ) : (
          <div className="fe-outros">
            <h5 className="fe-outros-titulo">{t('feiras.cliente.outrosContatos')}</h5>
            {outros.map((o) => (
              <div className="fe-outro" key={o.id}>
                <div className="fe-form-grid">
                  <Field label={t('feiras.cliente.nome')}><input value={o.nome} onChange={(e) => atualizarOutro(o.id, 'nome', e.target.value)} placeholder={t('feiras.cliente.nomeCompleto')} /></Field>
                  <Field label={t('feiras.cliente.telefone')}><input value={o.telefone} onChange={(e) => atualizarOutro(o.id, 'telefone', mascaraTel(e.target.value))} inputMode="tel" placeholder={t('feiras.comum.telPlaceholder')} /></Field>
                  <Field label={t('feiras.cliente.obsContato')} className="fe-full"><input value={o.obs} onChange={(e) => atualizarOutro(o.id, 'obs', e.target.value)} placeholder={t('feiras.cliente.obsContatoEx')} /></Field>
                </div>
                <button type="button" className="fe-btn fe-btn-danger fe-btn-sm" aria-label={t('feiras.cliente.removerContato')} onClick={() => setOutros((l) => l.filter((x) => x.id !== o.id))}><Icon name="trash" size={14} /></button>
              </div>
            ))}
            <div><button type="button" className="fe-btn fe-btn-outline fe-btn-sm" onClick={() => setOutros((l) => [...l, novoOutro()])}><Icon name="plus" size={14} /> {t('feiras.cliente.addMaisUm')}</button></div>
          </div>
        )}
      </Secao>

      {ex && (
        <>
          <Secao titulo={t('feiras.cliente.negociacoes', { n: negocios.length })}>
            {negocios.length === 0 ? <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{t('feiras.cliente.nenhumaNeg')}</p> : (
              <div className="fe-list">{negocios.map((n) => (
                <button key={n.id} className="fe-list-item" onClick={() => abrir('negocio', n.id)}>
                  <div className="fe-grow"><div className="fe-t">{n.titulo}</div><div className="fe-s">{t('feiras.etapa.' + n.etapa)} · {brl(n.valor)}</div></div><Icon name="chevron" size={16} />
                </button>))}</div>
            )}
            <button className="fe-btn fe-btn-outline fe-btn-sm" style={{ marginTop: 10 }} onClick={() => abrir('negocio', null, ex.id)}><Icon name="plus" size={14} /> {t('feiras.cliente.novaNeg')}</button>
          </Secao>

          {pedidos.length > 0 && (
            <Secao titulo={t('feiras.cliente.pedidos', { n: pedidos.length })}>
              <div className="fe-list">{pedidos.map((p) => (
                <button key={p.id} className="fe-list-item" onClick={() => abrir('pedido', p.id)}>
                  <div className="fe-grow"><div className="fe-t">{brl(totalPedido(p))}</div><div className="fe-s">{t(CHAVE_STATUS[p.status])} · {dataLonga(p.dataPedido)}</div></div><Icon name="chevron" size={16} />
                </button>))}</div>
            </Secao>
          )}

          <Secao titulo={t('feiras.cliente.historico')}>
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
          </Secao>
        </>
      )}
    </Drawer>
  );
}
