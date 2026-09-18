import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../context/I18nContext';
import {
  gerarVariacoesLogo, desenharLogoNoCanvas, baixarCanvasComoPng, salvarLogoAtual, sugerirNomes,
  getCreditosMock, descontarCreditosMock, CUSTO_CREDITOS, NICHOS, PALETA_LOGO, LIMITE_CORES_LOGO,
  type LogoVariacao, type Estilo, type Nicho,
} from '../lib/marketing';

const ESTILOS: Estilo[] = ['minimalista', 'divertido', 'elegante', 'colorido'];
const ESTILO_LABEL_KEY: Record<Estilo, string> = {
  minimalista: 'marketing.logo.estiloMinimalista',
  divertido: 'marketing.logo.estiloDivertido',
  elegante: 'marketing.logo.estiloElegante',
  colorido: 'marketing.logo.estiloColorido',
};

// V1 mockada — sem IA real (ver docs/spec-marketing-leigos.md). Cada variação
// é um SVG/canvas determinístico (iniciais + forma + cor), não uma geração de
// IA de verdade, mas o PNG exportado é um arquivo real e funcional.
export default function MarketingLogoView() {
  const { t, idioma } = useI18n();
  const [nomeLoja, setNomeLoja] = useState('');
  const [semNome, setSemNome] = useState(false);
  const [sugestoesNome, setSugestoesNome] = useState<string[]>([]);
  const [nicho, setNicho] = useState<Nicho | null>(null);
  const [descricao, setDescricao] = useState('');
  const [estilo, setEstilo] = useState<Estilo>('minimalista');
  const [coresSelecionadas, setCoresSelecionadas] = useState<string[]>([]);
  const [coresCustom, setCoresCustom] = useState<string[]>([]);
  const [gerando, setGerando] = useState(false);
  const [variacoes, setVariacoes] = useState<LogoVariacao[]>([]);
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);
  const [creditos, setCreditos] = useState(getCreditosMock);
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const corPickerRef = useRef<HTMLInputElement>(null);

  const coresDisponiveis = [...PALETA_LOGO.map((p) => p.cor), ...coresCustom.filter((c) => !PALETA_LOGO.some((p) => p.cor === c))];

  const custo = CUSTO_CREDITOS.logo;
  const semCredito = creditos < custo;

  useEffect(() => {
    variacoes.forEach((v) => {
      const canvas = canvasRefs.current[v.id];
      if (canvas) desenharLogoNoCanvas(canvas, v, 220);
    });
  }, [variacoes]);

  function selecionarNicho(n: Nicho) {
    setNicho(n);
    const sugestao = NICHOS.find((x) => x.id === n)?.estiloSugerido;
    if (sugestao) setEstilo(sugestao);
  }

  function alternarCor(cor: string) {
    setCoresSelecionadas((prev) => {
      if (prev.includes(cor)) return prev.filter((c) => c !== cor);
      if (prev.length >= LIMITE_CORES_LOGO) return prev;
      return [...prev, cor];
    });
  }

  function abrirSeletorDeCor() {
    corPickerRef.current?.click();
  }

  function aoEscolherCorCustom(cor: string) {
    if (!coresDisponiveis.includes(cor)) setCoresCustom((prev) => [...prev, cor]);
    alternarCor(cor);
  }

  function mostrarSugestoesNome() {
    setSugestoesNome(sugerirNomes(idioma, nicho));
  }

  function escolherNomeSugerido(nome: string) {
    setNomeLoja(nome);
    setSugestoesNome([]);
  }

  function alternarSemNome() {
    setSemNome((prev) => !prev);
    setSugestoesNome([]);
  }

  // Sem nome, exigimos nicho + pelo menos 1 cor — senão a geração fica sem
  // nenhum contexto de negócio pra se basear.
  const podeGerar = semNome
    ? nicho !== null && coresSelecionadas.length > 0
    : nomeLoja.trim().length > 0;
  const nomeParaGeracao = nomeLoja.trim() || (nicho ? t(NICHOS.find((n) => n.id === nicho)!.chaveLabel) : '');

  function gerar() {
    if (!podeGerar || gerando || semCredito) return;
    setGerando(true);
    setSelecionadaId(null);
    setTimeout(() => {
      setVariacoes(gerarVariacoesLogo(nomeParaGeracao, coresSelecionadas, estilo));
      setCreditos(descontarCreditosMock(custo));
      setGerando(false);
    }, 900);
  }

  function selecionar(v: LogoVariacao) {
    setSelecionadaId(v.id);
    salvarLogoAtual({ nomeLoja: nomeParaGeracao, variacao: v });
  }

  function baixar() {
    const v = variacoes.find((x) => x.id === selecionadaId);
    if (!v) return;
    const canvasExport = document.createElement('canvas');
    desenharLogoNoCanvas(canvasExport, v, 1024);
    const nomeArquivo = `logo-${nomeParaGeracao.trim().toLowerCase().replace(/\s+/g, '-') || 'stlseller'}.png`;
    baixarCanvasComoPng(canvasExport, nomeArquivo);
  }

  return (
    <div>
      <div className="hero">
        <h1>{t('nav.geradorLogo')}</h1>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="field">
            <label>{t('marketing.nomeLoja')}</label>
            {!semNome && (
              <input type="text" value={nomeLoja} onChange={(e) => setNomeLoja(e.target.value)} placeholder={t('marketing.nomeLojaPlaceholder')} />
            )}
            <div className="mkt-nome-acoes-row">
              {!semNome && (
                <button type="button" className="btn-outline" onClick={mostrarSugestoesNome}>
                  {t('marketing.sugerirNomes')}
                </button>
              )}
              <button type="button" className="link-btn" onClick={alternarSemNome}>
                {semNome ? t('marketing.voltarADigitarNome') : t('marketing.aindaNaoTenhoNome')}
              </button>
            </div>
            {sugestoesNome.length > 0 && (
              <div className="chip-row">
                {sugestoesNome.map((nome) => (
                  <button key={nome} type="button" className="chip" onClick={() => escolherNomeSugerido(nome)}>
                    {nome}
                  </button>
                ))}
              </div>
            )}
            {semNome && <span className="hint">{t('marketing.requisitosSemNome')}</span>}
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
            <label>{t('marketing.logo.estilo')}</label>
            <div className="chip-row">
              {ESTILOS.map((es) => (
                <button key={es} type="button" className={'chip' + (estilo === es ? ' active' : '')} onClick={() => setEstilo(es)}>
                  {t(ESTILO_LABEL_KEY[es])}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>
              {t('marketing.logo.coresLabel')}
              <span className="hint" style={{ fontWeight: 400 }}>{t('marketing.logo.coresHint').replace('{n}', String(coresSelecionadas.length))}</span>
            </label>
            <div className="mkt-cor-swatch-row">
              {PALETA_LOGO.map((p) => (
                <button
                  key={p.cor}
                  type="button"
                  className={'mkt-cor-swatch' + (coresSelecionadas.includes(p.cor) ? ' active' : '')}
                  style={{ background: p.cor }}
                  title={t(p.chaveLabel)}
                  aria-label={t(p.chaveLabel)}
                  onClick={() => alternarCor(p.cor)}
                />
              ))}
              {coresCustom.filter((c) => !PALETA_LOGO.some((p) => p.cor === c)).map((cor) => (
                <button
                  key={cor}
                  type="button"
                  className={'mkt-cor-swatch' + (coresSelecionadas.includes(cor) ? ' active' : '')}
                  style={{ background: cor }}
                  title={cor}
                  aria-label={cor}
                  onClick={() => alternarCor(cor)}
                />
              ))}
              <button
                type="button"
                className="mkt-cor-swatch-add"
                title={t('marketing.logo.corPersonalizada')}
                aria-label={t('marketing.logo.corPersonalizada')}
                disabled={coresSelecionadas.length >= LIMITE_CORES_LOGO}
                onClick={abrirSeletorDeCor}
              >
                +
              </button>
              <input
                ref={corPickerRef}
                type="color"
                className="mkt-cor-picker-hidden"
                onChange={(e) => aoEscolherCorCustom(e.target.value)}
              />
            </div>
          </div>

          <div className="mkt-actions-row">
            <button type="button" className="btn-dark" disabled={!podeGerar || gerando || semCredito} onClick={gerar}>
              {gerando ? t('marketing.gerando') : t('marketing.logo.gerar')}
            </button>
            <span className="hint">
              {t('marketing.creditosCusto').replace('{n}', String(custo))} · {t('marketing.creditosSaldo').replace('{n}', String(creditos))}
            </span>
          </div>
          {semCredito && <span className="hint" style={{ color: 'var(--red)' }}>{t('marketing.creditosInsuficientes')}</span>}
        </div>
      </div>

      {!variacoes.length ? (
        <div className="mkt-empty">
          <h2>{t('marketing.logo.tituloVazio')}</h2>
          <p>{t('marketing.logo.subtituloVazio')}</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <h3>{t('marketing.logo.variacoesTitulo')}</h3>
            <div className="mkt-logo-grid">
              {variacoes.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={'mkt-logo-card' + (selecionadaId === v.id ? ' active' : '')}
                  onClick={() => selecionar(v)}
                >
                  <canvas ref={(el) => { canvasRefs.current[v.id] = el; }} width={220} height={220} />
                </button>
              ))}
            </div>
            <button type="button" className="btn-outline" disabled={!selecionadaId} onClick={baixar}>
              {t('marketing.logo.baixarPng')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
