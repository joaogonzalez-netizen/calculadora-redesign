import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../context/I18nContext';
import Icon, { type IconName } from '../components/Icon';
import {
  gerarVariacoesLogo, gerarLogosComNomes, desenharLogoNoCanvas, baixarCanvasComoPng, salvarLogoAtual, sugerirNomesMarca,
  getCreditosMock, descontarCreditosMock,
  CUSTO_CREDITOS, NICHOS, PALETA_LOGO, LIMITE_CORES_LOGO, LIMITE_NICHOS_LOGO, QTD_NOMES_GERADOS, USOS_LOGO, LIMITE_SLOGAN,
  type LogoVariacao, type Estilo, type Nicho, type UsoLogo,
} from '../lib/marketing';

// Gerador de logo em formato de assistente (4 etapas) com prévia ao vivo.
// V1 mockada — sem IA real (ver docs/spec-marketing-leigos.md): cada variação
// é um canvas determinístico (iniciais + forma + cor), mas o PNG exportado é
// um arquivo real. Ordem pensada como o maker fala da marca: "logo pra marca X,
// que vende Y, com cara de Z":
//   1 Sua marca (nome ou "criar com IA", slogan, o que vende)
//   2 Estilo (cards com exemplo)  3 Cores (ou automático)
//   4 Personalidade (chips obrigatórios, descrição e usos opcionais)
// Sem nome, a geração cria até 10 nomes, cada um já com a sua logo.

const ESTILOS: Estilo[] = ['minimalista', 'divertido', 'elegante', 'colorido'];
const ESTILO_LABEL_KEY: Record<Estilo, string> = {
  minimalista: 'marketing.logo.estiloMinimalista',
  divertido: 'marketing.logo.estiloDivertido',
  elegante: 'marketing.logo.estiloElegante',
  colorido: 'marketing.logo.estiloColorido',
};
const ESTILO_DESC_KEY: Record<Estilo, string> = {
  minimalista: 'marketing.logo.estiloMinimalistaDesc',
  divertido: 'marketing.logo.estiloDivertidoDesc',
  elegante: 'marketing.logo.estiloEleganteDesc',
  colorido: 'marketing.logo.estiloColoridoDesc',
};

const ICONE_NICHO: Record<Nicho, IconName> = {
  decoracao: 'home', brinquedos: 'play', casaJardim: 'leaf', presentes: 'box', pet: 'heart',
  papelaria: 'list', pecasTecnicas: 'config', miniaturasRpg: 'crown', outro: 'plus',
};
const NICHOS_VISIVEIS = 6; // o resto fica atrás de "Ver mais categorias"

const PERSONALIDADES = ['profissional', 'divertida', 'premium', 'moderna', 'confiavel', 'criativa'] as const;
type Personalidade = (typeof PERSONALIDADES)[number];
const LIMITE_PERSONALIDADES = 3;
const MAX_DESCRICAO = 300;

const ETAPAS = ['marca', 'estilo', 'cores', 'personalidade'] as const;
type Etapa = (typeof ETAPAS)[number];

function LogoCanvas({ variacao, tamanho, className }: { variacao: LogoVariacao; tamanho: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) desenharLogoNoCanvas(ref.current, variacao, tamanho);
  }, [variacao, tamanho]);
  return <canvas ref={ref} width={tamanho} height={tamanho} className={className} />;
}

export default function MarketingLogoView() {
  const { t, idioma } = useI18n();
  const [etapa, setEtapa] = useState<Etapa>('marca');

  // 1 · Sua marca
  const [nomeLoja, setNomeLoja] = useState('');
  const [semNome, setSemNome] = useState(false);
  const [slogan, setSlogan] = useState('');
  const [nichos, setNichos] = useState<Nicho[]>([]);
  const [verTodosNichos, setVerTodosNichos] = useState(false);
  // 2 · Estilo — segue o sugerido pelo 1º nicho até o maker escolher um.
  const [estilo, setEstilo] = useState<Estilo>('minimalista');
  const [estiloManual, setEstiloManual] = useState(false);
  // 3 · Cores — vazio + automático = a IA escolhe a paleta pelo estilo.
  const [coresSelecionadas, setCoresSelecionadas] = useState<string[]>([]);
  const [coresAuto, setCoresAuto] = useState(true);
  const [coresCustom, setCoresCustom] = useState<string[]>([]);
  const corPickerRef = useRef<HTMLInputElement>(null);
  // 4 · Personalidade
  const [personalidades, setPersonalidades] = useState<Personalidade[]>([]);
  const [descricao, setDescricao] = useState('');
  const [usos, setUsos] = useState<UsoLogo[]>([]);

  // Geração
  const [rodadaNomes, setRodadaNomes] = useState(0);
  const [gerando, setGerando] = useState(false);
  const [variacoes, setVariacoes] = useState<LogoVariacao[]>([]);
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);
  const [creditos, setCreditos] = useState(getCreditosMock);
  const resultadoRef = useRef<HTMLDivElement>(null);

  const custo = CUSTO_CREDITOS.logo;
  const semCredito = creditos < custo;
  const cores = useMemo(() => (coresAuto ? [] : coresSelecionadas), [coresAuto, coresSelecionadas]);
  const estiloSugerido = nichos.length ? NICHOS.find((x) => x.id === nichos[0])?.estiloSugerido : undefined;
  const rotuloNicho = (n: Nicho) => t(NICHOS.find((x) => x.id === n)!.chaveLabel);
  const nomeParaGeracao = nomeLoja.trim() || (nichos.length ? rotuloNicho(nichos[0]) : '');

  // --- o que falta em cada etapa (mensagem curta, uma coisa por vez) ---
  const faltaEtapa: Record<Etapa, string | null> = {
    marca: !semNome && !nomeLoja.trim() ? t('marketing.logo.faltaNomeCurto')
      : !nichos.length ? t('marketing.logo.faltaNichoCurto') : null,
    estilo: null,
    cores: !coresAuto && !coresSelecionadas.length ? t('marketing.logo.faltaCorCurto') : null,
    personalidade: !personalidades.length ? t('marketing.logo.faltaPersonalidadeCurto') : null,
  };
  const idxEtapa = ETAPAS.indexOf(etapa);
  const etapaLiberada = (e: Etapa) => ETAPAS.slice(0, ETAPAS.indexOf(e)).every((x) => !faltaEtapa[x]);
  const podeGerar = ETAPAS.every((e) => !faltaEtapa[e]);

  // --- prévia ao vivo ---
  const previa = useMemo<LogoVariacao>(() => {
    const base = gerarVariacoesLogo(semNome ? 'IA' : (nomeParaGeracao || 'Sua marca'), cores, estilo)[0];
    return { ...base, id: 'previa' };
  }, [semNome, nomeParaGeracao, cores, estilo]);
  const exemplosEstilo = useMemo(() => Object.fromEntries(
    ESTILOS.map((es) => [es, { ...gerarVariacoesLogo(nomeParaGeracao || 'Aa', cores, es)[0], id: 'ex-' + es }]),
  ) as Record<Estilo, LogoVariacao>, [nomeParaGeracao, cores]);

  // --- handlers ---
  function alternarNicho(n: Nicho) {
    const next = nichos.includes(n) ? nichos.filter((x) => x !== n) : nichos.length >= LIMITE_NICHOS_LOGO ? nichos : [...nichos, n];
    setNichos(next);
    const sugestao = next.length ? NICHOS.find((x) => x.id === next[0])?.estiloSugerido : undefined;
    if (!estiloManual && sugestao) setEstilo(sugestao);
  }

  function escolherEstilo(es: Estilo) {
    setEstilo(es);
    setEstiloManual(true);
  }

  function alternarCor(cor: string) {
    setCoresAuto(false);
    setCoresSelecionadas((prev) => {
      if (prev.includes(cor)) return prev.filter((c) => c !== cor);
      if (prev.length >= LIMITE_CORES_LOGO) return prev;
      return [...prev, cor];
    });
  }

  function aoEscolherCorCustom(cor: string) {
    if (!PALETA_LOGO.some((p) => p.cor === cor) && !coresCustom.includes(cor)) setCoresCustom((prev) => [...prev, cor]);
    if (!coresSelecionadas.includes(cor)) alternarCor(cor);
  }

  function alternarPersonalidade(p: Personalidade) {
    setPersonalidades((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : prev.length >= LIMITE_PERSONALIDADES ? prev : [...prev, p]));
  }

  const todosUsos = usos.length === USOS_LOGO.length;
  function alternarUso(u: UsoLogo) {
    setUsos((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]));
  }

  function irPara(e: Etapa) {
    if (etapaLiberada(e)) setEtapa(e);
  }

  function gerar() {
    if (!podeGerar || gerando || semCredito) return;
    setGerando(true);
    setSelecionadaId(null);
    setTimeout(() => {
      if (semNome) {
        // Cada geração avança a rodada: gerar de novo traz nomes novos.
        setVariacoes(gerarLogosComNomes(sugerirNomesMarca(idioma, nichos, rodadaNomes, QTD_NOMES_GERADOS), cores, estilo));
        setRodadaNomes((r) => r + 1);
      } else {
        setVariacoes(gerarVariacoesLogo(nomeParaGeracao, cores, estilo));
      }
      setCreditos(descontarCreditosMock(custo));
      setGerando(false);
      setTimeout(() => resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }, 900);
  }

  function selecionar(v: LogoVariacao) {
    setSelecionadaId(v.id);
    salvarLogoAtual({ nomeLoja: v.nome ?? nomeParaGeracao, variacao: v, slogan: slogan.trim() || undefined, usos });
  }

  function baixar() {
    const v = variacoes.find((x) => x.id === selecionadaId);
    if (!v) return;
    const canvasExport = document.createElement('canvas');
    desenharLogoNoCanvas(canvasExport, v, 1024);
    const nomeArquivo = `logo-${(v.nome ?? nomeParaGeracao).trim().toLowerCase().replace(/\s+/g, '-') || 'stlseller'}.png`;
    baixarCanvasComoPng(canvasExport, nomeArquivo);
  }

  const escolhida = variacoes.find((x) => x.id === selecionadaId);
  const nichosMostrados = verTodosNichos ? NICHOS : NICHOS.slice(0, NICHOS_VISIVEIS);

  return (
    <div>
      <div className="hero">
        <h1>{t('marketing.logo.heroTitulo')}</h1>
        <p>{t('marketing.logo.heroSubtitulo')}</p>
      </div>

      <div className="logo-layout">
        <div className="card logo-wizard">
          <div className="card-body card-body-sem-titulo">
            {/* Progresso */}
            <ol className="logo-progresso">
              {ETAPAS.map((e, i) => (
                <li key={e}>
                  <button
                    type="button" disabled={!etapaLiberada(e)} onClick={() => irPara(e)}
                    className={(e === etapa ? 'atual' : '') + (i < idxEtapa ? ' feita' : '')}
                    aria-current={e === etapa ? 'step' : undefined}
                  >
                    <span className="logo-progresso-bolinha">{i < idxEtapa ? <Icon name="check" size={11} /> : i + 1}</span>
                    <span className="logo-progresso-label">{t('marketing.logo.etapa.' + e)}</span>
                  </button>
                </li>
              ))}
            </ol>

            {etapa === 'marca' && (
              <section className="logo-etapa">
                <h2>{t('marketing.logo.etapaMarcaTitulo')}</h2>

                <div className="field">
                  <label htmlFor="logo-nome">{t('marketing.logo.nomeLabel')}</label>
                  {!semNome ? (
                    <input id="logo-nome" type="text" value={nomeLoja} maxLength={30} autoFocus
                      onChange={(e) => setNomeLoja(e.target.value)} placeholder={t('marketing.nomeLojaPlaceholder')} />
                  ) : (
                    <div className="logo-sem-nome-info">
                      <Icon name="bolt" size={16} />
                      <div>
                        <b>{t('marketing.logo.semNomeTitulo')}</b>
                        <p>{t('marketing.logo.semNomeInfo').replace('{n}', String(QTD_NOMES_GERADOS))}</p>
                      </div>
                    </div>
                  )}
                  <label className="logo-check">
                    <input type="checkbox" checked={semNome} onChange={(e) => setSemNome(e.target.checked)} />
                    <span>{t('marketing.logo.naoTenhoNomeCheck')}</span>
                  </label>
                </div>

                <div className="field">
                  <label htmlFor="logo-slogan">{t('marketing.logo.sloganLabel')} <span className="hint">{t('marketing.logo.opcional')}</span></label>
                  <input id="logo-slogan" type="text" value={slogan} maxLength={LIMITE_SLOGAN}
                    onChange={(e) => setSlogan(e.target.value)} placeholder={t('marketing.logo.sloganPlaceholder')} />
                </div>

                <div className="field">
                  <label>
                    {t('marketing.logo.nichoLabel')}
                    <span className="hint logo-contador-inline">{t('marketing.logo.ateN').replace('{n}', String(LIMITE_NICHOS_LOGO))}</span>
                  </label>
                  <div className="logo-nichos">
                    {nichosMostrados.map((n) => {
                      const ativo = nichos.includes(n.id);
                      return (
                        <button key={n.id} type="button" aria-pressed={ativo} className={'logo-nicho' + (ativo ? ' ativo' : '')}
                          disabled={!ativo && nichos.length >= LIMITE_NICHOS_LOGO} onClick={() => alternarNicho(n.id)}>
                          <span className="logo-nicho-icone"><Icon name={ICONE_NICHO[n.id]} size={18} /></span>
                          {t(n.chaveLabel)}
                        </button>
                      );
                    })}
                  </div>
                  {NICHOS.length > NICHOS_VISIVEIS && (
                    <button type="button" className="link-btn logo-ver-mais" onClick={() => setVerTodosNichos((v) => !v)}>
                      {verTodosNichos ? t('marketing.logo.verMenos') : `+ ${t('marketing.logo.verMaisCategorias')}`}
                    </button>
                  )}
                </div>
              </section>
            )}

            {etapa === 'estilo' && (
              <section className="logo-etapa">
                <h2>{t('marketing.logo.etapaEstiloTitulo')}</h2>
                <div className="logo-estilos">
                  {ESTILOS.map((es) => (
                    <button key={es} type="button" aria-pressed={estilo === es} className={'logo-estilo' + (estilo === es ? ' ativo' : '')} onClick={() => escolherEstilo(es)}>
                      <LogoCanvas variacao={exemplosEstilo[es]} tamanho={96} className="logo-estilo-exemplo" />
                      <b>{t(ESTILO_LABEL_KEY[es])}</b>
                      <span>{t(ESTILO_DESC_KEY[es])}</span>
                      {estiloSugerido === es && <span className="logo-sugerido">{t('marketing.logo.sugerido')}</span>}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {etapa === 'cores' && (
              <section className="logo-etapa">
                <h2>{t('marketing.logo.etapaCoresTitulo')}</h2>
                <button type="button" aria-pressed={coresAuto} className={'logo-cores-auto' + (coresAuto ? ' ativo' : '')}
                  onClick={() => { setCoresAuto(true); setCoresSelecionadas([]); }}>
                  <Icon name="bolt" size={16} />
                  <span><b>{t('marketing.logo.coresAuto')}</b><small>{t('marketing.logo.coresAutoDesc')}</small></span>
                </button>
                <div className="logo-cores-ou">{t('marketing.logo.ouEscolha')}</div>
                <div className="logo-cores-grid">
                  {[...PALETA_LOGO.map((p) => ({ cor: p.cor, nome: t(p.chaveLabel) })), ...coresCustom.map((c) => ({ cor: c, nome: c }))].map(({ cor, nome }) => {
                    const ativa = !coresAuto && coresSelecionadas.includes(cor);
                    const ordem = coresSelecionadas.indexOf(cor);
                    return (
                      <button key={cor} type="button" aria-pressed={ativa} className={'logo-cor' + (ativa ? ' ativa' : '')}
                        disabled={!ativa && !coresAuto && coresSelecionadas.length >= LIMITE_CORES_LOGO} onClick={() => alternarCor(cor)}>
                        <span className="logo-cor-amostra" style={{ background: cor }}>{ativa && <Icon name="check" size={14} />}</span>
                        <span className="logo-cor-nome">{nome}</span>
                        {ativa && <small>{ordem === 0 ? t('marketing.logo.corPrincipal') : t('marketing.logo.corApoio')}</small>}
                      </button>
                    );
                  })}
                  <button type="button" className="logo-cor logo-cor-add" disabled={!coresAuto && coresSelecionadas.length >= LIMITE_CORES_LOGO}
                    onClick={() => corPickerRef.current?.click()}>
                    <span className="logo-cor-amostra"><Icon name="plus" size={14} /></span>
                    <span className="logo-cor-nome">{t('marketing.logo.outraCor')}</span>
                  </button>
                  <input ref={corPickerRef} type="color" className="mkt-cor-picker-hidden" onChange={(e) => aoEscolherCorCustom(e.target.value)} />
                </div>
                {!coresAuto && <span className="hint">{t('marketing.logo.coresHint').replace('{n}', String(coresSelecionadas.length))}</span>}
              </section>
            )}

            {etapa === 'personalidade' && (
              <section className="logo-etapa">
                <h2>{t('marketing.logo.etapaPersonalidadeTitulo')}</h2>

                <div className="field">
                  <label>
                    {t('marketing.logo.transmitirLabel')}
                    <span className="hint logo-contador-inline">{t('marketing.logo.ateN').replace('{n}', String(LIMITE_PERSONALIDADES))}</span>
                  </label>
                  <div className="chip-row logo-chips">
                    {PERSONALIDADES.map((p) => {
                      const ativo = personalidades.includes(p);
                      return (
                        <button key={p} type="button" aria-pressed={ativo} className={'chip' + (ativo ? ' active' : '')}
                          disabled={!ativo && personalidades.length >= LIMITE_PERSONALIDADES} onClick={() => alternarPersonalidade(p)}>
                          {t('marketing.logo.pers.' + p)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="logo-desc">{t('marketing.logo.descricaoLivreLabel')} <span className="hint">{t('marketing.logo.opcional')}</span></label>
                  <textarea id="logo-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} maxLength={MAX_DESCRICAO}
                    placeholder={t('marketing.logo.descricaoPlaceholder')} />
                  <span className="hint logo-contador-texto">{descricao.length} / {MAX_DESCRICAO} {t('marketing.logo.caracteres')}</span>
                </div>

                <div className="field logo-usos">
                  <label>{t('marketing.logo.usoLabelCurto')} <span className="hint">{t('marketing.logo.opcional')}</span></label>
                  <span className="hint">{t('marketing.logo.usoDescCurta')}</span>
                  <div className="logo-usos-grid">
                    <label className="logo-check logo-check-todos">
                      <input type="checkbox" checked={todosUsos} onChange={() => setUsos(todosUsos ? [] : USOS_LOGO.map((u) => u.id))} />
                      <span>{t('marketing.logo.selecionarTodos')}</span>
                    </label>
                    {USOS_LOGO.map((u) => (
                      <label key={u.id} className="logo-check">
                        <input type="checkbox" checked={usos.includes(u.id)} onChange={() => alternarUso(u.id)} />
                        <span>{t(u.chaveLabel)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Navegação */}
            <div className="logo-nav">
              {idxEtapa > 0 ? (
                <button type="button" className="btn-outline" onClick={() => setEtapa(ETAPAS[idxEtapa - 1])}>
                  <Icon name="chevron" size={12} /> {t('marketing.logo.voltar')}
                </button>
              ) : <span />}
              {etapa !== 'personalidade' ? (
                <div className="logo-nav-direita">
                  {faltaEtapa[etapa] && <span className="logo-falta">{faltaEtapa[etapa]}</span>}
                  <button type="button" className="btn-calc logo-continuar" disabled={!!faltaEtapa[etapa]} onClick={() => setEtapa(ETAPAS[idxEtapa + 1])}>
                    {t('marketing.logo.continuar')} <Icon name="chevron" size={12} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>
              ) : (
                <div className="logo-nav-direita logo-cta">
                  {faltaEtapa.personalidade && <span className="logo-falta">{faltaEtapa.personalidade}</span>}
                  <button type="button" className="btn-calc logo-criar" disabled={!podeGerar || gerando || semCredito} onClick={gerar}>
                    <Icon name="bolt" size={15} /> {gerando ? t('marketing.gerando') : t('marketing.logo.criarMinhaLogo')}
                    <span className="logo-criar-custo">{custo} {t('marketing.logo.creditosLabel')}</span>
                  </button>
                  <span className="hint">
                    {semCredito ? t('marketing.creditosInsuficientes') : t('marketing.logo.novasVersoesDepois')}
                    {' · '}{t('marketing.creditosSaldo').replace('{n}', String(creditos))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prévia ao vivo */}
        <aside className="card logo-previa">
          <div className="card-body card-body-sem-titulo">
            <span className="logo-previa-label">{t('marketing.logo.previa')}</span>
            <LogoCanvas variacao={previa} tamanho={180} className="logo-previa-canvas" />
            <b className="logo-previa-nome">{semNome ? t('marketing.logo.previaNomeIA') : (nomeLoja.trim() || t('marketing.logo.previaNomeVazio'))}</b>
            {slogan.trim() && <span className="logo-previa-slogan">{slogan.trim()}</span>}
            {nichos.length > 0 && <span className="logo-previa-nicho">{nichos.map(rotuloNicho).join(' · ')}</span>}
            <div className="logo-previa-tags">
              <span>{t(ESTILO_LABEL_KEY[estilo])}</span>
              {personalidades.map((p) => <span key={p}>{t('marketing.logo.pers.' + p)}</span>)}
            </div>
            <span className="hint logo-previa-aviso">{t('marketing.logo.previaAviso')}</span>
          </div>
        </aside>
      </div>

      {variacoes.length > 0 && (
        <div className="card" ref={resultadoRef}>
          <div className="card-body card-body-sem-titulo">
            <h3>{t(variacoes.some((v) => v.nome) ? 'marketing.logo.variacoesComNomeTitulo' : 'marketing.logo.variacoesTitulo')}</h3>
            <div className={'mkt-logo-grid' + (variacoes.some((v) => v.nome) ? ' com-nomes' : '')}>
              {variacoes.map((v) => (
                <button key={v.id} type="button" className={'mkt-logo-card' + (selecionadaId === v.id ? ' active' : '')} onClick={() => selecionar(v)}>
                  <LogoCanvas variacao={v} tamanho={220} />
                  {(v.nome || slogan.trim()) && <span className="mkt-logo-nome">{v.nome ?? nomeParaGeracao}</span>}
                  {slogan.trim() && <span className="mkt-logo-slogan">{slogan.trim()}</span>}
                </button>
              ))}
            </div>
            {escolhida?.nome && <p className="mkt-logo-nome-escolhido">{t('marketing.logo.nomeEscolhido')} <b>{escolhida.nome}</b></p>}
            <div className="mkt-actions-row">
              <button type="button" className="btn-outline" disabled={!selecionadaId} onClick={baixar}>{t('marketing.logo.baixarPng')}</button>
              <button type="button" className="btn-outline" disabled={gerando || semCredito} onClick={gerar}>
                <Icon name="sync" size={13} /> {t('marketing.logo.gerarNovamente')} · {custo} {t('marketing.logo.creditosLabel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
