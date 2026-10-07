import { useState } from 'react';
import { contarUsos, type Marcador, type VinculoMarcadores } from '../../lib/cluster';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

export type ModoFiltro = 'qualquer' | 'todos';

interface Props {
  marcadores: Marcador[];
  vinculo: VinculoMarcadores;
  totalSemMarcador: number;
  selecionados: Set<string>;
  semMarcador: boolean;
  modo: ModoFiltro;
  onAlternar: (id: string) => void;
  onSemMarcador: () => void;
  onModo: (m: ModoFiltro) => void;
  onLimpar: () => void;
}

// Filtro do Histórico por marcadores, em dropdown: um botão com a contagem de
// filtros ativos abre um painel com checkbox por marcador (+ "Sem marcador")
// e — com 2+ marcados — a escolha entre "Qualquer um" e "Todos".
export default function MarcadorFiltro({
  marcadores, vinculo, totalSemMarcador, selecionados, semMarcador, modo,
  onAlternar, onSemMarcador, onModo, onLimpar,
}: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const qtdAtiva = selecionados.size + (semMarcador ? 1 : 0);
  const temFiltro = qtdAtiva > 0;

  return (
    <div className="popover-wrap marcador-filtro-dropdown">
      <button type="button" className={'ctl-btn' + (temFiltro ? ' ativo' : '')} onClick={() => setOpen((o) => !o)}>
        <Icon name="tag" size={13} /> {t('calc.marcadoresLabel')}
        {temFiltro && <span className="marcador-filtro-badge">{qtdAtiva}</span>}
        <span className="ctl-caret">▾</span>
      </button>

      {open && (
        <>
          <div className="popover-scrim" onClick={() => setOpen(false)} />
          <div className="popover-list marcador-filtro-panel">
            {marcadores.length === 0 ? (
              <div className="hint" style={{ padding: '6px 10px' }}>{t('calc.semMarcadoresCriadosHint')}</div>
            ) : (
              <>
                {marcadores.map((m) => {
                  const ativo = selecionados.has(m.id);
                  return (
                    <label key={m.id} className={'popover-item marcador-filtro-item' + (ativo ? ' active' : '')}>
                      <input type="checkbox" checked={ativo} onChange={() => onAlternar(m.id)} />
                      <span className="pasta-dot" style={{ background: m.cor }} />
                      <span className="marcador-filtro-item-nome">{m.nome}</span>
                      <span className="marcador-filtro-count">{contarUsos(vinculo, m.id)}</span>
                    </label>
                  );
                })}
                <label className={'popover-item marcador-filtro-item sem' + (semMarcador ? ' active' : '')}>
                  <input type="checkbox" checked={semMarcador} onChange={onSemMarcador} />
                  <span className="marcador-filtro-item-nome">{t('calc.semMarcador')}</span>
                  <span className="marcador-filtro-count">{totalSemMarcador}</span>
                </label>

                {selecionados.size >= 2 && (
                  <div className="marcador-filtro-modo" role="radiogroup" aria-label={t('calc.combinarMarcadores')}>
                    {(['qualquer', 'todos'] as const).map((mo) => (
                      <button
                        key={mo} type="button" role="radio" aria-checked={modo === mo} className={modo === mo ? 'ativo' : ''}
                        onClick={() => onModo(mo)} title={t(mo === 'qualquer' ? 'calc.filtroQualquerUmDesc' : 'calc.filtroTodosDesc')}
                      >
                        {t(mo === 'qualquer' ? 'calc.filtroQualquerUm' : 'calc.filtroTodos')}
                      </button>
                    ))}
                  </div>
                )}

                {temFiltro && (
                  <button type="button" className="marcador-filtro-limpar" onClick={() => { onLimpar(); setOpen(false); }}>
                    {t('calc.limparFiltro')}
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
