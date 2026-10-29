import { useEffect, useState } from 'react';
import { USUARIO } from '../lib/dashboardMock';
import { marcarOnboardingManual } from '../lib/onboarding';
import { useI18n } from '../context/I18nContext';
import { MOSTRAR_PASSO_MARKETPLACE } from '../lib/versoes';
import Icon, { type IconName } from '../components/Icon';

type PassoId = 'buscador' | 'calculadora' | 'gerador' | 'marketplace';

interface Passo {
  id: PassoId;
  numero: number;
  tituloChave: string;
  descricaoChave: string;
  icone: IconName;
  ctaChave: string;
}

const PASSOS: Passo[] = [
  { id: 'buscador', numero: 1, tituloChave: 'passos.buscadorTitulo', descricaoChave: 'passos.buscadorDescricao', icone: 'buscador', ctaChave: 'passos.buscadorCta' },
  { id: 'calculadora', numero: 2, tituloChave: 'passos.calculadoraTitulo', descricaoChave: 'passos.calculadoraDescricao', icone: 'calculadora', ctaChave: 'passos.calculadoraCta' },
  { id: 'gerador', numero: 3, tituloChave: 'passos.geradorTitulo', descricaoChave: 'passos.geradorDescricao', icone: 'gerador', ctaChave: 'passos.geradorCta' },
  { id: 'marketplace', numero: 4, tituloChave: 'passos.marketplaceTitulo', descricaoChave: 'passos.marketplaceDescricao', icone: 'integracoes', ctaChave: 'passos.marketplaceCta' },
];

// Vídeo de boas-vindas por idioma. Não há versão em espanhol gravada, então o
// ES usa a versão em inglês com legendas em espanhol ligadas.
const VIDEOS_BOAS_VINDAS = {
  pt: { id: '4_Ury2eZHus', legenda: '' },
  en: { id: 'pJG8oUatrRA', legenda: '' },
  es: { id: 'pJG8oUatrRA', legenda: '&cc_load_policy=1&cc_lang_pref=es&hl=es' },
} as const;

interface Props {
  passosCompletos: Record<PassoId | 'video', boolean>;
  onConcluir: () => void;
  onIrParaGerador: () => void;
  onIrParaCalculadora: () => void;
  onIrParaConfiguracoes: () => void;
  onIrParaBuscador: () => void;
  onAtualizarPassos: () => void;
}

export default function PrimeirosPassosView({ passosCompletos, onConcluir, onIrParaGerador, onIrParaCalculadora, onIrParaConfiguracoes, onIrParaBuscador, onAtualizarPassos }: Props) {
  const { t, idioma } = useI18n();
  const [tocando, setTocando] = useState(false);
  const video = VIDEOS_BOAS_VINDAS[idioma] ?? VIDEOS_BOAS_VINDAS.pt;
  // Marketplace some do escopo em ES (não há Configurações): o card continua
  // visível, sem botão e fora da contagem, como na produção.
  const alcancavel = (p: Passo) => p.id !== 'marketplace' || MOSTRAR_PASSO_MARKETPLACE[idioma];
  const passos = PASSOS;
  const passosContados = passos.filter(alcancavel);
  // Total considerado pra "N de X concluídos" e pra concluir o checklist, inclui o
  // vídeo, que fica sempre disponível pra assistir de novo, diferente dos
  // outros passos que escondem o CTA quando completos.
  const totalPassos = passosContados.length + 1;
  const totalCompletos = passosContados.filter((p) => passosCompletos[p.id]).length + (passosCompletos.video ? 1 : 0);
  const videoAssistido = passosCompletos.video;
  const nome = USUARIO.primeiroNome || t('passos.vendedorPadrao');

  // Reserva o espaço do contador até a tela "carregar", pro número não pular
  // (na produção os passos vêm do servidor).
  const [carregado, setCarregado] = useState(false);
  useEffect(() => setCarregado(true), []);

  // Concluir é gravado uma vez, ao abrir a tela com tudo feito.
  useEffect(() => {
    if (carregado && totalCompletos >= totalPassos) onConcluir();
  }, [carregado, totalCompletos, totalPassos, onConcluir]);

  function acionar(passo: Passo) {
    // Passo "Buscador" só marca "feito" quando o usuário favorita algo de
    // verdade na tela do Buscador, o CTA aqui só navega, como o da Calculadora.
    if (passo.id === 'buscador') { onIrParaBuscador(); return; }
    if (passo.id === 'calculadora') { onIrParaCalculadora(); return; }
    if (passo.id === 'gerador') { onIrParaGerador(); return; }
    if (passo.id === 'marketplace') { onIrParaConfiguracoes(); return; }
  }

  function assistirVideo() {
    setTocando(true);
  }

  function alternarVideoAssistido(assistido: boolean) {
    marcarOnboardingManual('video', assistido);
    onAtualizarPassos();
  }

  return (
    <div>
      <div className="hero">
        <h1>{t('passos.boasVindas')}, <span className="accent">{nome}</span></h1>
        <p>{t('passos.subtitulo')}</p>
      </div>

      <div className="passos-progresso-row">
        <div className="passos-progresso-bar" role="progressbar" aria-valuemin={0} aria-valuemax={totalPassos} aria-valuenow={totalCompletos} aria-busy={!carregado}><div className="passos-progresso-fill" style={{ width: `${(totalCompletos / totalPassos) * 100}%` }} /></div>
        <span className="hint passos-progresso-label" style={carregado ? undefined : { visibility: 'hidden' }}>{totalCompletos} {t('passos.deLabel')} {totalPassos} {t('passos.concluidosPlural')}</span>
      </div>

      <div className={'passo-video-card' + (videoAssistido ? ' completo' : '') + (tocando ? ' tocando' : '')}>
        {tocando ? (
          <div className="passo-video-player tocando">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0${video.legenda}`}
              title={t('passos.videoTitulo')}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <button type="button" className="passo-video-player" onClick={assistirVideo} aria-hidden="true" tabIndex={-1} style={{ backgroundImage: `url(https://i.ytimg.com/vi/${video.id}/hqdefault.jpg)` }}>
            <span className="passo-video-play"><Icon name="play" size={20} /></span>
          </button>
        )}
        <div className="passo-video-info">
          <div className="passo-video-head">
            <h3>{t('passos.videoTitulo')}</h3>
            {videoAssistido && <div className="passo-feito"><Icon name="check" size={14} /> {t('passos.assistido')}</div>}
          </div>
          <p>{t('passos.videoDescricao')}</p>
          <div className="passo-video-footer">
            <button type="button" className="btn-outline" onClick={assistirVideo}><Icon name="play" size={13} /> {t('passos.assistirVideo')}</button>
            <label className="passo-video-check">
              <input type="checkbox" checked={videoAssistido} onChange={(e) => alternarVideoAssistido(e.target.checked)} />
              {t('passos.marcarComoAssistido')}
            </label>
          </div>
        </div>
      </div>

      <div className="passos-grid">
        {passos.map((p) => {
          const completo = passosCompletos[p.id];
          return (
            <div className={'passo-card' + (completo ? ' completo' : '')} key={p.id}>
              <div className="passo-head">
                <span className="passo-numero">{completo ? <Icon name="check" size={14} /> : p.numero}</span>
                <div className="passo-icone"><Icon name={p.icone} size={20} /></div>
              </div>
              <h3>{t(p.tituloChave)}</h3>
              <p>{t(p.descricaoChave)}</p>
              {completo ? (
                <div className="passo-feito"><Icon name="check" size={14} /> {t('passos.concluido')}</div>
              ) : alcancavel(p) && (
                <button type="button" className="btn-dark pill" onClick={() => acionar(p)}>{t(p.ctaChave)}</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
