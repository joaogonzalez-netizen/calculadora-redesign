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

// Barra de filtro do Histórico: um chip por marcador (com a contagem de
// cálculos), "Sem marcador" e — com 2+ marcadores marcados — a escolha entre
// "Qualquer um" (tem pelo menos um) e "Todos" (tem todos os marcados).
export default function MarcadorFiltro({
  marcadores, vinculo, totalSemMarcador, selecionados, semMarcador, modo,
  onAlternar, onSemMarcador, onModo, onLimpar,
}: Props) {
  const { t } = useI18n();
  const temFiltro = semMarcador || selecionados.size > 0;

  return (
    <div className="marcador-filtro">
      <span className="marcador-filtro-label"><Icon name="tag" size={13} /> {t('calc.marcadoresLabel')}</span>

      {marcadores.length === 0 ? (
        <span className="hint">{t('calc.semMarcadoresCriadosHint')}</span>
      ) : (
        <div className="marcador-filtro-chips">
          {marcadores.map((m) => {
            const ativo = selecionados.has(m.id);
            return (
              <button
                key={m.id} type="button" aria-pressed={ativo}
                className={'marcador-filtro-chip' + (ativo ? ' ativo' : '')}
                style={ativo ? { background: m.cor, borderColor: m.cor } : undefined}
                onClick={() => onAlternar(m.id)}
              >
                {!ativo && <span className="pasta-dot" style={{ background: m.cor }} />}
                {m.nome}
                <span className="marcador-filtro-count">{contarUsos(vinculo, m.id)}</span>
              </button>
            );
          })}
          <button
            type="button" aria-pressed={semMarcador}
            className={'marcador-filtro-chip sem' + (semMarcador ? ' ativo' : '')}
            onClick={onSemMarcador}
          >
            {t('calc.semMarcador')}
            <span className="marcador-filtro-count">{totalSemMarcador}</span>
          </button>
        </div>
      )}

      {selecionados.size >= 2 && (
        <div className="marcador-filtro-modo" role="radiogroup" aria-label={t('calc.combinarMarcadores')}>
          {(['qualquer', 'todos'] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={modo === m} className={modo === m ? 'ativo' : ''} onClick={() => onModo(m)}
              title={t(m === 'qualquer' ? 'calc.filtroQualquerUmDesc' : 'calc.filtroTodosDesc')}>
              {t(m === 'qualquer' ? 'calc.filtroQualquerUm' : 'calc.filtroTodos')}
            </button>
          ))}
        </div>
      )}

      {temFiltro && (
        <button type="button" className="marcador-filtro-limpar" onClick={onLimpar}>{t('calc.limparFiltro')}</button>
      )}
    </div>
  );
}
