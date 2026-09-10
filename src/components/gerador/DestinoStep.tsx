import Icon, { type IconName } from '../Icon';

// Primeiro passo do wizard — pedido por João (10/09/2026): muita gente caía
// em "Outros" no passo de Marketplace por falta de opção de rede social.
// Aqui o vendedor escolhe TODOS os destinos do anúncio (pode ser mais de
// um), antes até de subir foto, pra IA já ajustar formato de imagem, tom de
// texto e recorte de vídeo pro que for gerado.
interface Destino {
  id: string;
  nome: string;
  icone?: IconName;
  cor: string;
}

const MARKETPLACES_DESTINO: Destino[] = [
  { id: 'ml', nome: 'Mercado Livre', cor: '#ffd400' },
  { id: 'shopee', nome: 'Shopee', cor: '#ee4d2d' },
  { id: 'etsy', nome: 'Etsy', cor: '#f56400' },
];

const REDES_DESTINO: Destino[] = [
  { id: 'instagram', nome: 'Instagram', icone: 'instagram', cor: '#d62976' },
  { id: 'facebook', nome: 'Facebook', icone: 'facebook', cor: '#1877f2' },
  { id: 'tiktok', nome: 'TikTok', icone: 'tiktok', cor: '#14181a' },
  { id: 'pinterest', nome: 'Pinterest', icone: 'pinterest', cor: '#e60023' },
];

interface Props {
  selecionados: string[];
  onAlternar: (id: string) => void;
  onContinuar: () => void;
}

function GrupoDestino({ titulo, itens, selecionados, onAlternar }: { titulo: string; itens: Destino[]; selecionados: string[]; onAlternar: (id: string) => void }) {
  return (
    <div className="ger-destino-grupo">
      <div className="ger-destino-grupo-titulo">{titulo}</div>
      <div className="ger-destino-grid">
        {itens.map((d) => {
          const ativo = selecionados.includes(d.id);
          return (
            <button type="button" key={d.id} className={'ger-destino-card' + (ativo ? ' selecionado' : '')} onClick={() => onAlternar(d.id)}>
              <span className={'ger-destino-icone' + (d.icone ? ' com-glifo' : '')} style={{ background: d.cor }}>
                {d.icone && <Icon name={d.icone} size={15} style={{ color: '#fff' }} />}
              </span>
              <span className="ger-destino-nome">{d.nome}</span>
              <span className="ger-destino-check"><Icon name="check" size={12} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DestinoStep({ selecionados, onAlternar, onContinuar }: Props) {
  return (
    <>
      <div className="ger-titulo-bloco">
        <h2>Pra onde vamos gerar esse anúncio?</h2>
        <p>Nos conte pra onde quer gerar esse anúncio e ajude a IA a gerar o melhor modelo. Você pode escolher mais de um destino.</p>
      </div>

      <GrupoDestino titulo="Marketplaces" itens={MARKETPLACES_DESTINO} selecionados={selecionados} onAlternar={onAlternar} />
      <GrupoDestino titulo="Redes sociais" itens={REDES_DESTINO} selecionados={selecionados} onAlternar={onAlternar} />

      <div className="ger-destino-conta">
        {selecionados.length === 0 ? 'Selecione ao menos 1 destino para continuar.' : `${selecionados.length} destino${selecionados.length > 1 ? 's' : ''} selecionado${selecionados.length > 1 ? 's' : ''}.`}
      </div>

      <div className="ger-footer">
        <button type="button" className="btn-dark pill" disabled={selecionados.length === 0} onClick={onContinuar}>Continuar</button>
      </div>
    </>
  );
}
