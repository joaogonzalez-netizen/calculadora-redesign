import { useState } from 'react';
import Icon from '../Icon';

// Réplica do passo "Vídeo" do Gerador de anúncios em produção (print de
// João, 08/09/2026) — revisão do roteiro de narração antes de gerar o
// vídeo final. Mockado: o roteiro é um texto fixo editável, "Re-gerar
// roteiro" e o formato de narração ainda não chamam IA de verdade.
const ROTEIRO_MOCK = 'Incensário Bicho-Preguiça Divertido é a peça perfeita para quem quer trazer um toque lúdico e aconchegante para o ambiente. Ideal para quartos infantis e áreas de lazer, ele combina design encantador com funcionalidade, criando momentos de relaxamento e bem-estar em qualquer cantinho da casa.';

function regerarRoteiro() {
  alert('Em breve: re-gerar o roteiro da narração consome 2 créditos.');
}

interface Props {
  onVoltar: () => void;
  onContinuar: () => void;
}

export default function VideoStep({ onVoltar, onContinuar }: Props) {
  const [roteiro, setRoteiro] = useState(ROTEIRO_MOCK);

  return (
    <>
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> Cancelar e voltar</button>

      <div className="ger-titulo-bloco">
        <h2>Prepare o vídeo do anúncio</h2>
        <p>Revise o roteiro da narração e escolha o formato antes de gerar o vídeo.</p>
      </div>

      <div className="ger-video-label">Roteiro da narração</div>
      <textarea className="ger-video-textarea" rows={5} value={roteiro} onChange={(e) => setRoteiro(e.target.value)} />

      <div className="ger-video-rodape">
        <span className="ger-video-chip">Narração em Português (BR)</span>

        <div className="ger-video-acoes">
          <button type="button" className="ger-video-regerar" onClick={regerarRoteiro}>
            <Icon name="sync" size={13} /> Re-gerar roteiro · 2 créditos
          </button>
          <button type="button" className="btn-dark pill" onClick={onContinuar}>Gerar e ver resultados</button>
        </div>
      </div>
    </>
  );
}
