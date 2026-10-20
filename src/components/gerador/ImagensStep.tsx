import { useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';
import MedidasModal, { MedidasOverlay, medidasPadrao, type DimensoesProduto, type MedidasConfig } from './MedidasModal';
import fotoProduto from '../../assets/gerador-produto-mock.jpg';
import { CENAS_VIDEO, OUTRAS_IMAGENS, type ImagemGerada } from './imagensGeradas';

// Réplica do passo "Imagens" do Gerador de anúncios em produção (print de
// João, 20/10/2026). Três menus, todos só para conferir e aprovar: imagens
// FIXAS (capa, medidas, características e detalhe do acabamento), CENAS
// preparadas para o vídeo e OUTRAS imagens disponíveis. Aqui não há seleção:
// escolher quais 4 imagens viram o vídeo acontece no passo seguinte (Vídeo).
// Capa e Medidas usam uma foto mock do produto (a Medidas com as setas
// editáveis do MedidasModal por cima); os demais cards usam um gradiente de
// cor no lugar da imagem gerada pela IA.
function pedirAjuste(secao: string) {
  alert(`Em breve: peça ajustes no(a) "${secao}" direto por chat com a IA.`);
}

interface Props {
  // Dimensões digitadas em Informações: a imagem de medidas já nasce com elas.
  dimensoes?: DimensoesProduto;
  onVoltar: () => void;
  onContinuar: () => void;
}

export default function ImagensStep({ dimensoes, onVoltar, onContinuar }: Props) {
  const { t, idioma } = useI18n();
  const [medidas, setMedidas] = useState<MedidasConfig>(() => medidasPadrao(t, idioma, dimensoes));
  const [editandoMedidas, setEditandoMedidas] = useState(false);

  function cardImagem(img: ImagemGerada, rotulo: string) {
    return (
      <div key={img.id} className="ger-img-card">
        <div className="ger-img-card-media" style={{ background: img.gradiente }} />
        <div className="ger-img-card-label">{rotulo}</div>
      </div>
    );
  }

  return (
    <>
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> {t('gerador.cancelarEVoltar')}</button>

      <div className="ger-titulo-bloco">
        <h2>{t('gerador.imagensGeradas')}</h2>
        <p>{t('gerador.imagensDescConfirmar')}</p>
      </div>

      <h3 className="ger-secao-titulo" style={{ marginTop: 0 }}>{t('gerador.imagensFixas')}</h3>
      <p className="ger-img-secao-desc">{t('gerador.imagensFixasDesc')}</p>

      <div className="ger-img-aviso">
        <Icon name="lock" size={14} /> {t('gerador.imagensFixasAviso')}
      </div>

      <div className="ger-img-grid-fixas ger-txt-com-chat">
        <div className="ger-img-card">
          <div className="ger-img-card-media ger-img-card-media-foto">
            <img src={fotoProduto} alt="" />
            <span className="ger-img-badge-fixa">{t('gerador.fixa')}</span>
          </div>
          <div className="ger-img-card-label">{t('gerador.capaFundoBranco')}</div>
        </div>

        <div className="ger-img-card">
          <div className="ger-img-card-media ger-img-card-media-foto">
            <MedidasOverlay config={medidas} miniatura />
            <span className="ger-img-badge-fixa">{t('gerador.fixa')}</span>
            <div className="ger-img-medidas-hover">
              <button type="button" className="ger-img-medidas-btn" onClick={() => setEditandoMedidas(true)}>
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

        <div className="ger-img-card">
          <div className="ger-img-card-media" style={{ background: 'linear-gradient(160deg,#2b2f27,#14171b)' }}>
            <span className="ger-img-badge-fixa">{t('gerador.fixa')}</span>
          </div>
          <div className="ger-img-card-label">{t('gerador.imgDetalheAcabamento')}</div>
        </div>

        <button type="button" className="ger-txt-chat" onClick={() => pedirAjuste('Imagens fixas')} title="Pedir ajuste via chat">
          <Icon name="message" size={16} />
        </button>
      </div>

      <div className="ger-img-secao-head">
        <div>
          <h3 className="ger-secao-titulo" style={{ margin: '0 0 4px' }}>{t('gerador.cenasVideoTitulo')}</h3>
          <p className="ger-img-secao-desc">{t('gerador.cenasPreparadasDesc')}</p>
        </div>
      </div>

      <div className="ger-img-grid-video ger-txt-com-chat">
        {CENAS_VIDEO.map((img) => cardImagem(img, `${t('gerador.ambiente')} ${img.label}`))}

        <button type="button" className="ger-txt-chat" onClick={() => pedirAjuste('Cenas para o vídeo')} title="Pedir ajuste via chat">
          <Icon name="message" size={16} />
        </button>
      </div>

      <div className="ger-img-secao-head">
        <div>
          <h3 className="ger-secao-titulo" style={{ margin: '0 0 4px' }}>{t('gerador.outrasImagensTitulo')}</h3>
          <p className="ger-img-secao-desc">{t('gerador.outrasDisponiveisDesc')}</p>
        </div>
      </div>

      <div className="ger-img-grid-video">
        {OUTRAS_IMAGENS.map((img) => cardImagem(img, t(img.label)))}
      </div>

      {editandoMedidas && (
        <MedidasModal
          inicial={medidas}
          onCancelar={() => setEditandoMedidas(false)}
          onAprovar={(cfg) => { setMedidas(cfg); setEditandoMedidas(false); }}
        />
      )}

      <div className="ger-txt-footer">
        <div>
          <p>{t('gerador.satisfeitoImagensGeradas')}</p>
          <span className="hint">Aprovar para continuar para o próximo passo, ou re-gerar.</span>
        </div>
        <div className="ger-txt-footer-actions">
          <button type="button" className="btn-outline pill ger-btn" onClick={() => pedirAjuste('todas as imagens (re-gerar)')}>
            <Icon name="sync" size={13} /> {t('gerador.regerar')} · 2 {t('gerador.creditos')}
          </button>
          <button type="button" className="btn-dark pill ger-btn" onClick={onContinuar}>
            <Icon name="thumbUp" size={14} /> {t('gerador.aprovarEContinuar')}
          </button>
        </div>
      </div>
    </>
  );
}
