import type { View } from '../App';
import { CREDITOS } from '../lib/dashboardMock';
import { useI18n } from '../context/I18nContext';
import Icon from './Icon';
import IdiomaSwitcher from './IdiomaSwitcher';

const CHAVES_TITULO: Record<View, string> = {
  dashboard: 'topbar.title.dashboard',
  produtos: 'topbar.title.produtos',
  calculadora: 'topbar.title.calculadora',
  historico: 'topbar.title.historico',
  preferencias: 'topbar.title.preferencias',
  configuracoes: 'topbar.title.configuracoes',
  primeirospassos: 'topbar.title.primeirospassos',
  'gerador-criar': 'topbar.title.gerador-criar',
  'gerador-meus': 'topbar.title.gerador-meus',
  pedidos: 'topbar.title.pedidos',
  buscador: 'topbar.title.buscador',
  assistente: 'topbar.title.assistente',
};

export default function Topbar({ view }: { view: View }) {
  const { t } = useI18n();
  return (
    <div className="topbar">
      <h2>{t(CHAVES_TITULO[view])}</h2>
      <div className="top-actions">
        <IdiomaSwitcher />
        <div className="credits-pill">
          <Icon name="creditos" size={15} />
          <b>{CREDITOS}</b> <span>{t('topbar.creditos')}</span>
        </div>
        <button type="button" className="bell" aria-label={t('topbar.notificacoes')}>
          <Icon name="sino" size={17} />
          <span className="bell-dot" />
        </button>
      </div>
    </div>
  );
}
