import { useState } from 'react';
import { useStore, totalPedido } from '../../lib/store';
import { useUi } from '../../lib/ui';
import { brl, dataLonga, mascaraTel, waLink } from '../../lib/format';
import { ETAPAS, TIPOS_CONTATO, type TipoContato } from '../../lib/types';
import { Drawer, Field } from '../ui';
import Icon from '../Icon';

export default function ClienteDrawer() {
  const { drawer, fechar, abrir, avisar } = useUi();
  const s = useStore();
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
    if (!f.nome.trim()) return setErro('O nome é obrigatório.');
    const id = s.salvarCliente({ id: ex?.id, ...f, nome: f.nome.trim() });
    avisar('Cliente salvo');
    if (!ex) abrir('cliente', id); else fechar();
  }

  return (
    <Drawer aberto largo titulo={ex ? ex.nome : 'Novo cliente'} subtitulo={ex ? [ex.empresa, feira && `conheceu em ${feira.nome}`].filter(Boolean).join(' · ') : undefined} onClose={fechar}
      rodape={<>
        {ex && <button className="fe-btn fe-btn-danger" onClick={() => { if (confirm(`Excluir ${ex.nome} e tudo ligado a ele (negociações e pedidos)?`)) { s.excluirCliente(ex.id); fechar(); } }}><Icon name="trash" size={16} /></button>}
        <button className="fe-btn fe-btn-primary fe-grow" onClick={salvar}>{ex ? 'Salvar alterações' : 'Cadastrar cliente'}</button></>}>
      {erro && <div className="fe-notice" role="alert">{erro}</div>}
      {ex?.telefone && <div><a className="fe-btn fe-btn-wa" href={waLink(ex.telefone)} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={16} /> WhatsApp {ex.telefone}</a></div>}
      <div className="fe-form-grid">
        <Field label="Nome" className="fe-full"><input value={f.nome} onChange={set('nome')} placeholder="Nome completo" /></Field>
        <Field label="Empresa / loja"><input value={f.empresa} onChange={set('empresa')} /></Field>
        <Field label="Segmento"><input value={f.categoria} onChange={set('categoria')} placeholder="Ex: Loja de presentes" /></Field>
        <Field label="WhatsApp"><input value={f.telefone} onChange={(e) => setF((x) => ({ ...x, telefone: mascaraTel(e.target.value) }))} inputMode="tel" placeholder="(47) 99999-9999" /></Field>
        <Field label="E-mail"><input type="email" value={f.email} onChange={set('email')} inputMode="email" /></Field>
        <Field label="Cidade" className="fe-full"><input value={f.cidade} onChange={set('cidade')} /></Field>
        <Field label="Observações" className="fe-full"><textarea value={f.obs} onChange={set('obs')} placeholder="Ex: prefere pagar no Pix, atende só de manhã" /></Field>
      </div>

      {ex && (
        <>
          <div>
            <div className="fe-sec-title">Negociações ({negocios.length})</div>
            {negocios.length === 0 ? <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Nenhuma negociação.</p> : (
              <div className="fe-list">{negocios.map((n) => (
                <button key={n.id} className="fe-list-item" onClick={() => abrir('negocio', n.id)}>
                  <div className="fe-grow"><div className="fe-t">{n.titulo}</div><div className="fe-s">{ETAPAS.find((e) => e.id === n.etapa)?.label} · {brl(n.valor)}</div></div><Icon name="chevron" size={16} />
                </button>))}</div>
            )}
            <button className="fe-btn fe-btn-outline fe-btn-sm" style={{ marginTop: 10 }} onClick={() => abrir('negocio', null, ex.id)}><Icon name="plus" size={14} /> Nova negociação</button>
          </div>

          {pedidos.length > 0 && (
            <div>
              <div className="fe-sec-title">Pedidos ({pedidos.length})</div>
              <div className="fe-list">{pedidos.map((p) => (
                <button key={p.id} className="fe-list-item" onClick={() => abrir('pedido', p.id)}>
                  <div className="fe-grow"><div className="fe-t">{brl(totalPedido(p))}</div><div className="fe-s">{p.status} · {dataLonga(p.dataPedido)}</div></div><Icon name="chevron" size={16} />
                </button>))}</div>
            </div>
          )}

          <div>
            <div className="fe-sec-title">Histórico de contatos</div>
            <div className="fe-inline-add" style={{ marginBottom: 14 }}>
              <div className="fe-seg">{TIPOS_CONTATO.map((t) => <button key={t.id} type="button" className={tipo === t.id ? 'fe-on' : ''} onClick={() => setTipo(t.id)}>{t.label}</button>)}</div>
              <input className="fe-input" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="O que foi conversado?" />
              <div><button className="fe-btn fe-btn-outline fe-btn-sm" disabled={!nota.trim()} onClick={() => { s.registrarContato(ex.id, tipo, nota.trim()); setNota(''); avisar('Contato registrado'); }}>Registrar contato</button></div>
            </div>
            <div className="fe-timeline">
              {ex.contatos.map((c) => (
                <div className="fe-tl" key={c.id}><span className="fe-pt" /><div style={{ flex: 1 }}>
                  <div className="fe-h">{dataLonga(c.data)} · {TIPOS_CONTATO.find((t) => t.id === c.tipo)?.label}<button className="fe-del" onClick={() => s.excluirContato(ex.id, c.id)}>excluir</button></div>
                  <div className="fe-n">{c.nota}</div></div></div>
              ))}
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
