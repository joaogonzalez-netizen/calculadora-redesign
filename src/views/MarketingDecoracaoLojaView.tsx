import { useRef, useState } from 'react';
import { useI18n } from '../context/I18nContext';
import Icon from '../components/Icon';
import {
  desenharDecoracaoNoCanvas, gerarJpegValidado, baixarBlob, clamp, dimensaoCarrossel,
  getCreditosMock, descontarCreditosMock, CUSTO_CREDITOS,
  SPEC_CAPA_LOJA, SPEC_CARROSSEL,
  type Estilo, type Proporcao,
} from '../lib/marketing';

const CORES_MOCK_FOTO = ['#0d6efd', '#00955a', '#c58a00', '#8a3bd4', '#d4633b'];
const MAX_FOTOS = 5;

const ESTILOS: Estilo[] = ['minimalista', 'divertido', 'elegante', 'colorido'];
const ESTILO_LABEL_KEY: Record<Estilo, string> = {
  minimalista: 'marketing.logo.estiloMinimalista',
  divertido: 'marketing.logo.estiloDivertido',
  elegante: 'marketing.logo.estiloElegante',
  colorido: 'marketing.logo.estiloColorido',
};

const PROPORCOES: Proporcao[] = ['2:1', '16:9', '1:1', 'livre'];

interface ResultadoPeca {
  blob: Blob;
  tamanhoBytes: number;
  dentroDoLimite: boolean;
  largura: number;
  altura: number;
}

interface SecaoCarrossel {
  id: number;
  resultado: ResultadoPeca | null;
}

function kb(bytes: number) {
  return Math.round(bytes / 1024);
}

// V1 mockada (P0 do PRD) — sem IA/backend real, mesmo espírito das outras
// telas de Marketing. A composição em si é mock, mas a validação de peso
// (gerarJpegValidado) é real: nunca entrega um arquivo fora da spec da
// Shopee. Ver docs/prd-decoracao-loja-shopee.md e spec-decoracao-loja-shopee.md.
export default function MarketingDecoracaoLojaView() {
  const { t } = useI18n();
  const [creditos, setCreditos] = useState(getCreditosMock);

  // --- Capa da loja ---
  const [fotosCapa, setFotosCapa] = useState<string[]>([]);
  const [estiloCapa, setEstiloCapa] = useState<Estilo>('minimalista');
  const [promptCapa, setPromptCapa] = useState('');
  const [gerandoCapa, setGerandoCapa] = useState(false);
  const [resultadoCapa, setResultadoCapa] = useState<ResultadoPeca | null>(null);
  const [nonceCapa, setNonceCapa] = useState(0);
  const canvasCapaRef = useRef<HTMLCanvasElement>(null);

  const custoCapa = CUSTO_CREDITOS.capaLoja;
  const semCreditoCapa = creditos < custoCapa;

  function adicionarFotoCapa() {
    if (fotosCapa.length >= MAX_FOTOS) return;
    setFotosCapa((prev) => [...prev, CORES_MOCK_FOTO[prev.length % CORES_MOCK_FOTO.length]]);
  }
  function removerFotoCapa(idx: number) {
    setFotosCapa((prev) => prev.filter((_, i) => i !== idx));
  }

  async function gerarCapa() {
    if (!fotosCapa.length || gerandoCapa || semCreditoCapa) return;
    const canvas = canvasCapaRef.current;
    if (!canvas) return;
    setGerandoCapa(true);
    setResultadoCapa(null);
    const proximoNonce = nonceCapa + 1;
    setNonceCapa(proximoNonce);
    await new Promise((r) => setTimeout(r, 900));
    desenharDecoracaoNoCanvas(canvas, SPEC_CAPA_LOJA.largura, SPEC_CAPA_LOJA.altura, promptCapa, fotosCapa.length, estiloCapa, proximoNonce);
    const { blob, tamanhoBytes, dentroDoLimite } = await gerarJpegValidado(canvas, SPEC_CAPA_LOJA.pesoMaximoBytes);
    if (blob) setResultadoCapa({ blob, tamanhoBytes, dentroDoLimite, largura: SPEC_CAPA_LOJA.largura, altura: SPEC_CAPA_LOJA.altura });
    setCreditos(descontarCreditosMock(custoCapa));
    setGerandoCapa(false);
  }

  function baixarCapa() {
    if (!resultadoCapa) return;
    baixarBlob(resultadoCapa.blob, 'capa-loja-shopee.jpg');
  }

  // --- Carrossel ---
  const [fotosCarrossel, setFotosCarrossel] = useState<string[]>([]);
  const [estiloCarrossel, setEstiloCarrossel] = useState<Estilo>('minimalista');
  const [promptCarrossel, setPromptCarrossel] = useState('');
  const [proporcao, setProporcao] = useState<Proporcao>('2:1');
  const [larguraLivre, setLarguraLivre] = useState(1600);
  const [alturaLivre, setAlturaLivre] = useState(800);
  const [numSecoes, setNumSecoes] = useState(3);
  const [gerandoCarrossel, setGerandoCarrossel] = useState(false);
  const [secoes, setSecoes] = useState<SecaoCarrossel[]>([]);
  const [nonceGeracao, setNonceGeracao] = useState(0);
  const [nonceSecoes, setNonceSecoes] = useState<Record<number, number>>({});
  const canvasCarrosselRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  const custoCarrosselTotal = numSecoes * CUSTO_CREDITOS.carrosselSecao;
  const semCreditoCarrossel = creditos < custoCarrosselTotal;

  function adicionarFotoCarrossel() {
    if (fotosCarrossel.length >= MAX_FOTOS) return;
    setFotosCarrossel((prev) => [...prev, CORES_MOCK_FOTO[prev.length % CORES_MOCK_FOTO.length]]);
  }
  function removerFotoCarrossel(idx: number) {
    setFotosCarrossel((prev) => prev.filter((_, i) => i !== idx));
  }

  function dimensaoAtual() {
    return dimensaoCarrossel(proporcao, larguraLivre, proporcao === 'livre' ? alturaLivre : undefined);
  }

  async function gerarUmaSecao(id: number, variacao: number) {
    const canvas = canvasCarrosselRefs.current[id];
    if (!canvas) return null;
    const dim = dimensaoAtual();
    desenharDecoracaoNoCanvas(canvas, dim.largura, dim.altura, promptCarrossel, fotosCarrossel.length, estiloCarrossel, variacao);
    const { blob, tamanhoBytes, dentroDoLimite } = await gerarJpegValidado(canvas, SPEC_CARROSSEL.pesoMaximoBytes);
    return blob ? { blob, tamanhoBytes, dentroDoLimite, largura: dim.largura, altura: dim.altura } : null;
  }

  async function gerarCarrossel() {
    if (!fotosCarrossel.length || gerandoCarrossel || semCreditoCarrossel) return;
    setGerandoCarrossel(true);
    setSecoes(Array.from({ length: numSecoes }, (_, i) => ({ id: i, resultado: null })));
    const proximoNonce = nonceGeracao + 1;
    setNonceGeracao(proximoNonce);
    await new Promise((r) => setTimeout(r, 900));
    const resultados: SecaoCarrossel[] = [];
    for (let i = 0; i < numSecoes; i++) {
      const resultado = await gerarUmaSecao(i, i + proximoNonce * 11);
      resultados.push({ id: i, resultado });
    }
    setSecoes(resultados);
    setCreditos(descontarCreditosMock(custoCarrosselTotal));
    setGerandoCarrossel(false);
  }

  async function regenerarSecao(id: number) {
    const proximo = (nonceSecoes[id] ?? 0) + 1;
    setNonceSecoes((prev) => ({ ...prev, [id]: proximo }));
    setSecoes((prev) => prev.map((s) => (s.id === id ? { ...s, resultado: null } : s)));
    const resultado = await gerarUmaSecao(id, id + nonceGeracao * 11 + proximo * 23);
    setSecoes((prev) => prev.map((s) => (s.id === id ? { id, resultado } : s)));
    setCreditos(descontarCreditosMock(CUSTO_CREDITOS.carrosselSecao));
  }

  function baixarSecao(s: SecaoCarrossel) {
    if (!s.resultado) return;
    baixarBlob(s.resultado.blob, `carrossel-loja-shopee-secao-${s.id + 1}.jpg`);
  }

  return (
    <div>
      <div className="hero">
        <h1>{t('nav.decoracaoLoja')}</h1>
      </div>

      {/* ---------- Capa da loja ---------- */}
      <div className="card">
        <div className="card-body card-body-sem-titulo">
          <h3>{t('marketing.decoracao.capaTitulo')}</h3>
          <p className="hint">{t('marketing.decoracao.capaDesc')}</p>

          <div className="field">
            <label>{t('marketing.decoracao.fotosLabel')}</label>
            <div className="ger-dropzone" onClick={() => fotosCapa.length < MAX_FOTOS && adicionarFotoCapa()}>
              <Icon name="upload" size={22} />
              <h3>{t('gerador.arrastarSolte')}</h3>
              <p>{t('gerador.formatosImagem')}</p>
              <span className="hint">{fotosCapa.length}/{MAX_FOTOS} {t('gerador.imagensEnviadas')}</span>
            </div>
            <div className="ger-thumbs-grid">
              {Array.from({ length: MAX_FOTOS }).map((_, i) => (
                <div className="ger-thumb" key={i}>
                  {fotosCapa[i] ? (
                    <div className="ger-thumb-fill" style={{ background: fotosCapa[i] }}>
                      <button type="button" className="ger-thumb-remover" onClick={(e) => { e.stopPropagation(); removerFotoCapa(i); }}>
                        <Icon name="close" size={12} />
                      </button>
                    </div>
                  ) : <div className="ger-thumb-vazio" />}
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label>{t('marketing.logo.estilo')}</label>
            <div className="chip-row">
              {ESTILOS.map((es) => (
                <button key={es} type="button" className={'chip' + (estiloCapa === es ? ' active' : '')} onClick={() => setEstiloCapa(es)}>
                  {t(ESTILO_LABEL_KEY[es])}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>{t('marketing.decoracao.promptLabel')}</label>
            <textarea value={promptCapa} onChange={(e) => setPromptCapa(e.target.value)} placeholder={t('marketing.decoracao.promptPlaceholder')} rows={2} />
          </div>

          <div className="mkt-actions-row">
            <button type="button" className="btn-dark" disabled={!fotosCapa.length || gerandoCapa || semCreditoCapa} onClick={gerarCapa}>
              {gerandoCapa ? t('marketing.gerando') : t('marketing.decoracao.gerarCapa')}
            </button>
            <span className="hint">
              {t('marketing.creditosCusto').replace('{n}', String(custoCapa))} · {t('marketing.creditosSaldo').replace('{n}', String(creditos))}
            </span>
          </div>
          {semCreditoCapa && <span className="hint" style={{ color: 'var(--red)' }}>{t('marketing.creditosInsuficientes')}</span>}

          <canvas ref={canvasCapaRef} className="mkt-decor-canvas" style={{ display: resultadoCapa ? 'block' : 'none' }} />

          {resultadoCapa && (
            <div className="mkt-decor-resultado">
              {resultadoCapa.dentroDoLimite ? (
                <span className="mkt-decor-validado">
                  <Icon name="check" size={13} />
                  {t('marketing.decoracao.validado')} · {t('marketing.decoracao.specResumo')
                    .replace('{w}', String(resultadoCapa.largura)).replace('{h}', String(resultadoCapa.altura)).replace('{kb}', String(kb(resultadoCapa.tamanhoBytes)))}
                </span>
              ) : (
                <span className="hint" style={{ color: 'var(--red)' }}>{t('marketing.decoracao.foraDoLimite')}</span>
              )}
              <div className="mkt-actions-row" style={{ marginTop: 10 }}>
                <button type="button" className="btn-outline" disabled={!resultadoCapa.dentroDoLimite} onClick={baixarCapa}>{t('marketing.decoracao.baixar')}</button>
                <button type="button" className="link-btn" onClick={gerarCapa}>{t('marketing.decoracao.regenerar')}</button>
              </div>
            </div>
          )}

          {!resultadoCapa && !gerandoCapa && (
            <div className="mkt-empty" style={{ padding: '30px 20px' }}>
              <h2 style={{ fontSize: 16 }}>{t('marketing.decoracao.tituloVazioCapa')}</h2>
              <p>{t('marketing.decoracao.subtituloVazioCapa')}</p>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Carrossel ---------- */}
      <div className="card">
        <div className="card-body card-body-sem-titulo">
          <h3>{t('marketing.decoracao.carrosselTitulo')}</h3>
          <p className="hint">{t('marketing.decoracao.carrosselDesc')}</p>

          <div className="field">
            <label>{t('marketing.decoracao.proporcao')}</label>
            <div className="chip-row">
              {PROPORCOES.map((p) => (
                <button key={p} type="button" className={'chip' + (proporcao === p ? ' active' : '')} onClick={() => setProporcao(p)}>
                  {p === 'livre' ? t('marketing.decoracao.proporcaoLivre') : p}
                </button>
              ))}
            </div>
          </div>

          {proporcao === 'livre' && (
            <div className="row2">
              <div className="field">
                <label>{t('marketing.decoracao.largura')}</label>
                <input
                  type="number"
                  value={larguraLivre}
                  onChange={(e) => setLarguraLivre(clamp(Number(e.target.value) || 0, 200, SPEC_CARROSSEL.resolucaoMaxima))}
                />
              </div>
              <div className="field">
                <label>{t('marketing.decoracao.altura')}</label>
                <input
                  type="number"
                  value={alturaLivre}
                  onChange={(e) => setAlturaLivre(clamp(Number(e.target.value) || 0, 200, SPEC_CARROSSEL.resolucaoMaxima))}
                />
              </div>
            </div>
          )}

          <div className="field" style={{ maxWidth: 220 }}>
            <label>{t('marketing.decoracao.secoes')}</label>
            <select value={numSecoes} onChange={(e) => setNumSecoes(Number(e.target.value))}>
              {Array.from({ length: SPEC_CARROSSEL.maxSecoes }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>{t('marketing.decoracao.fotosLabel')}</label>
            <div className="ger-dropzone" onClick={() => fotosCarrossel.length < MAX_FOTOS && adicionarFotoCarrossel()}>
              <Icon name="upload" size={22} />
              <h3>{t('gerador.arrastarSolte')}</h3>
              <p>{t('gerador.formatosImagem')}</p>
              <span className="hint">{fotosCarrossel.length}/{MAX_FOTOS} {t('gerador.imagensEnviadas')}</span>
            </div>
            <div className="ger-thumbs-grid">
              {Array.from({ length: MAX_FOTOS }).map((_, i) => (
                <div className="ger-thumb" key={i}>
                  {fotosCarrossel[i] ? (
                    <div className="ger-thumb-fill" style={{ background: fotosCarrossel[i] }}>
                      <button type="button" className="ger-thumb-remover" onClick={(e) => { e.stopPropagation(); removerFotoCarrossel(i); }}>
                        <Icon name="close" size={12} />
                      </button>
                    </div>
                  ) : <div className="ger-thumb-vazio" />}
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label>{t('marketing.logo.estilo')}</label>
            <div className="chip-row">
              {ESTILOS.map((es) => (
                <button key={es} type="button" className={'chip' + (estiloCarrossel === es ? ' active' : '')} onClick={() => setEstiloCarrossel(es)}>
                  {t(ESTILO_LABEL_KEY[es])}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>{t('marketing.decoracao.promptLabel')}</label>
            <textarea value={promptCarrossel} onChange={(e) => setPromptCarrossel(e.target.value)} placeholder={t('marketing.decoracao.promptPlaceholder')} rows={2} />
          </div>

          <div className="mkt-actions-row">
            <button type="button" className="btn-dark" disabled={!fotosCarrossel.length || gerandoCarrossel || semCreditoCarrossel} onClick={gerarCarrossel}>
              {gerandoCarrossel ? t('marketing.gerando') : t('marketing.decoracao.gerarCarrossel')}
            </button>
            <span className="hint">
              {t('marketing.decoracao.custoCarrossel')
                .replace('{secoes}', String(numSecoes)).replace('{custo}', String(CUSTO_CREDITOS.carrosselSecao)).replace('{total}', String(custoCarrosselTotal))}
              {' · '}{t('marketing.creditosSaldo').replace('{n}', String(creditos))}
            </span>
          </div>
          {semCreditoCarrossel && <span className="hint" style={{ color: 'var(--red)' }}>{t('marketing.creditosInsuficientes')}</span>}

          {/* Canvases sempre montados (até o máximo de seções) pra o ref existir antes do 1º clique em "Gerar". */}
          <div className="mkt-decor-carrossel-grid">
            {Array.from({ length: SPEC_CARROSSEL.maxSecoes }).map((_, i) => {
              const visivel = i < Math.max(secoes.length, numSecoes) && (secoes.length > 0 || gerandoCarrossel);
              const secao = secoes.find((s) => s.id === i);
              return (
                <div key={i} className="mkt-decor-secao" style={{ display: visivel ? 'flex' : 'none' }}>
                  <span className="hint">{t('marketing.decoracao.secaoLabel').replace('{n}', String(i + 1))}</span>
                  <canvas ref={(el) => { canvasCarrosselRefs.current[i] = el; }} className="mkt-decor-canvas" style={{ display: secao?.resultado ? 'block' : 'none' }} />
                  {visivel && !secao?.resultado && <div className="mkt-decor-secao-carregando" />}
                  {secao?.resultado && (
                    <>
                      {secao.resultado.dentroDoLimite ? (
                        <span className="mkt-decor-validado">
                          <Icon name="check" size={12} />
                          {t('marketing.decoracao.specResumo')
                            .replace('{w}', String(secao.resultado.largura)).replace('{h}', String(secao.resultado.altura)).replace('{kb}', String(kb(secao.resultado.tamanhoBytes)))}
                        </span>
                      ) : (
                        <span className="hint" style={{ color: 'var(--red)' }}>{t('marketing.decoracao.foraDoLimite')}</span>
                      )}
                      <div className="mkt-actions-row">
                        <button type="button" className="btn-outline" disabled={!secao.resultado.dentroDoLimite} onClick={() => baixarSecao(secao)}>{t('marketing.decoracao.baixar')}</button>
                        <button type="button" className="link-btn" onClick={() => regenerarSecao(i)}>{t('marketing.decoracao.regenerar')}</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {!secoes.length && !gerandoCarrossel && (
            <div className="mkt-empty" style={{ padding: '30px 20px' }}>
              <h2 style={{ fontSize: 16 }}>{t('marketing.decoracao.tituloVazioCarrossel')}</h2>
              <p>{t('marketing.decoracao.subtituloVazioCarrossel')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
