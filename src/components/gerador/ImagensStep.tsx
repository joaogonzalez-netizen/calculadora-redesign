import { useState } from 'react';
import Icon from '../Icon';

// Réplica do passo "Imagens" do Gerador de anúncios em produção (print de
// João, 08/09/2026). 3 imagens fixas (capa, medidas, características) que
// sempre entram no anúncio + 6 imagens individuais geradas, das quais o
// usuário escolhe exatamente 4 pro vídeo. Sem fotos reais — cada card usa
// um gradiente de cor no lugar da imagem gerada pela IA, igual ao resto do
// mock do app.
const MAX_SELECAO = 4;

interface ImagemVideo {
  id: string;
  label: string;
  gradiente: string;
  escuro?: boolean;
}

const IMAGENS_VIDEO: ImagemVideo[] = [
  { id: 'uso1', label: 'Ambientada — Uso 1', gradiente: 'linear-gradient(160deg,#efe6d8,#d9c7a3)' },
  { id: 'uso2', label: 'Ambientada — Uso 2', gradiente: 'linear-gradient(160deg,#e9eee6,#cddac6)' },
  { id: 'uso3', label: 'Ambientada — Uso 3', gradiente: 'linear-gradient(160deg,#f4f1ea,#e3ddca)' },
  { id: 'detalhe', label: 'Detalhe — Acabamento', gradiente: 'linear-gradient(160deg,#2b2f27,#14171b)', escuro: true },
  { id: 'destaque', label: 'Destaque — Benefício', gradiente: 'linear-gradient(160deg,#efe0cd,#d6b98c)' },
  { id: 'hero', label: 'Hero — Cena final', gradiente: 'linear-gradient(160deg,#e8e3da,#c9beac)' },
];

const SELECAO_INICIAL = new Set(['uso1', 'uso2', 'uso3', 'detalhe']);

function editarMedidas() {
  alert('Em breve: ajustar as medidas exibidas na imagem fixa "Medidas".');
}

function pedirAjuste(secao: string) {
  alert(`Em breve: peça ajustes no(a) "${secao}" direto por chat com a IA.`);
}

interface Props {
  onVoltar: () => void;
  onContinuar: () => void;
}

export default function ImagensStep({ onVoltar, onContinuar }: Props) {
  const [selecionadas, setSelecionadas] = useState<Set<string>>(SELECAO_INICIAL);

  function alternar(id: string) {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_SELECAO) {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <>
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> Cancelar e voltar</button>

      <div className="ger-titulo-bloco">
        <h2>Imagens geradas</h2>
        <p>3 imagens fixas (capa, medidas e características) + 6 imagens individuais. Escolha exatamente 4 imagens para o vídeo.</p>
      </div>

      <h3 className="ger-secao-titulo" style={{ marginTop: 0 }}>Imagens fixas</h3>
      <p className="ger-img-secao-desc">Sempre incluídas no anúncio. Não entram na seleção do vídeo.</p>

      <div className="ger-img-aviso">
        <Icon name="lock" size={14} /> Estas 3 imagens não podem ser selecionadas para o vídeo — elas já fazem parte fixa do anúncio.
      </div>

      <div className="ger-img-grid-fixas ger-txt-com-chat">
        <div className="ger-img-card">
          <div className="ger-img-card-media" style={{ background: 'linear-gradient(160deg,#f5f5f4,#e6e6e3)' }}>
            <span className="ger-img-badge-fixa">Fixa</span>
          </div>
          <div className="ger-img-card-label">Capa — Fundo branco</div>
        </div>

        <div className="ger-img-card">
          <div className="ger-img-card-media" style={{ background: 'linear-gradient(160deg,#eef2ee,#d8e3d8)' }}>
            <span className="ger-img-badge-fixa">Fixa</span>
            <div className="ger-img-medidas-hover">
              <button type="button" className="ger-img-medidas-btn" onClick={editarMedidas}>
                <Icon name="tag" size={13} /> Editar medidas
              </button>
            </div>
          </div>
          <div className="ger-img-card-label">Medidas</div>
        </div>

        <div className="ger-img-card">
          <div className="ger-img-card-media" style={{ background: 'linear-gradient(160deg,#f6efe1,#ecdfc0)' }}>
            <span className="ger-img-badge-fixa">Fixa</span>
            <div className="ger-img-carac">
              <div className="ger-img-carac-item"><Icon name="gerador" size={15} /> Design lúdico de bicho-preguiça</div>
              <div className="ger-img-carac-item"><Icon name="home" size={15} /> Ideal para quartos infantis ou áreas de lazer</div>
              <div className="ger-img-carac-item"><Icon name="leaf" size={15} /> Base estilizada imitando folhas</div>
            </div>
          </div>
          <div className="ger-img-card-label">Características</div>
        </div>

        <button type="button" className="ger-txt-chat" onClick={() => pedirAjuste('Imagens fixas')} title="Pedir ajuste via chat">
          <Icon name="message" size={16} />
        </button>
      </div>

      <div className="ger-img-secao-head">
        <div>
          <h3 className="ger-secao-titulo" style={{ margin: '0 0 4px' }}>Imagens para o vídeo</h3>
          <p className="ger-img-secao-desc">Selecione exatamente 4 imagens entre as 6 disponíveis.</p>
        </div>
        <span className="ger-img-contador">{selecionadas.size} de {MAX_SELECAO} selecionadas</span>
      </div>

      <div className="ger-img-grid-video ger-txt-com-chat">
        {IMAGENS_VIDEO.map((img) => {
          const marcada = selecionadas.has(img.id);
          const desabilitada = !marcada && selecionadas.size >= MAX_SELECAO;
          return (
            <div
              key={img.id}
              className={'ger-img-card ger-img-card-video' + (marcada ? ' selecionada' : '') + (desabilitada ? ' desabilitada' : '')}
              onClick={() => alternar(img.id)}
            >
              <div className="ger-img-card-media" style={{ background: img.gradiente }}>
                <span className={'ger-img-check' + (marcada ? ' marcada' : '')}><Icon name="check" size={13} /></span>
                {img.id === 'uso3' && (
                  <div className="ger-img-capa-texto">
                    <h4>Incensário de Bicho-Preguiça</h4>
                    <span>Design Lúdico e Toque Descontraído</span>
                  </div>
                )}
              </div>
              <div className={'ger-img-card-label' + (img.escuro ? '' : '')}>{img.label}</div>
            </div>
          );
        })}

        <button type="button" className="ger-txt-chat" onClick={() => pedirAjuste('Imagens para o vídeo')} title="Pedir ajuste via chat">
          <Icon name="message" size={16} />
        </button>
      </div>

      <div className="ger-txt-footer">
        <div>
          <p>Você está satisfeito com as imagens geradas?</p>
          <span className="hint">Aprovar para continuar para o próximo passo, ou re-gerar.</span>
        </div>
        <div className="ger-txt-footer-actions">
          <button type="button" className="btn-outline" onClick={() => pedirAjuste('todas as imagens (re-gerar)')}>
            <Icon name="sync" size={13} /> Re-gerar · 2 créditos
          </button>
          <button type="button" className="btn-calc ger-txt-aprovar" onClick={onContinuar}>
            <Icon name="thumbUp" size={14} /> Aprovar e continuar
          </button>
        </div>
      </div>
    </>
  );
}
