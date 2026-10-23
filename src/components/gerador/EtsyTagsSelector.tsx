import { useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';
import InfoDot from '../InfoDot';

// Seleção das 13 tags do Etsy a partir da pesquisa EverBee. Tudo mockado: a
// pesquisa devolve sempre o mesmo conjunto de sugestões e a nota "Etsy x/100"
// (adequação do Seller) vem fixa por tag. O Seller IA pré-preenche as 13 e o
// usuário troca o que quiser; só dá para aprovar com as 13 fechadas.
export const ETSY_TAGS_LIMITE = 13;
const ETSY_TAG_MAX_CHARS = 20;
const PESQUISAS_TOTAL = 3;

type Origem = 'everbee' | 'ia';
export interface EtsyTag { texto: string; origem: Origem; nota: number; }

export const ETSY_TAGS_INICIAIS: EtsyTag[] = [
  { texto: 'articulated dragon', origem: 'everbee', nota: 78 },
  { texto: 'dinosaur fidget toy', origem: 'everbee', nota: 70 },
  { texto: 'desk sculpture', origem: 'everbee', nota: 70 },
  { texto: '3d printed decor', origem: 'ia', nota: 100 },
  { texto: 'fantasy figurine', origem: 'ia', nota: 100 },
  { texto: 'hand painted statue', origem: 'ia', nota: 78 },
  { texto: 'tabletop rpg figure', origem: 'ia', nota: 78 },
  { texto: 'gift for gamer', origem: 'ia', nota: 100 },
  { texto: 'collectible statue', origem: 'ia', nota: 78 },
  { texto: 'dino desk toy', origem: 'ia', nota: 78 },
  { texto: 'office stress relief', origem: 'ia', nota: 100 },
  { texto: 'dinosaur decor', origem: 'ia', nota: 78 },
  { texto: 'trex figurine', origem: 'ia', nota: 45 },
];

const SUGESTOES_EVERBEE: { texto: string; nota: number }[] = [
  { texto: 'articulated trex', nota: 92 },
  { texto: 'fidget dinosaur', nota: 88 },
  { texto: 'dinosaur desk decor', nota: 85 },
  { texto: 'stress relief toy', nota: 80 },
  { texto: 'gift for dino fans', nota: 78 },
  { texto: 'skeleton desk toy', nota: 70 },
  { texto: 'trex stress toy', nota: 62 },
  { texto: 'adhd fidget gift', nota: 55 },
];

function classeNota(nota: number) {
  return nota >= 75 ? 'alta' : nota >= 50 ? 'media' : 'baixa';
}

interface Props {
  tags: EtsyTag[];
  onChange: (tags: EtsyTag[]) => void;
}

export default function EtsyTagsSelector({ tags, onChange }: Props) {
  const { t } = useI18n();
  const [busca, setBusca] = useState('dinosaur');
  const [pesquisas, setPesquisas] = useState(1);
  const [resultados, setResultados] = useState(SUGESTOES_EVERBEE);

  const completo = tags.length >= ETSY_TAGS_LIMITE;
  const semPesquisas = pesquisas >= PESQUISAS_TOTAL;

  function pesquisar() {
    if (!busca.trim() || semPesquisas) return;
    setPesquisas((p) => p + 1);
    setResultados([...SUGESTOES_EVERBEE].reverse());
  }

  function alternar(texto: string, nota: number) {
    if (tags.some((tag) => tag.texto === texto)) {
      onChange(tags.filter((tag) => tag.texto !== texto));
    } else if (!completo) {
      onChange([...tags, { texto, origem: 'everbee', nota }]);
    }
  }

  const notaBadge = (nota: number) => (
    <span className={'ger-tag-nota ' + classeNota(nota)}>
      Etsy <b>{nota}/100</b>
      <InfoDot text={t('gerador.etsyTagsNotaInfo')} />
    </span>
  );

  return (
    <div className="ger-txt-card">
      <div className="ger-txt-card-head">
        <div>
          <div className="ger-txt-label">{t('gerador.etsyTagsSelecione')}</div>
          <div className="hint">{t('gerador.etsyTagsSelecioneDesc')}</div>
        </div>
        <span className={'ger-txt-tags-contagem' + (completo ? ' completo' : '')}>{tags.length}/{ETSY_TAGS_LIMITE}</span>
      </div>

      <form className="ger-tag-busca" onSubmit={(e) => { e.preventDefault(); pesquisar(); }}>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={t('gerador.etsyTagsBuscaPlaceholder')} />
        <button type="submit" className="btn-dark pill ger-btn" disabled={semPesquisas || !busca.trim()}>
          <Icon name="search" size={13} /> {t('gerador.etsyTagsPesquisar')}
        </button>
        <span className="ger-tag-pesquisas">{PESQUISAS_TOTAL - pesquisas} {t('gerador.etsyTagsDe')} {PESQUISAS_TOTAL} {t('gerador.etsyTagsPesquisasRestantes')}</span>
      </form>

      <div className="ger-tag-colunas">
        <div>
          <div className="ger-txt-label">{t('gerador.etsyTagsDoAnuncio')} · {tags.length}/{ETSY_TAGS_LIMITE}</div>
          <div className="ger-tag-selecionadas">
            {tags.length === 0 && <div className="hint">{t('gerador.etsyTagsVazio')}</div>}
            {tags.map((tag) => (
              <div className="ger-tag-item" key={tag.texto}>
                <div className="ger-tag-item-info">
                  <span className="ger-tag-origem">{tag.origem === 'everbee' ? 'EverBee' : 'Seller IA'}</span>
                  <strong>{tag.texto}</strong>
                </div>
                {notaBadge(tag.nota)}
                <button type="button" className="ger-tag-remover" title={t('gerador.removerTag')} onClick={() => onChange(tags.filter((x) => x.texto !== tag.texto))}>
                  <Icon name="close" size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="ger-txt-label">EverBee Research</div>
          <div className="hint" style={{ marginBottom: 8 }}>{completo ? t('gerador.etsyTagsCheio') : t('gerador.etsyTagsClique')}</div>
          <div className="ger-tag-resultados">
            {resultados.map((r) => {
              const marcada = tags.some((tag) => tag.texto === r.texto);
              const longa = r.texto.length > ETSY_TAG_MAX_CHARS;
              const bloqueada = !marcada && (completo || longa);
              return (
                <button type="button" key={r.texto} disabled={bloqueada} className={'ger-tag-resultado' + (marcada ? ' marcada' : '')} onClick={() => alternar(r.texto, r.nota)}>
                  <span className="ger-tag-check">{marcada && <Icon name="check" size={12} />}</span>
                  <strong>{r.texto}</strong>
                  <span className={'ger-tag-nota ' + classeNota(r.nota)}>Etsy <b>{r.nota}/100</b></span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
