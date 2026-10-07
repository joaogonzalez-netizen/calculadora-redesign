import { useCalculadora } from '../context/CalculadoraContext';
import { useI18n } from '../context/I18nContext';
import Card from './Card';

export default function ModeloCard() {
  const { state, set, errorIds } = useCalculadora();
  const { t } = useI18n();

  return (
    <Card icon="◆" title={t('calc.modelo')}>
      <div className="field">
        <label>{t('calc.nomeDoStl')}</label>
        <input
          id="nomePeca"
          type="text"
          placeholder={t('calc.placeholderNomeStl')}
          value={state.nomePeca}
          onChange={(e) => set('nomePeca', e.target.value)}
          className={errorIds.has('nomePeca') ? 'input-error' : ''}
        />
      </div>

      <div className="divider-label">{t('calc.adicioneFonteModelo')}</div>

      <div className="field">
        <label>{t('calc.linkBiblioteca')}</label>
        <input type="url" placeholder={t('calc.placeholderLinkBiblioteca')} value={state.stlLink} onChange={(e) => set('stlLink', e.target.value)} />
      </div>
      <div className="field">
        <label>{t('calc.referenciaConcorrente')}</label>
        <input type="url" placeholder={t('calc.placeholderReferenciaConcorrente')} value={state.concorrenteLink} onChange={(e) => set('concorrenteLink', e.target.value)} />
      </div>
      <div className="field">
        <label>{t('calc.linkAnuncioPublicado')}</label>
        <input type="url" placeholder={t('calc.placeholderLinkAnuncio')} value={state.anuncioLink} onChange={(e) => set('anuncioLink', e.target.value)} />
      </div>
    </Card>
  );
}
