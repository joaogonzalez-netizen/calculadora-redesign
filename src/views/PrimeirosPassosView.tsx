import { USUARIO } from '../lib/dashboardMock';
import { marcarOnboardingManual } from '../lib/onboarding';
import { useI18n } from '../context/I18nContext';
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

// Total de passos considerado pra "N de X concluídos" e pra sumir o menu —
// inclui o vídeo (passo 5), que fica sempre disponível pra assistir de novo,
// diferente dos outros 4 que escondem o CTA quando completos.
const TOTAL_PASSOS = PASSOS.length + 1;

interface Props {
  passosCompletos: Record<PassoId | 'video', boolean>;
  onIrParaCalculadora: () => void;
  onIrParaConfiguracoes: () => void;
  onAtualizarPassos: () => void;
}

export default function PrimeirosPassosView({ passosCompletos, onIrParaCalculadora, onIrParaConfiguracoes, onAtualizarPassos }: Props) {
  const { t } = useI18n();
  const totalCompletos = PASSOS.filter((p) => passosCompletos[p.id]).length + (passosCompletos.video ? 1 : 0);
  const videoAssistido = passosCompletos.video;

  function acionar(passo: Passo) {
    if (passo.id === 'buscador') { alert('Em breve: buscador de produtos.'); marcarOnboardingManual('buscador'); onAtualizarPassos(); return; }
    if (passo.id === 'calculadora') { onIrParaCalculadora(); return; }
    if (passo.id === 'gerador') { alert('Em breve: o gerador de anúncios com IA.'); marcarOnboardingManual('gerador'); onAtualizarPassos(); return; }
    if (passo.id === 'marketplace') { onIrParaConfiguracoes(); return; }
  }

  function assistirVideo() {
    alert('Em breve: player de vídeo embutido. Por enquanto, use o botão abaixo pra marcar como assistido.');
  }

  function alternarVideoAssistido(assistido: boolean) {
    marcarOnboardingManual('video', assistido);
    onAtualizarPassos();
  }

  return (
    <div>
      <div className="hero">
        <h1>{t('passos.boasVindas')}, <span className="accent">{USUARIO.primeiroNome}</span></h1>
        <p>{t('passos.subtitulo')}</p>
      </div>

      <div className="passos-progresso-row">
        <div className="passos-progresso-bar"><div className="passos-progresso-fill" style={{ width: `${(totalCompletos / TOTAL_PASSOS) * 100}%` }} /></div>
        <span className="hint passos-progresso-label">{totalCompletos} {t('passos.deLabel')} {TOTAL_PASSOS} {t('passos.concluidosPlural')}</span>
      </div>

      <div className={'passo-video-card' + (videoAssistido ? ' completo' : '')}>
        <button type="button" className="passo-video-player" onClick={assistirVideo}>
          <span className="passo-video-play"><Icon name="play" size={20} /></span>
          <span className="passo-video-duration">2:47</span>
        </button>
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
        {PASSOS.map((p) => {
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
              ) : (
                <button type="button" className="btn-dark pill" onClick={() => acionar(p)}>{t(p.ctaChave)}</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
