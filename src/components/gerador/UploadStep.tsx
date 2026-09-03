import Icon from '../Icon';

interface Props {
  imagens: string[];
  onAdicionar: () => void;
  onRemover: (idx: number) => void;
  onContinuar: () => void;
}

export default function UploadStep({ imagens, onAdicionar, onRemover, onContinuar }: Props) {
  const podeContinuar = imagens.length >= 1;
  const cheio = imagens.length >= 5;

  return (
    <>
      <div className="ger-dropzone" onClick={() => !cheio && onAdicionar()}>
        <Icon name="upload" size={24} />
        <h3>Arraste e solte ou clique para fazer o upload</h3>
        <p>JPG, PNG ou WebP — até 5 imagens</p>
        <span className="hint">{imagens.length}/5 imagens enviadas</span>
      </div>

      {!podeContinuar && <div className="ger-dropzone-aviso">Carregue pelo menos 1 imagem de referência para continuar</div>}

      <div className="ger-thumbs-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="ger-thumb" key={i}>
            {imagens[i] ? (
              <div className="ger-thumb-fill" style={{ background: imagens[i] }}>
                <button type="button" className="ger-thumb-remover" onClick={(e) => { e.stopPropagation(); onRemover(i); }}>
                  <Icon name="close" size={12} />
                </button>
              </div>
            ) : <div className="ger-thumb-vazio" />}
          </div>
        ))}
      </div>

      <div className="ger-info-card">
        <b>Como funciona</b>
        <p>As suas imagens enviadas servirão como referências visuais para a IA. Ela as analisará para gerar textos publicitários, imagens de produtos em diferentes ângulos/contextos e vídeos narrados.</p>
      </div>

      <div className="ger-footer">
        <button type="button" className="btn-calc" style={{ width: 'auto', padding: '13px 28px' }} disabled={!podeContinuar} onClick={onContinuar}>Continuar</button>
      </div>
    </>
  );
}
