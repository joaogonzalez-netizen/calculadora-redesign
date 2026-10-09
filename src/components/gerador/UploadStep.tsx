import type { ReactNode } from 'react';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';
import { fundoDeImagem } from '../../lib/rascunhosShopee';

interface Props {
  imagens: string[];
  onAdicionar: () => void;
  onRemover: (idx: number) => void;
  onContinuar: () => void;
  // Fluxo de apenas cópia: as fotos são as do anúncio copiado e não passam por IA.
  modoCopia?: boolean;
  // Aviso exibido logo acima do botão Continuar.
  avisoCopia?: ReactNode;
}

export default function UploadStep({ imagens, onAdicionar, onRemover, onContinuar, modoCopia, avisoCopia }: Props) {
  const { t } = useI18n();
  const podeContinuar = imagens.length >= 1;
  const cheio = imagens.length >= 5;

  return (
    <>
      <div className="ger-info-card">
        <b>{modoCopia ? t('gerador.imagensDoAnuncioCopiado') : t('gerador.comoFunciona')}</b>
        <p>{modoCopia ? t('gerador.imagensDoAnuncioCopiadoDesc') : 'As suas imagens enviadas servirão como referências visuais para a IA. Ela as analisará para gerar textos publicitários, imagens de produtos em diferentes ângulos/contextos e vídeos narrados.'}</p>
      </div>

      <div className="ger-dropzone" onClick={() => !cheio && onAdicionar()}>
        <Icon name="upload" size={24} />
        <h3>{t('gerador.arrastarSolte')}</h3>
        <p>{t('gerador.formatosImagem')}</p>
        <span className="hint">{imagens.length}/5 {t('gerador.imagensEnviadas')}</span>
      </div>

      {!podeContinuar && <div className="ger-dropzone-aviso">{t('gerador.avisoMinImagem')}</div>}

      <div className="ger-thumbs-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="ger-thumb" key={i}>
            {imagens[i] ? (
              <div className="ger-thumb-fill" style={{ background: fundoDeImagem(imagens[i]) }}>
                <button type="button" className="ger-thumb-remover" onClick={(e) => { e.stopPropagation(); onRemover(i); }}>
                  <Icon name="close" size={12} />
                </button>
              </div>
            ) : <div className="ger-thumb-vazio" />}
          </div>
        ))}
      </div>

      {avisoCopia && <div style={{ marginTop: 22 }}>{avisoCopia}</div>}

      <div className="ger-footer">
        <button type="button" className="btn-calc" style={{ width: 'auto', padding: '13px 28px' }} disabled={!podeContinuar} onClick={onContinuar}>{t('gerador.continuar')}</button>
      </div>
    </>
  );
}
