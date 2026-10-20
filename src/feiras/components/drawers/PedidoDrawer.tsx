import { useState } from 'react';
import { useStore } from '../../lib/store';
import { useUi } from '../../lib/ui';
import { addDias, dataLonga, hoje } from '../../lib/format';
import { useFeirasT, CHAVE_STATUS } from '../../lib/i18n';
import { STATUS_PEDIDO, type ItemPedido, type StatusPedido } from '../../lib/types';
import { Drawer, Field, Secao } from '../ui';
import Icon from '../Icon';
import ClienteBusca from '../ClienteBusca';
import ItensEditor from '../ItensEditor';

export default function PedidoDrawer() {
  const { drawer, fechar, abrir, avisar } = useUi();
  const s = useStore();
  const { t } = useFeirasT();
  const { db } = s;
  const ex = db.pedidos.find((p) => p.id === drawer?.id);
  const [clienteId, setClienteId] = useState(ex?.clienteId ?? '');
  const [status, setStatus] = useState<StatusPedido>(ex?.status ?? 'Na fila');
  const [data, setData] = useState(ex?.dataPedido ?? hoje());
  const [entrega, setEntrega] = useState(ex?.entrega ?? addDias(7));
  const [obs, setObs] = useState(ex?.obs ?? '');
  const [itens, setItens] = useState<ItemPedido[]>(ex?.itens ?? [{ produtoId: null, nome: '', qtd: 1, unit: 0, custoUnit: 0, tempoH: 0 }]);
  const [erro, setErro] = useState('');

  function salvar() {
    if (!clienteId) return setErro(t('feiras.pedido.erroCliente'));
    const validos = itens.filter((i) => (i.nome.trim() || i.produtoId) && i.qtd > 0);
    if (!validos.length) return setErro(t('feiras.pedido.erroItem'));
    s.salvarPedido({ id: ex?.id, clienteId, itens: validos, status, dataPedido: data, entrega, obs });
    avisar(t('feiras.pedido.salvo'));
    fechar();
  }

  return (
    <Drawer aberto largo titulo={ex ? t('feiras.pedido.titulo') : t('feiras.pedido.novo')} subtitulo={ex ? `${db.clientes.find((c) => c.id === ex.clienteId)?.nome ?? ''} · ${dataLonga(ex.dataPedido)}` : undefined} onClose={fechar}
      rodape={<>
        {ex && <button className="fe-btn fe-btn-danger" onClick={() => { if (confirm(t('feiras.pedido.confirmarExcluir'))) { s.excluirPedido(ex.id); fechar(); } }}><Icon name="trash" size={16} /></button>}
        <button className="fe-btn fe-btn-primary fe-grow" onClick={salvar}>{t('feiras.pedido.salvar')}</button></>}>
      {erro && <div className="fe-notice" role="alert">{erro}</div>}
      <Secao titulo={t('feiras.secao.datas')}>
      <div className="fe-form-grid">
        <div className="fe-field fe-full">
          <span className="fe-lbl">{t('feiras.pedido.cliente')}</span>
          <ClienteBusca clienteId={clienteId} onChange={setClienteId} disabled={!!ex} onAvisar={avisar} />
        </div>
        <Field label={t('feiras.pedido.data')}><input type="date" value={data} onChange={(e) => setData(e.target.value)} /></Field>
        <Field label={t('feiras.pedido.entrega')}><input type="date" value={entrega} onChange={(e) => setEntrega(e.target.value)} /></Field>
      </div>
      </Secao>
      <Secao titulo={t('feiras.pedido.andamento')}>
        <div className="fe-chips">{STATUS_PEDIDO.map((st) => <button key={st} type="button" className={'fe-chip' + (status === st ? ' fe-on' : '')} onClick={() => setStatus(st)}>{t(CHAVE_STATUS[st])}</button>)}</div>
      </Secao>
      <Secao titulo={t('feiras.secao.produtos')}><ItensEditor itens={itens} onChange={setItens} /></Secao>
      <Secao titulo={t('feiras.secao.obs')}>
        <Field label={t('feiras.pedido.obs')}><textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder={t('feiras.pedido.obsPlaceholder')} /></Field>
        {ex?.negocioId && <div><button className="fe-btn fe-btn-ghost fe-btn-sm" onClick={() => abrir('negocio', ex.negocioId)}>{t('feiras.pedido.verNegociacao')}</button></div>}
      </Secao>
    </Drawer>
  );
}
