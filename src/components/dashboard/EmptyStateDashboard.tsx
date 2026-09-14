import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

// Réplica do Painel em produção antes de conectar qualquer marketplace — ver
// print anexado por João em 02/09/2026. Ações ainda não integradas (Mercado
// Livre, Gerador de anúncios) caem num alert, igual a outros pontos do app
// que já sinalizam "em breve" dessa forma.
function emBreve(recurso: string) {
  alert(`Em breve: ${recurso}.`);
}

export default function EmptyStateDashboard({ onIrParaCalculadora }: { onIrParaCalculadora: () => void }) {
  const { t } = useI18n();
  return (
    <>
      <div className="onb-proximo-card">
        <div className="onb-proximo-content">
          <div className="onb-tag"><span className="onb-dot" />{t('dashboard.proximoPasso')}</div>
          <h2>{t('dashboard.conecteMercadoLivre')}</h2>
          <p>{t('dashboard.conecteMercadoLivreDesc')}</p>
          <button type="button" className="btn-dark pill" onClick={() => emBreve('conexão com o Mercado Livre')}>{t('dashboard.conectarMercadoLivre')}</button>
        </div>
        <div className="onb-ml-badge">ML</div>
      </div>

      <div className="onb-promo-banner">
        <div className="onb-promo-content">
          <div className="onb-tag onb-tag-light"><span className="onb-dot onb-dot-light" />{t('dashboard.featurePrincipalAtiva')}</div>
          <h2>{t('dashboard.geradorAnunciosIA')}</h2>
          <p>{t('dashboard.geradorAnunciosIADesc')}</p>
          <button type="button" className="btn-dark pill" onClick={() => emBreve('o gerador de anúncios com IA')}>{t('dashboard.gerarAnuncio')}</button>
        </div>
        <div className="onb-cardfan">
          <div className="onb-card onb-card-1">
            <span className="onb-card-chip">{t('dashboard.concluido')}</span>
            <div className="onb-card-title">Triceratops</div>
            <div className="onb-card-meta">28 mai · PT · 120 créditos</div>
          </div>
          <div className="onb-card onb-card-2">
            <span className="onb-card-chip">{t('dashboard.premium')}</span>
            <div className="onb-card-title">Antyferno</div>
            <div className="onb-card-meta">4 fev · PT · 120 créditos</div>
          </div>
          <div className="onb-card onb-card-3">
            <span className="onb-card-chip">{t('dashboard.premium')}</span>
            <div className="onb-card-title">Frost Dragon</div>
            <div className="onb-card-meta">10 abr · PT · 120 créditos</div>
          </div>
        </div>
      </div>

      <div className="onb-features-row">
        <div className="onb-feature-card">
          <div className="onb-feature-icon"><Icon name="clock" size={20} /></div>
          <h3>{t('dashboard.gerencie')} <span className="accent">{t('dashboard.pedidosEEstoque')}</span></h3>
          <p>{t('dashboard.personalizePrecosPerfil')}</p>
          <button type="button" className="btn-dark pill" onClick={() => emBreve('conexão com o Mercado Livre')}>{t('dashboard.conectarMercadoLivre')}</button>
        </div>
        <div className="onb-feature-card">
          <div className="onb-feature-icon"><Icon name="calculadora" size={20} /></div>
          <h3>{t('dashboard.calculadora')} <span className="accent">{t('dashboard.dePrecos')}</span></h3>
          <p>{t('dashboard.calculePrecoJusto')}</p>
          <button type="button" className="btn-dark pill" onClick={onIrParaCalculadora}>{t('dashboard.calculeAgora')}</button>
        </div>
      </div>
    </>
  );
}
