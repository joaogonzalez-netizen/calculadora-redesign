import { useState } from 'react';
import type { ProdutoBusca } from '../../lib/buscadorMock';
import { CATEGORIAS_FINDER, MAX_TEXTO_REPORT, sugerirCategorias, type MotivoReport, type NovoReport } from '../../lib/finderReports';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

interface Props {
  produto: ProdutoBusca;
  restantes: number;
  onClose: () => void;
  onEnviar: (report: NovoReport) => void;
}

const MOTIVOS: { id: MotivoReport; chave: string }[] = [
  { id: 'nao3d', chave: 'report.motivo.nao3d' },
  { id: 'categoria', chave: 'report.motivo.categoria' },
  { id: 'outro', chave: 'report.motivo.outro' },
];

export default function ReportarItemModal({ produto, restantes, onClose, onEnviar }: Props) {
  const { t } = useI18n();
  const sugeridas = sugerirCategorias(produto.nome);
  const [motivo, setMotivo] = useState<MotivoReport | null>(null);
  const [categoria, setCategoria] = useState('');
  const [texto, setTexto] = useState('');

  const valido =
    motivo === 'nao3d' ||
    (motivo === 'categoria' && categoria !== '') ||
    (motivo === 'outro' && texto.trim() !== '');

  function enviar() {
    if (!motivo || !valido) return;
    onEnviar({
      produtoId: produto.id,
      motivo,
      categoriaSugerida: motivo === 'categoria' ? sugeridas[0] : undefined,
      categoriaEscolhida: motivo === 'categoria' ? categoria : undefined,
      texto: motivo === 'outro' ? texto : undefined,
    });
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="modal-center modal-center-lg busc-report-modal" role="dialog" aria-modal="true" aria-label={t('report.titulo')}>
        <button type="button" className="modal-levar-x" onClick={onClose} aria-label={t('report.cancelar')}><Icon name="close" size={18} /></button>
        <h4>{t('report.titulo')}</h4>
        <p>{t('report.subtitulo')}</p>

        <div className="busc-report-item">
          <span className="busc-report-emoji">{produto.imagem}</span>
          <span className="busc-report-nome">{produto.nome}</span>
        </div>

        <div className="busc-report-bloco">
          <div className="busc-report-label">{t('report.motivo')}</div>
          <div className="busc-report-opcoes" role="radiogroup" aria-label={t('report.motivo')}>
            {MOTIVOS.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={motivo === m.id}
                className={'busc-report-opcao' + (motivo === m.id ? ' active' : '')}
                onClick={() => setMotivo(m.id)}
              >
                <span className="busc-report-radio" />
                {t(m.chave)}
              </button>
            ))}
          </div>
        </div>

        {motivo === 'categoria' && (
          <div className="busc-report-bloco">
            <div className="busc-report-label">{t('report.categoria')}</div>
            <div className="busc-report-sub">{t('report.categoriaSugeridas')}</div>
            <div className="busc-report-chips">
              {sugeridas.map((c) => (
                <button key={c} type="button" className={'busc-report-chip' + (categoria === c ? ' active' : '')} onClick={() => setCategoria(c)}>{c}</button>
              ))}
            </div>
            <div className="busc-report-sub">{t('report.categoriaTodas')}</div>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label={t('report.categoriaTodas')}>
              <option value="">{t('report.categoriaEscolher')}</option>
              {CATEGORIAS_FINDER.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {motivo === 'outro' && (
          <div className="busc-report-bloco">
            <label className="busc-report-label" htmlFor="report-texto">{t('report.texto')}</label>
            <textarea
              id="report-texto"
              value={texto}
              maxLength={MAX_TEXTO_REPORT}
              placeholder={t('report.textoPlaceholder')}
              onChange={(e) => setTexto(e.target.value)}
            />
            <div className="busc-report-contador">{texto.length}/{MAX_TEXTO_REPORT}</div>
          </div>
        )}

        <div className="alert busc-report-aviso">{t('report.aviso')}</div>

        <div className="busc-report-footer">
          <span className="hint">{restantes} {t('report.restantes')}</span>
          <div className="cl-footer">
            <button type="button" className="btn-outline" onClick={onClose}>{t('report.cancelar')}</button>
            <button type="button" className="btn-dark cl-btn-sm" disabled={!valido} onClick={enviar}>{t('report.enviar')}</button>
          </div>
        </div>
      </div>
    </>
  );
}
