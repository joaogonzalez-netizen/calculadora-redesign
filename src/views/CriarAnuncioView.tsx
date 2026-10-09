import { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { GERADOR_MARKETPLACES_VISIVEIS } from '../lib/versoes';
import Icon from '../components/Icon';
import { getRascunhoShopee, infoDoRascunho, modoDoRascunho, setModoRascunho } from '../lib/rascunhosShopee';
import PublicarAnuncioModal from '../components/gerador/PublicarAnuncioModal';
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

const CORES_MOCK = ['#0d6efd', '#00955a', '#c58a00', '#8a3bd4', '#d4633b'];

interface Props {
  onIrParaConfiguracoes: () => void;
  // Rascunho copiado da Shopee pela extensão: pré-preenche imagens e informações.
  rascunhoId?: string | null;
  onSalvarRascunho?: () => void;
}

export default function CriarAnuncioView({ onIrParaConfiguracoes, rascunhoId, onSalvarRascunho }: Props) {
  const { t, idioma } = useI18n();
  const [passoAtual, setPassoAtual] = useState<PassoId>('upload');
  const [visitados, setVisitados] = useState<Set<PassoId>>(new Set());
  const [rascunho] = useState(() => getRascunhoShopee(rascunhoId));
  const [modo, setModo] = useState(() => modoDoRascunho(rascunho));
  const [publicarAberto, setPublicarAberto] = useState(false);

  // Dois fluxos: o COMPLETO (geração com IA, 7 etapas) e o de APENAS CÓPIA
  // (anúncio copiado da Shopee: só revisa imagens e informações e publica —
  // sem IA, sem créditos). Quem copiou "só pra copiar" pode virar pro fluxo
  // completo a qualquer momento pelo CTA "Gerar anúncio com IA".
  const soCopia = !!rascunho && modo === 'copia';
  const PASSOS_COMPLETO = [
    { id: 'upload', numero: 1, label: t('gerador.stepUpload') },
    { id: 'marketplace', numero: 2, label: t('gerador.stepMarketplace') },
    { id: 'info', numero: 3, label: t('gerador.stepInformacoes') },
    { id: 'textos', numero: 4, label: t('gerador.stepTextos') },
    { id: 'imagens', numero: 5, label: t('gerador.stepImagens') },
    { id: 'video', numero: 6, label: t('gerador.stepVideo') },
    { id: 'resultado', numero: 7, label: t('gerador.stepResultado') },
  ] as const satisfies readonly { id: PassoId; numero: number; label: string }[];
  const PASSOS_COPIA = [
    { id: 'upload', numero: 1, label: t('gerador.stepImagens') },
    { id: 'info', numero: 2, label: t('gerador.stepInformacoes') },
  ] as const satisfies readonly { id: PassoId; numero: number; label: string }[];
  const PASSOS: readonly { id: PassoId; numero: number; label: string }[] = soCopia ? PASSOS_COPIA : PASSOS_COMPLETO;

  function gerarComIa() {
    if (!confirm(t('gerador.liberarIaConfirm'))) return;
    if (rascunho) setModoRascunho(rascunho.id, 'ia');
    setModo('ia');
  }
  const [imagens, setImagens] = useState<string[]>(() => rascunho?.imagens.slice(0, 5) ?? []);
  const [marketplace, setMarketplace] = useState(() => GERADOR_MARKETPLACES_VISIVEIS[idioma][0]);
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
  function pularParaResumo() {
    setVisitados(new Set(PASSOS.map((p) => p.id)));
    setPassoAtual('resultado');
  }

  const idxAtual = PASSOS.findIndex((p) => p.id === passoAtual);
  const passoAnterior = idxAtual > 0 ? PASSOS[idxAtual - 1].id : null;
  const passoInfo = PASSOS[idxAtual];
  const voltar = () => passoAnterior && setPassoAtual(passoAnterior);

  // Aviso do fluxo de apenas cópia: fica logo ACIMA do botão "Continuar" de cada etapa.
  const avisoCopia = soCopia ? (
    <div className="ger-rascunho-banner so-copia">
      <Icon name="download" size={16} />
      <div>
        <b>{t('gerador.soCopiaTitulo')}</b>
        <span>{t('gerador.soCopiaDesc')}</span>
      </div>
      <button type="button" className="btn-dark pill ger-liberar-ia" onClick={gerarComIa}><Icon name="gerador" size={14} /> {t('gerador.gerarComIa')}</button>
    </div>
  ) : undefined;

  return (
    <div>
      {rascunho && !soCopia && (
        <div className="ger-rascunho-banner">
          <Icon name="download" size={16} />
          <div>
            <b>{t('gerador.rascunhoShopeeTitulo')}</b>
            <span>{t('gerador.rascunhoShopeeDesc')}</span>
          </div>
        </div>
      )}
      <div className="ger-stepper-row">
        <GeradorStepper passos={PASSOS} atual={passoAtual} visitados={visitados} onIrPara={irPara} />
        {passoAtual !== 'resultado' && !soCopia && (
          <button type="button" className="ger-pular-resumo" onClick={pularParaResumo}>
            {t('gerador.pularParaResumo')} <Icon name="chevron" size={12} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
      </div>

      {passoAtual === 'info' ? (
        <InformacoesStep avisoCopia={avisoCopia} inicial={rascunho ? infoDoRascunho(rascunho) : undefined} modoCopia={soCopia ? { onPublicar: () => setPublicarAberto(true), onSalvarRascunho: () => onSalvarRascunho?.() } : undefined} onVoltar={voltar} onContinuar={() => marcarVisitadoEIr('info', 'textos')} />
      ) : passoAtual === 'textos' ? (
        <TextosStep marketplace={marketplace} onVoltar={voltar} onContinuar={() => marcarVisitadoEIr('textos', 'imagens')} />
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
                modoCopia={soCopia}
                avisoCopia={avisoCopia}
                onContinuar={() => marcarVisitadoEIr('upload', soCopia ? 'info' : 'marketplace')}
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
      {publicarAberto && (
        <PublicarAnuncioModal onFechar={() => setPublicarAberto(false)} onIrParaConfiguracoes={() => { setPublicarAberto(false); onIrParaConfiguracoes(); }} />
      )}
    </div>
  );
}
