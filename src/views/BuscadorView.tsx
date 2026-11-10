import { useEffect, useMemo, useRef, useState } from 'react';
import ReportarItemModal from '../components/buscador/ReportarItemModal';
import { criarReport, idsOcultosPara, lerReports, reportsRestantesHoje, type NovoReport } from '../lib/finderReports';
import { USUARIO } from '../lib/dashboardMock';
import { PRODUTOS_BUSCA, DROPS_STLAI, DROPS_STLFLIX, DESTAQUES_STLFLIX, type ProdutoBusca, type DropVitrine } from '../lib/buscadorMock';
import enfeitesFamilia from '../assets/buscador/enfeites-familia.png';
import { BUSCADOR_FAVORITOS_KEY, readJson, writeJson } from '../lib/storage';
import { useI18n } from '../context/I18nContext';
import Icon from '../components/Icon';

type Aba = 'todos' | 'ml' | 'mlar' | 'etsy' | 'shopee' | 'personalizaveis' | 'drops';

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
  const [busca, setBusca] = useState('');
  const [favoritos, setFavoritos] = useState<string[]>(() => readJson(BUSCADOR_FAVORITOS_KEY, []));
  const [somenteFavoritos, setSomenteFavoritos] = useState(false);
  // Idade máxima do anúncio em dias ('' = qualquer).
  const [idade, setIdade] = useState('');
  const [aba, setAba] = useState<Aba>('todos');
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

  const produtos = useMemo(() => {
    const ocultos = idsOcultosPara(USUARIO.id, reports);
    let lista = PRODUTOS_BUSCA.filter((p) => !ocultos.has(p.id));
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      lista = lista.filter((p) => p.nome.toLowerCase().includes(termo));
    }
    if (idade) lista = lista.filter((p) => p.diasNoAr <= Number(idade));
    if (somenteFavoritos) lista = lista.filter((p) => favoritos.includes(p.id));
    return lista;
  }, [busca, idade, somenteFavoritos, favoritos, reports]);

  return (
    <div>
      <div className="busc-header-row">
        <div className="hero">
          <h1>{t('buscador.titulo')} <span className="busc-beta-pill">{t('buscador.beta')}</span></h1>
          <p>{t('buscador.subtitulo')}</p>
        </div>
        <button
          type="button"
          className={'pill-btn busc-fav-toggle' + (somenteFavoritos ? ' active' : '')}
          onClick={() => setSomenteFavoritos((s) => !s)}
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
          <input type="text" placeholder={t('buscador.buscarPlaceholder')} value={busca} onChange={(e) => setBusca(e.target.value)} />
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
        <select className="busc-select" value={idade} onChange={(e) => setIdade(e.target.value)} aria-label={t('buscador.idadeAnuncio')}>
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
      <div className="busc-secao-head">
        <div>
          <h3>{t('buscador.subindoAgora')}</h3>
          <p className="hint">{t('buscador.produtosEmAlta')}</p>
        </div>
        <span className="busc-ver-todos">{t('buscador.verTodos')}</span>
      </div>

      {produtos.length === 0 ? (
        <div className="busc-vazio">{somenteFavoritos ? t('buscador.nenhumFavorito') : t('buscador.nenhumResultado')}</div>
      ) : (
        <div className="busc-grid">
          {produtos.map((p) => (
            <ProdutoBuscaCard key={p.id} produto={p} favorito={favoritos.includes(p.id)} onAlternarFavorito={() => alternarFavorito(p.id)} onReportar={() => abrirReport(p)} />
          ))}
        </div>
      )}
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

function ProdutoBuscaCard({ produto, favorito, onAlternarFavorito, onReportar }: { produto: ProdutoBusca; favorito: boolean; onAlternarFavorito: () => void; onReportar: () => void }) {
  const { t } = useI18n();
  return (
    <div className="busc-card">
      <div className="busc-card-imagem">
        <span className="busc-card-emoji">{produto.imagem}</span>
        <span className="busc-badge-alta">🔥 {t('buscador.emAlta')}</span>
        {produto.descontoPct !== undefined && (
          <span className="busc-badge-desconto">{produto.descontoPct}% {t('buscador.off')}</span>
        )}
        <span className="busc-card-bandeira">{produto.paisBandeira}</span>
        <div className="busc-card-acoes">
          <button type="button" title={t('buscador.reportar')} aria-label={t('buscador.reportar')} className="busc-card-acao-btn" onClick={onReportar}><Icon name="flag" size={14} /></button>
          <button type="button" title={t('buscador.remover')} className="busc-card-acao-btn"><Icon name="trash" size={14} /></button>
          <button
            type="button"
            title={favorito ? t('buscador.desfavoritar') : t('buscador.favoritar')}
            className={'busc-card-acao-btn' + (favorito ? ' active' : '')}
            onClick={onAlternarFavorito}
          >
            <Icon name="heart" size={14} filled={favorito} />
          </button>
        </div>
      </div>
      <div className="busc-card-body">
        <div className="busc-card-nome" title={produto.nome}>{produto.nome}</div>
        <div className="busc-card-preco">
          {brl(produto.precoAtual)}
          {produto.precoOriginal !== undefined && <span className="busc-card-preco-original">{brl(produto.precoOriginal)}</span>}
        </div>
        <div className="busc-card-vendas"><Icon name="pedidos" size={13} /> {produto.vendas.toLocaleString('pt-BR')} {t('buscador.vendas')}</div>
      </div>
    </div>
  );
}

function brl(v: number) {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
