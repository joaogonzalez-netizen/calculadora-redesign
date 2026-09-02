import Icon from '../Icon';

// Réplica do Painel em produção antes de conectar qualquer marketplace — ver
// print anexado por João em 02/09/2026. Ações ainda não integradas (Mercado
// Livre, Gerador de anúncios) caem num alert, igual a outros pontos do app
// que já sinalizam "em breve" dessa forma.
function emBreve(recurso: string) {
  alert(`Em breve: ${recurso}.`);
}

export default function EmptyStateDashboard({ onIrParaCalculadora }: { onIrParaCalculadora: () => void }) {
  return (
    <>
      <div className="onb-proximo-card">
        <div className="onb-proximo-content">
          <div className="onb-tag"><span className="onb-dot" />PRÓXIMO PASSO</div>
          <h2>Conecte o Mercado Livre para começar</h2>
          <p>Importamos seus anúncios e pedidos em alguns segundos. A partir daí o gerador, o histórico e os pedidos passam a funcionar com seus dados reais.</p>
          <button type="button" className="btn-dark pill" onClick={() => emBreve('conexão com o Mercado Livre')}>Conectar Mercado Livre</button>
        </div>
        <div className="onb-ml-badge">ML</div>
      </div>

      <div className="onb-promo-banner">
        <div className="onb-promo-content">
          <div className="onb-tag onb-tag-light"><span className="onb-dot onb-dot-light" />FEATURE PRINCIPAL · ATIVA</div>
          <h2>Gerador de anúncios com IA</h2>
          <p>Envie fotos do produto ou selecione um modelo 3D — e gere textos, imagens em diferentes contextos e vídeos narrados prontos pra publicar. Tudo no tom certo pro seu público.</p>
          <button type="button" className="btn-dark pill" onClick={() => emBreve('o gerador de anúncios com IA')}>Gerar anúncio</button>
        </div>
        <div className="onb-cardfan">
          <div className="onb-card onb-card-1">
            <span className="onb-card-chip">Concluído</span>
            <div className="onb-card-title">Triceratops</div>
            <div className="onb-card-meta">28 mai · PT · 120 créditos</div>
          </div>
          <div className="onb-card onb-card-2">
            <span className="onb-card-chip">Premium</span>
            <div className="onb-card-title">Antyferno</div>
            <div className="onb-card-meta">4 fev · PT · 120 créditos</div>
          </div>
          <div className="onb-card onb-card-3">
            <span className="onb-card-chip">Premium</span>
            <div className="onb-card-title">Frost Dragon</div>
            <div className="onb-card-meta">10 abr · PT · 120 créditos</div>
          </div>
        </div>
      </div>

      <div className="onb-features-row">
        <div className="onb-feature-card">
          <div className="onb-feature-icon"><Icon name="clock" size={20} /></div>
          <h3>Gerencie <span className="accent">pedidos e seu estoque</span></h3>
          <p>Personalize preços por perfil de cliente.</p>
          <button type="button" className="btn-dark pill" onClick={() => emBreve('conexão com o Mercado Livre')}>Conectar Mercado Livre</button>
        </div>
        <div className="onb-feature-card">
          <div className="onb-feature-icon"><Icon name="calculadora" size={20} /></div>
          <h3>Calculadora <span className="accent">de preços</span></h3>
          <p>Calcule o preço justo de cada peça</p>
          <button type="button" className="btn-dark pill" onClick={onIrParaCalculadora}>Calcule agora</button>
        </div>
      </div>
    </>
  );
}
