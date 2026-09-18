import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../context/I18nContext';
import Icon from '../components/Icon';
import GeradorStepper from '../components/gerador/GeradorStepper';
import {
  desenharBannerNoCanvas, baixarCanvasComoPng, getLogoAtual, sugerirNomes,
  getCreditosMock, descontarCreditosMock, CUSTO_CREDITOS, DIMENSOES_BANNER, NICHOS,
  type Plataforma, type Estilo, type Nicho,
} from '../lib/marketing';

type PassoId = 'plataforma' | 'contexto' | 'estilo' | 'resultado';

const PLATAFORMAS: { id: Plataforma; label: string }[] = [
  { id: 'shopee', label: 'Shopee' },
  { id: 'mercado-livre', label: 'Mercado Livre' },
];

const ESTILOS: Estilo[] = ['minimalista', 'divertido', 'elegante', 'colorido'];
const ESTILO_LABEL_KEY: Record<Estilo, string> = {
  minimalista: 'marketing.logo.estiloMinimalista',
  divertido: 'marketing.logo.estiloDivertido',
  elegante: 'marketing.logo.estiloElegante',
  colorido: 'marketing.logo.estiloColorido',
};

// V1 mockada, agora em wizard de passos (mesmo padrão do Gerador de
// Anúncios) — dimensões de referência, não oficiais (ver Seção 4.2 da spec).
export default function MarketingBannersView() {
  const { t, idioma } = useI18n();

  const PASSOS = [
    { id: 'plataforma', numero: 1, label: t('marketing.banners.stepPlataforma') },
    { id: 'contexto', numero: 2, label: t('marketing.banners.stepContexto') },
    { id: 'estilo', numero: 3, label: t('marketing.banners.stepEstilo') },
    { id: 'resultado', numero: 4, label: t('marketing.banners.stepResultado') },
  ] as const satisfies readonly { id: PassoId; numero: number; label: string }[];

  const [passoAtual, setPassoAtual] = useState<PassoId>('plataforma');
  const [visitados, setVisitados] = useState<Set<PassoId>>(new Set());

  const [plataforma, setPlataforma] = useState<Plataforma | null>(null);
  const [nomeLoja, setNomeLoja] = useState('');
  const [nicho, setNicho] = useState<Nicho | null>(null);
  const [descricao, setDescricao] = useState('');
  const [textoDestaque, setTextoDestaque] = useState('');
  const [estilo, setEstilo] = useState<Estilo>('minimalista');
  const [reaproveitarLogo, setReaproveitarLogo] = useState(false);
  const [sugestoesNome, setSugestoesNome] = useState<string[]>([]);
  const [gerando, setGerando] = useState(false);
  const [gerado, setGerado] = useState(false);
  const [creditos, setCreditos] = useState(getCreditosMock);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const logoAtual = getLogoAtual();

  const custo = CUSTO_CREDITOS.banner;
  const semCredito = creditos < custo;

  function irPara(id: string) {
    if (visitados.has(id as PassoId) || id === passoAtual) setPassoAtual(id as PassoId);
  }
  function marcarVisitadoEIr(atual: PassoId, proximo: PassoId) {
    setVisitados((prev) => new Set(prev).add(atual));
    setPassoAtual(proximo);
  }
  function pularParaResumo() {
    setVisitados(new Set(PASSOS.map((p) => p.id)));
    setPassoAtual('resultado');
  }
  const idxAtual = PASSOS.findIndex((p) => p.id === passoAtual);
  const passoAnterior = idxAtual > 0 ? PASSOS[idxAtual - 1].id : null;
  const voltar = () => passoAnterior && setPassoAtual(passoAnterior as PassoId);

  function selecionarNicho(n: Nicho) {
    setNicho(n);
    const sugestao = NICHOS.find((x) => x.id === n)?.estiloSugerido;
    if (sugestao) setEstilo(sugestao);
  }

  function mostrarSugestoesNome() {
    setSugestoesNome(sugerirNomes(idioma, nicho));
  }
  function escolherNomeSugerido(nome: string) {
    setNomeLoja(nome);
    setSugestoesNome([]);
  }

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
      desenharBannerNoCanvas(previewRef.current, plataforma, nomeLoja, textoDestaque, reaproveitarLogo ? logoAtual : null, estilo);
    }
  }, [gerado, plataforma, nomeLoja, textoDestaque, reaproveitarLogo, logoAtual, estilo]);

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

      <div className="ger-stepper-row">
        <GeradorStepper passos={PASSOS} atual={passoAtual} visitados={visitados} onIrPara={irPara} />
        {passoAtual !== 'resultado' && (
          <button type="button" className="ger-pular-resumo" onClick={pularParaResumo}>
            {t('gerador.pularParaResumo')} <Icon name="chevron" size={12} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
      </div>

      <div className="card ger-card">
        <div className="card-body" style={{ paddingTop: 22 }}>
          {passoAtual === 'plataforma' && (
            <>
              <div className="ger-titulo-bloco">
                <h2>{t('marketing.banners.tituloPlataforma')}</h2>
                <p>{t('marketing.banners.subtituloPlataforma')}</p>
              </div>
              <div className="ger-radio-grid">
                {PLATAFORMAS.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className={'ger-radio-card' + (plataforma === p.id ? ' selecionado' : '')}
                    onClick={() => { setPlataforma(p.id); setGerado(false); }}
                  >
                    <div>
                      <div className="ger-radio-card-titulo">{p.label}</div>
                      <div className="ger-radio-card-desc">
                        {t('marketing.banners.dimensaoLabel').replace('{w}', String(DIMENSOES_BANNER[p.id].largura)).replace('{h}', String(DIMENSOES_BANNER[p.id].altura))}
                      </div>
                    </div>
                    <span className="ger-radio-dot" />
                  </button>
                ))}
              </div>
              <div className="ger-footer">
                <button type="button" className="btn-dark pill" disabled={!plataforma} onClick={() => marcarVisitadoEIr('plataforma', 'contexto')}>
                  {t('gerador.continuar')}
                </button>
              </div>
            </>
          )}

          {passoAtual === 'contexto' && (
            <>
              <button type="button" className="ger-voltar" onClick={voltar}><Icon name="chevron" size={14} /> {t('gerador.voltar')}</button>
              <div className="ger-titulo-bloco">
                <h2>{t('marketing.banners.tituloContexto')}</h2>
                <p>{t('marketing.banners.subtituloContexto')}</p>
              </div>

              <div className="field">
                <label>{t('marketing.nomeLoja')}</label>
                <input type="text" value={nomeLoja} onChange={(e) => setNomeLoja(e.target.value)} placeholder={t('marketing.nomeLojaPlaceholder')} />
                <div className="mkt-nome-acoes-row">
                  <button type="button" className="btn-outline" onClick={mostrarSugestoesNome}>{t('marketing.sugerirNomes')}</button>
                </div>
                {sugestoesNome.length > 0 && (
                  <div className="chip-row">
                    {sugestoesNome.map((nome) => (
                      <button key={nome} type="button" className="chip" onClick={() => escolherNomeSugerido(nome)}>{nome}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="field">
                <label>{t('marketing.logo.nichoLabel')}</label>
                <div className="chip-row">
                  {NICHOS.map((n) => (
                    <button key={n.id} type="button" className={'chip' + (nicho === n.id ? ' active' : '')} onClick={() => selecionarNicho(n.id)}>
                      {t(n.chaveLabel)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>{t('marketing.logo.descricaoLabel')}</label>
                <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder={t('marketing.logo.descricaoPlaceholder')} rows={2} />
              </div>

              <div className="field">
                <label>{t('marketing.banners.textoDestaque')}</label>
                <input type="text" value={textoDestaque} onChange={(e) => setTextoDestaque(e.target.value)} placeholder={t('marketing.banners.textoDestaquePlaceholder')} />
              </div>

              <div className="ger-footer">
                <button type="button" className="btn-dark pill" disabled={!nomeLoja.trim()} onClick={() => marcarVisitadoEIr('contexto', 'estilo')}>
                  {t('gerador.continuar')}
                </button>
              </div>
            </>
          )}

          {passoAtual === 'estilo' && (
            <>
              <button type="button" className="ger-voltar" onClick={voltar}><Icon name="chevron" size={14} /> {t('gerador.voltar')}</button>
              <div className="ger-titulo-bloco">
                <h2>{t('marketing.banners.tituloEstilo')}</h2>
                <p>{t('marketing.banners.subtituloEstilo')}</p>
              </div>

              <div className="field">
                <label>{t('marketing.logo.estilo')}</label>
                <div className="chip-row">
                  {ESTILOS.map((es) => (
                    <button key={es} type="button" className={'chip' + (estilo === es ? ' active' : '')} onClick={() => setEstilo(es)}>
                      {t(ESTILO_LABEL_KEY[es])}
                    </button>
                  ))}
                </div>
              </div>

              <label className="mkt-checkbox-row">
                <input type="checkbox" checked={reaproveitarLogo} disabled={!logoAtual} onChange={(e) => setReaproveitarLogo(e.target.checked)} />
                {t('marketing.banners.reaproveitarLogo')}
              </label>
              {!logoAtual && <span className="hint">{t('marketing.banners.semLogoSalva')}</span>}

              <div className="ger-footer">
                <button type="button" className="btn-dark pill" onClick={() => marcarVisitadoEIr('estilo', 'resultado')}>
                  {t('gerador.continuar')}
                </button>
              </div>
            </>
          )}

          {passoAtual === 'resultado' && (
            <>
              <button type="button" className="ger-voltar" onClick={voltar}><Icon name="chevron" size={14} /> {t('gerador.voltar')}</button>
              <div className="ger-titulo-bloco">
                <h2>{t('marketing.banners.tituloResultado')}</h2>
              </div>

              <div className="mkt-actions-row">
                <button type="button" className="btn-dark" disabled={!plataforma || !nomeLoja.trim() || gerando || semCredito} onClick={gerar}>
                  {gerando ? t('marketing.gerando') : gerado ? t('marketing.banners.regenerar') : t('marketing.banners.gerar')}
                </button>
                <span className="hint">
                  {t('marketing.creditosCusto').replace('{n}', String(custo))} · {t('marketing.creditosSaldo').replace('{n}', String(creditos))}
                </span>
              </div>
              {semCredito && <span className="hint" style={{ color: 'var(--red)' }}>{t('marketing.creditosInsuficientes')}</span>}

              {!gerado ? (
                <div className="mkt-empty">
                  <h2>{t('marketing.banners.tituloVazio')}</h2>
                  <p>{t('marketing.banners.subtituloVazio')}</p>
                </div>
              ) : (
                <>
                  <h3>{t('marketing.banners.previewTitulo')}</h3>
                  <div className="mkt-banner-preview-wrap">
                    <canvas ref={previewRef} className="mkt-banner-canvas" />
                  </div>
                  <button type="button" className="btn-outline" onClick={baixar}>{t('marketing.banners.baixarPng')}</button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
