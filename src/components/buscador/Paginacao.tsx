import { itensPaginacao } from '../../lib/paginacao';
import { useI18n } from '../../context/I18nContext';

interface Props {
  pagina: number;
  totalPaginas: number;
  inicio: number;
  fim: number;
  total: number;
  onMudar: (pagina: number) => void;
}

/** Mesmo padrão visual de Pedidos e Anúncios marketplace (.prod-pagination / .page-btn):
 * "Exibindo 1 a 24 de N produtos" à esquerda, ‹ 1 2 3 … 9 › à direita. */
export default function Paginacao({ pagina, totalPaginas, inicio, fim, total, onMudar }: Props) {
  const { t, idioma } = useI18n();
  if (totalPaginas <= 1) return null;
  const fmt = (n: number) => n.toLocaleString(idioma === 'pt' ? 'pt-BR' : idioma === 'es' ? 'es-AR' : 'en-US');

  return (
    <div className="prod-pagination busc-pag">
      <span>
        {t('produtos.exibindo')} {fmt(inicio)} {idioma === 'en' ? 'to' : 'a'} {fmt(fim)} {t('produtos.deLabel')} {fmt(total)} {t('produtos.produtosPlural')}
      </span>
      <div className="prod-pages">
        <button type="button" className="page-btn" disabled={pagina === 1} onClick={() => onMudar(pagina - 1)} aria-label="‹">‹</button>
        {itensPaginacao(pagina, totalPaginas).map((item) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              className={'page-btn' + (item === pagina ? ' active' : '')}
              aria-current={item === pagina ? 'page' : undefined}
              onClick={() => onMudar(item)}
            >
              {item}
            </button>
          ) : (
            <span key={item}>…</span>
          ),
        )}
        <button type="button" className="page-btn" disabled={pagina === totalPaginas} onClick={() => onMudar(pagina + 1)} aria-label="›">›</button>
      </div>
    </div>
  );
}
