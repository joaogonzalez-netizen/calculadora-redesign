import { CORES_CLUSTER } from '../../lib/cluster';

export default function ColorSwatches({ value, onChange }: { value: string; onChange: (cor: string) => void }) {
  return (
    <div className="cor-swatches">
      {CORES_CLUSTER.map((c) => (
        <button
          key={c}
          type="button"
          className={'cor-swatch' + (c === value ? ' active' : '')}
          style={{ background: c }}
          onClick={() => onChange(c)}
          aria-label={c}
        />
      ))}
    </div>
  );
}
