import { useState } from 'react';
import { useStore } from '../../lib/store';
import { useUi } from '../../lib/ui';
import { addDias, brl, dataLonga, hoje, mascaraTel, relativo, waLink } from '../../lib/format';
import { ETAPAS, TIPOS_CONTATO, type Etapa, type ItemPedido, type Temperatura, type TipoContato } from '../../lib/types';
import { Drawer, Field } from '../ui';
import Icon from '../Icon';
import ItensEditor from '../ItensEditor';

export default function NegocioDrawer() {
  const { drawer, fechar, abrir, avisar, ir } = useUi();
  const s = useStore();
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
    if (!cli.nome.trim()) return setErro('Informe o nome do cliente.');
    const id = s.salvarCliente({ nome: cli.nome.trim(), telefone: cli.telefone, empresa: cli.empresa.trim() });
    setClienteId(id);
    setCli({ nome: '', telefone: '', empresa: '' });
    setNovoCliente(false);
    setErro('');
    avisar('Cliente cadastrado e selecionado');
  }

  const cliente = db.clientes.find((c) => c.id === clienteId);
  const aberto = existente && existente.etapa !== 'fechado' && existente.etapa !== 'perdido';
  const idxEtapa = ETAPAS.findIndex((e) => e.id === existente?.etapa);

  function salvar() {
    if (!clienteId) return setErro('Escolha o cliente ou clique em “Novo cliente” para cadastrar.');
    if (!resumoItens) return setErro('Adicione ao menos um produto da calculadora ou um item avulso.');
    const id = s.salvarNegocio({ id: existente?.id, clienteId, titulo: resumoItens, valor: Math.round(totalItens * 100) / 100, temperatura: temp, proximoContato: prox || null, itens: itensValidos });
    avisar('Negociação salva');
    if (novo) abrir('negocio', id); else fechar();
  }

  function mover(e: Etapa) {
    if (!existente || e === existente.etapa) return;
    if (e === 'fechado') { setModo('fechar'); return; }
    if (e === 'perdido') { setModo('perder'); return; }
    s.moverNegocio(existente.id, e);
    avisar(`Movido para “${ETAPAS.find((x) => x.id === e)!.label}”`);
  }

  function addContato() {
    if (!clienteId || !nota.trim()) return;
    s.registrarContato(clienteId, tipo, nota.trim());
    setNota('');
    if (!prox) setProx(addDias(3));
    avisar('Contato registrado');
  }

  function confirmarFechamento() {
    const validos = itens.filter((i) => (i.nome.trim() || i.produtoId) && i.qtd > 0);
    if (!validos.length) return setErro('Adicione ao menos um item ao pedido.');
    s.fecharNegocio(existente!.id, validos, entrega);
    fechar();
    avisar('Negócio fechado! Pedido criado na fila.', { label: 'Ver fila de pedidos', fn: () => ir('fila') });
  }

  const salvarBar = modo === 'ver' ? (
    <>
      {existente && <button className="fe-btn fe-btn-danger" onClick={() => { if (confirm('Excluir esta negociação?')) { s.excluirNegocio(existente.id); fechar(); } }}><Icon name="trash" size={16} /></button>}
      <button className="fe-btn fe-btn-primary fe-grow" onClick={salvar}>{novo ? 'Criar negociação' : 'Salvar alterações'}</button>
    </>
  ) : modo === 'fechar' ? (
    <><button className="fe-btn fe-btn-outline" onClick={() => setModo('ver')}>Voltar</button><button className="fe-btn fe-btn-primary fe-grow" onClick={confirmarFechamento}><Icon name="check" size={16} /> Fechar e gerar pedido</button></>
  ) : (
    <><button className="fe-btn fe-btn-outline" onClick={() => setModo('ver')}>Voltar</button><button className="fe-btn fe-btn-danger fe-grow" onClick={() => { s.moverNegocio(existente!.id, 'perdido', motivo.trim() || 'Não informado'); fechar(); avisar('Marcado como perdido'); }}>Confirmar perda</button></>
  );

  const msgWa = cliente ? `Oi ${cliente.nome.split(' ')[0]}, tudo bem? Aqui é da ${s.feiraAtiva?.nome ? 'feira ' + s.feiraAtiva.nome : 'feira'}. Sobre ${resumoItens || existente?.titulo || 'o seu interesse'}…` : '';

  return (
    <Drawer aberto largo titulo={novo ? 'Nova negociação' : cliente?.nome ?? 'Negociação'} subtitulo={novo ? undefined : existente?.titulo} onClose={fechar} rodape={salvarBar}>
      {erro && <div className="fe-notice" role="alert">{erro}</div>}

      {existente && (
        <div>
          <div className="fe-stepper" role="group" aria-label="Etapa">
            {ETAPAS.filter((e) => e.id !== 'perdido').map((e, i) => (
              <button key={e.id} type="button" className={i < idxEtapa && existente.etapa !== 'perdido' ? 'fe-past' : e.id === existente.etapa ? 'fe-cur' : ''} onClick={() => mover(e.id)}>{e.label}</button>
            ))}
          </div>
          {existente.etapa === 'perdido' && <div className="fe-notice" style={{ marginTop: 10 }}><b>Perdido.</b> {existente.motivoPerda} <button className="fe-btn fe-btn-sm fe-btn-outline" style={{ marginLeft: 8 }} onClick={() => s.moverNegocio(existente.id, 'negociando')}>Reabrir</button></div>}
          {existente.etapa === 'fechado' && existente.pedidoId && <div className="fe-notice" style={{ marginTop: 10, background: 'var(--primary-tint)', color: 'var(--primary-dark)' }}>Fechado com pedido gerado. <button className="fe-btn fe-btn-sm fe-btn-outline" style={{ marginLeft: 8 }} onClick={() => abrir('pedido', existente.pedidoId)}>Ver pedido</button></div>}
        </div>
      )}

      {modo === 'fechar' && (
        <>
          <div className="fe-notice" style={{ background: 'var(--primary-tint)', color: 'var(--primary-dark)' }}>Confirme o que foi combinado. Isso cria o pedido e coloca na fila de produção.</div>
          <ItensEditor itens={itens} onChange={setItens} />
          <Field label="Prazo de entrega"><input type="date" value={entrega} min={hoje()} onChange={(e) => setEntrega(e.target.value)} /></Field>
        </>
      )}

      {modo === 'perder' && (
        <Field label="Por que não avançou?" hint="Ajuda a ver padrões depois do atendimento"><textarea autoFocus value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex: achou caro, comprou de outro, sumiu" /></Field>
      )}

      {modo === 'ver' && (
        <>
          <div className="fe-form-grid">
            <Field label="Cliente" className="fe-full">
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} disabled={!novo}>
                {db.clientes.length === 0 && <option value="">Nenhum cliente cadastrado</option>}
                {db.clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}{c.empresa ? ` · ${c.empresa}` : ''}</option>)}
              </select>
              {novo && !novoCliente && (
                <button type="button" className="fe-btn fe-btn-outline fe-btn-sm" style={{ marginTop: 8, alignSelf: 'flex-start' }} onClick={() => setNovoCliente(true)}>
                  <Icon name="plus" size={14} /> Novo cliente
                </button>
              )}
            </Field>
            {novo && novoCliente && (
              <div className="fe-full fe-card fe-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="fe-sec-title" style={{ margin: 0 }}>Cadastrar novo cliente</div>
                <div className="fe-form-grid">
                  <Field label="Nome" className="fe-full"><input autoFocus value={cli.nome} onChange={(e) => setCli((x) => ({ ...x, nome: e.target.value }))} placeholder="Nome completo" /></Field>
                  <Field label="WhatsApp"><input value={cli.telefone} onChange={(e) => setCli((x) => ({ ...x, telefone: mascaraTel(e.target.value) }))} inputMode="tel" placeholder="(47) 99999-9999" /></Field>
                  <Field label="Empresa / loja"><input value={cli.empresa} onChange={(e) => setCli((x) => ({ ...x, empresa: e.target.value }))} /></Field>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="fe-btn fe-btn-primary" onClick={cadastrarCliente}>Cadastrar cliente</button>
                  <button type="button" className="fe-btn fe-btn-outline" onClick={() => { setNovoCliente(false); setErro(''); }}>Cancelar</button>
                </div>
              </div>
            )}
            <Field label="Próximo contato" className="fe-full">
              <input type="date" value={prox} onChange={(e) => setProx(e.target.value)} />
              {prox && existente && aberto && <span className="fe-hint">{relativo(prox)}</span>}
            </Field>
          </div>
          <div>
            <div className="fe-sec-title">Temperatura</div>
            <div className="fe-seg">{([['frio', 'Frio'], ['morno', 'Morno'], ['quente', 'Quente']] as const).map(([id, l]) => <button key={id} type="button" data-t={id} className={temp === id ? 'fe-on' : ''} onClick={() => setTemp(id)}>{l}</button>)}</div>
          </div>

          {existente && aberto && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {cliente?.telefone && <a className="fe-btn fe-btn-wa" href={waLink(cliente.telefone, msgWa)} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={16} /> Chamar no WhatsApp</a>}
              <button className="fe-btn fe-btn-primary" onClick={() => setModo('fechar')}><Icon name="check" size={16} /> Fechar negócio</button>
              <button className="fe-btn fe-btn-outline" onClick={() => setModo('perder')}>Marcar perdido</button>
            </div>
          )}

          {cliente && existente && (
            <div>
              <div className="fe-sec-title">Histórico com {cliente.nome.split(' ')[0]}</div>
              <div className="fe-inline-add" style={{ marginBottom: 14 }}>
                <div className="fe-seg">{TIPOS_CONTATO.map((t) => <button key={t.id} type="button" className={tipo === t.id ? 'fe-on' : ''} onClick={() => setTipo(t.id)}>{t.label}</button>)}</div>
                <input className="fe-input" value={nota} onChange={(e) => setNota(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addContato()} placeholder="O que foi conversado?" />
                <div><button className="fe-btn fe-btn-outline fe-btn-sm" onClick={addContato} disabled={!nota.trim()}>Registrar contato</button></div>
              </div>
              <div className="fe-timeline">
                {cliente.contatos.length === 0 && <p className="fe-hint" style={{ color: 'var(--text-3)', fontSize: 13 }}>Nenhum contato registrado ainda.</p>}
                {cliente.contatos.map((c) => (
                  <div className="fe-tl" key={c.id}><span className="fe-pt" /><div style={{ flex: 1 }}>
                    <div className="fe-h">{dataLonga(c.data)} · {TIPOS_CONTATO.find((t) => t.id === c.tipo)?.label}<button className="fe-del" onClick={() => s.excluirContato(cliente.id, c.id)} aria-label="Excluir contato">excluir</button></div>
                    <div className="fe-n">{c.nota}</div></div></div>
                ))}
              </div>
              <button className="fe-btn fe-btn-ghost fe-btn-sm" onClick={() => abrir('cliente', cliente.id)}>Abrir cadastro do cliente</button>
            </div>
          )}
          {(!existente || aberto) && (
            <div>
              <div className="fe-sec-title">O que ele quer?</div>
              <ItensEditor itens={itens} onChange={setItens} rotuloTotal="Valor estimado" />
              {db.produtos.length === 0 && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--text-3)' }}>Nenhum cálculo de Venda direta salvo: calcule o produto na Calculadora de preços e salve para escolher aqui. Enquanto isso, descreva o item avulso.</p>}
            </div>
          )}
          {existente && <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Valor atual {brl(existente.valor)} · criado em {dataLonga(existente.criadoEm)}</p>}
        </>
      )}
    </Drawer>
  );
}
