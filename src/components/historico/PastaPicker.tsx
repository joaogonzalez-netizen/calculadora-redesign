import type { Pasta } from '../../lib/cluster';
import Icon from '../Icon';

interface Props {
  pastas: Pasta[];
  pastaId: string | undefined;
  onAbrir: () => void;
}

export default function PastaPicker({ pastas, pastaId, onAbrir }: Props) {
  const atual = pastas.find((p) => p.id === pastaId);
  return (
    <button type="button" className="cluster-picker-btn" onClick={onAbrir}>
      {atual
        ? <><span className="pasta-dot" style={{ background: atual.cor }} />{atual.nome}</>
        : <span className="cluster-picker-empty"><Icon name="folder" size={13} /> Adicionar</span>}
    </button>
  );
}
