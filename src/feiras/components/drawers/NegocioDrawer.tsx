import { useState } from 'react';
import { useStore } from '../../lib/store';
import { useUi } from '../../lib/ui';
import { addDias, brl, dataLonga, hoje, mascaraTel, relativo, waLink } from '../../lib/format';
import { ETAPAS, TIPOS_CONTATO, type Etapa, type ItemPedido, type Temperatura, type TipoContato } from '../../lib/types';
import { Drawer, Field } from '../ui';
import Icon from '../Icon';
import ItensEditor from '../ItensEditor';
import { useFeirasT } from '../../lib/i18n';

export default function NegocioDrawer() {
  const { drawer, fechar, abrir, avisar, ir } = useUi();
  const s = useStore();
  const { t } = useFeirasT();
  const { db } = s;
  const existente = db.negocios.find((n) => n.id === drawer?.id);
  const novo = !existente;

  const [clienteId, setClienteId] = useState(existente?.clienteId ?? drawer?.ctx ?? db.clientes[0]?.id ?? '');
  const [temp, setTemp] = useState<Temperatura>(existente?.temperatura ?? 'morno');
  const [prox, setProx] = useState(existente?.proximoContato ?? '');
  const [tipo, setTipo] = useState<TipoContato>('whatsapp');
  const [nota, setNota] = useState('');
  const [modo, setModo] = useState<'ver' | 'fechar' | 'perder'>('ver');
  const [motivo, setMotivo] = useState('');
  const [itens, setItens] = useState<ItemPedido[]>(existente?.itens?.length ? existente.itens : [{ produtoId: null, nome: existente?.titulo ?? '', qtd: 1, unit: existente?.valor ?? 0, custoUnit: 0, tempoH: 0 }]);
  // O título e o valor da negociação vêm dos itens (catálogo ou avulsos).
  const itensValidos = itens.filter((i) => (i.nome.trim() || i.produtoId) && i.qtd > 0);
  const resumoItens = itensValidos.map((i) => (itensValidos.length > 1 || i.qtd > 1 ? `${i.qtd}x ${i.nome}` : i.nome)).join(', ');
  const totalItens = itensValidos.reduce((sum, i) => sum + i.qtd * i.unit, 0);
  const [entrega, setEntrega] = useState(addDias(10));
  const [erro, setErro] = useState('');
  // Cadastro rápido de cliente dentro da própria negociação.
  const [novoCliente, setNovoCliente] = useState(false);
  const [cli, setCli] = useState({ nome: '', telefone: '', empresa: '' });

  function cadastrarCliente() {
    if (!cli.nome.trim()) return setErro(t('feiras.neg.erroNomeCliente'));
    const id = s.salvarCliente({ nome: cli.nome.trim(), telefone: cli.telefone, empresa: cli.empresa.trim() });
    setClienteId(id);
    setCli({ nome: '', telefone: '', empresa: '' });
    setNovoCliente(false);
    setErro('');
    avisar(t('feiras.neg.clienteCadastrado'));
  }

  const cliente = db.clientes.find((c) => c.id === clienteId);
  const aberto = existente && existente.etapa !== 'fechado' && existente.etapa !== 'perdido';
  const idxEtapa = ETAPAS.findIndex((e) => e.id === existente?.etapa);

  function salvar() {
    if (!clienteId) return setErro(t('feiras.neg.erroEscolherCliente'));
    if (!resumoItens) return setErro(t('feiras.neg.erroItens'));
    const id = s.salvarNegocio({ id: existente?.id, clienteId, titulo: resumoItens, valor: Math.round(totalItens * 100) / 100, temperatura: temp, proximoContato: prox || null, itens: itensValidos });
    avisar(t('feiras.neg.salva'));
    if (novo) abrir('negocio', id); else fechar();
  }

  function mover(e: Etapa) {
    if (!existente || e === existente.etapa) return;
    if (e === 'fechado') { setModo('fechar'); return; }
    if (e === 'perdido') { setModo('perder'); return; }
    s.moverNegocio(existente.id, e);
    avisar(t('feiras.neg.movido', { etapa: t('feiras.etapa.' + e) }));
  }

  function addContato() {
    if (!clienteId || !nota.trim()) return;
    s.registrarContato(clienteId, tipo, nota.trim());
    setNota('');
    if (!prox) setProx(addDias(3));
    avisar(t('feiras.neg.contatoRegistrado'));
  }

  function confirmarFechamento() {
    const validos = itens.filter((i) => (i.nome.trim() || i.produtoId) && i.qtd > 0);
    if (!validos.length) return setErro(t('feiras.neg.erroItemPedido'));
    s.fecharNegocio(existente!.id, validos, entrega);
    fechar();
    avisar(t('feiras.neg.fechado'), { label: t('feiras.neg.verFila'), fn: () => ir('fila') });
  }

  const salvarBar = modo === 'ver' ? (
    <>
      {existente && <button className="fe-btn fe-btn-danger" onClick={() => { if (confirm(t('feiras.neg.confirmarExcluir'))) { s.excluirNegocio(existente.id); fechar(); } }}><Icon name="trash" size={16} /></button>}
      <button className="fe-btn fe-btn-primary fe-grow" onClick={salvar}>{novo ? t('feiras.neg.criar') : t('feiras.neg.salvarAlt')}</button>
    </>
  ) : modo === 'fechar' ? (
    <><button className="fe-btn fe-btn-outline" onClick={() => setModo('ver')}>{t('feiras.comum.voltar')}</button><button className="fe-btn fe-btn-primary fe-grow" onClick={confirmarFechamento}><Icon name="check" size={16} /> {t('feiras.neg.fecharGerar')}</button></>
  ) : (
    <><button className="fe-btn fe-btn-outline" onClick={() => setModo('ver')}>{t('feiras.comum.voltar')}</button><button className="fe-btn fe-btn-danger fe-grow" onClick={() => { s.moverNegocio(existente!.id, 'perdido', motivo.trim() || t('feiras.neg.motivoNaoInformado')); fechar(); avisar(t('feiras.neg.marcadoPerdido')); }}>{t('feiras.neg.confirmarPerda')}</button></>
  );

  const msgWa = cliente ? t('feiras.neg.msgWa', {
    nome: cliente.nome.split(' ')[0],
    local: s.feiraAtiva?.nome ? t('feiras.neg.msgWaFeira', { nome: s.feiraAtiva.nome }) : t('feiras.neg.msgWaFeiraSem'),
    assunto: resumoItens || existente?.titulo || t('feiras.neg.msgWaInteresse'),
  }) : '';

  return (
    <Drawer aberto largo titulo={novo ? t('feiras.neg.nova') : cliente?.nome ?? t('feiras.neg.tituloPadrao')} subtitulo={novo ? undefined : existente?.titulo} onClose={fechar} rodape={salvarBar}>
      {erro && <div className="fe-notice" role="alert">{erro}</div>}

      {existente && (
        <div>
          <div className="fe-stepper" role="group" aria-label={t('feiras.neg.etapa')}>
            {ETAPAS.filter((e) => e.id !== 'perdido').map((e, i) => (
              <button key={e.id} type="button" className={i < idxEtapa && existente.etapa !== 'perdido' ? 'fe-past' : e.id === existente.etapa ? 'fe-cur' : ''} onClick={() => mover(e.id)}>{t('feiras.etapa.' + e.id)}</button>
            ))}
          </div>
          {existente.etapa === 'perdido' && <div className="fe-notice" style={{ marginTop: 10 }}><b>{t('feiras.neg.perdido')}</b> {existente.motivoPerda} <button className="fe-btn fe-btn-sm fe-btn-outline" style={{ marginLeft: 8 }} onClick={() => s.moverNegocio(existente.id, 'negociando')}>{t('feiras.neg.reabrir')}</button></div>}
          {existente.etapa === 'fechado' && existente.pedidoId && <div className="fe-notice" style={{ marginTop: 10, background: 'var(--primary-tint)', color: 'var(--primary-dark)' }}>{t('feiras.neg.fechadoComPedido')} <button className="fe-btn fe-btn-sm fe-btn-outline" style={{ marginLeft: 8 }} onClick={() => abrir('pedido', existente.pedidoId)}>{t('feiras.neg.verPedido')}</button></div>}
        </div>
      )}

      {modo === 'fechar' && (
        <>
          <div className="fe-notice" style={{ background: 'var(--primary-tint)', color: 'var(--primary-dark)' }}>{t('feiras.neg.confirmeCombinado')}</div>
          <ItensEditor itens={itens} onChange={setItens} />
          <Field label={t('feiras.neg.prazoEntrega')}><input type="date" value={entrega} min={hoje()} onChange={(e) => setEntrega(e.target.value)} /></Field>
        </>
      )}

      {modo === 'perder' && (
        <Field label={t('feiras.neg.porQueNao')} hint={t('feiras.neg.porQueHint')}><textarea autoFocus value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder={t('feiras.neg.porQueEx')} /></Field>
      )}

      {modo === 'ver' && (
        <>
          <div className="fe-form-grid">
            <Field label={t('feiras.neg.cliente')} className="fe-full">
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} disabled={!novo}>
                {db.clientes.length === 0 && <option value="">{t('feiras.neg.nenhumCliente')}</option>}
                {db.clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.empresa ? ` · ${c.empresa}` : ''}</option>)}
              </select>
              {novo && !novoCliente && (
                <button type="button" className="fe-btn fe-btn-outline fe-btn-sm" style={{ marginTop: 8, alignSelf: 'flex-start' }} onClick={() => setNovoCliente(true)}>
                  <Icon name="plus" size={14} /> {t('feiras.neg.novoCliente')}
                </button>
              )}
            </Field>
            {novo && novoCliente && (
              <div className="fe-full fe-card fe-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="fe-sec-title" style={{ margin: 0 }}>{t('feiras.cliBusca.cadastrarTitulo')}</div>
                <div className="fe-form-grid">
                  <Field label={t('feiras.cliBusca.nome')} className="fe-full"><input autoFocus value={cli.nome} onChange={(e) => setCli((x) => ({ ...x, nome: e.target.value }))} placeholder={t('feiras.cliBusca.nomeCompleto')} /></Field>
                  <Field label={t('feiras.comum.whatsapp')}><input value={cli.telefone} onChange={(e) => setCli((x) => ({ ...x, telefone: mascaraTel(e.target.value) }))} inputMode="tel" placeholder={t('feiras.comum.telPlaceholder')} /></Field>
                  <Field label={t('feiras.cliBusca.empresa')}><input value={cli.empresa} onChange={(e) => setCli((x) => ({ ...x, empresa: e.target.value }))} /></Field>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="fe-btn fe-btn-primary" onClick={cadastrarCliente}>{t('feiras.cliBusca.cadastrar')}</button>
                  <button type="button" className="fe-btn fe-btn-outline" onClick={() => { setNovoCliente(false); setErro(''); }}>{t('feiras.comum.cancelar')}</button>
                </div>
              </div>
            )}
            <Field label={t('feiras.neg.proximoContato')} className="fe-full">
              <input type="date" value={prox} onChange={(e) => setProx(e.target.value)} />
              {prox && existente && aberto && <span className="fe-hint">{relativo(prox)}</span>}
            </Field>
          </div>
          <div>
            <div className="fe-sec-title">{t('feiras.neg.temperatura')}</div>
            <div className="fe-seg">{(['frio', 'morno', 'quente'] as const).map((id) => <button key={id} type="button" data-t={id} className={temp === id ? 'fe-on' : ''} onClick={() => setTemp(id)}>{t('feiras.tempCap.' + id)}</button>)}</div>
          </div>

          {existente && aberto && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {cliente?.telefone && <a className="fe-btn fe-btn-wa" href={waLink(cliente.telefone, msgWa)} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={16} /> {t('feiras.neg.chamarWa')}</a>}
              <button className="fe-btn fe-btn-primary" onClick={() => setModo('fechar')}><Icon name="check" size={16} /> {t('feiras.neg.fecharNegocio')}</button>
              <button className="fe-btn fe-btn-outline" onClick={() => setModo('perder')}>{t('feiras.neg.marcarPerdido')}</button>
            </div>
          )}

          {cliente && existente && (
            <div>
              <div className="fe-sec-title">{t('feiras.neg.historicoCom', { nome: cliente.nome.split(' ')[0] })}</div>
              <div className="fe-inline-add" style={{ marginBottom: 14 }}>
                <div className="fe-seg">{TIPOS_CONTATO.map((tc) => <button key={tc.id} type="button" className={tipo === tc.id ? 'fe-on' : ''} onClick={() => setTipo(tc.id)}>{t('feiras.contato.' + tc.id)}</button>)}</div>
                <input className="fe-input" value={nota} onChange={(e) => setNota(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addContato()} placeholder={t('feiras.cliente.oQueConversado')} />
                <div><button className="fe-btn fe-btn-outline fe-btn-sm" onClick={addContato} disabled={!nota.trim()}>{t('feiras.cliente.registrar')}</button></div>
              </div>
              <div className="fe-timeline">
                {cliente.contatos.length === 0 && <p className="fe-hint" style={{ color: 'var(--text-3)', fontSize: 13 }}>{t('feiras.neg.nenhumContato')}</p>}
                {cliente.contatos.map((c) => (
                  <div className="fe-tl" key={c.id}><span className="fe-pt" /><div style={{ flex: 1 }}>
                    <div className="fe-h">{dataLonga(c.data)} · {t('feiras.contato.' + c.tipo)}<button className="fe-del" onClick={() => s.excluirContato(cliente.id, c.id)} aria-label={t('feiras.neg.excluirContato')}>{t('feiras.comum.excluir')}</button></div>
                    <div className="fe-n">{c.nota}</div></div></div>
                ))}
              </div>
              <button className="fe-btn fe-btn-ghost fe-btn-sm" onClick={() => abrir('cliente', cliente.id)}>{t('feiras.neg.abrirCadastro')}</button>
            </div>
          )}
          {(!existente || aberto) && (
            <div>
              <div className="fe-sec-title">{t('feiras.neg.oQueQuer')}</div>
              <ItensEditor itens={itens} onChange={setItens} rotuloTotal={t('feiras.neg.valorEstimado')} />
              {db.produtos.length === 0 && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--text-3)' }}>{t('feiras.neg.semProdutos')}</p>}
            </div>
          )}
          {existente && <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{t('feiras.neg.valorAtual', { v: brl(existente.valor), d: dataLonga(existente.criadoEm) })}</p>}
        </>
      )}
    </Drawer>
  );
}
