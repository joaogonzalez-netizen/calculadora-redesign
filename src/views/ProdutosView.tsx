import { useEffect, useMemo, useState } from 'react';
import { ORDENS, PERIODOS, PRODUTOS, PRODUTOS_KPIS, type Produto, type ProdutoStatus } from '../lib/produtosMock';
import { PRODUTO_VINCULOS_KEY, readJson, writeJson, type ProdutoVinculos } from '../lib/storage';
import { classeTagMarketplace } from '../lib/marketplaceTag';
import { useI18n } from '../context/I18nContext';
import Icon from '../components/Icon';
import PopoverList from '../components/produtos/PopoverList';
import ProdutoDetailDrawer from '../components/produtos/ProdutoDetailDrawer';
import CustoLucroDrawer from '../components/produtos/CustoLucroDrawer';
import FiltrosAvancadosDrawer, { type FaixaFiltro } from '../components/produtos/FiltrosAvancadosDrawer';
import PausarAnuncioModal from '../components/produtos/PausarAnuncioModal';
import OtimizarAnuncioDrawer from '../components/produtos/OtimizarAnuncioDrawer';

const STATUS_OPTS: (ProdutoStatus | 'Todos')[] = ['Todos', 'Ativo', 'Pausado', 'Esgotado'];
const CANAL_OPTS = ['Todos', 'Mercado Livre', 'Shopee'];

interface Props {
  filtroSemCustoInicial?: boolean;
  onFiltroSemCustoConsumido?: () => void;
}

export default function ProdutosView({ filtroSemCustoInicial, onFiltroSemCustoConsumido }: Props) {
  const { t } = useI18n();
  const [busca, setBusca] = useState('');
  const [periodo, setPeriodo] = useState('Maio 2026');
  const [canal, setCanal] = useState('Mercado Livre');
  const [status, setStatus] = useState<ProdutoStatus | 'Todos'>('Todos');
  const [ordem, setOrdem] = useState(ORDENS[0]);
  const [faixaFiltro, setFaixaFiltro] = useState<{ valor: FaixaFiltro; estoque: FaixaFiltro } | null>(null);
  const [somenteSemCusto, setSomenteSemCusto] = useState(false);

  // Chegou aqui pelo botão "Ver produtos sem custo" do DRE — abre já filtrado,
  // em todos os canais, e consome o gatilho pra não re-aplicar em navegações futuras.
  useEffect(() => {
    if (!filtroSemCustoInicial) return;
    setSomenteSemCusto(true);
    setCanal('Todos');
    onFiltroSemCustoConsumido?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroSemCustoInicial]);

  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);
  const [detalheProduto, setDetalheProduto] = useState<Produto | null>(null);
  const [custoProduto, setCustoProduto] = useState<Produto | null>(null);
  const [pausarProduto, setPausarProduto] = useState<Produto | null>(null);
  const [otimizarProduto, setOtimizarProduto] = useState<Produto | null>(null);
  const [statusOverride, setStatusOverride] = useState<Record<string, ProdutoStatus>>({});

  const [vinculos, setVinculos] = useState<ProdutoVinculos>(() => readJson(PRODUTO_VINCULOS_KEY, {}));
  function salvarVinculo(produtoId: string, v: ProdutoVinculos[string]) {
    setVinculos((prev) => {
      const next = { ...prev, [produtoId]: v };
      writeJson(PRODUTO_VINCULOS_KEY, next);
      return next;
    });
    setCustoProduto(null);
  }

  const produtos = useMemo(() => {
    let lista = PRODUTOS.map((p) => ({ ...p, status: statusOverride[p.id] ?? p.status }));
    if (busca.trim()) lista = lista.filter((p) => p.nome.toLowerCase().includes(busca.trim().toLowerCase()) || p.sku.toLowerCase().includes(busca.trim().toLowerCase()));
    if (canal !== 'Todos') lista = lista.filter((p) => p.marketplace === canal);
    if (status !== 'Todos') lista = lista.filter((p) => p.status === status);
    if (faixaFiltro) {
      const { valor, estoque } = faixaFiltro;
      const min = parseFloat(valor.min), max = parseFloat(valor.max);
      const eMin = parseFloat(estoque.min), eMax = parseFloat(estoque.max);
      lista = lista.filter((p) => {
        const precoNum = parseFloat(p.preco.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
        if (!isNaN(min) && precoNum < min) return false;
        if (!isNaN(max) && precoNum > max) return false;
        if (!isNaN(eMin) && p.estoque < eMin) return false;
        if (!isNaN(eMax) && p.estoque > eMax) return false;
        return true;
      });
    }
    if (somenteSemCusto) lista = lista.filter((p) => !vinculos[p.id]);
    if (ordem === 'Título A-Z') lista = [...lista].sort((a, b) => a.nome.localeCompare(b.nome));
    if (ordem === 'Título Z-A') lista = [...lista].sort((a, b) => b.nome.localeCompare(a.nome));
    return lista;
  }, [busca, canal, status, ordem, faixaFiltro, statusOverride, somenteSemCusto, vinculos]);

  function traduzirStatus(s: string) {
    if (s === 'Todos') return t('produtos.statusTodos');
    if (s === 'Ativo') return t('produtos.statusAtivo');
    if (s === 'Pausado') return t('produtos.statusPausado');
    if (s === 'Esgotado') return t('produtos.statusEsgotado');
    return s;
  }
  function traduzirCanal(c: string) {
    return c === 'Todos' ? t('produtos.statusTodos') : c;
  }
  function traduzirEstoqueSituacao(s: string) {
    if (s === 'Saudável') return t('produtos.estoqueSaudavel');
    if (s === 'Estoque baixo') return t('produtos.kpiEstoqueBaixo');
    if (s === 'Sem estoque') return t('produtos.kpiSemEstoque');
    return s;
  }

  return (
    <div>
      <div className="hero">
        <h1>{t('produtos.titulo')}</h1>
        <p>{t('produtos.subtitulo')}</p>
      </div>

      <div className="prod-actions-row">
        <button type="button" className="btn-outline">{t('produtos.exportarCsv')}</button>
        <button type="button" className="btn-dark">{t('produtos.sincronizarEstoque')}</button>
      </div>

      <div className="kpi-grid prod-kpi-grid">
        <div className="kpi-card"><div className="kpi-head"><span>{t('produtos.kpiVendasAcumuladas')}</span></div><div className="kpi-value"><span className="kpi-int">{PRODUTOS_KPIS.vendasAcumuladas}</span></div><div className="kpi-foot"><span className="kpi-comp">{t('produtos.kpiNoTotal')}</span></div></div>
        <div className="kpi-card"><div className="kpi-head"><span>{t('produtos.kpiProdutosAtivos')}</span></div><div className="kpi-value"><span className="kpi-int">{PRODUTOS_KPIS.produtosAtivos.valor}</span><span className="kpi-dec">un.</span></div><div className="kpi-foot"><span className="kpi-comp">{PRODUTOS_KPIS.produtosAtivos.sub}</span></div></div>
        <div className="kpi-card"><div className="kpi-head"><span>{t('produtos.kpiEmEstoque')}</span></div><div className="kpi-value"><span className="kpi-int">{PRODUTOS_KPIS.emEstoque.valor}</span><span className="kpi-dec">un.</span></div><div className="kpi-foot"><span className="kpi-comp">{PRODUTOS_KPIS.emEstoque.sub}</span></div></div>
        <div className="kpi-card kpi-warn"><div className="kpi-head"><span>{t('produtos.kpiEstoqueBaixo')}</span></div><div className="kpi-value"><span className="kpi-int">{PRODUTOS_KPIS.estoqueBaixo.valor}</span><span className="kpi-dec">un.</span></div><div className="kpi-foot"><span className="kpi-comp warn">{PRODUTOS_KPIS.estoqueBaixo.sub}</span></div></div>
        <div className="kpi-card kpi-danger"><div className="kpi-head"><span>{t('produtos.kpiSemEstoque')}</span></div><div className="kpi-value"><span className="kpi-int">{PRODUTOS_KPIS.semEstoque.valor}</span><span className="kpi-dec">pedidos</span></div><div className="kpi-foot"><span className="kpi-comp danger">{PRODUTOS_KPIS.semEstoque.sub}</span></div></div>
      </div>

      <div className="prod-filters-row">
        <div className="cl-search prod-search"><Icon name="search" size={15} /><input type="text" placeholder={t('produtos.buscarPlaceholder')} value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
        <PopoverList label={t('produtos.filtroPeriodo')} options={PERIODOS} value={periodo} onChange={setPeriodo} />
        <PopoverList label={t('produtos.filtroCanal')} options={CANAL_OPTS} value={canal} onChange={setCanal} getLabel={traduzirCanal} />
        <PopoverList label={t('produtos.filtroStatus')} options={STATUS_OPTS} value={status} onChange={(v) => setStatus(v as ProdutoStatus | 'Todos')} getLabel={traduzirStatus} />
        <PopoverList label="" options={ORDENS} value={ordem} onChange={setOrdem} />
        <button type="button" className="ctl-btn" onClick={() => setFiltrosOpen(true)}>▽ {t('produtos.botaoFiltros')}</button>
      </div>

      {somenteSemCusto && (
        <div className="filtro-ativo-chip">
          {t('produtos.chipSomenteSemCusto')}
          <button type="button" onClick={() => setSomenteSemCusto(false)}><Icon name="close" size={12} /></button>
        </div>
      )}

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="prod-table">
            <thead>
              <tr>
                <th>{t('produtos.colunaProduto')}</th><th>{t('produtos.colunaMarketplace')}</th><th>{t('produtos.colunaStatus')}</th><th>{t('produtos.colunaEstoque')}</th><th>{t('produtos.colunaVendidos')}</th><th>{t('produtos.colunaPreco')}</th><th>{t('produtos.colunaProducao')}</th><th>{t('produtos.colunaOtimizar')}</th><th>{t('produtos.colunaAcoes')}</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => {
                const vinculo = vinculos[p.id];
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="prod-name">{p.nome}</div>
                      <div className="prod-sku">{p.sku} · {p.variacoes.length} var. · dd/mm/aaaa</div>
                    </td>
                    <td><span className={'mp-tag ' + classeTagMarketplace(p.marketplace)}>{p.marketplace}</span></td>
                    <td><span className={'status-tag status-' + p.status.toLowerCase()}>{traduzirStatus(p.status)}</span></td>
                    <td>
                      <div>{p.estoque} un.</div>
                      <small className={'estoque-sit sit-' + p.estoqueSituacao.replace(/\s/g, '-').toLowerCase()}>{traduzirEstoqueSituacao(p.estoqueSituacao)}</small>
                    </td>
                    <td>{p.vendidos} un.</td>
                    <td>{p.preco}</td>
                    <td>
                      {vinculo ? (
                        <div className="custo-vinculado" onClick={() => setCustoProduto(p)}>
                          <b>{brl2(vinculo.custoProducao)}</b>
                          <small>{vinculo.tipo === 'calculo' ? t('produtos.viaCalculoSalvo') : t('produtos.informadoManualmente')}</small>
                        </div>
                      ) : (
                        <button type="button" className="btn-outline vincular-custo-btn" onClick={() => setCustoProduto(p)}>{t('produtos.vincularCusto')}</button>
                      )}
                    </td>
                    <td>
                      <button type="button" className="btn-outline otimizar-btn" onClick={() => setOtimizarProduto(p)}>
                        <Icon name="otimizador" size={14} /> {t('produtos.otimizarBtn')}
                      </button>
                    </td>
                    <td>
                      <div className="prod-acoes">
                        <button type="button" title={t('produtos.verDetalhes')} onClick={() => setDetalheProduto(p)}><Icon name="eye" size={16} /></button>
                        <div className="prod-menu-wrap">
                          <button type="button" title={t('produtos.maisAcoes')} onClick={() => setMenuAbertoId(menuAbertoId === p.id ? null : p.id)}><Icon name="dots" size={16} /></button>
                          {menuAbertoId === p.id && (
                            <>
                              <div className="popover-scrim" onClick={() => setMenuAbertoId(null)} />
                              <div className="popover-list prod-menu">
                                <div className="popover-item" onClick={() => { setPausarProduto(p); setMenuAbertoId(null); }}>
                                  {p.status === 'Pausado' ? t('produtos.reativarAnuncio') : t('produtos.pausarAnuncio')}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="prod-pagination">
            <span>{t('produtos.exibindo')} 1–{produtos.length} {t('produtos.deLabel')} {PRODUTOS_KPIS.produtosAtivos.valor} {t('produtos.produtosPlural')}</span>
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

      <div className="prod-footnote">
        <Icon name="creditos" size={13} /> {t('produtos.footNote')}
      </div>

      {filtrosOpen && <FiltrosAvancadosDrawer onClose={() => setFiltrosOpen(false)} onApply={(valor, estoque) => setFaixaFiltro({ valor, estoque })} />}
      {detalheProduto && <ProdutoDetailDrawer produto={detalheProduto} onClose={() => setDetalheProduto(null)} />}
      {custoProduto && (
        <CustoLucroDrawer
          produto={custoProduto}
          vinculo={vinculos[custoProduto.id]}
          onClose={() => setCustoProduto(null)}
          onSave={(v) => salvarVinculo(custoProduto.id, v)}
        />
      )}
      {otimizarProduto && <OtimizarAnuncioDrawer produto={otimizarProduto} onClose={() => setOtimizarProduto(null)} />}
      {pausarProduto && (
        <PausarAnuncioModal
          produto={pausarProduto}
          onClose={() => setPausarProduto(null)}
          onConfirm={() => {
            setStatusOverride((prev) => ({ ...prev, [pausarProduto.id]: pausarProduto.status === 'Pausado' ? 'Ativo' : 'Pausado' }));
            setPausarProduto(null);
          }}
        />
      )}
    </div>
  );
}

function brl2(v?: number) {
  if (v === undefined) return '-';
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
