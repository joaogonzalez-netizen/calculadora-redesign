import { useState } from 'react';
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

// Sub-escolha só aparece quando o vendedor marca "Outros" — muita gente
// caía nessa opção por falta de destino específico, então aqui ele conta
// exatamente pra onde vai (pode ser mais de um) e a IA ajusta o que gerar.
interface Destino {
  id: string;
  nome: string;
  icone?: IconName;
  cor: string;
}

const OUTROS_MARKETPLACES: Destino[] = [
  { id: 'amazon', nome: 'Amazon', cor: '#ff9900' },
  { id: 'aliexpress', nome: 'AliExpress', cor: '#e2231a' },
];

const OUTRAS_REDES: Destino[] = [
  { id: 'instagram', nome: 'Instagram', icone: 'instagram', cor: '#d62976' },
  { id: 'facebook', nome: 'Facebook', icone: 'facebook', cor: '#1877f2' },
  { id: 'tiktok', nome: 'TikTok', icone: 'tiktok', cor: '#14181a' },
  { id: 'pinterest', nome: 'Pinterest', icone: 'pinterest', cor: '#e60023' },
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
              <span className={'ger-destino-icone' + (d.icone ? ' com-glifo' : '')} style={{ background: d.cor }}>
                {d.icone && <Icon name={d.icone} size={15} style={{ color: '#fff' }} />}
              </span>
              <span className="ger-destino-nome">{d.nome}</span>
              <span className="ger-destino-check"><Icon name="check" size={12} /></span>
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
  const [outrosDestinos, setOutrosDestinos] = useState<string[]>([]);
  const ehOutros = marketplace === 'outros';

  function alternarDestino(id: string) {
    setOutrosDestinos((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

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

      {ehOutros && (
        <div className="ger-outros-destino">
          <div className="ger-titulo-bloco" style={{ marginBottom: 20 }}>
            <h3 className="ger-secao-titulo" style={{ marginTop: 0 }}>Pra onde vamos gerar esse anúncio?</h3>
            <p>Nos conte pra onde quer gerar esse anúncio e ajude a IA a gerar o melhor modelo. Você pode escolher mais de um destino.</p>
          </div>
          <GrupoDestino titulo="Outros marketplaces" itens={OUTROS_MARKETPLACES} selecionados={outrosDestinos} onAlternar={alternarDestino} />
          <GrupoDestino titulo="Redes sociais" itens={OUTRAS_REDES} selecionados={outrosDestinos} onAlternar={alternarDestino} />
          <div className="ger-destino-conta">
            {outrosDestinos.length === 0 ? 'Selecione ao menos 1 destino para continuar.' : `${outrosDestinos.length} destino${outrosDestinos.length > 1 ? 's' : ''} selecionado${outrosDestinos.length > 1 ? 's' : ''}.`}
          </div>
        </div>
      )}

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
        <button type="button" className="btn-dark pill" disabled={ehOutros && outrosDestinos.length === 0} onClick={onContinuar}>Continuar</button>
      </div>
    </>
  );
}
