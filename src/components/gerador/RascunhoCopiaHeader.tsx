import { useI18n } from '../../context/I18nContext';
import { brl } from '../../lib/format';
import { fundoDeImagem, type RascunhoShopee } from '../../lib/rascunhosShopee';
import type { AceiteCopia } from '../../lib/termoCopia';

const LOCALE = { pt: 'pt-BR', es: 'es-AR', en: 'en-US' } as const;

interface Props {
  rascunho: RascunhoShopee;
  aceite: AceiteCopia | null;
  // 'ia' = já escolheu gerar com IA (topo do Gerador); 'revisando' = na Revisar cópia, ainda escolhendo.
  modo?: 'ia' | 'revisando';
}

// Card do anúncio copiado, separado do conteúdo do passo: aparece na Revisar cópia
// e no topo do Gerador depois de "Gerar com IA" (com o aceite do termo, se houver).
export default function RascunhoCopiaHeader({ rascunho, aceite, modo = 'ia' }: Props) {
  const { t, idioma } = useI18n();
  const meta = [
    rascunho.preco > 0 ? brl(rascunho.preco) : '',
    `${rascunho.imagens.length} ${t('copia.fotos')}`,
    rascunho.categoria.split('>').pop()?.trim() ?? '',
  ].filter(Boolean);

  return (
    <section className="rc-head" aria-labelledby="rc-head-titulo">
      <div className="rc-head-main">
        <div className="rc-thumb" style={{ background: fundoDeImagem(rascunho.imagens[0] ?? 'var(--surface-3)') }} />
        <div className="rc-info">
          <span className="rc-eyebrow">{t('copia.eyebrow')}</span>
          <h2 id="rc-head-titulo">{rascunho.titulo}</h2>
          <div className="rc-meta">{meta.join(' · ')}</div>
        </div>
        <span className={'rc-modo-tag ' + (modo === 'ia' ? 'ia' : 'copia')}>{t(modo === 'ia' ? 'copia.tagIa' : 'copia.tagRevisando')}</span>
      </div>
      <p className="rc-modo-desc">{t(modo === 'ia' ? 'copia.iaDesc' : 'copia.revisandoDesc')}</p>
      {aceite && (
        <p className="rc-aceite">
          {t('copia.aceitoEm')} {new Date(aceite.aceitoEm).toLocaleString(LOCALE[idioma], { dateStyle: 'short', timeStyle: 'short' })}
        </p>
      )}
    </section>
  );
}
