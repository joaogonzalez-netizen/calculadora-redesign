import { useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';
import EtsyTagsSelector, { ETSY_TAGS_INICIAIS, ETSY_TAGS_LIMITE, type EtsyTag } from './EtsyTagsSelector';

// Réplica do passo "Textos" do Gerador de anúncios em produção (print de
// João, 08/09/2026), revisão dos textos que a IA gerou a partir das
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
// medidas) que alimentam os filtros de busca do comprador, mockado no
// mesmo padrão do resto do passo, por idioma do anúncio.
interface EtsyMock {
  material: string;
  cor: string;
  largura: string;
  profundidade: string;
  altura: string;
}

// Etsy só tem versão em inglês: é o idioma em que o comprador busca, então a
// etapa não tem abas de idioma (print de produção, 20/10/2026).
const ETSY_MOCK: EtsyMock = {
  material: 'PLA',
  cor: 'Bone Beige',
  largura: '4 cm · 1.6 in',
  profundidade: '4 cm · 1.6 in',
  altura: '4 cm · 1.6 in',
};

const ETSY_TEXTOS: TextosMock = {
  titulo: 'Articulated T-Rex Fidget Toy, Dinosaur Stress Relief Accessory, PLA Bone Beige Material, Detailed Desk Display Decor, Gift for Dino Fans',
  variacoes: [
    'T-Rex Fidget Toy Model, Dinosaur Lovers 3D Printed, PLA Light Beige Finish, Articulated Stress Relief Piece, Gift for Dino Fans',
    'Articulated Dinosaur Fidget Toy, Desk Decor 3D Printed, PLA Detailed Skeleton Design, Office Use, Gift for Dino Fans',
    'Articulated T-Rex Desk Decor, Dinosaur Fidget Toy Model, PLA Bone Beige Sculpture, Stress Relief Articulated Design',
  ],
  descricao: `Articulated T-Rex Fidget Toy is an intricately designed piece, perfect for stress relief.

This Articulated T-Rex Fidget Toy showcases a highly detailed skeleton design, serving both as a playful fidget accessory and an eye-catching desk decoration.

Details:
- Material: PLA, plant-based and renewable, with a great finish.
- Color: Bone Beige
- Size: 4x4x4 cm

Care:
Avoid sun and intense heat, do not leave inside a car.

Add a fun touch to your desk!`,
};

// Títulos que o EverBee devolve a partir de uma palavra-chave (mock): ainda
// não chama a API, só troca o prefixo pela palavra digitada.
const ETSY_TITULOS_EVERBEE = [
  'Dinosaur Fidget Toy, Articulated T-Rex 3D Printed, Desk Decor Stress Relief, Gift for Dino Fans',
  'Articulated Dinosaur Desk Toy, PLA Bone Beige Figurine, Office Stress Relief, Collectible Gift',
  '3D Printed T-Rex Fidget, Dinosaur Desk Decor, Anxiety Relief Toy, Gift for Gamers and Kids',
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
    descricao: `The Fun Sloth Incense Holder for Home Decoration is the perfect piece to bring a playful, cheerful touch to any room, ideal for kids' bedrooms and leisure areas. This incense holder combines function with a charming design, creating moments of relaxation and well-being.

Benefits:
- The decorative piece creates a cozy, fun atmosphere, great for children.
- Its playful shape brings joy not only to kids but also to the adults who share those spaces.
- Leaf-inspired stylized design, a charming addition to interior decor.
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
  const [etsyTags, setEtsyTags] = useState<EtsyTag[]>(ETSY_TAGS_INICIAIS);
  const [palavraEverbee, setPalavraEverbee] = useState('dinosaur fidget');
  const [titulosEverbee, setTitulosEverbee] = useState<string[]>([]);
  const [tituloEtsy, setTituloEtsy] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const isEtsy = marketplace === 'etsy';
  const textos = isEtsy ? { ...ETSY_TEXTOS, titulo: tituloEtsy ?? ETSY_TEXTOS.titulo } : MOCK[idioma];
  const etsyAttrs = ETSY_MOCK;
  const tagsFechadas = !isEtsy || etsyTags.length === ETSY_TAGS_LIMITE;

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

      {!isEtsy && (
        <div className="ger-txt-idioma-tabs">
          <button type="button" className={idioma === 'pt' ? 'active' : ''} onClick={() => setIdioma('pt')}>{t('gerador.portugues')}</button>
          <button type="button" className={idioma === 'en' ? 'active' : ''} onClick={() => setIdioma('en')}>{t('gerador.ingles')}</button>
        </div>
      )}

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

      {isEtsy && (
        <div className="ger-txt-card">
          <div className="ger-txt-label"><span className="ger-eb-badge">EverBee</span></div>
          <div className="hint" style={{ margin: '8px 0 12px' }}>{t('gerador.etsyTituloEverbeeDesc')}</div>
          <form className="ger-tag-busca" style={{ margin: 0 }} onSubmit={(e) => { e.preventDefault(); if (palavraEverbee.trim()) setTitulosEverbee(ETSY_TITULOS_EVERBEE); }}>
            <input value={palavraEverbee} onChange={(e) => setPalavraEverbee(e.target.value)} placeholder={t('gerador.etsyTagsBuscaPlaceholder')} aria-label={t('gerador.etsyTituloPalavra')} />
            <button type="submit" className="btn-dark pill ger-btn" disabled={!palavraEverbee.trim()}>{t('gerador.etsyTituloGerar')}</button>
          </form>
          {titulosEverbee.length > 0 && (
            <div className="ger-txt-variacoes" style={{ marginTop: 14 }}>
              {titulosEverbee.map((v, idx) => (
                <div className="ger-txt-variacao" key={idx}>
                  <span>{v}</span>
                  <button type="button" className="btn-outline pill ger-btn" onClick={() => setTituloEtsy(v)} disabled={tituloEtsy === v}>
                    {tituloEtsy === v ? t('gerador.etsyTituloEmUso') : t('gerador.etsyTituloUsar')}
                  </button>
                  {botaoCopiar('eb-titulo-' + idx, v)}
                </div>
              ))}
            </div>
          )}
          <div className="hint" style={{ marginTop: 10 }}>{t('gerador.etsyTituloAviso')}</div>
        </div>
      )}

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
          <EtsyTagsSelector tags={etsyTags} onChange={setEtsyTags} />

          <div className="ger-txt-card">
            <div className="ger-txt-label" style={{ marginBottom: 4 }}>{t('gerador.etsyAtributos')}</div>
            <div className="hint" style={{ marginBottom: 12 }}>{t('gerador.etsyAtributosDesc')}</div>
            <div className="ger-txt-attr-lista">
              {[
                { chave: 'material', label: t('gerador.material'), valor: etsyAttrs.material },
                { chave: 'cor', label: t('gerador.corConfirmada'), valor: etsyAttrs.cor },
                { chave: 'largura', label: t('gerador.etsyLarguraX'), valor: etsyAttrs.largura },
                { chave: 'profundidade', label: t('gerador.etsyProfundidadeY'), valor: etsyAttrs.profundidade },
                { chave: 'altura', label: t('gerador.etsyAlturaZ'), valor: etsyAttrs.altura },
              ].map((attr) => (
                <div className="ger-txt-attr-row" key={attr.chave}>
                  <span className="ger-txt-attr-label">{attr.label}</span>
                  <span className="ger-txt-attr-valor">{attr.valor}</span>
                  {botaoCopiar('attr-' + attr.chave, attr.valor)}
                </div>
              ))}
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
          <button type="button" className="btn-outline pill ger-btn" onClick={() => pedirAjuste('todos os textos (re-gerar)')}>
            <Icon name="sync" size={13} /> {t('gerador.regerar')} · 1 {t('gerador.credito')}
          </button>
          <button type="button" className="btn-dark pill ger-btn" onClick={onContinuar} disabled={!tagsFechadas} title={tagsFechadas ? undefined : t('gerador.etsyTagsFalta')}>
            <Icon name="thumbUp" size={14} /> {t('gerador.aprovarEContinuar')}
          </button>
        </div>
      </div>
    </>
  );
}
