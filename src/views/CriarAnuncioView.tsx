import { useState } from 'react';
import GeradorStepper from '../components/gerador/GeradorStepper';
import UploadStep from '../components/gerador/UploadStep';
import MarketplaceStep from '../components/gerador/MarketplaceStep';

// Réplica do Gerador de anúncios em produção (prints de João) — construído
// tela por tela. Tudo mockado: sem upload real de arquivo, o clique na
// dropzone simula uma imagem enviada (cor de placeholder), marketplace e
// plano já vêm pré-selecionados, e os passos ainda não recebidos ficam com
// um aviso de "em construção" dentro do mesmo wizard.
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

export default function CriarAnuncioView() {
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

  return (
    <div>
      <GeradorStepper passos={PASSOS} atual={passoAtual} visitados={visitados} onIrPara={irPara} />

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
              onVoltar={() => passoAnterior && setPassoAtual(passoAnterior)}
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
    </div>
  );
}
