import { USUARIO } from '../lib/dashboardMock';
import { marcarOnboardingManual } from '../lib/onboarding';
import Icon, { type IconName } from '../components/Icon';

interface Passo {
  id: 'buscador' | 'calculadora' | 'gerador' | 'marketplace';
  numero: number;
  titulo: string;
  descricao: string;
  icone: IconName;
  cta: string;
}

const PASSOS: Passo[] = [
  { id: 'buscador', numero: 1, titulo: 'Buscador de produtos', descricao: 'Favorite seus principais produtos nos marketplaces.', icone: 'buscador', cta: 'Ir para o Buscador' },
  { id: 'calculadora', numero: 2, titulo: 'Calculadora de preços', descricao: 'Calcule o preço justo de pelo menos uma peça.', icone: 'calculadora', cta: 'Calcular agora' },
  { id: 'gerador', numero: 3, titulo: 'Gerador de anúncios', descricao: 'Gere um anúncio com IA pra um dos seus produtos.', icone: 'gerador', cta: 'Gerar anúncio' },
  { id: 'marketplace', numero: 4, titulo: 'Conectar marketplace', descricao: 'Conecte um marketplace pra sincronizar pedidos e estoque.', icone: 'integracoes', cta: 'Conectar marketplace' },
];

interface Props {
  passosCompletos: Record<Passo['id'], boolean>;
  onIrParaCalculadora: () => void;
  onIrParaConfiguracoes: () => void;
  onAtualizarPassos: () => void;
}

export default function PrimeirosPassosView({ passosCompletos, onIrParaCalculadora, onIrParaConfiguracoes, onAtualizarPassos }: Props) {
  const totalCompletos = PASSOS.filter((p) => passosCompletos[p.id]).length;

  function acionar(passo: Passo) {
    if (passo.id === 'buscador') { alert('Em breve: buscador de produtos.'); marcarOnboardingManual('buscador'); onAtualizarPassos(); return; }
    if (passo.id === 'calculadora') { onIrParaCalculadora(); return; }
    if (passo.id === 'gerador') { alert('Em breve: o gerador de anúncios com IA.'); marcarOnboardingManual('gerador'); onAtualizarPassos(); return; }
    if (passo.id === 'marketplace') { onIrParaConfiguracoes(); return; }
  }

  return (
    <div>
      <div className="hero">
        <h1>Bem-vindo, <span className="accent">{USUARIO.primeiroNome}</span></h1>
        <p>Complete os passos abaixo pra tirar o máximo proveito da plataforma. Leva menos de 5 minutos.</p>
      </div>

      <div className="passos-progresso-row">
        <div className="passos-progresso-bar"><div className="passos-progresso-fill" style={{ width: `${(totalCompletos / PASSOS.length) * 100}%` }} /></div>
        <span className="hint passos-progresso-label">{totalCompletos} de {PASSOS.length} concluídos</span>
      </div>

      <div className="passos-grid">
        {PASSOS.map((p) => {
          const completo = passosCompletos[p.id];
          return (
            <div className={'passo-card' + (completo ? ' completo' : '')} key={p.id}>
              <div className="passo-head">
                <span className="passo-numero">{completo ? <Icon name="check" size={14} /> : p.numero}</span>
                <div className="passo-icone"><Icon name={p.icone} size={20} /></div>
              </div>
              <h3>{p.titulo}</h3>
              <p>{p.descricao}</p>
              {completo ? (
                <div className="passo-feito"><Icon name="check" size={14} /> Concluído</div>
              ) : (
                <button type="button" className="btn-dark pill" onClick={() => acionar(p)}>{p.cta}</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
