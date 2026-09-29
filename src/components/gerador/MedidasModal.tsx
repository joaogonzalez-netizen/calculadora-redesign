import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';
import fotoProduto from '../../assets/gerador-produto-mock.jpg';
import type { Idioma } from '../../lib/i18n';

// Editor da imagem fixa "Medidas" do passo Imagens (print de João, 29/09/2026).
// A imagem gerada é a foto do produto com cotas por cima. A lista de medidas é
// livre — kits têm várias peças, e uma mesma peça pode querer duas alturas
// (ex.: porta-controle sozinho e com o controle). Dois tipos de cota:
// - reta: seta entre duas alças (largura, altura, comprimento…);
// - diâmetro: linha de ponta a ponta da peça redonda, com o texto "Ø …" em
//   cima dela (pode ser inclinada pra acompanhar a perspectiva).
// A unidade (cm ou polegadas) vale pra imagem toda; trocar converte os valores.
// Tudo é desenhado num SVG de 1000×1000 (a foto inclusive), então a mesma
// config renderiza igual no modal e na miniatura do card.

interface Ponto { x: number; y: number }

interface MedidaBase {
  id: string;
  nome: string; // título do card no painel ("Altura com controle")
  prefixo: string; // começo do texto automático ("Comp.", "Ø")
  valor: string; // na unidade da config
  texto: string;
  // true quando o maker editou o texto à mão — aí mudar nome/valor não sobrescreve mais.
  textoManual: boolean;
  visivel: boolean;
}
export interface Medida extends MedidaBase { tipo: 'reta' | 'diametro'; a: Ponto; b: Ponto }

export type Unidade = 'cm' | 'in';
export interface MedidasConfig { unidade: Unidade; medidas: Medida[] }

type Alca = 'a' | 'b' | 'linha';

const TAMANHO = 1000;
const MARGEM = 12;
const FOTO = { x: 60, y: 30, lado: 880 };
const FONTE = 26;

// id aleatório (e não contador de módulo): o contador zera no hot reload e
// passaria a repetir ids de medidas que já estão no estado.
const novoId = () => 'med_' + Math.random().toString(36).slice(2, 10);

type T = (k: string) => string;

const CM_POR_POLEGADA = 2.54;

export function simboloUnidade(t: T, u: Unidade): string {
  return t(u === 'in' ? 'gerador.unidadeIn' : 'gerador.unidadeCm');
}

// A versão EN (mercado americano) abre em polegadas; PT/ES em centímetros.
export function unidadePadrao(idioma: Idioma): Unidade {
  return idioma === 'en' ? 'in' : 'cm';
}

// Valor digitado aceita vírgula ou ponto. Resultado de conversão sai com 1 casa
// em cm e 2 em polegadas, sem zeros sobrando, e com vírgula fora do inglês.
function formatarValor(n: number, u: Unidade, idioma: Idioma): string {
  const txt = String(Number(n.toFixed(u === 'in' ? 2 : 1)));
  return idioma === 'en' ? txt : txt.replace('.', ',');
}

function converter(valor: string, de: Unidade, para: Unidade, idioma: Idioma): string {
  const n = parseFloat(valor.replace(',', '.'));
  if (isNaN(n) || de === para) return valor;
  return formatarValor(para === 'in' ? n / CM_POR_POLEGADA : n * CM_POR_POLEGADA, para, idioma);
}

function textoAuto(prefixo: string, valor: string, simbolo: string): string {
  return `${prefixo.trim()} ${valor.trim() || '0'} ${simbolo}`.trim();
}

function reta(nome: string, prefixo: string, valor: string, simbolo: string, a: Ponto, b: Ponto): Medida {
  return { id: novoId(), tipo: 'reta', nome, prefixo, valor, texto: textoAuto(prefixo, valor, simbolo), textoManual: false, visivel: true, a, b };
}

export function medidasPadrao(t: T, idioma: Idioma): MedidasConfig {
  const unidade = unidadePadrao(idioma);
  const sim = simboloUnidade(t, unidade);
  const v = (cm: string) => converter(cm, 'cm', unidade, idioma);
  return {
    unidade,
    medidas: [
      reta(t('gerador.medidaLargura'), t('gerador.medidaLarguraTexto'), v('6'), sim, { x: 150, y: 905 }, { x: 850, y: 905 }),
      reta(t('gerador.medidaAltura'), t('gerador.medidaAlturaTexto'), v('6'), sim, { x: 95, y: 130 }, { x: 95, y: 840 }),
      reta(t('gerador.medidaComprimento'), t('gerador.medidaComprimentoTexto'), v('11'), sim, { x: 330, y: 870 }, { x: 860, y: 560 }),
    ],
  };
}

// Medidas novas nascem no meio da foto, deslocadas pra não caírem umas em cima das outras.
function novaMedida(tipo: Medida['tipo'], t: T, qtd: number, unidade: Unidade): Medida {
  const d = (qtd % 5) * 45;
  const sim = simboloUnidade(t, unidade);
  const valor = unidade === 'in' ? '4' : '10';
  if (tipo === 'diametro') {
    return { ...reta(t('gerador.medidaDiametro'), 'Ø', valor, sim, { x: 310 + d, y: 330 + d }, { x: 690 + d, y: 330 + d }), tipo };
  }
  return reta(t('gerador.novaMedida'), t('gerador.novaMedida'), valor, sim, { x: 300 + d, y: 480 + d }, { x: 700 + d, y: 480 + d });
}

const limitar = (v: number) => Math.max(MARGEM, Math.min(TAMANHO - MARGEM, v));

function Rotulo({ texto, x, y, rotacao, miniatura, halo }: { texto: string; x: number; y: number; rotacao: number; miniatura: boolean; halo: boolean }) {
  const largPill = texto.length * FONTE * 0.56 + 22;
  return (
    <g transform={`rotate(${rotacao} ${x} ${y})`} style={{ pointerEvents: 'none' }}>
      {miniatura && (
        <rect x={x - largPill / 2} y={y - FONTE * 0.85} width={largPill} height={FONTE * 1.7} rx={6}
          fill="#fff" stroke="rgba(0,0,0,.12)" strokeWidth={2} />
      )}
      <text
        x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={FONTE} fontWeight={700}
        fill="#14181a" stroke={!miniatura && halo ? '#fff' : 'none'} strokeWidth={7} paintOrder="stroke"
        style={{ userSelect: 'none' }}
      >
        {texto}
      </text>
    </g>
  );
}

// Texto da reta: segue o ângulo quando a linha é mais vertical (Altura) e fica
// deitado no resto. Retas deitadas/em pé levam o texto pro lado de fora
// (abaixo / à esquerda); diagonais e diâmetros ficam com o texto em cima da linha.
function RotuloReta({ m, miniatura }: { m: Medida; miniatura: boolean }) {
  let angulo = (Math.atan2(m.b.y - m.a.y, m.b.x - m.a.x) * 180) / Math.PI;
  if (angulo > 90) angulo -= 180;
  if (angulo <= -90) angulo += 180;
  const rad = (angulo * Math.PI) / 180;
  const deitada = Math.abs(angulo) < 20;
  const empe = Math.abs(angulo) > 60;
  const afastamento = m.tipo === 'reta' && (deitada || empe) ? 40 : 0;
  const x = (m.a.x + m.b.x) / 2 - Math.sin(rad) * afastamento;
  const y = (m.a.y + m.b.y) / 2 + Math.cos(rad) * afastamento;
  return <Rotulo texto={m.texto} x={x} y={y} rotacao={empe ? (angulo > 0 ? -90 : 90) : 0} miniatura={miniatura} halo={afastamento === 0} />;
}

interface OverlayProps {
  config: MedidasConfig;
  miniatura?: boolean;
  selecionada?: string | null;
  onMover?: (id: string, alca: Alca, delta: Ponto, absoluto: Ponto) => void;
  onSelecionar?: (id: string) => void;
}

export function MedidasOverlay({ config, miniatura = false, selecionada, onMover, onSelecionar }: OverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const arrasto = useRef<{ id: string; alca: Alca; ultimo: Ponto } | null>(null);
  const editavel = !miniatura && !!onMover;

  function pontoSvg(e: ReactPointerEvent): Ponto {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svgRef.current!.getScreenCTM()!.inverse());
    return { x: p.x, y: p.y };
  }

  function iniciar(e: ReactPointerEvent, id: string, alca: Alca) {
    if (!editavel) return;
    e.preventDefault();
    e.stopPropagation();
    svgRef.current!.setPointerCapture(e.pointerId);
    arrasto.current = { id, alca, ultimo: pontoSvg(e) };
    onSelecionar?.(id);
  }

  function mover(e: ReactPointerEvent) {
    const a = arrasto.current;
    if (!a || !onMover) return;
    const p = pontoSvg(e);
    onMover(a.id, a.alca, { x: p.x - a.ultimo.x, y: p.y - a.ultimo.y }, { x: limitar(p.x), y: limitar(p.y) });
    arrasto.current = { ...a, ultimo: p };
  }

  const soltar = () => { arrasto.current = null; };
  const traco = miniatura ? 3 : 2.5;
  const alca = (id: string, qual: Alca, x: number, y: number, extra = '') => (
    <circle key={qual} cx={x} cy={y} r={11} className={'ger-med-alca' + extra} onPointerDown={(e) => iniciar(e, id, qual)} />
  );

  return (
    <svg ref={svgRef} viewBox={`0 0 ${TAMANHO} ${TAMANHO}`} className="ger-med-svg" onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar}>
      <image href={fotoProduto} x={FOTO.x} y={FOTO.y} width={FOTO.lado} height={FOTO.lado} />
      {config.medidas.map((m) => {
        if (!m.visivel) return null;
        const ativa = editavel && selecionada === m.id;
        const cor = ativa ? 'var(--primary)' : '#14181a';
        return (
          <g key={m.id}>
            <line x1={m.a.x} y1={m.a.y} x2={m.b.x} y2={m.b.y} stroke={cor} strokeWidth={traco} />
            {editavel && (
              <line x1={m.a.x} y1={m.a.y} x2={m.b.x} y2={m.b.y} stroke="transparent" strokeWidth={26}
                className="ger-med-linha" onPointerDown={(e) => iniciar(e, m.id, 'linha')} />
            )}
            <RotuloReta m={m} miniatura={miniatura} />
            {editavel && [alca(m.id, 'a', m.a.x, m.a.y), alca(m.id, 'b', m.b.x, m.b.y)]}
          </g>
        );
      })}
    </svg>
  );
}

interface ModalProps {
  inicial: MedidasConfig;
  onCancelar: () => void;
  onAprovar: (cfg: MedidasConfig) => void;
}

export default function MedidasModal({ inicial, onCancelar, onAprovar }: ModalProps) {
  const { t, idioma } = useI18n();
  const [cfg, setCfg] = useState<MedidasConfig>(inicial);
  const simbolo = simboloUnidade(t, cfg.unidade);
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const listaRef = useRef<HTMLDivElement>(null);

  // Selecionar uma medida na imagem (ou adicionar uma nova) rola a lista até o card dela.
  useEffect(() => {
    listaRef.current?.querySelector('.ger-med-texto-card.ativa')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selecionada]);

  function atualizar(id: string, fn: (m: Medida) => Medida) {
    setCfg((prev) => ({ ...prev, medidas: prev.medidas.map((m) => (m.id === id ? fn(m) : m)) }));
  }

  function mover(id: string, qual: Alca, d: Ponto, abs: Ponto) {
    atualizar(id, (m) => {
      if (qual === 'a' || qual === 'b') return { ...m, [qual]: abs };
      // move a medida inteira sem deixar nenhuma ponta sair da imagem
      const dx = Math.max(MARGEM - Math.min(m.a.x, m.b.x), Math.min(TAMANHO - MARGEM - Math.max(m.a.x, m.b.x), d.x));
      const dy = Math.max(MARGEM - Math.min(m.a.y, m.b.y), Math.min(TAMANHO - MARGEM - Math.max(m.a.y, m.b.y), d.y));
      return { ...m, a: { x: m.a.x + dx, y: m.a.y + dy }, b: { x: m.b.x + dx, y: m.b.y + dy } };
    });
  }

  function setNome(id: string, nome: string) {
    // renomear muda o começo do texto automático — menos no diâmetro, que é sempre "Ø"
    atualizar(id, (m) => {
      const prefixo = m.tipo === 'diametro' ? m.prefixo : nome;
      return { ...m, nome, prefixo, texto: m.textoManual ? m.texto : textoAuto(prefixo, m.valor, simbolo) };
    });
  }

  function setValor(id: string, valor: string) {
    atualizar(id, (m) => ({ ...m, valor, texto: m.textoManual ? m.texto : textoAuto(m.prefixo, valor, simbolo) }));
  }

  // Troca a unidade da imagem toda: converte os valores e refaz os textos
  // automáticos. Texto editado à mão fica como o maker escreveu.
  function trocarUnidade(unidade: Unidade) {
    setCfg((prev) => {
      if (prev.unidade === unidade) return prev;
      const sim = simboloUnidade(t, unidade);
      return {
        unidade,
        medidas: prev.medidas.map((m) => {
          const valor = converter(m.valor, prev.unidade, unidade, idioma);
          return { ...m, valor, texto: m.textoManual ? m.texto : textoAuto(m.prefixo, valor, sim) };
        }),
      };
    });
  }

  function adicionar(tipo: Medida['tipo']) {
    const m = novaMedida(tipo, t, cfg.medidas.length, cfg.unidade);
    setCfg((prev) => ({ ...prev, medidas: [...prev.medidas, m] }));
    setSelecionada(m.id);
  }

  function remover(id: string) {
    setCfg((prev) => ({ ...prev, medidas: prev.medidas.filter((m) => m.id !== id) }));
  }

  return (
    <div className="pub-overlay" onClick={onCancelar}>
      <div className="pub-modal ger-med-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pub-modal-head">
          <div>
            <h2>{t('gerador.editarImagemMedidas')}</h2>
            <p>{t('gerador.editarImagemMedidasDesc')}</p>
          </div>
          <button type="button" className="pub-close" onClick={onCancelar} aria-label={t('gerador.cancelar')}>
            <Icon name="close" size={14} />
          </button>
        </div>

        <div className="ger-med-corpo">
          <div className="ger-med-canvas">
            <MedidasOverlay config={cfg} selecionada={selecionada} onMover={mover} onSelecionar={setSelecionada} />
          </div>

          <div className="ger-med-lado">
            <div className="ger-med-lista-head">
              <h4 className="ger-med-subtitulo">{t('gerador.textosDasMedidas')}</h4>
              <div className="ger-med-unidade" role="radiogroup" aria-label={t('gerador.unidadeDeMedida')}>
                {(['cm', 'in'] as const).map((u) => (
                  <button
                    key={u} type="button" role="radio" aria-checked={cfg.unidade === u}
                    className={cfg.unidade === u ? 'ativa' : ''} onClick={() => trocarUnidade(u)}
                  >
                    {simboloUnidade(t, u)}
                  </button>
                ))}
              </div>
            </div>
            <div className="ger-med-textos" ref={listaRef}>
              {cfg.medidas.length === 0 && <p className="ger-med-hint">{t('gerador.semMedidas')}</p>}
              {cfg.medidas.map((m) => (
                <div
                  key={m.id}
                  className={'ger-med-texto-card' + (m.visivel ? '' : ' desligada') + (selecionada === m.id ? ' ativa' : '')}
                  onFocusCapture={() => setSelecionada(m.id)}
                >
                  <div className="ger-med-card-head">
                    <span className="ger-med-tipo" title={t(m.tipo === 'diametro' ? 'gerador.medidaDiametro' : 'gerador.medidaReta')}>
                      {m.tipo === 'diametro' ? 'Ø' : '↔'}
                    </span>
                    <label className="ger-med-nome" title={t('gerador.editarNomeMedida')}>
                      <input
                        type="text" value={m.nome} placeholder={t('gerador.nomeDaMedida')} aria-label={t('gerador.nomeDaMedida')}
                        onChange={(e) => setNome(m.id, e.target.value)}
                      />
                      <Icon name="pencil" size={13} />
                    </label>
                    <label className="switch">
                      <input type="checkbox" checked={m.visivel} aria-label={t('gerador.mostrarMedida')}
                        onChange={(e) => atualizar(m.id, (x) => ({ ...x, visivel: e.target.checked }))} />
                      <span className="track" />
                    </label>
                    <button type="button" className="ger-med-remover" onClick={() => remover(m.id)} aria-label={t('gerador.removerMedida')} title={t('gerador.removerMedida')}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                  <div className="ger-med-card-campos">
                    <div className="suffix-wrap ger-med-valor">
                      <input type="text" inputMode="decimal" value={m.valor} disabled={!m.visivel}
                        aria-label={t('gerador.valorDaMedida')} onChange={(e) => setValor(m.id, e.target.value)} />
                      <span className="sfx">{simbolo}</span>
                    </div>
                    <input
                      type="text" value={m.texto} disabled={!m.visivel} aria-label={t('gerador.textoDaMedida')}
                      onChange={(e) => atualizar(m.id, (x) => ({ ...x, texto: e.target.value, textoManual: true }))}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="ger-med-adicionar">
              <button type="button" className="btn-outline" onClick={() => adicionar('reta')}>
                <Icon name="plus" size={13} /> {t('gerador.adicionarMedidaReta')}
              </button>
              <button type="button" className="btn-outline" onClick={() => adicionar('diametro')}>
                <Icon name="plus" size={13} /> {t('gerador.adicionarDiametro')}
              </button>
            </div>

            <p className="ger-med-hint">{t('gerador.arrasteAlcasHint')}</p>

            <button type="button" className="btn-outline ger-med-restaurar" onClick={() => { setCfg(medidasPadrao(t, idioma)); setSelecionada(null); }}>
              <Icon name="sync" size={14} /> {t('gerador.restaurarPadrao')}
            </button>
          </div>
        </div>

        <div className="ger-med-footer">
          <button type="button" className="btn-outline" onClick={onCancelar}>{t('gerador.cancelar')}</button>
          <button type="button" className="btn-calc" onClick={() => onAprovar(cfg)}>{t('gerador.aprovar')}</button>
        </div>
      </div>
    </div>
  );
}
