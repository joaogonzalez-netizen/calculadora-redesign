import { useMemo, useState } from 'react';
import { PRODUTOS_BUSCA, type ProdutoBusca } from '../lib/buscadorMock';
import { BUSCADOR_FAVORITOS_KEY, readJson, writeJson } from '../lib/storage';
import { useI18n } from '../context/I18nContext';
import Icon from '../components/Icon';

interface Props {
  onFavoritar: () => void;
}

/** Tela "Buscador de Produtos" (Product Finder). Grid de produtos 3D em alta
 * — dados mockados, sem backend. Busca e favoritos são funcionais de verdade
 * (favoritos persistem em localStorage); as demais faixas de filtro do
 * cabeçalho (preço, material, ordenação, tabs de marketplace) são só visuais
 * nesta versão, igual combinado no escopo da feature. */
export default function BuscadorView({ onFavoritar }: Props) {
  const { t } = useI18n();
  const [busca, setBusca] = useState('');
  const [favoritos, setFavoritos] = useState<string[]>(() => readJson(BUSCADOR_FAVORITOS_KEY, []));
  const [somenteFavoritos, setSomenteFavoritos] = useState(false);

  function alternarFavorito(id: string) {
    setFavoritos((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      writeJson(BUSCADOR_FAVORITOS_KEY, next);
      return next;
    });
    onFavoritar();
  }

  const produtos = useMemo(() => {
    let lista = PRODUTOS_BUSCA;
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      lista = lista.filter((p) => p.nome.toLowerCase().includes(termo));
    }
    if (somenteFavoritos) lista = lista.filter((p) => favoritos.includes(p.id));
    return lista;
  }, [busca, somenteFavoritos, favoritos]);

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
          <span className="busc-tab active">{t('buscador.tabTodos')}</span>
          <span className="busc-tab">{t('buscador.tabMercadoLivre')}</span>
          <span className="busc-tab">{t('buscador.tabEtsy')}</span>
          <span className="busc-tab">
            {t('buscador.tabShopee')}
            <span className="busc-tab-tag">{t('buscador.emConstrucao')}</span>
          </span>
        </div>
        <span className="pill-btn busc-stl-link">{t('buscador.buscadorStls')}</span>
      </div>

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
        <select className="busc-select" defaultValue="mais-vendidos">
          <option value="mais-vendidos">{t('buscador.maisVendidos')}</option>
          <option value="menor-preco">{t('buscador.menorPreco')}</option>
          <option value="maior-preco">{t('buscador.maiorPreco')}</option>
        </select>
        <button type="button" className="ctl-btn">▽ {t('buscador.filtros')}</button>
      </div>

      <div className="busc-count-row">
        <span className="hint">{t('buscador.produtosContagem')}</span>
      </div>

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
            <ProdutoBuscaCard key={p.id} produto={p} favorito={favoritos.includes(p.id)} onAlternarFavorito={() => alternarFavorito(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProdutoBuscaCard({ produto, favorito, onAlternarFavorito }: { produto: ProdutoBusca; favorito: boolean; onAlternarFavorito: () => void }) {
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
