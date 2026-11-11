import { useEffect, useMemo, useRef, useState } from 'react';
import ReportarItemModal from '../components/buscador/ReportarItemModal';
import { criarReport, idsOcultosPara, lerReports, reportsRestantesHoje, type NovoReport } from '../lib/finderReports';
import { USUARIO } from '../lib/dashboardMock';
import { PRODUTOS_BUSCA_LISTA, DROPS_STLAI, DROPS_STLFLIX, DESTAQUES_STLFLIX, type ProdutoBusca, type DropVitrine } from '../lib/buscadorMock';
import enfeitesFamilia from '../assets/buscador/enfeites-familia.png';
import { BUSCADOR_FAVORITOS_KEY, readJson, writeJson } from '../lib/storage';
import { useI18n } from '../context/I18nContext';
import Icon from '../components/Icon';
import Paginacao from '../components/buscador/Paginacao';
import { PAGINA_TAM, limitarPagina } from '../lib/paginacao';
import { MARKETPLACES_BUSCA, SEM_CATEGORIA, categoriaFinder, categoriaNativa, contarCategorias, type MarketplaceBusca } from '../lib/finderCategorias';

const PARAMS_BUSCADOR = ['page', 'q', 'idade'] as const;

function lerUrl() {
  const p = new URLSearchParams(window.location.search);
  return { busca: p.get('q') ?? '', idade: p.get('idade') ?? '', pagina: Number(p.get('page')) || 1 };
}

type Aba = 'todos' | 'ml' | 'mlar' | 'etsy' | 'shopee' | 'personalizaveis' | 'drops';

// Mockup de UX das categorias do Finder: três versões alternáveis, no mesmo
// padrão do seletor "Visualização" do Painel.
type Variante = 'A' | 'B' | 'C';
const VARIANTES: { key: Variante; chaveLabel: string; chaveNota: string }[] = [
  { key: 'A', chaveLabel: 'buscador.varA', chaveNota: 'buscador.varNotaA' },
  { key: 'B', chaveLabel: 'buscador.varB', chaveNota: 'buscador.varNotaB' },
  { key: 'C', chaveLabel: 'buscador.varC', chaveNota: 'buscador.varNotaC' },
];
const VARIANTE_KEY = 'stlseller_finder_variante';
const MARKETPLACE_DA_ABA: Partial<Record<Aba, MarketplaceBusca>> = { ml: 'Mercado Livre', etsy: 'Etsy', shopee: 'Shopee' };
/** Versão C: itens mostrados por marketplace antes do "Ver todos". */
const ITENS_POR_BLOCO = 6;

interface Props {
  onFavoritar: () => void;
}

/** Tela "Buscador de Produtos" (Product Finder). Grid de produtos 3D em alta
 *, dados mockados, sem backend. Busca e favoritos são funcionais de verdade
 * (favoritos persistem em localStorage); as demais faixas de filtro do
 * cabeçalho (preço, material, ordenação, tabs de marketplace) são só visuais,
 * exceto a idade do anúncio, que filtra de verdade
 * nesta versão, igual combinado no escopo da feature. */
export default function BuscadorView({ onFavoritar }: Props) {
  const { t } = useI18n();
  const [busca, setBusca] = useState(() => lerUrl().busca);
  const [favoritos, setFavoritos] = useState<string[]>(() => readJson(BUSCADOR_FAVORITOS_KEY, []));
  const [somenteFavoritos, setSomenteFavoritos] = useState(false);
  // Idade máxima do anúncio em dias ('' = qualquer).
  const [idade, setIdade] = useState(() => lerUrl().idade);
  const [pagina, setPagina] = useState(() => lerUrl().pagina);
  const topoLista = useRef<HTMLDivElement>(null);
  const primeiraRenderPagina = useRef(true);
  const [aba, setAbaRaw] = useState<Aba>('todos');
  const [variante, setVariante] = useState<Variante>(() => {
    const salva = readJson<string>(VARIANTE_KEY, 'A');
    return VARIANTES.some((v) => v.key === salva) ? (salva as Variante) : 'A';
  });
  // Categoria escolhida nos chips ('' = todas). Na versão A é a nativa do marketplace; em B e C, a do Finder.
  const [catSel, setCatSel] = useState('');

  function setAba(a: Aba) {
    setAbaRaw(a);
    setCatSel('');
    setPagina(1);
  }

  function trocarVariante(v: Variante) {
    setVariante(v);
    writeJson(VARIANTE_KEY, v);
    setCatSel('');
    setPagina(1);
  }
  // Reports: itens reportados somem da busca deste seller (e a lista negra some pra todos).
  const [reports, setReports] = useState(() => lerReports());
  const [reportando, setReportando] = useState<ProdutoBusca | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const timerAviso = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timerAviso.current), []);

  function mostrarAviso(msg: string) {
    setAviso(msg);
    window.clearTimeout(timerAviso.current);
    timerAviso.current = window.setTimeout(() => setAviso(null), 3500);
  }

  function enviarReport(novo: NovoReport) {
    const r = criarReport(novo);
    setReportando(null);
    if (r.ok) {
      setReports(lerReports());
      mostrarAviso(t('report.obrigado'));
      return;
    }
    mostrarAviso(r.erro === 'limite' ? t('report.limite') : t('report.jaReportou'));
  }

  function abrirReport(p: ProdutoBusca) {
    if (reportsRestantesHoje(USUARIO.id) === 0) {
      mostrarAviso(t('report.limite'));
      return;
    }
    setReportando(p);
  }

  function alternarFavorito(id: string) {
    setFavoritos((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      writeJson(BUSCADOR_FAVORITOS_KEY, next);
      return next;
    });
    onFavoritar();
  }

  const vitrine = aba === 'personalizaveis' || aba === 'drops';

  const extrairCategoria = variante === 'A' ? categoriaNativa : categoriaFinder;

  const listaBase = useMemo(() => {
    const ocultos = idsOcultosPara(USUARIO.id, reports);
    let lista = PRODUTOS_BUSCA_LISTA.filter((p) => !ocultos.has(p.id));
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      lista = lista.filter((p) => p.nome.toLowerCase().includes(termo));
    }
    if (idade) lista = lista.filter((p) => p.diasNoAr <= Number(idade));
    if (somenteFavoritos) lista = lista.filter((p) => favoritos.includes(p.id));
    // Mercado Livre Argentina não tem itens no mock.
    if (aba === 'mlar') return [];
    const mkt = MARKETPLACE_DA_ABA[aba];
    if (mkt) lista = lista.filter((p) => p.marketplace === mkt);
    return lista;
  }, [busca, idade, somenteFavoritos, favoritos, reports, aba]);

  const chipsCategoria = useMemo(() => contarCategorias(listaBase, extrairCategoria), [listaBase, extrairCategoria]);
  const produtos = useMemo(
    () => (catSel ? listaBase.filter((p) => extrairCategoria(p) === catSel) : listaBase),
    [listaBase, catSel, extrairCategoria],
  );
  // Versão A só tem categorias quando há um marketplace escolhido (cada um tem a sua lista).
  const mostrarChips = variante !== 'A' || aba === 'ml' || aba === 'etsy' || aba === 'shopee';

  const totalPaginas = Math.max(1, Math.ceil(produtos.length / PAGINA_TAM));
  const paginaAtual = limitarPagina(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * PAGINA_TAM;
  const produtosDaPagina = produtos.slice(inicio, inicio + PAGINA_TAM);

  // Busca, filtro de idade e página vivem na URL: o botão voltar do navegador devolve a mesma página.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    PARAMS_BUSCADOR.forEach((k) => p.delete(k));
    if (busca.trim()) p.set('q', busca);
    if (idade) p.set('idade', idade);
    if (paginaAtual > 1) p.set('page', String(paginaAtual));
    const qs = p.toString();
    if (qs === window.location.search.replace(/^\?/, '')) return;
    window.history.pushState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
  }, [busca, idade, paginaAtual]);

  useEffect(() => {
    const aoVoltar = () => {
      const u = lerUrl();
      setBusca(u.busca);
      setIdade(u.idade);
      setPagina(u.pagina);
    };
    window.addEventListener('popstate', aoVoltar);
    return () => {
      window.removeEventListener('popstate', aoVoltar);
      // Sair do Buscador não deixa parâmetros dele na URL das outras telas.
      const p = new URLSearchParams(window.location.search);
      PARAMS_BUSCADOR.forEach((k) => p.delete(k));
      const qs = p.toString();
      window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : ''));
    };
  }, []);

  // Trocar de página rola até o topo da listagem, não até o topo da tela.
  useEffect(() => {
    if (primeiraRenderPagina.current) {
      primeiraRenderPagina.current = false;
      return;
    }
    topoLista.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [paginaAtual]);

  return (
    <div>
      <div className="busc-header-row">
        <div className="hero">
          <h1>{t('buscador.titulo')} <span className="busc-beta-pill">{t('buscador.beta')}</span></h1>
          <p>{t('buscador.subtitulo')}</p>
        </div>
        <div className="cluster-modo-row busc-var-row">
          <span className="hint">{t('buscador.visualizacao')}</span>
          <div className="cluster-modo-toggle painel-modo-toggle">
            {VARIANTES.map((v) => (
              <button key={v.key} type="button" className={variante === v.key ? 'active' : ''} onClick={() => trocarVariante(v.key)}>{t(v.chaveLabel)}</button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className={'pill-btn busc-fav-toggle' + (somenteFavoritos ? ' active' : '')}
          onClick={() => { setSomenteFavoritos((s) => !s); setPagina(1); }}
        >
          <Icon name="heart" size={14} filled={somenteFavoritos} /> {t('buscador.favoritos')}
        </button>
      </div>

      <div className="busc-tabs-row">
        <div className="busc-tabs">
          <Tab ativo={aba === 'todos'} onClick={() => setAba('todos')}>{t('buscador.tabTodos')}</Tab>
          <Tab ativo={aba === 'ml'} onClick={() => setAba('ml')}>{t('buscador.tabMercadoLivre')}</Tab>
          <Tab ativo={aba === 'mlar'} onClick={() => setAba('mlar')}>{t('buscador.tabMercadoLivreAr')}</Tab>
          <Tab ativo={aba === 'etsy'} onClick={() => setAba('etsy')}>{t('buscador.tabEtsy')}</Tab>
          <Tab ativo={aba === 'shopee'} onClick={() => setAba('shopee')}>{t('buscador.tabShopee')}</Tab>
          <Tab ativo={aba === 'personalizaveis'} marca="ai" onClick={() => setAba('personalizaveis')}>
            <Icon name="spark" size={15} />{t('buscador.tabPersonalizaveis')}
          </Tab>
          <Tab ativo={aba === 'drops'} marca="flix" onClick={() => setAba('drops')}>
            <Icon name="layers" size={15} />{t('buscador.tabDrops')}
          </Tab>
        </div>
        <span className="pill-btn busc-stl-link">{t('buscador.buscadorStls')}</span>
      </div>

      {aba === 'personalizaveis' && <VitrineIntro marca="ai" />}
      {aba === 'drops' && <VitrineIntro marca="flix" />}

      <div className="busc-filters-row">
        <div className="cl-search busc-search">
          <Icon name="search" size={15} />
          <input type="text" placeholder={t('buscador.buscarPlaceholder')} value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} />
        </div>
        <div className="busc-preco-range">
          <span className="hint">{t('buscador.preco')}</span>
          <div className="busc-preco-input"><span>R$</span><input type="text" inputMode="decimal" placeholder="0" /></div>
          <span className="hint">{t('buscador.ate')}</span>
          <div className="busc-preco-input"><span>R$</span><input type="text" inputMode="decimal" placeholder="0" /></div>
        </div>
        <select className="busc-select" defaultValue="">
          <option value="" disabled>{t('buscador.material')}</option>
          <option value="pla">PLA</option>
          <option value="petg">PETG</option>
          <option value="resina">Resina</option>
        </select>
        <select className="busc-select" value={idade} onChange={(e) => { setIdade(e.target.value); setPagina(1); }} aria-label={t('buscador.idadeAnuncio')}>
          <option value="">{t('buscador.idadeAnuncio')}</option>
          <option value="7">{t('buscador.idade7')}</option>
          <option value="30">{t('buscador.idade30')}</option>
          <option value="90">{t('buscador.idade90')}</option>
          <option value="365">{t('buscador.idade365')}</option>
        </select>
        <select className="busc-select" defaultValue="mais-vendidos">
          <option value="mais-vendidos">{vitrine ? t('buscador.maiorDemanda') : t('buscador.maisVendidos')}</option>
          <option value="menor-preco">{t('buscador.menorPreco')}</option>
          <option value="maior-preco">{t('buscador.maiorPreco')}</option>
        </select>
        <button type="button" className="ctl-btn">▽ {t('buscador.filtros')}</button>
      </div>

      <div className="busc-count-row">
        <span className="hint">
          {aba === 'personalizaveis' ? t('buscador.stlai.contagem') : aba === 'drops' ? t('buscador.flix.contagem') : t('buscador.produtosContagem')}
        </span>
      </div>

      {aba === 'personalizaveis' && (
        <>
          <div className="busc-drop-grid">
            {DROPS_STLAI.slice(0, 3).map((d, i) => <DropCard key={d.id} drop={{ ...d, imagem: i === 0 ? enfeitesFamilia : undefined }} marca="ai" />)}
            <VerTodosCard marca="ai" />
          </div>
          <p className="busc-nota">{t('buscador.stlai.nota')}</p>
        </>
      )}

      {aba === 'drops' && (
        <>
          <div className="busc-drop-grid">
            {DROPS_STLFLIX.map((d) => <DropCard key={d.id} drop={d} marca="flix" />)}
            <VerTodosCard marca="flix" />
          </div>
          <h3 className="busc-drop-destaque">{t('buscador.flix.destaque')}</h3>
          <div className="busc-drop-grid">
            {DESTAQUES_STLFLIX.map((d) => <DropCard key={d.id} drop={d} marca="flix" />)}
          </div>
          <p className="busc-nota">{t('buscador.flix.nota')}</p>
        </>
      )}

      {!vitrine && (
        <>
      <div className="busc-var-nota"><Icon name="info" size={14} />{t(VARIANTES.find((v) => v.key === variante)!.chaveNota)}</div>

      {mostrarChips ? (
        <div className="busc-cats" role="tablist">
          <CategoriaChip ativo={catSel === ''} onClick={() => { setCatSel(''); setPagina(1); }} total={listaBase.length}>{t('buscador.catTodas')}</CategoriaChip>
          {chipsCategoria.map((c) => (
            <CategoriaChip key={c.nome} ativo={catSel === c.nome} sem={c.nome === SEM_CATEGORIA} onClick={() => { setCatSel(c.nome); setPagina(1); }} total={c.total}>{c.nome}</CategoriaChip>
          ))}
        </div>
      ) : (
        <p className="hint busc-cats-dica">{t('buscador.catEscolhaMkt')}</p>
      )}

      <div className="busc-secao-head" ref={topoLista}>
        <div>
          <h3>{t('buscador.subindoAgora')}</h3>
          <p className="hint">{t('buscador.produtosEmAlta')}</p>
        </div>
        <span className="busc-ver-todos">{t('buscador.verTodos')}</span>
      </div>

      {produtos.length === 0 ? (
        <div className="busc-vazio">{somenteFavoritos ? t('buscador.nenhumFavorito') : t('buscador.nenhumResultado')}</div>
      ) : variante === 'C' ? (
        MARKETPLACES_BUSCA.map((m) => {
          const doMarketplace = produtos.filter((p) => p.marketplace === m);
          if (doMarketplace.length === 0) return null;
          return (
            <section key={m} className="busc-mkt-bloco">
              <div className="busc-mkt-head">
                <h4>{m} <span className="hint">· {doMarketplace.length} {t('buscador.catItens')}</span></h4>
                <span className="busc-ver-todos">{t('buscador.verTodos')}</span>
              </div>
              <div className="busc-grid">
                {doMarketplace.slice(0, ITENS_POR_BLOCO).map((p) => (
                  <ProdutoBuscaCard key={p.id} produto={p} favorito={favoritos.includes(p.id)} onAlternarFavorito={() => alternarFavorito(p.id)} onReportar={() => abrirReport(p)} />
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <div className="busc-grid">
          {produtosDaPagina.map((p) => (
            <ProdutoBuscaCard key={p.id} produto={p} mostrarMkt={variante === 'B' && aba === 'todos'} favorito={favoritos.includes(p.id)} onAlternarFavorito={() => alternarFavorito(p.id)} onReportar={() => abrirReport(p)} />
          ))}
        </div>
      )}
      {variante !== 'C' && <Paginacao
        pagina={paginaAtual}
        totalPaginas={totalPaginas}
        inicio={produtos.length === 0 ? 0 : inicio + 1}
        fim={inicio + produtosDaPagina.length}
        total={produtos.length}
        onMudar={setPagina}
      />}
        </>
      )}

      {reportando && (
        <ReportarItemModal
          produto={reportando}
          restantes={reportsRestantesHoje(USUARIO.id)}
          onClose={() => setReportando(null)}
          onEnviar={enviarReport}
        />
      )}
      {aviso && <div className="busc-toast" role="status">{aviso}</div>}
    </div>
  );
}

type Marca = 'ai' | 'flix';

function Tab({ ativo, marca, onClick, children }: { ativo: boolean; marca?: Marca; onClick: () => void; children: React.ReactNode }) {
  const cls = 'busc-tab' + (marca ? ' busc-tab-' + marca : '') + (ativo ? ' active' : '');
  return <button type="button" className={cls} onClick={onClick}>{children}</button>;
}

function VitrineIntro({ marca }: { marca: Marca }) {
  const { t } = useI18n();
  const k = marca === 'ai' ? 'stlai' : 'flix';
  return (
    <div className={'busc-intro busc-marca-' + marca}>
      <div className="busc-intro-icone"><Icon name={marca === 'ai' ? 'spark' : 'layers'} size={22} /></div>
      <div className="busc-intro-texto">
        <h2>{t(`buscador.${k}.titulo`)}</h2>
        <p>{t(`buscador.${k}.desc`)}</p>
      </div>
      <div className="busc-intro-nota">
        <div className="busc-intro-nota-titulo"><Icon name="info" size={14} />{t('buscador.comoOrdenamos')}</div>
        <p>{t(`buscador.${k}.ordenaDesc`)}</p>
      </div>
    </div>
  );
}

function VerTodosCard({ marca }: { marca: Marca }) {
  const { t } = useI18n();
  const k = marca === 'ai' ? 'stlai' : 'flix';
  return (
    <div className={'busc-drop-vertodos busc-marca-' + marca}>
      <div className="busc-drop-vertodos-icone"><Icon name={marca === 'ai' ? 'spark' : 'layers'} size={24} /></div>
      <strong>{t(`buscador.${k}.verTodos`)}</strong>
      <span>{t(`buscador.${k}.verTodosDesc`)}</span>
    </div>
  );
}

function DropCard({ drop, marca }: { drop: DropVitrine; marca: Marca }) {
  const { t } = useI18n();
  const k = marca === 'ai' ? 'stlai' : 'flix';
  return (
    <div className={'busc-drop busc-marca-' + marca}>
      <div className="busc-drop-imagem">
        {drop.imagem ? <img src={drop.imagem} alt="" /> : <span className="busc-drop-emoji">{drop.emoji}</span>}
        <span className="busc-drop-badge"><Icon name={marca === 'ai' ? 'spark' : 'layers'} size={14} />{t(`buscador.${k}.badge`)}</span>
        <button type="button" className="busc-drop-fav" aria-label={t('buscador.favoritar')}><Icon name="heart" size={17} /></button>
      </div>
      <div className="busc-drop-nome" title={drop.nome}>{drop.nome}</div>
      <div className="busc-drop-desc" title={drop.descricao}>{drop.descricao}</div>
      <div className="busc-drop-metrica">
        <Icon name="trend" size={13} />
        {marca === 'ai' ? `${drop.metrica} ${t('buscador.vendasNicho')}` : `${drop.metrica} ${t('buscador.downloads')}`}
      </div>
      <button type="button" className="busc-drop-cta"><Icon name={marca === 'ai' ? 'spark' : 'download'} size={15} />{t(`buscador.${k}.cta`)}</button>
    </div>
  );
}

function CategoriaChip({ ativo, sem, total, onClick, children }: { ativo: boolean; sem?: boolean; total: number; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" role="tab" aria-selected={ativo} className={'busc-cat-chip' + (ativo ? ' active' : '') + (sem ? ' sem' : '')} onClick={onClick}>
      {children}<span className="busc-cat-count">{total}</span>
    </button>
  );
}

function ProdutoBuscaCard({ produto, mostrarMkt, favorito, onAlternarFavorito, onReportar }: { produto: ProdutoBusca; mostrarMkt?: boolean; favorito: boolean; onAlternarFavorito: () => void; onReportar: () => void }) {
  const { t } = useI18n();
  return (
    <div className="busc-card">
      <div className="busc-card-imagem">
        {produto.foto ? <img className="busc-card-foto" src={produto.foto} alt={produto.nome} loading="lazy" /> : <span className="busc-card-emoji">{produto.imagem}</span>}
        <div className="busc-card-pills">
          <span className="busc-pill busc-pill-alta"><Icon name="trend" size={13} /> {t('buscador.emAlta')}</span>
          {produto.descontoPct !== undefined && (
            <span className="busc-pill busc-pill-desconto">{produto.descontoPct}% {t('buscador.off')}</span>
          )}
          <span className="busc-pill busc-pill-bandeira">{produto.paisBandeira}</span>
        </div>
        <button
          type="button"
          title={favorito ? t('buscador.desfavoritar') : t('buscador.favoritar')}
          aria-label={favorito ? t('buscador.desfavoritar') : t('buscador.favoritar')}
          className={'busc-card-fav' + (favorito ? ' active' : '')}
          onClick={onAlternarFavorito}
        >
          <Icon name="heart" size={15} filled={favorito} />
        </button>
        <span className="busc-card-vendedor" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.2" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" /></svg>
        </span>
        <div className="busc-card-acoes">
          <button type="button" title={t('buscador.reportar')} aria-label={t('buscador.reportar')} className="busc-card-acao-btn" onClick={onReportar}><Icon name="flag" size={14} /></button>
          <button type="button" title={t('buscador.remover')} aria-label={t('buscador.remover')} className="busc-card-acao-btn"><Icon name="trash" size={14} /></button>
        </div>
      </div>
      <div className="busc-card-body">
        <div className="busc-card-nome" title={produto.nome}>{produto.nome}</div>
        <div className="busc-card-preco">
          {brl(produto.precoAtual)}
          {produto.precoOriginal !== undefined && <span className="busc-card-preco-original">{brl(produto.precoOriginal)}</span>}
        </div>
        <div className="busc-card-metricas">
          <span className="busc-card-vendas"><Icon name="pedidos" size={12} /> {produto.vendas.toLocaleString('pt-BR')} {t('buscador.vendas')}</span>
          <span className="busc-chip-info busc-chip-idade"><Icon name="clock" size={11} /> {idadeCurta(produto.diasNoAr)}</span>
        </div>
        <div className="busc-card-chips">
          {mostrarMkt && <span className="busc-chip-info">{produto.marketplace}</span>}
          {produto.material && <span className="busc-chip-info">{produto.material}</span>}
        </div>
      </div>
    </div>
  );
}

function idadeCurta(dias: number) {
  if (dias < 30) return `${dias} dias`;
  if (dias < 365) return `${Math.floor(dias / 30)} meses`;
  const anos = Math.floor(dias / 365);
  return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
}

function brl(v: number) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
