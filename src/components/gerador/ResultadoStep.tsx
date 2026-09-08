import { useState } from 'react';
import Icon from '../Icon';
import PublicarAnuncioModal from './PublicarAnuncioModal';

// Réplica do passo final "Resultado" do Gerador de anúncios em produção
// (print de João, 08/09/2026) — resumo de tudo que foi gerado (textos,
// imagens e vídeo), com seções recolhíveis e um "Re-gerar" por seção
// (cada um com seu próprio custo em créditos, igual às telas anteriores).
// Mesmo produto mockado dos passos Textos/Imagens/Video (Incensário
// Bicho-Preguiça), pra manter o resumo coerente com o resto do wizard.
const TITULO = 'Incensário Bicho-Preguiça Divertido para Decoração do Ambiente';

const VARIACOES = [
  'Decoração Lúdica com Incensário Bicho-Preguiça para Crianças',
  'Incensário Bicho-Preguiça para Quarto Infantil e Área de Lazer',
  'Incensário Bicho-Preguiça com Design Natural e Detalhes Coloridos',
];

const DESCRICAO = `O Incensário Bicho-Preguiça Divertido para Decoração do Ambiente é a peça perfeita para trazer um toque lúdico e alegre aos ambientes, sendo ideal para quartos infantis e áreas de lazer.

Benefícios:
- Ambiente acolhedor e divertido, ideal para crianças.
- Design estilizado que imita folhas — combina com a estética da natureza.
- Peça estática, sem partes móveis, focada na beleza visual.

Especificações:
- Medidas: 23x23x23 cm
- Cor: Verde e Marrom
- Peso: 300 g
- Material: PLA, plástico de origem vegetal e fonte renovável.

Cuidados:
Evite sol e calor intenso, não deixe dentro do carro.`;

const IMAGENS_COMPACTO = [
  'linear-gradient(160deg,#f5f5f4,#e6e6e3)',
  'linear-gradient(160deg,#eef2ee,#d8e3d8)',
  'linear-gradient(160deg,#f6efe1,#ecdfc0)',
  'linear-gradient(160deg,#efe6d8,#d9c7a3)',
  'linear-gradient(160deg,#e9eee6,#cddac6)',
  'linear-gradient(160deg,#2b2f27,#14171b)',
];
const IMAGENS_EXTRAS = [
  'linear-gradient(160deg,#efe0cd,#d6b98c)',
  'linear-gradient(160deg,#e8e3da,#c9beac)',
  'linear-gradient(160deg,#f4f1ea,#e3ddca)',
];

function dataFormatada() {
  return new Date().toLocaleDateString('pt-BR');
}

function baixarTudo() {
  alert('Em breve: baixar textos, imagens e vídeo do anúncio num pacote único.');
}
function regerarSecao(secao: string, creditos: number) {
  alert(`Em breve: re-gerar "${secao}" consome ${creditos} crédito${creditos > 1 ? 's' : ''}.`);
}
function baixarImagens() {
  alert('Em breve: baixar todas as imagens geradas.');
}
function baixarVideo() {
  alert('Em breve: baixar o vídeo narrado gerado.');
}

interface SecaoHeadProps {
  titulo: string;
  aberta: boolean;
  creditos: number;
  onToggle: () => void;
}

function SecaoHead({ titulo, aberta, creditos, onToggle }: SecaoHeadProps) {
  return (
    <div className={'ger-res-secao-head' + (aberta ? '' : ' fechada')} onClick={onToggle}>
      <h3>{titulo} <Icon name="chevron" size={13} /></h3>
      <button type="button" className="ger-res-regerar" onClick={(e) => { e.stopPropagation(); regerarSecao(titulo, creditos); }}>
        <Icon name="sync" size={12} /> Re-gerar · <Icon name="creditos" size={12} /> {creditos}
      </button>
    </div>
  );
}

interface Props {
  onVoltar: () => void;
}

export default function ResultadoStep({ onVoltar }: Props) {
  const [textosAberto, setTextosAberto] = useState(true);
  const [imagensAberto, setImagensAberto] = useState(true);
  const [videoAberto, setVideoAberto] = useState(true);
  const [imagensExpandidas, setImagensExpandidas] = useState(true);
  const [publicarAberto, setPublicarAberto] = useState(false);

  return (
    <>
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> Cancelar e voltar</button>

      <div className="ger-res-head">
        <div>
          <h2>Resumo do Anúncio</h2>
          <div className="sub">{TITULO.split(' ').slice(0, 6).join(' ')}…</div>
          <div className="ger-res-meta">
            <span><Icon name="creditos" size={13} /> 10 créditos usados</span>
            <span><Icon name="clock" size={13} /> Gerado em {dataFormatada()}</span>
          </div>
        </div>
        <div className="ger-res-acoes">
          <button type="button" className="btn-outline" onClick={baixarTudo}><Icon name="upload" size={13} style={{ transform: 'rotate(180deg)' }} /> Baixar tudo</button>
          <button type="button" className="btn-dark" onClick={() => setPublicarAberto(true)}>Publicar anúncio</button>
        </div>
      </div>

      {publicarAberto && <PublicarAnuncioModal onFechar={() => setPublicarAberto(false)} />}

      <div className="ger-res-secao">
        <SecaoHead titulo="Textos" aberta={textosAberto} creditos={1} onToggle={() => setTextosAberto((v) => !v)} />
        {textosAberto && (
          <>
            <div className="ger-txt-card">
              <div className="ger-txt-card-head">
                <div>
                  <div className="ger-txt-label">Título</div>
                  <div className="ger-txt-titulo">{TITULO}</div>
                </div>
              </div>
            </div>

            <div className="ger-txt-card">
              <div className="ger-txt-label" style={{ marginBottom: 12 }}>Variações de Título</div>
              <div className="ger-txt-variacoes">
                {VARIACOES.map((v, idx) => <div className="ger-txt-variacao" key={idx}><span>{v}</span></div>)}
              </div>
            </div>

            <div className="ger-txt-card ger-txt-com-chat">
              <div className="ger-txt-label">Descrição</div>
              <div className="ger-txt-desc">{DESCRICAO}</div>
              <button type="button" className="ger-txt-chat" onClick={() => regerarSecao('Descrição', 1)} title="Pedir ajuste via chat">
                <Icon name="message" size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="ger-res-secao">
        <SecaoHead titulo="Imagens do Produto" aberta={imagensAberto} creditos={2} onToggle={() => setImagensAberto((v) => !v)} />
        {imagensAberto && (
          <>
            <div className="ger-res-img-grid">
              {IMAGENS_COMPACTO.map((g, idx) => <div className="ger-res-img" key={idx} style={{ background: g }} />)}
              {imagensExpandidas && IMAGENS_EXTRAS.map((g, idx) => <div className="ger-res-img" key={'extra' + idx} style={{ background: g }} />)}
            </div>
            <div className="ger-res-img-rodape">
              <button type="button" onClick={baixarImagens}><Icon name="upload" size={13} style={{ transform: 'rotate(180deg)' }} /> Baixar todas as imagens</button>
              <button type="button" onClick={() => setImagensExpandidas((v) => !v)}>{imagensExpandidas ? 'Mostrar menos imagens' : 'Mostrar mais imagens'}</button>
            </div>
          </>
        )}
      </div>

      <div className="ger-res-secao">
        <SecaoHead titulo="Vídeos narrados" aberta={videoAberto} creditos={2} onToggle={() => setVideoAberto((v) => !v)} />
        {videoAberto && (
          <div>
            <div className="ger-res-video">
              <div className="ger-res-video-bar">
                <Icon name="chevron" size={11} style={{ transform: 'rotate(180deg)' }} /> 0:00 <span className="trilha" />
              </div>
            </div>
            <button type="button" className="ger-video-baixar" onClick={baixarVideo}>
              <Icon name="upload" size={13} style={{ transform: 'rotate(180deg)' }} /> Baixar vídeo
            </button>
          </div>
        )}
      </div>
    </>
  );
}
