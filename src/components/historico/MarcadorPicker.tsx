import { MAX_POR_CALCULO, type Marcador } from '../../lib/cluster';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

interface Props {
  marcadores: Marcador[];
  ids: string[];
  filtrados: Set<string>;
  onAbrir: () => void;
  onFiltrar: (id: string) => void;
}

// Célula "Marcadores" da tabela: até 3 chips (clicar filtra por aquele
// marcador) + botão de editar, que abre o drawer de marcadores do cálculo.
export default function MarcadorPicker({ marcadores, ids, filtrados, onAbrir, onFiltrar }: Props) {
  const { t } = useI18n();
  const atuais = ids.map((id) => marcadores.find((m) => m.id === id)).filter((m): m is Marcador => !!m);

  return (
    <div className="marcador-celula">
      {atuais.map((m) => (
        <button
          key={m.id} type="button" title={t('calc.filtrarPorEsteMarcador')}
          className={'marcador-chip-mini' + (filtrados.has(m.id) ? ' filtrando' : '')} style={{ background: m.cor }}
          onClick={() => onFiltrar(m.id)}
        >
          {m.nome}
        </button>
      ))}
      <button
        type="button" className={'cluster-picker-btn' + (atuais.length ? ' so-icone' : '')} onClick={onAbrir}
        title={t('calc.editarMarcadores')} aria-label={t('calc.editarMarcadores')}
      >
        {atuais.length === 0
          ? <span className="cluster-picker-empty"><Icon name="tag" size={13} /> {t('calc.adicionar')}</span>
          : <Icon name={atuais.length < MAX_POR_CALCULO ? 'plus' : 'pencil'} size={12} />}
      </button>
    </div>
  );
}
