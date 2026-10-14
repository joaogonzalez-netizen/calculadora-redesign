import { useState } from 'react';
import { useStore } from '../../lib/store';
import { useUi } from '../../lib/ui';
import { addDias, dataLonga, hoje } from '../../lib/format';
import { STATUS_PEDIDO, type ItemPedido, type StatusPedido } from '../../lib/types';
import { Drawer, Field } from '../ui';
import Icon from '../Icon';
import ItensEditor from '../ItensEditor';

export default function PedidoDrawer() {
  const { drawer, fechar, abrir, avisar } = useUi();
  const s = useStore();
  const { db } = s;
  const ex = db.pedidos.find((p) => p.id === drawer?.id);
  const [clienteId, setClienteId] = useState(ex?.clienteId ?? db.clientes[0]?.id ?? '');
  const [status, setStatus] = useState<StatusPedido>(ex?.status ?? 'Na fila');
  const [data, setData] = useState(ex?.dataPedido ?? hoje());
  const [entrega, setEntrega] = useState(ex?.entrega ?? addDias(7));
  const [obs, setObs] = useState(ex?.obs ?? '');
  const [itens, setItens] = useState<ItemPedido[]>(ex?.itens ?? [{ produtoId: null, nome: '', qtd: 1, unit: 0, custoUnit: 0, tempoH: 0 }]);
  const [erro, setErro] = useState('');

  function salvar() {
    if (!clienteId) return setErro('Escolha o cliente.');
    const validos = itens.filter((i) => (i.nome.trim() || i.produtoId) && i.qtd > 0);
    if (!validos.length) return setErro('Adicione ao menos um item.');
    s.salvarPedido({ id: ex?.id, clienteId, itens: validos, status, dataPedido: data, entrega, obs });
    avisar('Pedido salvo');
    fechar();
  }

  return (
    <Drawer aberto largo titulo={ex ? 'Pedido' : 'Novo pedido'} subtitulo={ex ? `${db.clientes.find((c) => c.id === ex.clienteId)?.nome ?? ''} · ${dataLonga(ex.dataPedido)}` : undefined} onClose={fechar}
      rodape={<>
        {ex && <button className="fe-btn fe-btn-danger" onClick={() => { if (confirm('Excluir este pedido?')) { s.excluirPedido(ex.id); fechar(); } }}><Icon name="trash" size={16} /></button>}
        <button className="fe-btn fe-btn-primary fe-grow" onClick={salvar}>Salvar pedido</button></>}>
      {erro && <div className="fe-notice" role="alert">{erro}</div>}
      <div className="fe-form-grid">
        <Field label="Cliente" className="fe-full">
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} disabled={!!ex}>
            {db.clientes.length === 0 && <option value="">Cadastre um cliente primeiro</option>}
            {db.clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Field>
        <Field label="Data do pedido"><input type="date" value={data} onChange={(e) => setData(e.target.value)} /></Field>
        <Field label="Entrega"><input type="date" value={entrega} onChange={(e) => setEntrega(e.target.value)} /></Field>
      </div>
      <div>
        <div className="fe-sec-title">Andamento</div>
        <div className="fe-chips">{STATUS_PEDIDO.map((st) => <button key={st} type="button" className={'fe-chip' + (status === st ? ' fe-on' : '')} onClick={() => setStatus(st)}>{st}</button>)}</div>
      </div>
      <ItensEditor itens={itens} onChange={setItens} />
      <Field label="Observações"><textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Cor, acabamento, forma de pagamento…" /></Field>
      {ex?.negocioId && <button className="fe-btn fe-btn-ghost fe-btn-sm" onClick={() => abrir('negocio', ex.negocioId)}>Ver negociação de origem</button>}
    </Drawer>
  );
}
