import { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { GERADOR_MARKETPLACES_VISIVEIS } from '../lib/versoes';
import Icon from '../components/Icon';
import { getRascunhoShopee, infoDoRascunho, modoDoRascunho, setModoRascunho, type RascunhoShopee } from '../lib/rascunhosShopee';
import { getAceiteCopia, type AceiteCopia } from '../lib/termoCopia';
import RascunhoCopiaHeader from '../components/gerador/RascunhoCopiaHeader';
import RevisarCopia from '../components/gerador/RevisarCopia';
import PublicarAnuncioModal from '../components/gerador/PublicarAnuncioModal';
import GeradorStepper from '../components/gerador/GeradorStepper';
import UploadStep from '../components/gerador/UploadStep';
import MarketplaceStep from '../components/gerador/MarketplaceStep';
import InformacoesStep from '../components/gerador/InformacoesStep';
import TextosStep from '../components/gerador/TextosStep';
import ImagensStep from '../components/gerador/ImagensStep';
import VideoStep from '../components/gerador/VideoStep';
import ResultadoStep from '../components/gerador/ResultadoStep';
import type { DimensoesProduto } from '../components/gerador/MedidasModal';

// Réplica do Gerador de anúncios em produção (prints de João), construído
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
  // Rascunho em memória (ex.: "Reescrever com o Seller" em Produtos), usado quando não há rascunho salvo.
  rascunhoInicial?: RascunhoShopee | null;
  onSalvarRascunho?: () => void;
  onVoltarMeusAnuncios?: () => void;
}

export default function CriarAnuncioView({ onIrParaConfiguracoes, rascunhoId, rascunhoInicial, onSalvarRascunho, onVoltarMeusAnuncios }: Props) {
  const { t, idioma } = useI18n();
  const [passoAtual, setPassoAtual] = useState<PassoId>('upload');
  const [visitados, setVisitados] = useState<Set<PassoId>>(new Set());
  const [rascunho] = useState(() => getRascunhoShopee(rascunhoId) ?? rascunhoInicial ?? null);
  const [publicarAberto, setPublicarAberto] = useState(false);
  // Anúncio copiado pela extensão: só segue com o aceite do termo registrado no log.
  const doExtensao = !!rascunho && rascunho.origem !== 'produto';
  const [aceite, setAceite] = useState<AceiteCopia | null>(() => getAceiteCopia(rascunho?.aceiteId));
  // Anúncio da extensão: abre na Revisar cópia (o termo só é pedido ao copiar como está). Só vai pro Gerador depois de "Gerar anúncio com IA".
  const [modo, setModo] = useState(() => (doExtensao ? (rascunho?.modo === 'ia' ? 'ia' : 'copia') : modoDoRascunho(rascunho)));
  const revisando = doExtensao && modo !== 'ia';

  const PASSOS_COMPLETO = [
    { id: 'upload', numero: 1, label: t('gerador.stepUpload') },
    { id: 'marketplace', numero: 2, label: t('gerador.stepMarketplace') },
    { id: 'info', numero: 3, label: t('gerador.stepInformacoes') },
    { id: 'textos', numero: 4, label: t('gerador.stepTextos') },
    { id: 'imagens', numero: 5, label: t('gerador.stepImagens') },
    { id: 'video', numero: 6, label: t('gerador.stepVideo') },
    { id: 'resultado', numero: 7, label: t('gerador.stepResultado') },
  ] as const satisfies readonly { id: PassoId; numero: number; label: string }[];
  const PASSOS = PASSOS_COMPLETO;

  function gerarComIa() {
    if (rascunho) setModoRascunho(rascunho.id, 'ia');
    setModo('ia');
  }
  function publicarCopia() {
    if (rascunho) setModoRascunho(rascunho.id, 'copia');
    setPublicarAberto(true);
  }
  const [imagens, setImagens] = useState<string[]>(() => rascunho?.imagens.slice(0, 5) ?? []);
  const [marketplace, setMarketplace] = useState(() => GERADOR_MARKETPLACES_VISIVEIS[idioma][0]);
  const [plano, setPlano] = useState('premium');
  const [dimensoes, setDimensoes] = useState<DimensoesProduto | undefined>();

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

  if (revisando && rascunho) {
    return (
      <>
        <RevisarCopia rascunho={rascunho} aceite={aceite} onAceite={setAceite} onGerarIa={gerarComIa} onPublicar={publicarCopia} onSalvarRascunho={() => onSalvarRascunho?.()} onVoltar={() => onVoltarMeusAnuncios?.()} />
        {publicarAberto && (
          <PublicarAnuncioModal onFechar={() => setPublicarAberto(false)} onIrParaConfiguracoes={() => { setPublicarAberto(false); onIrParaConfiguracoes(); }} />
        )}
      </>
    );
  }

  return (
    <div>
      {doExtensao && rascunho && <RascunhoCopiaHeader rascunho={rascunho} aceite={aceite} />}
      {rascunho && !doExtensao && (
        <div className="ger-rascunho-banner">
          <Icon name="download" size={16} />
          <div>
            <b>{t('gerador.reescreverBannerTitulo')}</b>
            <span>{t('gerador.reescreverBannerDesc')}</span>
          </div>
        </div>
      )}
      <div className="ger-stepper-row">
        <GeradorStepper passos={PASSOS} atual={passoAtual} visitados={visitados} onIrPara={irPara} />
        {passoAtual !== 'resultado' && (
          <button type="button" className="ger-pular-resumo" onClick={pularParaResumo}>
            {t('gerador.pularParaResumo')} <Icon name="chevron" size={12} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
      </div>

      {passoAtual === 'info' ? (
        <InformacoesStep inicial={rascunho ? infoDoRascunho(rascunho) : undefined} onVoltar={voltar} onContinuar={(dims) => { setDimensoes(dims); marcarVisitadoEIr('info', 'textos'); }} />
      ) : passoAtual === 'textos' ? (
        <TextosStep marketplace={marketplace} onVoltar={voltar} onContinuar={() => marcarVisitadoEIr('textos', 'imagens')} />
      ) : passoAtual === 'imagens' ? (
        <ImagensStep dimensoes={dimensoes} onVoltar={voltar} onContinuar={() => marcarVisitadoEIr('imagens', 'video')} />
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
                <p>A etapa "{passoInfo.label}" ainda está sendo construída, manda o print dela que eu sigo daqui.</p>
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
