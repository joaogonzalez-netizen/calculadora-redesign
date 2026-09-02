import Icon from '../Icon';

// Variante B do empty state — teste pra validar a hipótese do funil de adoção:
// Gerador de anúncios e Calculadora têm muito mais uso do que a conexão de
// marketplace (que concentra a maior queda do funil). Aqui as duas ferramentas
// que não dependem de integração alguma viram a entrada principal, e "conectar
// marketplace" vira um passo opcional e discreto lá embaixo.
function emBreve(recurso: string) {
  alert(`Em breve: ${recurso}.`);
}

export default function EmptyStateFerramentas({ onIrParaCalculadora }: { onIrParaCalculadora: () => void }) {
  return (
    <>
      <div className="onb-tools-row">
        <div className="onb-tool-card onb-tool-gerador">
          <div className="onb-tag onb-tag-light"><span className="onb-dot onb-dot-light" />FEATURE MAIS USADA</div>
          <h2>Gerador de anúncios com IA</h2>
          <p>Envie fotos do produto ou selecione um modelo 3D — gere textos, imagens e vídeos prontos pra publicar. Comece sem precisar conectar nada.</p>
          <button type="button" className="btn-dark pill" onClick={() => emBreve('o gerador de anúncios com IA')}>Gerar anúncio</button>

          <div className="onb-cardfan onb-cardfan-sm">
            <div className="onb-card onb-card-1">
              <span className="onb-card-chip">Concluído</span>
              <div className="onb-card-title">Triceratops</div>
              <div className="onb-card-meta">28 mai · PT</div>
            </div>
            <div className="onb-card onb-card-2">
              <span className="onb-card-chip">Premium</span>
              <div className="onb-card-title">Frost Dragon</div>
              <div className="onb-card-meta">10 abr · PT</div>
            </div>
          </div>
        </div>

        <div className="onb-tool-card onb-tool-calc">
          <div className="onb-tag onb-tag-light"><span className="onb-dot onb-dot-light" />FEATURE MAIS USADA</div>
          <h2>Calculadora de preços</h2>
          <p>Calcule o preço justo de cada peça em segundos, com o custo real de material, energia e taxas — sem depender de nenhuma integração.</p>
          <button type="button" className="btn-dark pill" onClick={onIrParaCalculadora}>Calcule agora</button>

          <div className="onb-calc-deco">
            <Icon name="calculadora" size={16} />
            <div>
              <div className="onb-calc-deco-preco">R$ 39,90</div>
              <div className="onb-calc-deco-margem">margem 44%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="onb-secundario-card">
        <div>
          <div className="onb-tag onb-tag-muted">PASSO OPCIONAL</div>
          <h3>Quer sincronizar pedidos e estoque automaticamente?</h3>
          <p>Conecte o Mercado Livre pra importar seus anúncios e acompanhar vendas em tempo real. Não é obrigatório pra usar o gerador ou a calculadora.</p>
        </div>
        <button type="button" className="btn-outline" onClick={() => emBreve('conexão com o Mercado Livre')}>Conectar Mercado Livre</button>
      </div>
    </>
  );
}
