import { useState, type ChangeEvent } from 'react';
import { useCalculadora, novoFilamentoItem } from '../context/CalculadoraContext';
import { useI18n } from '../context/I18nContext';
import Card from './Card';

export default function ModeloCard() {
  const { state, set, errorIds } = useCalculadora();
  const { t } = useI18n();
  const [status, setStatus] = useState(t('calc.statusCarregueGcode'));

  function handleGcode(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus(t('calc.statusLendoArquivo'));
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '');
      const timeMatch = text.match(/;\s*estimated printing time.*?(\d+)h\s*(\d+)m/i) || text.match(/;\s*estimated printing time.*?(\d+)m/i);
      const filMatch = text.match(/;\s*filament used\s*\[g\]\s*=\s*([\d.]+)/i) || text.match(/;\s*filament used.*?=\s*([\d.]+)\s*g/i);
      let found = false;
      if (timeMatch) {
        if (timeMatch.length === 3) {
          set('horasImpressao', parseInt(timeMatch[1], 10));
          set('minutosImpressao', parseInt(timeMatch[2], 10));
        } else {
          set('horasImpressao', 0);
          set('minutosImpressao', parseInt(timeMatch[1], 10));
        }
        found = true;
      }
      if (filMatch) {
        const pesoExtraido = parseFloat(filMatch[1]);
        if (state.filamentoItems.length) {
          const copia = [...state.filamentoItems];
          copia[0] = { ...copia[0], pesoG: pesoExtraido };
          set('filamentoItems', copia);
        } else {
          set('filamentoItems', [novoFilamentoItem('', '', 0, pesoExtraido)]);
        }
        found = true;
      }
      setStatus(found ? t('calc.statusTempoPesoExtraidos') : t('calc.statusDadosNaoEncontrados'));
    };
    reader.onerror = () => setStatus(t('calc.statusErroLerArquivo'));
    reader.readAsText(file);
  }

  return (
    <Card icon="◆" title={t('calc.modelo')}>
      <div className="field">
        <label>{t('calc.nomeDoStl')}</label>
        <input
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

      <div className="divider-label">{t('calc.ouCarregueGcode')}</div>

      <div className="dropzone">
        <div className="dz-ic">⇪</div>
        <div className="dz-text">
          <b>{status}</b>
          <span>{t('calc.arrasteOuClique')}</span>
        </div>
        <button type="button" onClick={() => document.getElementById('gcodeInput')?.click()}>{t('calc.escolherArquivo')}</button>
        <input type="file" id="gcodeInput" accept=".gcode,.bgcode,.gco,.nc" className="hidden" onChange={handleGcode} />
      </div>
    </Card>
  );
}
