import Icon from '../Icon';

export interface PassoInfo {
  id: string;
  numero: number;
  label: string;
}

interface Props {
  passos: readonly PassoInfo[];
  atual: string;
  visitados: Set<string>;
  onIrPara: (id: string) => void;
}

export default function GeradorStepper({ passos, atual, visitados, onIrPara }: Props) {
  return (
    <div className="ger-stepper">
      {passos.map((p, idx) => {
        const feito = visitados.has(p.id);
        const ativo = p.id === atual;
        const clicavel = feito || ativo;
        return (
          <div className="ger-stepper-item" key={p.id}>
            {idx > 0 && <span className="ger-stepper-line" />}
            <button
              type="button"
              className={'ger-step' + (ativo ? ' ativo' : '') + (feito ? ' feito' : '')}
              disabled={!clicavel}
              onClick={() => onIrPara(p.id)}
            >
              <span className="ger-step-badge">{feito ? <Icon name="check" size={13} /> : p.numero}</span>
              <span className="ger-step-label">{p.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
