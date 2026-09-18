import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../context/I18nContext';
import {
  desenharBannerNoCanvas, baixarCanvasComoPng, getLogoAtual,
  getCreditosMock, descontarCreditosMock, CUSTO_CREDITOS, DIMENSOES_BANNER, type Plataforma,
} from '../lib/marketing';

const PLATAFORMAS: { id: Plataforma; label: string }[] = [
  { id: 'shopee', label: 'Shopee' },
  { id: 'mercado-livre', label: 'Mercado Livre' },
];

// V1 mockada — dimensões de referência, não oficiais (ver Seção 4.2 da spec).
export default function MarketingBannersView() {
  const { t } = useI18n();
  const [plataforma, setPlataforma] = useState<Plataforma | null>(null);
  const [nomeLoja, setNomeLoja] = useState('');
  const [textoDestaque, setTextoDestaque] = useState('');
  const [reaproveitarLogo, setReaproveitarLogo] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [gerado, setGerado] = useState(false);
  const [creditos, setCreditos] = useState(getCreditosMock);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const logoAtual = getLogoAtual();

  const custo = CUSTO_CREDITOS.banner;
  const semCredito = creditos < custo;
  const dimensao = plataforma ? DIMENSOES_BANNER[plataforma] : null;

  function gerar() {
    if (!plataforma || !nomeLoja.trim() || gerando || semCredito) return;
    setGerando(true);
    setTimeout(() => {
      setGerado(true);
      setCreditos(descontarCreditosMock(custo));
      setGerando(false);
    }, 900);
  }

  useEffect(() => {
    if (gerado && plataforma && previewRef.current) {
      desenharBannerNoCanvas(previewRef.current, plataforma, nomeLoja, textoDestaque, reaproveitarLogo ? logoAtual : null);
    }
  }, [gerado, plataforma, nomeLoja, textoDestaque, reaproveitarLogo, logoAtual]);

  function baixar() {
    if (!previewRef.current || !plataforma) return;
    const nomeArquivo = `banner-${plataforma}-${nomeLoja.trim().toLowerCase().replace(/\s+/g, '-') || 'stlseller'}.png`;
    baixarCanvasComoPng(previewRef.current, nomeArquivo);
  }

  return (
    <div>
      <div className="hero">
        <h1>{t('nav.geradorBanners')}</h1>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="field">
            <label>{t('marketing.banners.escolhaPlataforma')}</label>
            <div className="chip-row">
              {PLATAFORMAS.map((p) => (
                <button key={p.id} type="button" className={'chip' + (plataforma === p.id ? ' active' : '')} onClick={() => { setPlataforma(p.id); setGerado(false); }}>
                  {p.label}
                </button>
              ))}
            </div>
            {dimensao && (
              <span className="hint">
                {t('marketing.banners.dimensaoLabel').replace('{w}', String(dimensao.largura)).replace('{h}', String(dimensao.altura))}
              </span>
            )}
          </div>

          <div className="row2">
            <div className="field">
              <label>{t('marketing.nomeLoja')}</label>
              <input type="text" value={nomeLoja} onChange={(e) => setNomeLoja(e.target.value)} placeholder={t('marketing.nomeLojaPlaceholder')} />
            </div>
            <div className="field">
              <label>{t('marketing.banners.textoDestaque')}</label>
              <input type="text" value={textoDestaque} onChange={(e) => setTextoDestaque(e.target.value)} placeholder={t('marketing.banners.textoDestaquePlaceholder')} />
            </div>
          </div>

          <label className="mkt-checkbox-row">
            <input type="checkbox" checked={reaproveitarLogo} disabled={!logoAtual} onChange={(e) => setReaproveitarLogo(e.target.checked)} />
            {t('marketing.banners.reaproveitarLogo')}
          </label>
          {!logoAtual && <span className="hint">{t('marketing.banners.semLogoSalva')}</span>}

          <div className="mkt-actions-row">
            <button type="button" className="btn-dark" disabled={!plataforma || !nomeLoja.trim() || gerando || semCredito} onClick={gerar}>
              {gerando ? t('marketing.gerando') : t('marketing.banners.gerar')}
            </button>
            <span className="hint">
              {t('marketing.creditosCusto').replace('{n}', String(custo))} · {t('marketing.creditosSaldo').replace('{n}', String(creditos))}
            </span>
          </div>
          {semCredito && <span className="hint" style={{ color: 'var(--red)' }}>{t('marketing.creditosInsuficientes')}</span>}
        </div>
      </div>

      {!gerado ? (
        <div className="mkt-empty">
          <h2>{t('marketing.banners.tituloVazio')}</h2>
          <p>{t('marketing.banners.subtituloVazio')}</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <h3>{t('marketing.banners.previewTitulo')}</h3>
            <div className="mkt-banner-preview-wrap">
              <canvas ref={previewRef} className="mkt-banner-canvas" />
            </div>
            <button type="button" className="btn-outline" onClick={baixar}>{t('marketing.banners.baixarPng')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
