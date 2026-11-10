import type { View } from '../App';
import { useI18n } from '../context/I18nContext';
import Icon from './Icon';

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
  'finder-reports': 'topbar.title.finder-reports',
  assistente: 'topbar.title.assistente',
  'marketing-logo': 'topbar.title.marketing-logo',
  'marketing-banners': 'topbar.title.marketing-banners',
  'marketing-etiquetas': 'topbar.title.marketing-etiquetas',
  'marketing-decoracao': 'topbar.title.marketing-decoracao',
  'feiras-painel': 'topbar.title.feiras-painel',
  'feiras-negocios': 'topbar.title.feiras-negocios',
  'feiras-clientes': 'topbar.title.feiras-clientes',
  'feiras-catalogo': 'topbar.title.feiras-catalogo',
  'feiras-eventos': 'topbar.title.feiras-eventos',
  'feiras-prospeccao': 'topbar.title.feiras-prospeccao',
  'fila-pedidos': 'topbar.title.fila-pedidos',
};

interface Props {
  view: View;
  // Só no Assistente com conversa aberta: botão de começar uma conversa nova.
  onNovaConversa?: () => void;
}

// Com o novo header (logo, ecossistema, créditos e conta), a barra de título
// só aparece quando há uma ação própria da tela: nova conversa no Assistente.
export default function Topbar({ view, onNovaConversa }: Props) {
  const { t } = useI18n();
  if (!onNovaConversa) return null;
  return (
    <div className="topbar">
      <div className="topbar-titulo">
        <h2>{t(CHAVES_TITULO[view])}</h2>
        <button type="button" className="topbar-nova-conversa" onClick={onNovaConversa}>
          <Icon name="pencil" size={14} /> {t('assist.novaConversa')}
        </button>
      </div>
    </div>
  );
}
