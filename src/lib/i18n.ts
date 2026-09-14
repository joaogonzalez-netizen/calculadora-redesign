// Dicionário de tradução — infraestrutura de i18n do STLSeller.
// Cobre por enquanto a navegação (Sidebar/Topbar) e o Painel — o resto do
// app continua em português. Chave "namespace.campo", sempre com fallback
// pra pt-BR se a chave não existir no idioma ativo (ver useI18n em
// I18nContext.tsx). Pra estender: adicione a chave nova nos 3 idiomas aqui,
// depois troque o texto fixo pelo t('chave') no componente.
export type Idioma = 'pt' | 'en' | 'es';

export const IDIOMA_PADRAO: Idioma = 'pt';
export const IDIOMA_STORAGE_KEY = 'stlseller_idioma';

export const IDIOMAS_DISPONIVEIS: { id: Idioma; label: string; bandeira: string }[] = [
  { id: 'pt', label: 'Português', bandeira: '🇧🇷' },
  { id: 'en', label: 'English', bandeira: '🇺🇸' },
  { id: 'es', label: 'Español', bandeira: '🇪🇸' },
];

type Dicionario = Record<string, string>;

const pt: Dicionario = {
  'nav.onboarding': 'Onboarding',
  'nav.primeirosPassos': 'Primeiros passos',
  'nav.principal': 'Principal',
  'nav.painel': 'Painel',
  'nav.pedidos': 'Pedidos',
  'nav.produtos': 'Produtos',
  'nav.ferramentas': 'Ferramentas',
  'nav.geradorAnuncios': 'Gerador de anúncios',
  'nav.calculadoraPrecos': 'Calculadora de preços',
  'nav.buscadorProdutos': 'Buscador de produtos',
  'nav.novaCalculadora': 'Nova calculadora',
  'nav.historico': 'Histórico',
  'nav.preferencias': 'Preferências',
  'nav.criarAnuncio': 'Criar Anúncio',
  'nav.meusAnuncios': 'Meus Anúncios',
  'nav.emBrevePorAqui': 'Em breve por aqui',
  'nav.otimizador': 'Otimizador',
  'nav.emBreveBadge': 'EM BREVE',
  'nav.sistema': 'Sistema',
  'nav.configuracoes': 'Configurações',
  'nav.integracoes': 'Integrações',
  'nav.expandirMenu': 'Expandir menu',
  'nav.recolherMenu': 'Recolher menu',

  'topbar.creditos': 'créditos',
  'topbar.notificacoes': 'Notificações',
  'topbar.title.dashboard': 'Painel',
  'topbar.title.produtos': 'Produtos',
  'topbar.title.calculadora': 'Calculadora de preços',
  'topbar.title.historico': 'Histórico',
  'topbar.title.preferencias': 'Preferências',
  'topbar.title.configuracoes': 'Configurações',
  'topbar.title.primeirospassos': 'Primeiros passos',
  'topbar.title.gerador-criar': 'Gerar anúncio',
  'topbar.title.gerador-meus': 'Meus anúncios',
  'topbar.title.pedidos': 'Pedidos',

  'idioma.selecionarIdioma': 'Idioma',

  'dashboard.visualizacao': 'Visualização:',
  'dashboard.comDados': 'Com dados',
  'dashboard.vazioMarketplace': 'Empty · Marketplace 1º',
  'dashboard.vazioFerramentas': 'Empty · Ferramentas 1º',
};

const en: Dicionario = {
  'nav.onboarding': 'Onboarding',
  'nav.primeirosPassos': 'Getting started',
  'nav.principal': 'Main',
  'nav.painel': 'Dashboard',
  'nav.pedidos': 'Orders',
  'nav.produtos': 'Products',
  'nav.ferramentas': 'Tools',
  'nav.geradorAnuncios': 'Ad generator',
  'nav.calculadoraPrecos': 'Price calculator',
  'nav.buscadorProdutos': 'Product finder',
  'nav.novaCalculadora': 'New calculation',
  'nav.historico': 'History',
  'nav.preferencias': 'Preferences',
  'nav.criarAnuncio': 'Create ad',
  'nav.meusAnuncios': 'My ads',
  'nav.emBrevePorAqui': 'Coming soon',
  'nav.otimizador': 'Optimizer',
  'nav.emBreveBadge': 'COMING SOON',
  'nav.sistema': 'System',
  'nav.configuracoes': 'Settings',
  'nav.integracoes': 'Integrations',
  'nav.expandirMenu': 'Expand menu',
  'nav.recolherMenu': 'Collapse menu',

  'topbar.creditos': 'credits',
  'topbar.notificacoes': 'Notifications',
  'topbar.title.dashboard': 'Dashboard',
  'topbar.title.produtos': 'Products',
  'topbar.title.calculadora': 'Price calculator',
  'topbar.title.historico': 'History',
  'topbar.title.preferencias': 'Preferences',
  'topbar.title.configuracoes': 'Settings',
  'topbar.title.primeirospassos': 'Getting started',
  'topbar.title.gerador-criar': 'Generate ad',
  'topbar.title.gerador-meus': 'My ads',
  'topbar.title.pedidos': 'Orders',

  'idioma.selecionarIdioma': 'Language',

  'dashboard.visualizacao': 'View:',
  'dashboard.comDados': 'With data',
  'dashboard.vazioMarketplace': 'Empty · Marketplace 1st',
  'dashboard.vazioFerramentas': 'Empty · Tools 1st',
};

const es: Dicionario = {
  'nav.onboarding': 'Onboarding',
  'nav.primeirosPassos': 'Primeros pasos',
  'nav.principal': 'Principal',
  'nav.painel': 'Panel',
  'nav.pedidos': 'Pedidos',
  'nav.produtos': 'Productos',
  'nav.ferramentas': 'Herramientas',
  'nav.geradorAnuncios': 'Generador de anuncios',
  'nav.calculadoraPrecos': 'Calculadora de precios',
  'nav.buscadorProdutos': 'Buscador de productos',
  'nav.novaCalculadora': 'Nueva calculadora',
  'nav.historico': 'Historial',
  'nav.preferencias': 'Preferencias',
  'nav.criarAnuncio': 'Crear anuncio',
  'nav.meusAnuncios': 'Mis anuncios',
  'nav.emBrevePorAqui': 'Próximamente',
  'nav.otimizador': 'Optimizador',
  'nav.emBreveBadge': 'PRÓXIMAMENTE',
  'nav.sistema': 'Sistema',
  'nav.configuracoes': 'Configuración',
  'nav.integracoes': 'Integraciones',
  'nav.expandirMenu': 'Expandir menú',
  'nav.recolherMenu': 'Contraer menú',

  'topbar.creditos': 'créditos',
  'topbar.notificacoes': 'Notificaciones',
  'topbar.title.dashboard': 'Panel',
  'topbar.title.produtos': 'Productos',
  'topbar.title.calculadora': 'Calculadora de precios',
  'topbar.title.historico': 'Historial',
  'topbar.title.preferencias': 'Preferencias',
  'topbar.title.configuracoes': 'Configuración',
  'topbar.title.primeirospassos': 'Primeros pasos',
  'topbar.title.gerador-criar': 'Generar anuncio',
  'topbar.title.gerador-meus': 'Mis anuncios',
  'topbar.title.pedidos': 'Pedidos',

  'idioma.selecionarIdioma': 'Idioma',

  'dashboard.visualizacao': 'Vista:',
  'dashboard.comDados': 'Con datos',
  'dashboard.vazioMarketplace': 'Vacío · Marketplace 1º',
  'dashboard.vazioFerramentas': 'Vacío · Herramientas 1º',
};

export const DICIONARIOS: Record<Idioma, Dicionario> = { pt, en, es };

export function traduzir(idioma: Idioma, chave: string): string {
  return DICIONARIOS[idioma][chave] ?? DICIONARIOS[IDIOMA_PADRAO][chave] ?? chave;
}
