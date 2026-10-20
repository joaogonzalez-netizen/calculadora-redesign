import { useI18n } from '../context/I18nContext';

export default function AppFooter() {
  const { t } = useI18n();
  return (
    <div className="app-footer">
      <span>© STLSELLER · {t('footer.ecossistema')}</span>
      <span className="app-footer-links">
        <a href="#termos">{t('footer.termos')}</a>
        <a href="#privacidade">{t('footer.privacidade')}</a>
      </span>
    </div>
  );
}
