import { useEffect, useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

// Réplica do passo "Textos" do Gerador de anúncios em produção (print de
// João, 08/09/2026) — revisão dos textos que a IA gerou a partir das
// imagens e informações dos passos anteriores. Tudo mockado: título,
// variações e descrição vêm de um texto fixo por idioma; "Re-gerar" e o
// botão de chat (pedir ajuste pontual num texto) ainda não chamam IA de
// verdade.
interface TextosMock {
  titulo: string;
  variacoes: string[];
  descricao: string;
}

// Etsy exige campos dedicados de tags (até 13) e atributos (material, cor,
// medidas) que alimentam os filtros de busca do comprador — mockado no
// mesmo padrão do resto do passo, por idioma do anúncio.
interface EtsyMock {
  tags: string[];
  material: string;
  cor: string;
  largura: string;
  profundidade: string;
  altura: string;
}

const ETSY_MOCK: Record<'pt' | 'en', EtsyMock> = {
  pt: {
    tags: [
      'incensário bicho', 'preguiça decoração', 'quarto infantil', 'área de lazer verde',
      'peça decorativa pla', 'presente criança', 'decoração lúdica', 'incensário 3d',
      'bicho preguiça mini', 'decoração natureza', 'presente divertido', 'enfeite mesa', 'decoração verde marrom',
    ],
    material: 'PLA',
    cor: 'Verde e marrom',
    largura: '23 cm · 9.1 in',
    profundidade: '23 cm · 9.1 in',
    altura: '23 cm · 9.1 in',
  },
  en: {
    tags: [
      'sloth incense', 'sloth holder decor', 'kids bedroom', 'green leisure area',
      'pla decor piece', 'gift for kids', 'playful decor', '3d incense holder',
      'mini sloth figure', 'nature decor', 'fun gift idea', 'desk decor', 'green brown decor',
    ],
    material: 'PLA',
    cor: 'Green and brown',
    largura: '23 cm · 9.1 in',
    profundidade: '23 cm · 9.1 in',
    altura: '23 cm · 9.1 in',
  },
};

const ETSY_TAGS_LIMITE = 13;

// Sugestões de keywords via EverBee Research API (GET /api/v1/keywords/{keyword})
// — mockado no mesmo formato do retorno real (keyword, vol, competition, score),
// pra já sair plugável quando a integração de verdade entrar (ver US de
// exploração de custo por anúncio). Keywords em inglês porque é assim que a
// busca do Etsy funciona de verdade, independente do idioma do anúncio.
interface EverbeeKeyword {
  keyword: string;
  vol: number;
  competition: number;
  score: number;
}

const EVERBEE_MOCK: EverbeeKeyword[] = [
  { keyword: 'sloth decor', vol: 8420, competition: 210, score: 4010 },
  { keyword: 'sloth gift', vol: 12680, competition: 640, score: 3210 },
  { keyword: 'kids room decor', vol: 31200, competition: 2890, score: 1870 },
  { keyword: 'cute animal decor', vol: 6150, competition: 95, score: 5290 },
  { keyword: 'incense holder', vol: 9870, competition: 480, score: 3450 },
  { keyword: 'nursery decor', vol: 18400, competition: 1320, score: 2210 },
];

const MOCK: Record<'pt' | 'en', TextosMock> = {
  pt: {
    titulo: 'Incensário Bicho-Preguiça Divertido para Decoração do Ambiente Peça Decorativa Quarto Infantil Área De Lazer Verde',
    variacoes: [
      'Decoração Lúdica com Incensário Bicho-Preguiça para Crianças Peça Decorativa Quarto Infantil Área De Lazer Verde Marrom',
      'Incensário Bicho-Preguiça para Quarto Infantil e Área de Lazer Peça Decorativa Verde Marrom Divertida Ambiente Crianças',
      'Incensário Bicho-Preguiça com Design Natural e Detalhes Coloridos Peça Decorativa Verde Marrom Quarto Infantil Área De',
    ],
    descricao: `O Incensário Bicho-Preguiça Divertido para Decoração do Ambiente é a peça perfeita para trazer um toque lúdico e alegre aos ambientes, sendo ideal para quartos infantis e áreas de lazer. Este incensário combina funcionalidade com um design encantador, proporcionando momentos de relaxamento e bem-estar.

Benefícios:
- A peça decorativa proporciona um ambiente acolhedor e divertido, ideal para crianças.
- Seu formato lúdico traz alegria não apenas aos pequenos, mas também aos adultos que compartilham esses espaços.
- Design estilizado que imita folhas - uma adição charmosa à decoração de interiores.
- Disponível na cor verde e marrom, combina perfeitamente com a estética da natureza.
- Peça estática, sem partes móveis, focada na beleza visual e na decoração do ambiente.

Especificações:
- Medidas: 23x23x23 cm
- Cor: Verde e Marrom
- Peso: 300 g
- Material: PLA, plástico de origem vegetal e fonte renovável, com ótimo acabamento.

Cuidados:
Evite sol e calor intenso, não deixe dentro do carro.

Perguntas frequentes:
P: Dá para personalizar?
R: Sim, não informado.

P: As partes se movem/encaixam?
R: Não informado.

Adicione um toque divertido à sua decoração!`,
  },
  en: {
    titulo: 'Fun Sloth Incense Holder Home Decor Piece Kids Bedroom Green Leisure Area Decoration',
    variacoes: [
      'Playful Sloth Incense Holder Decor for Kids Bedroom Green Brown Leisure Area Piece',
      'Sloth Incense Holder for Kids Room and Leisure Area Fun Green Brown Decorative Piece',
      'Sloth Incense Holder with Natural Design and Colorful Details Green Brown Kids Room Piece',
    ],
    descricao: `The Fun Sloth Incense Holder for Home Decoration is the perfect piece to bring a playful, cheerful touch to any room — ideal for kids' bedrooms and leisure areas. This incense holder combines function with a charming design, creating moments of relaxation and well-being.

Benefits:
- The decorative piece creates a cozy, fun atmosphere, great for children.
- Its playful shape brings joy not only to kids but also to the adults who share those spaces.
- Leaf-inspired stylized design — a charming addition to interior decor.
- Available in green and brown, matching a nature-inspired aesthetic perfectly.
- A static piece with no moving parts, focused on visual beauty and room decoration.

Specifications:
- Size: 23x23x23 cm
- Color: Green and Brown
- Weight: 300 g
- Material: PLA, plant-based and renewable, with a great finish.

Care:
Avoid sun and intense heat, do not leave inside a car.

FAQ:
Q: Can it be customized?
A: Yes, not specified.

Q: Do the parts move/fit together?
A: Not specified.

Add a fun touch to your decor!`,
  },
};

function pedirAjuste(secao: string) {
  alert(`Em breve: peça ajustes no(a) "${secao}" direto por chat com a IA.`);
}

interface Props {
  marketplace: string;
  onVoltar: () => void;
  onContinuar: () => void;
}

export default function TextosStep({ marketplace, onVoltar, onContinuar }: Props) {
  const { t } = useI18n();
  const [idioma, setIdioma] = useState<'pt' | 'en'>('pt');
  const [copiado, setCopiado] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(() => [...ETSY_MOCK.pt.tags]);
  const [everbeeBusca, setEverbeeBusca] = useState('sloth decor');

  // Tags acompanham o idioma do anúncio, igual título/descrição — troca de
  // idioma reseta pra lista gerada daquele idioma (perde edições manuais,
  // mesmo comportamento de "Re-gerar" pro resto do texto).
  useEffect(() => {
    setTags([...ETSY_MOCK[idioma].tags]);
  }, [idioma]);

  const textos = MOCK[idioma];
  const etsyAttrs = ETSY_MOCK[idioma];
  const isEtsy = marketplace === 'etsy';

  function adicionarTagEverbee(keyword: string) {
    if (tags.includes(keyword) || tags.length >= ETSY_TAGS_LIMITE) return;
    setTags((prev) => [...prev, keyword]);
  }

  function removerTag(tag: string) {
    setTags((prev) => prev.filter((tg) => tg !== tag));
  }

  function copiar(chave: string, texto: string) {
    navigator.clipboard?.writeText(texto);
    setCopiado(chave);
    setTimeout(() => setCopiado((atual) => (atual === chave ? null : atual)), 1500);
  }

  function botaoCopiar(chave: string, texto: string) {
    return (
      <button type="button" className={'ger-txt-copy' + (copiado === chave ? ' copiado' : '')} onClick={() => copiar(chave, texto)} title={t('gerador.copiar')}>
        <Icon name={copiado === chave ? 'check' : 'copy'} size={15} />
      </button>
    );
  }

  return (
    <>
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> {t('gerador.cancelarEVoltar')}</button>

      <div className="ger-titulo-bloco">
        <h2>{t('gerador.reviseAprovarTextos')}</h2>
      </div>

      <div className="ger-txt-idioma-tabs">
        <button type="button" className={idioma === 'pt' ? 'active' : ''} onClick={() => setIdioma('pt')}>{t('gerador.portugues')}</button>
        <button type="button" className={idioma === 'en' ? 'active' : ''} onClick={() => setIdioma('en')}>{t('gerador.ingles')}</button>
      </div>

      <div className="ger-txt-card">
        <div className="ger-txt-card-head">
          <div>
            <div className="ger-txt-label">{t('gerador.titulo')}</div>
            <div className="ger-txt-titulo">{textos.titulo}</div>
          </div>
          {botaoCopiar('titulo', textos.titulo)}
        </div>
      </div>

      <div className="ger-txt-card ger-txt-com-chat">
        <div className="ger-txt-label" style={{ marginBottom: 12 }}>{t('gerador.variacoesTitulo')}</div>
        <div className="ger-txt-variacoes">
          {textos.variacoes.map((v, idx) => (
            <div className="ger-txt-variacao" key={idx}>
              <span>{v}</span>
              {botaoCopiar('variacao-' + idx, v)}
            </div>
          ))}
        </div>
        <button type="button" className="ger-txt-chat" onClick={() => pedirAjuste('Variações de Título')} title="Pedir ajuste via chat">
          <Icon name="message" size={16} />
        </button>
      </div>

      <div className="ger-txt-card ger-txt-com-chat">
        <div className="ger-txt-card-head">
          <div className="ger-txt-label">{t('gerador.descricaoParaMarketplace')}</div>
          {botaoCopiar('descricao', textos.descricao)}
        </div>
        <div className="ger-txt-desc">{textos.descricao}</div>
        <button type="button" className="ger-txt-chat" onClick={() => pedirAjuste('Descrição para marketplace')} title="Pedir ajuste via chat">
          <Icon name="message" size={16} />
        </button>
      </div>

      {isEtsy && (
        <>
          <div className="ger-txt-card">
            <div className="ger-txt-card-head">
              <div className="ger-txt-label">{t('gerador.etsyTags')}</div>
              <span className="ger-txt-tags-contagem">{tags.length}/{ETSY_TAGS_LIMITE}</span>
            </div>
            <div className="ger-txt-tags-lista">
              {tags.map((tag) => (
                <div className="ger-txt-tag" key={tag}>
                  <span>{tag}</span>
                  {botaoCopiar('tag-' + tag, tag)}
                  <button type="button" onClick={() => removerTag(tag)} title={t('gerador.removerTag')}>
                    <Icon name="close" size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="ger-txt-card">
            <div className="ger-txt-label" style={{ marginBottom: 4 }}>{t('gerador.etsyAtributos')}</div>
            <div className="hint" style={{ marginBottom: 12 }}>{t('gerador.etsyAtributosDesc')}</div>
            <div className="ger-txt-attr-lista">
              {[
                { chave: 'material', label: t('gerador.material'), valor: etsyAttrs.material },
                { chave: 'cor', label: t('gerador.corConfirmada'), valor: etsyAttrs.cor },
                { chave: 'largura', label: t('gerador.larguraX'), valor: etsyAttrs.largura },
                { chave: 'profundidade', label: t('gerador.alturaY'), valor: etsyAttrs.profundidade },
                { chave: 'altura', label: t('gerador.comprimentoZ'), valor: etsyAttrs.altura },
              ].map((attr) => (
                <div className="ger-txt-attr-row" key={attr.chave}>
                  <span className="ger-txt-attr-label">{attr.label}</span>
                  <span className="ger-txt-attr-valor">{attr.valor}</span>
                  {botaoCopiar('attr-' + attr.chave, attr.valor)}
                </div>
              ))}
            </div>
          </div>

          <div className="ger-txt-card">
            <div className="ger-txt-label" style={{ marginBottom: 4 }}>{t('gerador.everbeeTitulo')}</div>
            <div className="hint" style={{ marginBottom: 14 }}>{t('gerador.everbeeDesc')}</div>
            <div className="cl-search ger-txt-everbee-busca">
              <Icon name="search" size={15} />
              <input type="text" placeholder={t('gerador.everbeeBuscarPlaceholder')} value={everbeeBusca} onChange={(e) => setEverbeeBusca(e.target.value)} />
            </div>
            <div className="ger-txt-everbee-lista">
              {EVERBEE_MOCK.filter((k) => k.keyword.toLowerCase().includes(everbeeBusca.trim().toLowerCase())).map((k) => {
                const jaAdicionada = tags.includes(k.keyword);
                return (
                  <div className="ger-txt-everbee-row" key={k.keyword}>
                    <div className="ger-txt-everbee-info">
                      <span className="ger-txt-everbee-keyword">{k.keyword}</span>
                      <span className="ger-txt-everbee-metricas">
                        {t('gerador.everbeeVolume')} {k.vol.toLocaleString('pt-BR')} · {t('gerador.everbeeConcorrencia')} {k.competition.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={'ger-txt-everbee-add' + (jaAdicionada ? ' adicionada' : '')}
                      disabled={jaAdicionada || tags.length >= ETSY_TAGS_LIMITE}
                      onClick={() => adicionarTagEverbee(k.keyword)}
                    >
                      <Icon name={jaAdicionada ? 'check' : 'plus'} size={13} /> {jaAdicionada ? t('gerador.everbeeAdicionada') : t('gerador.everbeeAdicionar')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="ger-txt-footer">
        <div>
          <p>{t('gerador.satisfeitoTextosGerados')}</p>
          <span className="hint">Aprovar para continuar para o próximo passo, ou re-gerar.</span>
        </div>
        <div className="ger-txt-footer-actions">
          <button type="button" className="btn-outline" onClick={() => pedirAjuste('todos os textos (re-gerar)')}>
            <Icon name="sync" size={13} /> {t('gerador.regerar')} · 1 {t('gerador.credito')}
          </button>
          <button type="button" className="btn-calc ger-txt-aprovar" onClick={onContinuar}>
            <Icon name="thumbUp" size={14} /> {t('gerador.aprovarEContinuar')}
          </button>
        </div>
      </div>
    </>
  );
}
