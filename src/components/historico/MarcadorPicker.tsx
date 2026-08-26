import type { Marcador } from '../../lib/cluster';
import Icon from '../Icon';

interface Props {
  marcadores: Marcador[];
  marcadorId: string | undefined;
  onAbrir: () => void;
}

export default function MarcadorPicker({ marcadores, marcadorId, onAbrir }: Props) {
  const atual = marcadores.find((m) => m.id === marcadorId);
  return (
    <button type="button" className="cluster-picker-btn" onClick={onAbrir}>
      {atual
        ? <span className="marcador-chip-mini" style={{ background: atual.cor }}>{atual.nome}</span>
        : <span className="cluster-picker-empty"><Icon name="tag" size={13} /> Adicionar</span>}
    </button>
  );
}
