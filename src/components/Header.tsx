import { linkEcossistema } from '../lib/headerLinks';
import { useI18n } from '../context/I18nContext';
import IdiomaSwitcher from './IdiomaSwitcher';
import logo from '../assets/header/logo-stlseller.svg';
import iconFeedback from '../assets/header/icon-feedback.svg';
import iconLoja from '../assets/header/icon-loja.svg';
import iconCursos from '../assets/header/icon-cursos.svg';
import iconSino from '../assets/header/icon-sino.svg';
import iconUsuario from '../assets/header/icon-usuario.svg';

export default function Header() {
  const { t, idioma } = useI18n();
  return (
    <header className="app-header">
      <div className="app-header-bar">
        <div className="app-header-left">
          <img className="app-header-logo" src={logo} alt="STLSELLER" width={146.896} height={32} />
          <span className="app-header-divider" aria-hidden="true" />
          <nav className="eco-pills" aria-label="STLFLIX">
            <a className="eco-pill eco-stlflix" href={linkEcossistema('stlflix', idioma)} target="_blank" rel="noopener noreferrer">STLFLIX</a>
            <a className="eco-pill eco-stlai" href={linkEcossistema('stlai', idioma)} target="_blank" rel="noopener noreferrer">STLAI</a>
            <a className="eco-pill eco-stlacademy" href={linkEcossistema('academy', idioma)} target="_blank" rel="noopener noreferrer">STLACADEMY</a>
          </nav>
          <span className="app-header-divider" aria-hidden="true" />
          <button type="button" className="header-loja">
            <img src={iconLoja} alt="" width={15} height={16} />
            <span>{t('header.loja')}</span>
          </button>
          <a className="header-cursos" href={linkEcossistema('cursos', idioma)} target="_blank" rel="noopener noreferrer">
            <img src={iconCursos} alt="" width={21.884} height={16} />
            <span>{t('header.cursosAoVivo')}</span>
          </a>
        </div>
        <div className="app-header-actions">
          <button type="button" className="header-pill">
            <img src={iconFeedback} alt="" width={16} height={16} />
            <span>{t('header.feedback')}</span>
          </button>
          <IdiomaSwitcher />
          <button type="button" className="header-icon-btn header-sino" aria-label={t('topbar.notificacoes')}>
            <img src={iconSino} alt="" width={20} height={20} />
            <span className="header-sino-dot" />
          </button>
          <button type="button" className="header-icon-btn" aria-label={t('header.usuario')}>
            <img src={iconUsuario} alt="" width={18} height={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
