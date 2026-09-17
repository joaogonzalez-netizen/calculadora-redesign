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

interface Props {
  passosCompletos: Record<PassoId | 'video', boolean>;
  onIrParaCalculadora: () => void;
  onIrParaConfiguracoes: () => void;
  onIrParaBuscador: () => void;
  onAtualizarPassos: () => void;
}

export default function PrimeirosPassosView({ passosCompletos, onIrParaCalculadora, onIrParaConfiguracoes, onIrParaBuscador, onAtualizarPassos }: Props) {
  const { t, idioma } = useI18n();
  // ES/EN não têm conexão com marketplaces (menu Configurações some nessas
  // versões), então o passo "Conectar marketplace" some do checklist também.
  const passos = MOSTRAR_PASSO_MARKETPLACE[idioma] ? PASSOS : PASSOS.filter((p) => p.id !== 'marketplace');
  // Total considerado pra "N de X concluídos" e pra sumir o menu — inclui o
  // vídeo, que fica sempre disponível pra assistir de novo, diferente dos
  // outros passos que escondem o CTA quando completos.
  const totalPassos = passos.length + 1;
  const totalCompletos = passos.filter((p) => passosCompletos[p.id]).length + (passosCompletos.video ? 1 : 0);
  const videoAssistido = passosCompletos.video;

  function acionar(passo: Passo) {
    // Passo "Buscador" só marca "feito" quando o usuário favorita algo de
    // verdade na tela do Buscador — o CTA aqui só navega, como o da Calculadora.
    if (passo.id === 'buscador') { onIrParaBuscador(); return; }
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
        <div className="passos-progresso-bar"><div className="passos-progresso-fill" style={{ width: `${(totalCompletos / totalPassos) * 100}%` }} /></div>
        <span className="hint passos-progresso-label">{totalCompletos} {t('passos.deLabel')} {totalPassos} {t('passos.concluidosPlural')}</span>
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
