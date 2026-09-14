import { useState } from 'react';
import { useI18n } from '../../context/I18nContext';
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
  labelChave: string;
  gradiente: string;
  escuro?: boolean;
}

const IMAGENS_VIDEO: ImagemVideo[] = [
  { id: 'uso1', labelChave: 'gerador.imgAmbientadaUso1', gradiente: 'linear-gradient(160deg,#efe6d8,#d9c7a3)' },
  { id: 'uso2', labelChave: 'gerador.imgAmbientadaUso2', gradiente: 'linear-gradient(160deg,#e9eee6,#cddac6)' },
  { id: 'uso3', labelChave: 'gerador.imgAmbientadaUso3', gradiente: 'linear-gradient(160deg,#f4f1ea,#e3ddca)' },
  { id: 'detalhe', labelChave: 'gerador.imgDetalheAcabamento', gradiente: 'linear-gradient(160deg,#2b2f27,#14171b)', escuro: true },
  { id: 'destaque', labelChave: 'gerador.imgDestaqueBeneficio', gradiente: 'linear-gradient(160deg,#efe0cd,#d6b98c)' },
  { id: 'hero', labelChave: 'gerador.imgHeroCenaFinal', gradiente: 'linear-gradient(160deg,#e8e3da,#c9beac)' },
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
  const { t } = useI18n();
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
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> {t('gerador.cancelarEVoltar')}</button>

      <div className="ger-titulo-bloco">
        <h2>{t('gerador.imagensGeradas')}</h2>
        <p>3 imagens fixas (capa, medidas e características) + 6 imagens individuais. Escolha exatamente 4 imagens para o vídeo.</p>
      </div>

      <h3 className="ger-secao-titulo" style={{ marginTop: 0 }}>{t('gerador.imagensFixas')}</h3>
      <p className="ger-img-secao-desc">Sempre incluídas no anúncio. Não entram na seleção do vídeo.</p>

      <div className="ger-img-aviso">
        <Icon name="lock" size={14} /> Estas 3 imagens não podem ser selecionadas para o vídeo — elas já fazem parte fixa do anúncio.
      </div>

      <div className="ger-img-grid-fixas ger-txt-com-chat">
        <div className="ger-img-card">
          <div className="ger-img-card-media" style={{ background: 'linear-gradient(160deg,#f5f5f4,#e6e6e3)' }}>
            <span className="ger-img-badge-fixa">{t('gerador.fixa')}</span>
          </div>
          <div className="ger-img-card-label">{t('gerador.capaFundoBranco')}</div>
        </div>

        <div className="ger-img-card">
          <div className="ger-img-card-media" style={{ background: 'linear-gradient(160deg,#eef2ee,#d8e3d8)' }}>
            <span className="ger-img-badge-fixa">{t('gerador.fixa')}</span>
            <div className="ger-img-medidas-hover">
              <button type="button" className="ger-img-medidas-btn" onClick={editarMedidas}>
                <Icon name="tag" size={13} /> {t('gerador.editarMedidas')}
              </button>
            </div>
          </div>
          <div className="ger-img-card-label">{t('gerador.medidas')}</div>
        </div>

        <div className="ger-img-card">
          <div className="ger-img-card-media" style={{ background: 'linear-gradient(160deg,#f6efe1,#ecdfc0)' }}>
            <span className="ger-img-badge-fixa">{t('gerador.fixa')}</span>
            <div className="ger-img-carac">
              <div className="ger-img-carac-item"><Icon name="gerador" size={15} /> Design lúdico de bicho-preguiça</div>
              <div className="ger-img-carac-item"><Icon name="home" size={15} /> Ideal para quartos infantis ou áreas de lazer</div>
              <div className="ger-img-carac-item"><Icon name="leaf" size={15} /> Base estilizada imitando folhas</div>
            </div>
          </div>
          <div className="ger-img-card-label">{t('gerador.caracteristicas')}</div>
        </div>

        <button type="button" className="ger-txt-chat" onClick={() => pedirAjuste('Imagens fixas')} title="Pedir ajuste via chat">
          <Icon name="message" size={16} />
        </button>
      </div>

      <div className="ger-img-secao-head">
        <div>
          <h3 className="ger-secao-titulo" style={{ margin: '0 0 4px' }}>{t('gerador.imagensParaVideo')}</h3>
          <p className="ger-img-secao-desc">{t('gerador.selecioneExatamente4')}</p>
        </div>
        <span className="ger-img-contador">{selecionadas.size} {t('gerador.de')} {MAX_SELECAO} {t('gerador.selecionadas')}</span>
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
              <div className={'ger-img-card-label' + (img.escuro ? '' : '')}>{t(img.labelChave)}</div>
            </div>
          );
        })}

        <button type="button" className="ger-txt-chat" onClick={() => pedirAjuste('Imagens para o vídeo')} title="Pedir ajuste via chat">
          <Icon name="message" size={16} />
        </button>
      </div>

      <div className="ger-txt-footer">
        <div>
          <p>{t('gerador.satisfeitoImagensGeradas')}</p>
          <span className="hint">Aprovar para continuar para o próximo passo, ou re-gerar.</span>
        </div>
        <div className="ger-txt-footer-actions">
          <button type="button" className="btn-outline" onClick={() => pedirAjuste('todas as imagens (re-gerar)')}>
            <Icon name="sync" size={13} /> {t('gerador.regerar')} · 2 {t('gerador.creditos')}
          </button>
          <button type="button" className="btn-calc ger-txt-aprovar" onClick={onContinuar}>
            <Icon name="thumbUp" size={14} /> {t('gerador.aprovarEContinuar')}
          </button>
        </div>
      </div>
    </>
  );
}
