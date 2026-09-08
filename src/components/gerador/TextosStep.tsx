import { useState } from 'react';
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
  onVoltar: () => void;
  onContinuar: () => void;
}

export default function TextosStep({ onVoltar, onContinuar }: Props) {
  const [idioma, setIdioma] = useState<'pt' | 'en'>('pt');
  const [copiado, setCopiado] = useState<string | null>(null);

  const textos = MOCK[idioma];

  function copiar(chave: string, texto: string) {
    navigator.clipboard?.writeText(texto);
    setCopiado(chave);
    setTimeout(() => setCopiado((atual) => (atual === chave ? null : atual)), 1500);
  }

  function botaoCopiar(chave: string, texto: string) {
    return (
      <button type="button" className={'ger-txt-copy' + (copiado === chave ? ' copiado' : '')} onClick={() => copiar(chave, texto)} title="Copiar">
        <Icon name={copiado === chave ? 'check' : 'copy'} size={15} />
      </button>
    );
  }

  return (
    <>
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> Cancelar e voltar</button>

      <div className="ger-titulo-bloco">
        <h2>Revise e aprove os textos</h2>
      </div>

      <div className="ger-txt-idioma-tabs">
        <button type="button" className={idioma === 'pt' ? 'active' : ''} onClick={() => setIdioma('pt')}>Português</button>
        <button type="button" className={idioma === 'en' ? 'active' : ''} onClick={() => setIdioma('en')}>Inglês</button>
      </div>

      <div className="ger-txt-card">
        <div className="ger-txt-card-head">
          <div>
            <div className="ger-txt-label">Título</div>
            <div className="ger-txt-titulo">{textos.titulo}</div>
          </div>
          {botaoCopiar('titulo', textos.titulo)}
        </div>
      </div>

      <div className="ger-txt-card ger-txt-com-chat">
        <div className="ger-txt-label" style={{ marginBottom: 12 }}>Variações de Título</div>
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
          <div className="ger-txt-label">Descrição para marketplace</div>
          {botaoCopiar('descricao', textos.descricao)}
        </div>
        <div className="ger-txt-desc">{textos.descricao}</div>
        <button type="button" className="ger-txt-chat" onClick={() => pedirAjuste('Descrição para marketplace')} title="Pedir ajuste via chat">
          <Icon name="message" size={16} />
        </button>
      </div>

      <div className="ger-txt-footer">
        <div>
          <p>Você está satisfeito com os textos gerados?</p>
          <span className="hint">Aprovar para continuar para o próximo passo, ou re-gerar.</span>
        </div>
        <div className="ger-txt-footer-actions">
          <button type="button" className="btn-outline" onClick={() => pedirAjuste('todos os textos (re-gerar)')}>
            <Icon name="sync" size={13} /> Re-gerar · 1 crédito
          </button>
          <button type="button" className="btn-calc ger-txt-aprovar" onClick={onContinuar}>
            <Icon name="thumbUp" size={14} /> Aprovar e continuar
          </button>
        </div>
      </div>
    </>
  );
}
