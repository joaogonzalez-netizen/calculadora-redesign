import { useEffect, useMemo, useRef, useState } from 'react';
import { CONTAS_PEDIDOS_BR, CONTAS_PEDIDOS_US, pedidosDoIdioma, pedidosKpisDoIdioma, type ContaMarketplace, type Pedido } from '../lib/pedidosMock';
import { brl, localeNumeros } from '../lib/format';
import type { Idioma } from '../lib/i18n';
import { classeTagMarketplace } from '../lib/marketplaceTag';
import { useI18n } from '../context/I18nContext';
import Icon from '../components/Icon';
import PopoverList from '../components/produtos/PopoverList';
import PedidoDrawer from '../components/pedidos/PedidoDrawer';
import EtiquetaModal from '../components/pedidos/EtiquetaModal';
import {
  gravarImpressas,
  lerImpressas,
  motivoInelegivel,
  podeImprimirEtiqueta,
  statusEtiqueta,
} from '../lib/etiquetasShopee';

const PERIODOS = ['Maio 2026', 'Abril 2026', 'Março 2026'];
// Contas conectadas por idioma: EN (mercado americano) só tem Etsy e TikTok Shop.
// Um marketplace pode ter mais de uma conta, então o filtro lista contas (com o
// canal num selo ao lado do nome), nunca só o marketplace.
const CONTAS_POR_IDIOMA: Record<Idioma, ContaMarketplace[]> = {
  pt: CONTAS_PEDIDOS_BR,
  es: CONTAS_PEDIDOS_BR,
  en: CONTAS_PEDIDOS_US,
};
const TODAS = 'Todas';
const STATUS_OPTS = ['Todos', 'Pago', 'Enviado', 'Pendente', 'Cancelado', 'Entregue'];
// Filtro de etiqueta Shopee: 'todas' ou um StatusEtiqueta.
const ETQ_TODAS = 'todas';
const ETQ_OPTS = [ETQ_TODAS, 'a-emitir', 'emitida', 'indisponivel'];

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
};

export default function PedidosView() {
  const { t, idioma } = useI18n();
  const en = idioma === 'en';
  const CONTAS_DO_IDIOMA = CONTAS_POR_IDIOMA[idioma];
  const CONTAS = useMemo(() => [TODAS, ...CONTAS_DO_IDIOMA.map((c) => c.nome)], [CONTAS_DO_IDIOMA]);
  const PEDIDOS = pedidosDoIdioma(idioma);
  const PEDIDOS_KPIS = pedidosKpisDoIdioma(idioma);
  const [busca, setBusca] = useState('');
  const [periodo, setPeriodo] = useState(PERIODOS[0]);
  const [conta, setConta] = useState(TODAS);
  // Trocar de idioma com a tela aberta: a conta escolhida pode não existir no
  // novo idioma (ex.: uma conta do Mercado Livre em EN), então volta pra "Todas".
  useEffect(() => {
    setConta((atual) => (CONTAS.includes(atual) ? atual : TODAS));
  }, [CONTAS]);
  function emBreve(acao: string) {
    if (en) alert(`Coming soon: ${ACOES_EN[acao] ?? acao}.`);
    else alertaEmBreve(acao);
  }
  const [status, setStatus] = useState(STATUS_OPTS[0]);
  const [filtroEtiqueta, setFiltroEtiqueta] = useState(ETQ_TODAS);
  const [selecionado, setSelecionado] = useState<Pedido | null>(null);
  // Etiquetas Shopee: seleção em lote, pedidos no modal e histórico de impressão.
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [paraImprimir, setParaImprimir] = useState<Pedido[] | null>(null);
  const [impressas, setImpressas] = useState<Record<string, string>>(lerImpressas);
  const marcarTodosRef = useRef<HTMLInputElement>(null);

  const pedidos = useMemo(() => {
    let lista = [...PEDIDOS];
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      lista = lista.filter((p) => p.produto.toLowerCase().includes(termo) || p.comprador.toLowerCase().includes(termo) || p.codigoMlb.toLowerCase().includes(termo));
    }
    if (conta !== TODAS) lista = lista.filter((p) => p.conta === conta);
    if (status !== 'Todos') lista = lista.filter((p) => p.status === status);
    if (filtroEtiqueta !== ETQ_TODAS) lista = lista.filter((p) => statusEtiqueta(p, impressas) === filtroEtiqueta);
    return lista;
  }, [PEDIDOS, busca, conta, status, filtroEtiqueta, impressas]);

  const exibidos = pedidos.slice(0, 10);

  // Só entra na seleção o que ainda está na tela: filtro ou idioma novo descartam o resto.
  const marcadosVisiveis = exibidos.filter((p) => marcados.has(p.id) && podeImprimirEtiqueta(p));
  const elegiveisNaPagina = exibidos.filter(podeImprimirEtiqueta);
  const todosMarcados = elegiveisNaPagina.length > 0 && marcadosVisiveis.length === elegiveisNaPagina.length;
  const algunsMarcados = marcadosVisiveis.length > 0 && !todosMarcados;
  // Shopee só existe nos mercados PT/ES; a coluna fica fixa mesmo que o filtro mostre só outros canais.
  const colEtiq = !en;

  useEffect(() => {
    if (marcarTodosRef.current) marcarTodosRef.current.indeterminate = algunsMarcados;
  }, [algunsMarcados]);

  useEffect(() => {
    setMarcados(new Set());
  }, [busca, conta, status, filtroEtiqueta, idioma]);

  function alternarMarcado(id: string) {
    setMarcados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }
  function alternarTodos() {
    setMarcados(todosMarcados ? new Set() : new Set(elegiveisNaPagina.map((p) => p.id)));
  }
  function registrarImpressao(ids: string[]) {
    const agora = new Date().toISOString();
    setImpressas((atual) => {
      const novo = { ...atual };
      for (const id of ids) novo[id] = agora;
      gravarImpressas(novo);
      return novo;
    });
    setMarcados((atual) => {
      const novo = new Set(atual);
      for (const id of ids) novo.delete(id);
      return novo;
    });
  }
  function dataImpressao(iso: string) {
    return new Date(iso).toLocaleDateString(localeNumeros(), { day: '2-digit', month: '2-digit' });
  }
  function motivoTexto(p: Pedido) {
    const m = motivoInelegivel(p);
    return m ? t('pedidos.etiqueta.motivo.' + m) : '';
  }

  function traduzirPeriodo(v: string) {
    if (v === 'Maio 2026') return t('pedidos.periodoMaio2026');
    if (v === 'Abril 2026') return t('pedidos.periodoAbril2026');
    if (v === 'Março 2026') return t('pedidos.periodoMarco2026');
    return v;
  }
  function renderConta(v: string) {
    if (v === TODAS) return t('pedidos.contaTodas');
    const c = CONTAS_DO_IDIOMA.find((x) => x.nome === v);
    return (
      <span className="conta-opt">
        {v}
        {c && <span className={'mp-tag ' + classeTagMarketplace(c.marketplace)}>{c.marketplace}</span>}
      </span>
    );
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
        <PopoverList label={t('pedidos.filtroConta')} options={CONTAS} value={conta} onChange={setConta} renderItem={renderConta} />
        <PopoverList label={t('pedidos.filtroStatus')} options={STATUS_OPTS} value={status} onChange={setStatus} getLabel={traduzirStatus} />
        {colEtiq && (
          <PopoverList
            label={t('pedidos.etiqueta.filtro')}
            options={ETQ_OPTS}
            value={filtroEtiqueta}
            onChange={setFiltroEtiqueta}
            getLabel={(v) => (v === ETQ_TODAS ? t('pedidos.etiqueta.filtroTodas') : t('pedidos.etiqueta.status.' + v))}
          />
        )}
      </div>

      {marcadosVisiveis.length > 0 && (
        <div className="ped-bulk" role="region" aria-label={t('pedidos.etiqueta.titulo')}>
          <span aria-live="polite"><b>{marcadosVisiveis.length === 1 ? t('pedidos.etiqueta.selecionadosUma') : t('pedidos.etiqueta.selecionados').replace('{n}', String(marcadosVisiveis.length))}</b></span>
          <div className="ped-bulk-acoes">
            <button type="button" className="btn-outline" onClick={() => setMarcados(new Set())}>{t('pedidos.etiqueta.limpar')}</button>
            <button type="button" className="btn-dark" onClick={() => setParaImprimir(marcadosVisiveis)}>
              <Icon name="printer" size={16} /> {t('pedidos.etiqueta.imprimirEtiquetas')}
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-scroll-x">
          <table className="prod-table">
            <thead>
              <tr>
                {colEtiq && (
                  <th className="col-etiq">
                    <div className="etq-cel">
                      <input
                        ref={marcarTodosRef}
                        type="checkbox"
                        checked={todosMarcados}
                        disabled={elegiveisNaPagina.length === 0}
                        onChange={alternarTodos}
                        aria-label={t('pedidos.etiqueta.selecionarTodos')}
                      />
                      <span>{t('pedidos.etiqueta.coluna')}</span>
                    </div>
                  </th>
                )}
                <th>{t('pedidos.colunaPedido')}</th><th>{t('pedidos.colunaMarketplace')}</th><th>{t('pedidos.colunaComprador')}</th><th>{t('pedidos.colunaStatus')}</th><th>{t('pedidos.colunaPagamento')}</th><th>{t('pedidos.colunaValorTotal')}</th><th className="col-acoes-sticky">{t('pedidos.colunaAcoes')}</th>
              </tr>
            </thead>
            <tbody>
              {exibidos.map((p) => (
                <tr key={p.id}>
                  {colEtiq && (
                    <td className="col-etiq">
                      {(() => {
                        const st = statusEtiqueta(p, impressas);
                        if (!st) return <span className="etq-sem" aria-label={t('pedidos.etiqueta.semEtiqueta')}>—</span>;
                        return (
                          <div className="etq-cel">
                            <input
                              type="checkbox"
                              checked={marcados.has(p.id)}
                              disabled={!podeImprimirEtiqueta(p)}
                              onChange={() => alternarMarcado(p.id)}
                              aria-label={`${t('pedidos.etiqueta.selecionarPedido')} ${p.id}`}
                              aria-describedby={'etq-st-' + p.id}
                            />
                            <div className="etq-st" id={'etq-st-' + p.id}>
                              <span className={'etq-tag etq-tag-' + st}>{t('pedidos.etiqueta.status.' + st)}</span>
                              {st === 'emitida' && <small>{t('pedidos.etiqueta.emitidaEm').replace('{data}', dataImpressao(impressas[p.id]))}</small>}
                              {st === 'indisponivel' && <small>{motivoTexto(p)}</small>}
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                  )}
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
                      {podeImprimirEtiqueta(p) && (
                        <button type="button" title={impressas[p.id] ? t('pedidos.etiqueta.reimprimir') : t('pedidos.etiqueta.imprimir')} aria-label={impressas[p.id] ? t('pedidos.etiqueta.reimprimir') : t('pedidos.etiqueta.imprimir')} onClick={() => setParaImprimir([p])}><Icon name="printer" size={16} /></button>
                      )}
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

      {selecionado && (
        <PedidoDrawer
          pedido={selecionado}
          impressaEm={impressas[selecionado.id] ?? null}
          onImprimirEtiqueta={() => setParaImprimir([selecionado])}
          onClose={() => setSelecionado(null)}
        />
      )}
      {paraImprimir && (
        <EtiquetaModal pedidos={paraImprimir} impressas={impressas} onClose={() => setParaImprimir(null)} onImpresso={registrarImpressao} />
      )}
    </div>
  );
}
