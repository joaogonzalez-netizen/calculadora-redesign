import { useMemo, useState } from 'react';
import { PRODUTOS_BUSCA_LISTA } from '../lib/buscadorMock';
import {
  CATEGORIAS_FINDER,
  decidirReport,
  ehModerador,
  lerReports,
  type FinderReport,
  type StatusReport,
} from '../lib/finderReports';
import { useI18n } from '../context/I18nContext';
import Icon from '../components/Icon';

type Filtro = 'todos' | StatusReport;
const FILTROS: Filtro[] = ['aberto', 'aprovado', 'recusado', 'todos'];

/** Menu "Reports do Finder": fila de moderação manual. Só a conta de moderação
 * enxerga o menu; a checagem de verdade fica no backend (403), aqui é só a UI. */
export default function FinderReportsView() {
  const { t, idioma } = useI18n();
  const [reports, setReports] = useState<FinderReport[]>(() => lerReports());
  const [filtro, setFiltro] = useState<Filtro>('aberto');
  // Categoria que o moderador pode ajustar antes de aprovar um report de categoria.
  const [ajustes, setAjustes] = useState<Record<string, string>>({});

  const visiveis = useMemo(
    () => reports.filter((r) => filtro === 'todos' || r.status === filtro),
    [reports, filtro],
  );

  if (!ehModerador()) return <div className="busc-vazio">403</div>;

  function decidir(r: FinderReport, status: 'aprovado' | 'recusado') {
    decidirReport(r.id, status, status === 'aprovado' && r.motivo === 'categoria' ? ajustes[r.id] ?? r.categoriaEscolhida : undefined);
    setReports(lerReports());
  }

  const locale = idioma === 'pt' ? 'pt-BR' : idioma === 'es' ? 'es-AR' : 'en-US';
  const data = (ts: number) => new Date(ts).toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const contagem = (f: Filtro) => (f === 'todos' ? reports.length : reports.filter((r) => r.status === f).length);

  return (
    <div>
      <div className="hero">
        <h1>{t('reports.titulo')} <span className="busc-beta-pill"><Icon name="lock" size={11} /> {t('reports.restrito')}</span></h1>
        <p>{t('reports.subtitulo')}</p>
      </div>

      <div className="chip-row sm busc-reports-filtros">
        {FILTROS.map((f) => (
          <button key={f} type="button" className={'chip sm' + (filtro === f ? ' active' : '')} onClick={() => setFiltro(f)}>
            {t(`reports.filtro.${f}`)} ({contagem(f)})
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <div className="busc-vazio">{t('reports.vazio')}</div>
      ) : (
        <div className="busc-reports-tabela">
          <table className="prod-table">
            <thead>
              <tr>
                <th>{t('reports.col.item')}</th>
                <th>{t('reports.col.motivo')}</th>
                <th>{t('reports.col.categoria')}</th>
                <th>{t('reports.col.seller')}</th>
                <th>{t('reports.col.data')}</th>
                <th>{t('reports.col.acoes')}</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((r) => {
                const produto = PRODUTOS_BUSCA_LISTA.find((p) => p.id === r.produtoId);
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="busc-reports-item">
                        <span className="busc-report-emoji">{produto?.imagem ?? '📦'}</span>
                        <span className="prod-name">{produto?.nome ?? r.produtoId}</span>
                      </div>
                    </td>
                    <td>
                      <div className="prod-name">{t(`report.motivo.${r.motivo}`)}</div>
                      {r.texto && <div className="prod-sku">“{r.texto}”</div>}
                    </td>
                    <td>
                      {r.motivo === 'categoria' ? (
                        <div className="busc-reports-cat">
                          <div className="prod-sku">{t('reports.sugerida')}: {r.categoriaSugerida ?? '—'}</div>
                          {r.status === 'aberto' ? (
                            <select
                              value={ajustes[r.id] ?? r.categoriaEscolhida ?? ''}
                              onChange={(e) => setAjustes((a) => ({ ...a, [r.id]: e.target.value }))}
                              aria-label={t('reports.escolhida')}
                            >
                              {CATEGORIAS_FINDER.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          ) : (
                            <div className="prod-name">{t('reports.escolhida')}: {r.categoriaEscolhida ?? '—'}</div>
                          )}
                        </div>
                      ) : (
                        <span className="prod-sku">—</span>
                      )}
                    </td>
                    <td className="prod-name">{r.sellerNome}</td>
                    <td className="prod-sku">{data(r.criadoEm)}</td>
                    <td>
                      {r.status === 'aberto' ? (
                        <div className="busc-reports-acoes">
                          <button type="button" className="btn-dark cl-btn-sm" onClick={() => decidir(r, 'aprovado')} title={t(r.motivo === 'categoria' ? 'reports.dica.categoria' : 'reports.dica.listaNegra')}>
                            {t('reports.aprovar')}
                          </button>
                          <button type="button" className="btn-outline" onClick={() => decidir(r, 'recusado')}>{t('reports.recusar')}</button>
                        </div>
                      ) : (
                        <div>
                          <span className={'status-tag ' + (r.status === 'aprovado' ? 'status-ativo' : 'status-pausado')}>{t(`reports.status.${r.status}`)}</span>
                          <div className="prod-sku">
                            {r.status === 'recusado' ? t('reports.efeito.voltou') : r.motivo === 'categoria' ? t('reports.efeito.categoria') : t('reports.efeito.listaNegra')}
                            {r.decididoPor && <> · {t('reports.decididoPor')} {r.decididoPor}</>}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
