import { useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';
import { CENAS_VIDEO, MAX_CENAS_VIDEO, OUTRAS_IMAGENS, SELECAO_INICIAL_VIDEO, type ImagemGerada } from './imagensGeradas';

// Réplica do passo "Vídeo" do Gerador de anúncios em produção (print de
// João, 08/09/2026), revisão do roteiro de narração antes de gerar o
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
  const { t } = useI18n();
  const [roteiro, setRoteiro] = useState(ROTEIRO_MOCK);
  // Narração é opcional: sem ela o vídeo sai só com as cenas e o campo de roteiro some.
  const [comNarracao, setComNarracao] = useState(false);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(SELECAO_INICIAL_VIDEO);
  const completo = selecionadas.size === MAX_CENAS_VIDEO;

  function alternar(id: string) {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_CENAS_VIDEO) next.add(id);
      return next;
    });
  }

  function cardSelecionavel(img: ImagemGerada, rotulo: string) {
    const marcada = selecionadas.has(img.id);
    const desabilitada = !marcada && selecionadas.size >= MAX_CENAS_VIDEO;
    return (
      <div
        key={img.id}
        className={'ger-img-card ger-img-card-video' + (marcada ? ' selecionada' : '') + (desabilitada ? ' desabilitada' : '')}
        onClick={() => alternar(img.id)}
      >
        <div className="ger-img-card-media" style={{ background: img.gradiente }}>
          <span className={'ger-img-check' + (marcada ? ' marcada' : '')}><Icon name="check" size={13} /></span>
        </div>
        <div className="ger-img-card-label">{rotulo}</div>
      </div>
    );
  }

  return (
    <>
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> {t('gerador.cancelarEVoltar')}</button>

      <div className="ger-titulo-bloco">
        <h2>{t('gerador.prepareVideoAnuncio')}</h2>
        <p>{t('gerador.videoDescNarracaoOpcional')}</p>
      </div>

      <div className="ger-img-secao-head" style={{ marginTop: 0 }}>
        <div>
          <h3 className="ger-secao-titulo" style={{ margin: '0 0 4px' }}>{t('gerador.cenasVideoTitulo')}</h3>
          <p className="ger-img-secao-desc">{t('gerador.cenasVideoDesc')}</p>
        </div>
        <span className={'ger-img-contador' + (completo ? ' completo' : '')}>
          {selecionadas.size} {t('gerador.de')} {MAX_CENAS_VIDEO} {t('gerador.selecionadas')}
        </span>
      </div>
      <div className="ger-img-grid-video">
        {CENAS_VIDEO.map((img) => cardSelecionavel(img, `${t('gerador.ambiente')} ${img.label}`))}
      </div>

      <div className="ger-img-secao-head">
        <div>
          <h3 className="ger-secao-titulo" style={{ margin: '0 0 4px' }}>{t('gerador.outrasImagensTitulo')}</h3>
          <p className="ger-img-secao-desc">{t('gerador.outrasImagensDesc')}</p>
        </div>
      </div>
      <div className="ger-img-grid-video" style={{ marginBottom: 34 }}>
        {OUTRAS_IMAGENS.map((img) => cardSelecionavel(img, t(img.label)))}
      </div>

      <div className={'ger-confirma-bloco ger-narracao-bloco' + (comNarracao ? '' : ' confirmado')}>
        <div className="ger-narracao-head" style={{ marginBottom: 0 }}>
          <h3 className="ger-secao-titulo" style={{ margin: 0 }}>{t('gerador.narracaoTitulo')}</h3>
          <div className="switch-row ger-narracao-switch">
            <label>{t('gerador.incluirNarracao')}</label>
            <label className="switch"><input type="checkbox" checked={comNarracao} onChange={(e) => setComNarracao(e.target.checked)} /><span className="track" /></label>
          </div>
        </div>

        {comNarracao ? (
          <>
            <div className="ger-confirma-aviso">
              <Icon name="alert" size={16} />
              <div>
                <b>{t('gerador.narracaoAvisoTitulo')}</b>
                <p>{t('gerador.narracaoAvisoTexto')}</p>
              </div>
            </div>
            <div className="field">
              <label>{t('gerador.roteiroNarracao')}</label>
              <textarea className="ger-video-textarea" rows={5} value={roteiro} onChange={(e) => setRoteiro(e.target.value)} />
            </div>
          </>
        ) : (
          <p className="ger-img-secao-desc" style={{ margin: 0 }}>{t('gerador.narracaoDesligadaDesc')}</p>
        )}

        <div className="ger-video-rodape" style={{ marginTop: 0 }}>
          {comNarracao ? <span className="ger-video-chip">{t('gerador.narracaoEmPortugues')}</span> : <span />}

          <div className="ger-video-acoes">
            {comNarracao && (
              <button type="button" className="btn-outline pill ger-btn" onClick={regerarRoteiro}>
                <Icon name="sync" size={13} /> {t('gerador.regerarRoteiro')} · 2 {t('gerador.creditos')}
              </button>
            )}
            <button type="button" className="btn-dark pill ger-btn" disabled={!completo} onClick={onContinuar}>{t('gerador.gerarVerResultados')}</button>
          </div>
        </div>
      </div>
    </>
  );
}
