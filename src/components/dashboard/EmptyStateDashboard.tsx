import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

// Réplica do Painel em produção antes de conectar qualquer marketplace, ver
// print anexado por João em 02/09/2026. Ações ainda não integradas (Mercado
// Livre, Gerador de anúncios) caem num alert, igual a outros pontos do app
// que já sinalizam "em breve" dessa forma.
function emBreve(recurso: string) {
  alert(`Em breve: ${recurso}.`);
}
function comingSoon(recurso: string) {
  alert(`Coming soon: ${recurso}.`);
}

// Na versão EN (mercado americano) o marketplace de entrada é o Etsy, nunca o
// Mercado Livre; as chaves do dicionário citam o ML, então o texto EN fica aqui.
const CONECTE_ETSY = 'Connect Etsy to get started';
const CONECTAR_ETSY = 'Connect Etsy';

export default function EmptyStateDashboard({ onIrParaCalculadora }: { onIrParaCalculadora: () => void }) {
  const { t, idioma } = useI18n();
  const en = idioma === 'en';
  const conectarMarketplace = () => (en ? comingSoon('Etsy connection') : emBreve('conexão com o Mercado Livre'));
  const metaCard = (pt: string, us: string) => (en ? us : pt);
  return (
    <>
      <div className="onb-proximo-card">
        <div className="onb-proximo-content">
          <div className="onb-tag"><span className="onb-dot" />{t('dashboard.proximoPasso')}</div>
          <h2>{en ? CONECTE_ETSY : t('dashboard.conecteMercadoLivre')}</h2>
          <p>{t('dashboard.conecteMercadoLivreDesc')}</p>
          <button type="button" className="btn-dark pill" onClick={conectarMarketplace}>{en ? CONECTAR_ETSY : t('dashboard.conectarMercadoLivre')}</button>
        </div>
        {en
          ? <div className="onb-ml-badge" style={{ background: '#f1641e', color: '#ffffff' }}>Etsy</div>
          : <div className="onb-ml-badge">ML</div>}
      </div>

      <div className="onb-promo-banner">
        <div className="onb-promo-content">
          <div className="onb-tag onb-tag-light"><span className="onb-dot onb-dot-light" />{t('dashboard.featurePrincipalAtiva')}</div>
          <h2>{t('dashboard.geradorAnunciosIA')}</h2>
          <p>{t('dashboard.geradorAnunciosIADesc')}</p>
          <button type="button" className="btn-dark pill" onClick={() => (en ? comingSoon('the AI listing generator') : emBreve('o gerador de anúncios com IA'))}>{t('dashboard.gerarAnuncio')}</button>
        </div>
        <div className="onb-cardfan">
          <div className="onb-card onb-card-1">
            <span className="onb-card-chip">{t('dashboard.concluido')}</span>
            <div className="onb-card-title">Triceratops</div>
            <div className="onb-card-meta">{metaCard('28 mai · PT · 120 créditos', 'May 28 · EN · 120 credits')}</div>
          </div>
          <div className="onb-card onb-card-2">
            <span className="onb-card-chip">{t('dashboard.premium')}</span>
            <div className="onb-card-title">Antyferno</div>
            <div className="onb-card-meta">{metaCard('4 fev · PT · 120 créditos', 'Feb 4 · EN · 120 credits')}</div>
          </div>
          <div className="onb-card onb-card-3">
            <span className="onb-card-chip">{t('dashboard.premium')}</span>
            <div className="onb-card-title">Frost Dragon</div>
            <div className="onb-card-meta">{metaCard('10 abr · PT · 120 créditos', 'Apr 10 · EN · 120 credits')}</div>
          </div>
        </div>
      </div>

      <div className="onb-features-row">
        <div className="onb-feature-card">
          <div className="onb-feature-icon"><Icon name="clock" size={20} /></div>
          <h3>{t('dashboard.gerencie')} <span className="accent">{t('dashboard.pedidosEEstoque')}</span></h3>
          <p>{t('dashboard.personalizePrecosPerfil')}</p>
          <button type="button" className="btn-dark pill" onClick={conectarMarketplace}>{en ? CONECTAR_ETSY : t('dashboard.conectarMercadoLivre')}</button>
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
