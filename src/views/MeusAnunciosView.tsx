import { useState } from 'react';
import Icon from '../components/Icon';
import PopoverList from '../components/produtos/PopoverList';
import { useI18n } from '../context/I18nContext';

// Réplica da tela "Meus Anúncios" em produção (print de João, 08/09/2026) —
// listagem dos anúncios criados pelo Gerador, com busca, ordenação, filtro
// por status/marketplace e troca entre Cards/Lista. "Continuar" sempre
// reabre o wizard do zero (a tela de Criar Anúncio ainda não retoma um
// rascunho específico); baixar e excluir mexem numa cópia local da lista,
// só pra essa sessão.
type StatusAnuncio = 'gerando' | 'rascunho' | 'publicado';
type MarketplaceAnuncio = 'ml' | 'shopee' | 'etsy' | 'outros';

interface Anuncio {
  id: string;
  nome: string;
  status: StatusAnuncio;
  marketplace: MarketplaceAnuncio;
  data: string;
  cor: string;
}

const CHAVES_STATUS_LABEL: Record<StatusAnuncio, string> = {
  gerando: 'meusAnuncios.gerando',
  rascunho: 'meusAnuncios.rascunho',
  publicado: 'meusAnuncios.publicado',
};
const STATUS_CLASSE: Record<StatusAnuncio, string> = {
  gerando: 'status-pausado',
  rascunho: 'ma-status-rascunho',
  publicado: 'status-ativo',
};

const STATUS_FILTRO: StatusAnuncio[] = ['gerando', 'rascunho', 'publicado'];

const MARKETPLACES_FILTRO: { id: MarketplaceAnuncio; chave: string }[] = [
  { id: 'ml', chave: 'gerador.mkMercadoLivre' },
  { id: 'shopee', chave: 'gerador.mkShopee' },
  { id: 'etsy', chave: 'gerador.mkEtsy' },
  { id: 'outros', chave: 'gerador.mkOutros' },
];

const MOCK_INICIAL: Anuncio[] = [
  { id: 'a1', nome: 'Incensário de Bicho-Preguiça', status: 'gerando', marketplace: 'ml', data: '08/09/2026', cor: 'linear-gradient(160deg,#e9eee6,#2b2f27)' },
  { id: 'a2', nome: 'draft-pendente', status: 'rascunho', marketplace: 'shopee', data: '03/09/2026', cor: 'linear-gradient(160deg,#efe6d8,#d9c7a3)' },
  { id: 'a3', nome: 'Miniatura Dragão RPG', status: 'publicado', marketplace: 'etsy', data: '28/08/2026', cor: 'linear-gradient(160deg,#e8e3da,#c9beac)' },
  { id: 'a4', nome: 'Suporte de Celular Articulado', status: 'publicado', marketplace: 'ml', data: '25/08/2026', cor: 'linear-gradient(160deg,#e0e7ef,#a9bbd1)' },
  { id: 'a5', nome: 'Vaso Geométrico Facetado', status: 'publicado', marketplace: 'shopee', data: '20/08/2026', cor: 'linear-gradient(160deg,#f0e6ea,#d7b8c6)' },
  { id: 'a6', nome: 'Porta-chaves Parede Minimalista', status: 'rascunho', marketplace: 'outros', data: '18/08/2026', cor: 'linear-gradient(160deg,#eaf0e6,#bcd1ac)' },
  { id: 'a7', nome: 'Luminária Geométrica de Mesa', status: 'publicado', marketplace: 'ml', data: '15/08/2026', cor: 'linear-gradient(160deg,#f4ecdf,#dcc59a)' },
];

function paraData(d: string) {
  const [dia, mes, ano] = d.split('/').map(Number);
  return new Date(ano, mes - 1, dia).getTime();
}

interface Props {
  onCriarAnuncio: () => void;
}

export default function MeusAnunciosView({ onCriarAnuncio }: Props) {
  const { t } = useI18n();
  const ORDENS = [t('meusAnuncios.ordenarRecentes'), t('meusAnuncios.ordenarMaisAntigos'), t('meusAnuncios.ordenarNomeAZ')];
  const [anuncios, setAnuncios] = useState<Anuncio[]>(MOCK_INICIAL);
  const [busca, setBusca] = useState('');
  const [ordem, setOrdem] = useState(ORDENS[0]);
  const [modo, setModo] = useState<'cards' | 'lista'>('cards');
  const [statusFiltro, setStatusFiltro] = useState<StatusAnuncio | 'todos'>('todos');
  const [marketplaceFiltro, setMarketplaceFiltro] = useState(t('calc.todos'));

  const filtrados = anuncios
    .filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase()))
    .filter((a) => statusFiltro === 'todos' || a.status === statusFiltro)
    .filter((a) => marketplaceFiltro === t('calc.todos') || MARKETPLACES_FILTRO.find((m) => m.id === a.marketplace && t(m.chave) === marketplaceFiltro))
    .sort((a, b) => {
      if (ordem === t('meusAnuncios.ordenarNomeAZ')) return a.nome.localeCompare(b.nome);
      const diff = paraData(b.data) - paraData(a.data);
      return ordem === t('meusAnuncios.ordenarMaisAntigos') ? -diff : diff;
    });

  function baixar(a: Anuncio) {
    alert(`"${a.nome}" — ${t('meusAnuncios.baixarEmBreve')}`);
  }
  function excluir(a: Anuncio) {
    if (!confirm(`Excluir "${a.nome}"? Essa ação não pode ser desfeita.`)) return;
    setAnuncios((prev) => prev.filter((x) => x.id !== a.id));
  }

  return (
    <div>
      <div className="hero">
        <h1>{t('meusAnuncios.heroTitulo')} <span className="accent">{t('meusAnuncios.heroTituloDestaque')}</span></h1>
        <p>Visualize, edite ou duplique anúncios já criados. Você pode filtrar por status, idioma ou tipo de produto pra encontrar o que precisa rápido.</p>
      </div>

      <div className="ma-toolbar">
        <div className="cl-search ma-busca"><Icon name="search" size={15} /><input type="text" placeholder={t('meusAnuncios.buscarPlaceholder')} value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
        <div className="chip-row sm">
          <button type="button" className={'chip sm' + (statusFiltro === 'todos' ? ' active' : '')} onClick={() => setStatusFiltro('todos')}>{t('calc.todos')}</button>
          {STATUS_FILTRO.map((s) => (
            <button type="button" key={s} className={'chip sm' + (statusFiltro === s ? ' active' : '')} onClick={() => setStatusFiltro(s)}>{t(CHAVES_STATUS_LABEL[s])}</button>
          ))}
        </div>
        <PopoverList
          label={t('meusAnuncios.filtroMarketplaceLabel')}
          options={[t('calc.todos'), ...MARKETPLACES_FILTRO.map((m) => t(m.chave))]}
          value={marketplaceFiltro}
          onChange={setMarketplaceFiltro}
        />
        <PopoverList label="" options={ORDENS} value={ordem} onChange={setOrdem} />
        <div className="cluster-modo-toggle">
          <button type="button" className={modo === 'cards' ? 'active' : ''} onClick={() => setModo('cards')}><Icon name="dashboard" size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} /> {t('meusAnuncios.cards')}</button>
          <button type="button" className={modo === 'lista' ? 'active' : ''} onClick={() => setModo('lista')}><Icon name="folder" size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} /> {t('meusAnuncios.lista')}</button>
        </div>
        <button type="button" className="btn-dark ma-novo" onClick={onCriarAnuncio}>{t('meusAnuncios.novoAnuncio')}</button>
      </div>

      {modo === 'cards' ? (
        <div className="ma-grid">
          <button type="button" className="ma-card ma-card-novo" onClick={onCriarAnuncio}>
            <div className="ma-card-media ma-card-novo-media">
              <span className="ma-card-novo-icone"><Icon name="plus" size={20} /></span>
            </div>
            <div className="ma-card-corpo ma-card-novo-corpo">
              <b>{t('meusAnuncios.criarNovoAnuncio')}</b>
              <span>{t('meusAnuncios.criarNovoAnuncioDesc')}</span>
            </div>
          </button>

          {filtrados.map((a) => (
            <div className="ma-card" key={a.id}>
              <div className="ma-card-topo">
                <span className={'status-tag ' + STATUS_CLASSE[a.status]}>{t(CHAVES_STATUS_LABEL[a.status])}</span>
              </div>
              <div className="ma-card-media" style={{ background: a.cor }} />
              <div className="ma-card-corpo">
                <b>{a.nome}</b>
                <div className="ma-card-meta">
                  <span className="mp-tag">{t(MARKETPLACES_FILTRO.find((m) => m.id === a.marketplace)!.chave)}</span>
                  <span>{a.data}</span>
                </div>
                <div className="ma-card-acoes">
                  <button type="button" className="btn-outline ma-continuar" onClick={onCriarAnuncio}>
                    <Icon name="chevron" size={12} style={{ transform: 'rotate(180deg)' }} /> {a.status === 'publicado' ? t('meusAnuncios.verAnuncio') : t('meusAnuncios.continuar')}
                  </button>
                  <button type="button" className="ma-icone-btn" title={t('meusAnuncios.baixar')} onClick={() => baixar(a)}><Icon name="download" size={14} /></button>
                  <button type="button" className="ma-icone-btn ma-icone-btn-red" title={t('meusAnuncios.excluir')} onClick={() => excluir(a)}><Icon name="trash" size={14} /></button>
                </div>
              </div>
            </div>
          ))}

          {filtrados.length === 0 && anuncios.length > 0 && (
            <div className="ma-vazio">{t('meusAnuncios.nenhumEncontrado')} "{busca}".</div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="prod-table">
              <thead><tr><th>{t('meusAnuncios.colAnuncio')}</th><th>{t('meusAnuncios.colMarketplace')}</th><th>{t('meusAnuncios.colStatus')}</th><th>{t('meusAnuncios.colData')}</th><th /></tr></thead>
              <tbody>
                {filtrados.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 34, height: 34, borderRadius: 8, background: a.cor, flex: '0 0 auto' }} />
                        <span className="prod-name">{a.nome}</span>
                      </div>
                    </td>
                    <td><span className="mp-tag">{t(MARKETPLACES_FILTRO.find((m) => m.id === a.marketplace)!.chave)}</span></td>
                    <td><span className={'status-tag ' + STATUS_CLASSE[a.status]}>{t(CHAVES_STATUS_LABEL[a.status])}</span></td>
                    <td>{a.data}</td>
                    <td>
                      <div className="ma-card-acoes" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-outline ma-continuar" onClick={onCriarAnuncio}>{a.status === 'publicado' ? t('meusAnuncios.verAnuncio') : t('meusAnuncios.continuar')}</button>
                        <button type="button" className="ma-icone-btn" title={t('meusAnuncios.baixar')} onClick={() => baixar(a)}><Icon name="download" size={14} /></button>
                        <button type="button" className="ma-icone-btn ma-icone-btn-red" title={t('meusAnuncios.excluir')} onClick={() => excluir(a)}><Icon name="trash" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtrados.length === 0 && <div className="ma-vazio">{t('meusAnuncios.nenhumEncontrado')} "{busca}".</div>}
          </div>
        </div>
      )}
    </div>
  );
}
