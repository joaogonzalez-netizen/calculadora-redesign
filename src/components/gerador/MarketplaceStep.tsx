import Icon, { type IconName } from '../Icon';

interface Marketplace {
  id: string;
  nome: string;
  desc: string;
}

interface ItemPlano {
  label: string;
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
  { id: 'ml', nome: 'Mercado Livre', desc: 'Maior marketplace da América Latina. Ideal para volume e alcance.' },
  { id: 'shopee', nome: 'Shopee', desc: 'Forte em preço e promoções. Público mobile e jovem.' },
  { id: 'etsy', nome: 'Etsy', desc: 'Vitrine global para produtos autorais e personalizados.' },
  { id: 'outros', nome: 'Outros', desc: 'Gera o pacote completo para download — publicação manual.' },
];

const PLANOS: Plano[] = [
  {
    id: 'core', nome: 'Core', icone: 'bolt', creditos: 1,
    itens: [
      { label: '9 imagens geradas', incluso: true },
      { label: '4 variações de títulos', incluso: true },
      { label: '1 descrição para marketplace', incluso: true },
      { label: 'Vídeo de demonstração narrado', incluso: false },
    ],
  },
  {
    id: 'premium', nome: 'Premium', icone: 'crown', creditos: 10, recomendado: true,
    itens: [
      { label: '9 imagens geradas', incluso: true },
      { label: '4 variações de títulos', incluso: true },
      { label: '1 descrição para marketplace', incluso: true },
      { label: 'Vídeo de demonstração narrado', incluso: true },
    ],
  },
];

interface Props {
  marketplace: string;
  plano: string;
  onSelecionarMarketplace: (id: string) => void;
  onSelecionarPlano: (id: string) => void;
  onVoltar: () => void;
  onContinuar: () => void;
}

export default function MarketplaceStep({ marketplace, plano, onSelecionarMarketplace, onSelecionarPlano, onVoltar, onContinuar }: Props) {
  return (
    <>
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> Voltar</button>

      <div className="ger-titulo-bloco">
        <h2>Onde você vai publicar?</h2>
        <p>Escolha o marketplace de destino. Os campos e o formato do anúncio se ajustam à plataforma escolhida.</p>
      </div>

      <div className="ger-radio-grid">
        {MARKETPLACES.map((m) => (
          <button
            type="button"
            key={m.id}
            className={'ger-radio-card' + (marketplace === m.id ? ' selecionado' : '')}
            onClick={() => onSelecionarMarketplace(m.id)}
          >
            <div>
              <div className="ger-radio-card-titulo">{m.nome}</div>
              <div className="ger-radio-card-desc">{m.desc}</div>
            </div>
            <span className="ger-radio-dot" />
          </button>
        ))}
      </div>

      <h3 className="ger-secao-titulo">Escolha o modelo de geração</h3>

      <div className="ger-plano-grid">
        {PLANOS.map((p) => (
          <button
            type="button"
            key={p.id}
            className={'ger-plano-card' + (plano === p.id ? ' selecionado' : '')}
            onClick={() => onSelecionarPlano(p.id)}
          >
            {p.recomendado && <span className="ger-plano-badge">Recomendado</span>}
            <div className="ger-plano-head">
              <span className="ger-plano-icon"><Icon name={p.icone} size={16} /></span>
              <span className="ger-plano-nome">{p.nome}</span>
              <span className="ger-radio-dot" />
            </div>
            <ul className="ger-plano-lista">
              {p.itens.map((it) => (
                <li key={it.label} className={it.incluso ? 'sim' : 'nao'}>
                  <Icon name={it.incluso ? 'check' : 'close'} size={13} /> {it.label}
                </li>
              ))}
            </ul>
            <div className="ger-plano-creditos"><b>{p.creditos}</b> créditos</div>
          </button>
        ))}
      </div>

      <div className="ger-footer">
        <button type="button" className="btn-dark pill" onClick={onContinuar}>Continuar</button>
      </div>
    </>
  );
}
