import { useEffect, useMemo, useState } from 'react';
import { pedidosDoIdioma, pedidosKpisDoIdioma, type Pedido } from '../lib/pedidosMock';
import { brl, localeNumeros } from '../lib/format';
import type { Idioma } from '../lib/i18n';
import { classeTagMarketplace } from '../lib/marketplaceTag';
import { useI18n } from '../context/I18nContext';
import Icon from '../components/Icon';
import PopoverList from '../components/produtos/PopoverList';
import PedidoDrawer from '../components/pedidos/PedidoDrawer';

const PERIODOS = ['Maio 2026', 'Abril 2026', 'Março 2026'];
// Contas por idioma: EN (mercado americano) só tem Etsy e TikTok Shop.
const CONTAS_POR_IDIOMA: Record<Idioma, string[]> = {
  pt: ['Todas', 'Mercado Livre', 'Shopee'],
  es: ['Todas', 'Mercado Livre', 'Shopee'],
  en: ['Todas', 'Etsy', 'TikTok Shop'],
};
const STATUS_OPTS = ['Todos', 'Pago', 'Enviado', 'Pendente', 'Cancelado', 'Entregue'];

const STATUS_CLASSE: Record<Pedido['status'], string> = {
  Pago: 'ped-status-pago',
  Enviado: 'ped-status-enviado',
  Pendente: 'ped-status-pendente',
  Cancelado: 'ped-status-cancelado',
  Entregue: 'ped-status-entregue',
};
const PAGAMENTO_CLASSE: Record<Pedido['pagamento'], string> = {
  Aprovado: 'ped-status-entregue',
  Pendente: 'ped-status-pendente',
  Reembolsado: 'ped-status-cancelado',
};

function alertaEmBreve(acao: string) {
  alert(`Em breve: ${acao}.`);
}
// Mesmo aviso na versão EN, com o texto já em inglês.
const ACOES_EN: Record<string, string> = {
  'exportar pedidos em CSV': 'export orders to CSV',
  'sincronização de pedidos': 'order sync',
  'filtros avançados': 'advanced filters',
};

export default function PedidosView() {
  const { t, idioma } = useI18n();
  const en = idioma === 'en';
  const CONTAS = CONTAS_POR_IDIOMA[idioma];
  const PEDIDOS = pedidosDoIdioma(idioma);
  const PEDIDOS_KPIS = pedidosKpisDoIdioma(idioma);
  const [busca, setBusca] = useState('');
  const [periodo, setPeriodo] = useState(PERIODOS[0]);
  const [conta, setConta] = useState(CONTAS[1]);
  // Trocar de idioma com a tela aberta: a conta escolhida pode não existir no
  // novo idioma (ex.: Mercado Livre em EN), então volta pra conta padrão.
  useEffect(() => {
    setConta((atual) => (CONTAS.includes(atual) ? atual : CONTAS[1]));
  }, [CONTAS]);
  function emBreve(acao: string) {
    if (en) alert(`Coming soon: ${ACOES_EN[acao] ?? acao}.`);
    else alertaEmBreve(acao);
  }
  const [status, setStatus] = useState(STATUS_OPTS[0]);
  const [selecionado, setSelecionado] = useState<Pedido | null>(null);

  const pedidos = useMemo(() => {
    let lista = [...PEDIDOS];
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      lista = lista.filter((p) => p.produto.toLowerCase().includes(termo) || p.comprador.toLowerCase().includes(termo) || p.codigoMlb.toLowerCase().includes(termo));
    }
    if (conta !== 'Todas') lista = lista.filter((p) => p.marketplace === conta);
    if (status !== 'Todos') lista = lista.filter((p) => p.status === status);
    return lista;
  }, [PEDIDOS, busca, conta, status]);

  const exibidos = pedidos.slice(0, 10);

  function traduzirPeriodo(v: string) {
    if (v === 'Maio 2026') return t('pedidos.periodoMaio2026');
    if (v === 'Abril 2026') return t('pedidos.periodoAbril2026');
    if (v === 'Março 2026') return t('pedidos.periodoMarco2026');
    return v;
  }
  function traduzirConta(v: string) {
    return v === 'Todas' ? t('pedidos.contaTodas') : v;
  }
  function traduzirStatus(v: string) {
    if (v === 'Todos') return t('pedidos.statusTodos');
    if (v === 'Pago') return t('pedidos.statusPago');
    if (v === 'Enviado') return t('pedidos.statusEnviado');
    if (v === 'Pendente') return t('pedidos.statusPendente');
    if (v === 'Cancelado') return t('pedidos.statusCancelado');
    if (v === 'Entregue') return t('pedidos.statusEntregue');
    return v;
  }

  function traduzirPagamento(v: string) {
    if (v === 'Aprovado') return t('pedidos.pagamentoAprovado');
    if (v === 'Pendente') return t('pedidos.statusPendente');
    if (v === 'Reembolsado') return t('pedidos.pagamentoReembolsado');
    return v;
  }

  return (
    <div>
      <div className="hero">
        <h1>{t('pedidos.titulo')}</h1>
        <p>{t('pedidos.subtitulo')}</p>
      </div>

      <div className="prod-actions-row">
        <button type="button" className="btn-outline" onClick={() => emBreve('exportar pedidos em CSV')}>{t('pedidos.exportarCsv')}</button>
        <button type="button" className="btn-dark" onClick={() => emBreve('sincronização de pedidos')}>{t('pedidos.sincronizarPedidos')}</button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-head"><span>{t('pedidos.kpiPedidos')}</span></div>
          <div className="kpi-value"><span className="kpi-int">{PEDIDOS_KPIS.total}</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head"><span>{t('pedidos.kpiFaturamento')}</span></div>
          <div className="kpi-value"><span className="kpi-dec">{en ? '$' : 'R$'}</span><span className="kpi-int">{PEDIDOS_KPIS.faturamento.toLocaleString(localeNumeros())}</span><span className="kpi-dec">{en ? '.00' : ',00'}</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head"><span>{t('pedidos.kpiAguardandoEnvio')}</span></div>
          <div className="kpi-value"><span className="kpi-int">{PEDIDOS_KPIS.aguardandoEnvio}</span><span className="kpi-dec">{en ? 'orders' : 'pedidos'}</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-head"><span>{t('pedidos.kpiTaxasEstimadas')}</span></div>
          <div className="kpi-value"><span className="kpi-dec">{en ? '$' : 'R$'}</span><span className="kpi-int">{PEDIDOS_KPIS.taxasEstimadas.toLocaleString(localeNumeros())}</span><span className="kpi-dec">{en ? '.00' : ',00'}</span></div>
        </div>
      </div>

      <div className="prod-filters-row">
        <div className="cl-search prod-search"><Icon name="search" size={15} /><input type="text" placeholder={t('pedidos.buscarPlaceholder')} value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
        <PopoverList label={t('pedidos.filtroPeriodo')} options={PERIODOS} value={periodo} onChange={setPeriodo} getLabel={traduzirPeriodo} />
        <PopoverList label={t('pedidos.filtroConta')} options={CONTAS} value={conta} onChange={setConta} getLabel={traduzirConta} />
        <PopoverList label={t('pedidos.filtroStatus')} options={STATUS_OPTS} value={status} onChange={setStatus} getLabel={traduzirStatus} />
        <button type="button" className="ctl-btn" onClick={() => emBreve('filtros avançados')}>▽ {t('pedidos.botaoFiltros')}</button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-scroll-x">
          <table className="prod-table">
            <thead>
              <tr>
                <th>{t('pedidos.colunaPedido')}</th><th>{t('pedidos.colunaMarketplace')}</th><th>{t('pedidos.colunaComprador')}</th><th>{t('pedidos.colunaStatus')}</th><th>{t('pedidos.colunaPagamento')}</th><th>{t('pedidos.colunaValorTotal')}</th><th className="col-acoes-sticky">{t('pedidos.colunaAcoes')}</th>
              </tr>
            </thead>
            <tbody>
              {exibidos.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="prod-name">{p.produto}</div>
                    <div className="prod-sku">#{p.codigoMlb} · {p.qtd} {en ? 'units' : 'un.'} · {p.data}</div>
                  </td>
                  <td><span className={'mp-tag ' + classeTagMarketplace(p.marketplace)}>{p.marketplace}</span></td>
                  <td>
                    <div className="prod-name">{p.comprador}</div>
                    <div className="prod-sku">{p.compradorHandle}</div>
                  </td>
                  <td><span className={'ped-status ' + STATUS_CLASSE[p.status]}>{en ? traduzirStatus(p.status) : p.status}</span></td>
                  <td><span className={'ped-status ' + PAGAMENTO_CLASSE[p.pagamento]}>{en ? traduzirPagamento(p.pagamento) : p.pagamento}</span></td>
                  <td>
                    <b>{brl(p.valorTotal)}</b>
                    <div className="ped-taxa-inline">{t('pedidos.taxaLabel')}: {brl(p.valorTotal * p.taxaPct)}</div>
                  </td>
                  <td className="col-acoes-sticky">
                    <div className="prod-acoes">
                      <button type="button" title={t('pedidos.verPedido')} onClick={() => setSelecionado(p)}><Icon name="eye" size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {!exibidos.length && <div className="hint" style={{ textAlign: 'center', padding: 24 }}>{t('pedidos.nenhumPedidoEncontrado')}</div>}
          <div className="prod-pagination">
            <span>{t('pedidos.exibindo')} 1 {en ? 'to' : 'a'} {exibidos.length} {t('pedidos.deLabel')} {PEDIDOS_KPIS.total} {t('pedidos.pedidosPlural')}</span>
            <div className="prod-pages">
              <button type="button" className="page-btn">‹</button>
              <button type="button" className="page-btn active">1</button>
              <button type="button" className="page-btn">2</button>
              <button type="button" className="page-btn">3</button>
              <button type="button" className="page-btn">4</button>
              <span>…</span>
              <button type="button" className="page-btn">9</button>
              <button type="button" className="page-btn">›</button>
            </div>
          </div>
        </div>
      </div>

      {selecionado && <PedidoDrawer pedido={selecionado} onClose={() => setSelecionado(null)} />}
    </div>
  );
}
