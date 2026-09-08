import { useState } from 'react';
import GeradorStepper from '../components/gerador/GeradorStepper';
import UploadStep from '../components/gerador/UploadStep';
import MarketplaceStep from '../components/gerador/MarketplaceStep';
import InformacoesStep from '../components/gerador/InformacoesStep';
import TextosStep from '../components/gerador/TextosStep';
import ImagensStep from '../components/gerador/ImagensStep';
import VideoStep from '../components/gerador/VideoStep';
import ResultadoStep from '../components/gerador/ResultadoStep';

// Réplica do Gerador de anúncios em produção (prints de João) — construído
// tela por tela. Tudo mockado: sem upload real de arquivo, o clique na
// dropzone simula uma imagem enviada (cor de placeholder), marketplace e
// plano já vêm pré-selecionados, campos de Informações vêm com sugestões
// mockadas da IA, e os passos ainda não recebidos ficam com um aviso de
// "em construção" dentro do mesmo wizard.
type PassoId = 'upload' | 'marketplace' | 'info' | 'textos' | 'imagens' | 'video' | 'resultado';

const PASSOS = [
  { id: 'upload', numero: 1, label: 'Upload' },
  { id: 'marketplace', numero: 2, label: 'Marketplace e plano' },
  { id: 'info', numero: 3, label: 'Informações' },
  { id: 'textos', numero: 4, label: 'Textos' },
  { id: 'imagens', numero: 5, label: 'Imagens' },
  { id: 'video', numero: 6, label: 'Video' },
  { id: 'resultado', numero: 7, label: 'Resultado' },
] as const satisfies readonly { id: PassoId; numero: number; label: string }[];

const CORES_MOCK = ['#0d6efd', '#00955a', '#c58a00', '#8a3bd4', '#d4633b'];

interface Props {
  onIrParaConfiguracoes: () => void;
}

export default function CriarAnuncioView({ onIrParaConfiguracoes }: Props) {
  const [passoAtual, setPassoAtual] = useState<PassoId>('upload');
  const [visitados, setVisitados] = useState<Set<PassoId>>(new Set());
  const [imagens, setImagens] = useState<string[]>([]);
  const [marketplace, setMarketplace] = useState('ml');
  const [plano, setPlano] = useState('premium');

  function adicionarImagem() {
    setImagens((prev) => (prev.length >= 5 ? prev : [...prev, CORES_MOCK[prev.length % CORES_MOCK.length]]));
  }
  function removerImagem(idx: number) {
    setImagens((prev) => prev.filter((_, i) => i !== idx));
  }
  function irPara(id: string) {
    if (visitados.has(id as PassoId) || id === passoAtual) setPassoAtual(id as PassoId);
  }
  function marcarVisitadoEIr(atual: PassoId, proximo: PassoId) {
    setVisitados((prev) => new Set(prev).add(atual));
    setPassoAtual(proximo);
  }

  const idxAtual = PASSOS.findIndex((p) => p.id === passoAtual);
  const passoAnterior = idxAtual > 0 ? PASSOS[idxAtual - 1].id : null;
  const passoInfo = PASSOS[idxAtual];
  const voltar = () => passoAnterior && setPassoAtual(passoAnterior);

  return (
    <div>
      <GeradorStepper passos={PASSOS} atual={passoAtual} visitados={visitados} onIrPara={irPara} />

      {passoAtual === 'info' ? (
        <InformacoesStep onVoltar={voltar} onContinuar={() => marcarVisitadoEIr('info', 'textos')} />
      ) : passoAtual === 'textos' ? (
        <TextosStep onVoltar={voltar} onContinuar={() => marcarVisitadoEIr('textos', 'imagens')} />
      ) : passoAtual === 'imagens' ? (
        <ImagensStep onVoltar={voltar} onContinuar={() => marcarVisitadoEIr('imagens', 'video')} />
      ) : passoAtual === 'video' ? (
        <VideoStep onVoltar={voltar} onContinuar={() => marcarVisitadoEIr('video', 'resultado')} />
      ) : passoAtual === 'resultado' ? (
        <ResultadoStep onVoltar={voltar} onIrParaConfiguracoes={onIrParaConfiguracoes} />
      ) : (
        <div className="card ger-card">
          <div className="card-body">
            {passoAtual === 'upload' && (
              <UploadStep
                imagens={imagens}
                onAdicionar={adicionarImagem}
                onRemover={removerImagem}
                onContinuar={() => marcarVisitadoEIr('upload', 'marketplace')}
              />
            )}
            {passoAtual === 'marketplace' && (
              <MarketplaceStep
                marketplace={marketplace}
                plano={plano}
                onSelecionarMarketplace={setMarketplace}
                onSelecionarPlano={setPlano}
                onVoltar={voltar}
                onContinuar={() => marcarVisitadoEIr('marketplace', 'info')}
              />
            )}
            {passoAtual !== 'upload' && passoAtual !== 'marketplace' && (
              <div className="ger-em-construcao">
                <p>A etapa "{passoInfo.label}" ainda está sendo construída — manda o print dela que eu sigo daqui.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
