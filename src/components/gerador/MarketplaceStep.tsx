import { useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import { GERADOR_MARKETPLACES_VISIVEIS } from '../../lib/versoes';
import Icon, { type IconName } from '../Icon';

interface Marketplace {
  id: string;
  nomeChave: string;
  descChave: string;
}

interface ItemPlano {
  labelChave: string;
  incluso: boolean;
}

interface Plano {
  id: string;
  nome: string;
  icone: IconName;
  creditos: number;
  recomendado?: boolean;
  itens: ItemPlano[];
}

const MARKETPLACES: Marketplace[] = [
  { id: 'ml', nomeChave: 'gerador.mkMercadoLivre', descChave: 'gerador.mkMercadoLivreDesc' },
  { id: 'shopee', nomeChave: 'gerador.mkShopee', descChave: 'gerador.mkShopeeDesc' },
  { id: 'etsy', nomeChave: 'gerador.mkEtsy', descChave: 'gerador.mkEtsyDesc' },
  { id: 'outros', nomeChave: 'gerador.mkOutros', descChave: 'gerador.mkOutrosDesc' },
];

const PLANOS: Plano[] = [
  {
    id: 'core', nome: 'Core', icone: 'bolt', creditos: 1,
    itens: [
      { labelChave: 'gerador.imagensGeradas9', incluso: true },
      { labelChave: 'gerador.variacoesTitulos4', incluso: true },
      { labelChave: 'gerador.descricaoMarketplace1', incluso: true },
      { labelChave: 'gerador.videoDemonstracaoNarrado', incluso: false },
    ],
  },
  {
    id: 'premium', nome: 'Premium', icone: 'crown', creditos: 10, recomendado: true,
    itens: [
      { labelChave: 'gerador.imagensGeradas9', incluso: true },
      { labelChave: 'gerador.variacoesTitulos4', incluso: true },
      { labelChave: 'gerador.descricaoMarketplace1', incluso: true },
      { labelChave: 'gerador.videoDemonstracaoNarrado', incluso: true },
    ],
  },
];

// Sub-escolha só aparece quando o vendedor marca "Outros" — muita gente
// caía nessa opção por falta de destino específico, então aqui ele conta
// exatamente pra onde vai (pode ser mais de um) e a IA ajusta o que gerar.
// Cards simples (só o nome) — sem cor/ícone por destino, pra manter a grade
// rápida de escanear mesmo com vários itens (ver print de referência do João).
interface Destino {
  id: string;
  nome: string;
}

const OUTROS_MARKETPLACES: Destino[] = [
  { id: 'amazon', nome: 'Amazon' },
  { id: 'aliexpress', nome: 'AliExpress' },
  { id: 'ebay', nome: 'eBay' },
  // "Facebook Marketplace" — fica aqui, não em Redes sociais, porque é canal
  // de venda de verdade (forte nos EUA e principalmente na Argentina), não
  // só uma postagem social. Mesma lógica pra "TikTok Shop" vs. "TikTok" (rede).
  { id: 'facebook-marketplace', nome: 'Facebook Marketplace' },
  { id: 'tiktok-shop', nome: 'TikTok Shop' },
  { id: 'elo7', nome: 'Elo7' },
  { id: 'loja-propria', nome: 'Loja própria' },
];

const OUTRAS_REDES: Destino[] = [
  { id: 'instagram', nome: 'Instagram' },
  { id: 'facebook', nome: 'Facebook' },
  { id: 'tiktok', nome: 'TikTok' },
  { id: 'pinterest', nome: 'Pinterest' },
];

function GrupoDestino({ titulo, itens, selecionados, onAlternar }: { titulo: string; itens: Destino[]; selecionados: string[]; onAlternar: (id: string) => void }) {
  return (
    <div className="ger-destino-grupo">
      <div className="ger-destino-grupo-titulo">{titulo}</div>
      <div className="ger-destino-grid">
        {itens.map((d) => {
          const ativo = selecionados.includes(d.id);
          return (
            <button type="button" key={d.id} className={'ger-destino-card' + (ativo ? ' selecionado' : '')} onClick={() => onAlternar(d.id)}>
              <span className="ger-destino-nome">{d.nome}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


interface Props {
  marketplace: string;
  plano: string;
  onSelecionarMarketplace: (id: string) => void;
  onSelecionarPlano: (id: string) => void;
  onVoltar: () => void;
  onContinuar: () => void;
}

export default function MarketplaceStep({ marketplace, plano, onSelecionarMarketplace, onSelecionarPlano, onVoltar, onContinuar }: Props) {
  const { t, idioma } = useI18n();
  const marketplacesVisiveis = MARKETPLACES.filter((m) => GERADOR_MARKETPLACES_VISIVEIS[idioma].includes(m.id));
  const [outrosDestinos, setOutrosDestinos] = useState<string[]>([]);
  const [destinosCustom, setDestinosCustom] = useState<string[]>([]);
  const [novoDestinoCustom, setNovoDestinoCustom] = useState('');
  const ehOutros = marketplace === 'outros';
  const totalDestinos = outrosDestinos.length + destinosCustom.length;

  function alternarDestino(id: string) {
    setOutrosDestinos((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }
  function adicionarDestinoCustom() {
    const v = novoDestinoCustom.trim();
    if (!v) return;
    setDestinosCustom((prev) => (prev.some((d) => d.toLowerCase() === v.toLowerCase()) ? prev : [...prev, v]));
    setNovoDestinoCustom('');
  }
  function removerDestinoCustom(nome: string) {
    setDestinosCustom((prev) => prev.filter((d) => d !== nome));
  }

  return (
    <>
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> {t('gerador.voltar')}</button>

      <div className="ger-titulo-bloco">
        <h2>{t('gerador.ondeVaiPublicar')}</h2>
        <p>Escolha o marketplace de destino. Os campos e o formato do anúncio se ajustam à plataforma escolhida.</p>
      </div>

      <div className="ger-radio-grid">
        {marketplacesVisiveis.map((m) => (
          <button
            type="button"
            key={m.id}
            className={'ger-radio-card' + (marketplace === m.id ? ' selecionado' : '')}
            onClick={() => onSelecionarMarketplace(m.id)}
          >
            <div>
              <div className="ger-radio-card-titulo">{t(m.nomeChave)}</div>
              <div className="ger-radio-card-desc">{t(m.descChave)}</div>
            </div>
            <span className="ger-radio-dot" />
          </button>
        ))}
      </div>

      {ehOutros && (
        <div className="ger-outros-destino">
          <div className="ger-titulo-bloco" style={{ marginBottom: 20 }}>
            <h3 className="ger-secao-titulo" style={{ marginTop: 0 }}>{t('gerador.praOndeVamosGerar')}</h3>
            <p>Nos conte pra onde quer gerar esse anúncio e ajude a IA a gerar o melhor modelo. Você pode escolher mais de um destino.</p>
          </div>
          <GrupoDestino titulo={t('gerador.outrosMarketplaces')} itens={OUTROS_MARKETPLACES} selecionados={outrosDestinos} onAlternar={alternarDestino} />
          <GrupoDestino titulo={t('gerador.redesSociais')} itens={OUTRAS_REDES} selecionados={outrosDestinos} onAlternar={alternarDestino} />

          <div className="ger-destino-grupo">
            <div className="ger-destino-grupo-titulo">{t('gerador.naoENenhumDesses')}</div>
            <div className="ger-destino-custom-row">
              <input
                type="text"
                placeholder={t('gerador.digiteOutroDestino')}
                value={novoDestinoCustom}
                onChange={(e) => setNovoDestinoCustom(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarDestinoCustom(); } }}
                onBlur={adicionarDestinoCustom}
              />
              <button type="button" className="btn-outline" onClick={adicionarDestinoCustom}>{t('gerador.adicionar')}</button>
            </div>
            {destinosCustom.length > 0 && (
              <div className="ger-destino-custom-lista">
                {destinosCustom.map((d) => (
                  <span className="pub-chip-custom" key={d}>{d} <button type="button" onClick={() => removerDestinoCustom(d)}><Icon name="close" size={11} /></button></span>
                ))}
              </div>
            )}
          </div>

          <div className="ger-destino-conta">
            {totalDestinos === 0
              ? t('gerador.selecioneAoMenos1Destino')
              : `${totalDestinos} ${totalDestinos > 1 ? t('gerador.destinos') : t('gerador.destino')} ${totalDestinos > 1 ? t('gerador.selecionadosPlural') : t('gerador.selecionadoSingular')}.`}
          </div>
        </div>
      )}

      <h3 className="ger-secao-titulo">{t('gerador.escolhaModeloGeracao')}</h3>

      <div className="ger-plano-grid">
        {PLANOS.map((p) => (
          <button
            type="button"
            key={p.id}
            className={'ger-plano-card' + (plano === p.id ? ' selecionado' : '')}
            onClick={() => onSelecionarPlano(p.id)}
          >
            {p.recomendado && <span className="ger-plano-badge">{t('gerador.recomendado')}</span>}
            <div className="ger-plano-head">
              <span className="ger-plano-icon"><Icon name={p.icone} size={16} /></span>
              <span className="ger-plano-nome">{p.nome}</span>
              <span className="ger-radio-dot" />
            </div>
            <ul className="ger-plano-lista">
              {p.itens.map((it) => (
                <li key={it.labelChave} className={it.incluso ? 'sim' : 'nao'}>
                  <Icon name={it.incluso ? 'check' : 'close'} size={13} /> {t(it.labelChave)}
                </li>
              ))}
            </ul>
            <div className="ger-plano-creditos"><b>{p.creditos}</b> {t('gerador.creditos')}</div>
          </button>
        ))}
      </div>

      <div className="ger-footer">
        <button type="button" className="btn-dark pill" disabled={ehOutros && totalDestinos === 0} onClick={onContinuar}>{t('gerador.continuar')}</button>
      </div>
    </>
  );
}
