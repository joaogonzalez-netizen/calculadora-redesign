import { useEffect, useRef, useState } from 'react';
import type { Pedido } from '../../lib/pedidosMock';
import {
  gerarEtiquetasMock,
  gravarFormato,
  lerFormato,
  type FormatoEtiqueta,
  type ResultadoEtiqueta,
} from '../../lib/etiquetasShopee';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

interface Props {
  pedidos: Pedido[];
  /** id do pedido -> data ISO da última impressão. */
  impressas: Record<string, string>;
  onClose: () => void;
  /** Chamado com os ids que saíram para impressão. */
  onImpresso: (ids: string[]) => void;
}

type Fase = 'config' | 'gerando' | 'resultado';

const ETIQUETAS_POR_FOLHA_A4 = 4;

function Barras({ codigo }: { codigo: string }) {
  const barras: { x: number; w: number }[] = [];
  let x = 0;
  for (const ch of codigo + codigo) {
    const c = ch.charCodeAt(0);
    const w = 1 + (c % 3);
    barras.push({ x, w });
    x += w + 1 + ((c >> 2) % 2);
  }
  return (
    <svg className="etq-barras" viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" role="img" aria-label={codigo}>
      {barras.map((b, i) => <rect key={i} x={b.x} y={0} width={b.w} height={40} fill="currentColor" />)}
    </svg>
  );
}

// Imitação do arquivo oficial. O texto fica em português de propósito: a
// etiqueta real da Shopee não muda de idioma com o app.
function Etiqueta({ pedido }: { pedido: Pedido }) {
  return (
    <div className="etq-label-box">
    <div className="etq-label">
      <div className="etq-topo">
        <b>Shopee Xpress</b>
        <span>Standard</span>
      </div>
      <Barras codigo={pedido.envioCodigo} />
      <div className="etq-codigo">{pedido.envioCodigo}</div>
      <div className="etq-bloco">
        <small>DESTINATÁRIO</small>
        <b>{pedido.comprador}</b>
        <span>{pedido.destinoCidade}</span>
        <span>CEP {pedido.destinoCep}</span>
      </div>
      <div className="etq-bloco">
        <small>REMETENTE</small>
        <span>{pedido.conta}</span>
      </div>
      <div className="etq-rodape">
        <span>Pedido {pedido.id.slice(-8)}</span>
        <span>0,3 kg</span>
      </div>
    </div>
    </div>
  );
}

function plural(t: (c: string) => string, chave: string, n: number, extra: Record<string, string> = {}) {
  let texto = n === 1 ? t(chave + 'Uma') : t(chave);
  texto = texto.replace('{n}', String(n));
  for (const [k, v] of Object.entries(extra)) texto = texto.replace(`{${k}}`, v);
  return texto;
}

export default function EtiquetaModal({ pedidos, impressas, onClose, onImpresso }: Props) {
  const { t } = useI18n();
  const [fase, setFase] = useState<Fase>('config');
  const [formato, setFormato] = useState<FormatoEtiqueta>(lerFormato);
  const [indice, setIndice] = useState(0);
  const [resultados, setResultados] = useState<ResultadoEtiqueta[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const origemRef = useRef<Element | null>(document.activeElement);

  const jaImpressas = pedidos.filter((p) => impressas[p.id]).length;
  // A4 leva 4 etiquetas A6 por folha (2×2); a térmica leva 1 por etiqueta.
  const porFolha = formato === 'a4' ? ETIQUETAS_POR_FOLHA_A4 : 1;
  const totalPaginas = Math.ceil(pedidos.length / porFolha);
  const visiveis = pedidos.slice(indice * porFolha, (indice + 1) * porFolha);
  const falhas = resultados.filter((r) => r.erro);
  const okCount = resultados.length - falhas.length;

  useEffect(() => {
    const origem = origemRef.current;
    dialogRef.current?.focus();
    return () => {
      if (origem instanceof HTMLElement) origem.focus();
    };
  }, []);

  function aoTeclar(e: React.KeyboardEvent) {
    if (e.key === 'Escape' && fase !== 'gerando') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focaveis = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [tabindex="0"]');
    if (!focaveis.length) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (e.shiftKey && (document.activeElement === primeiro || document.activeElement === dialogRef.current)) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  }

  function escolherFormato(f: FormatoEtiqueta) {
    setFormato(f);
    setIndice(0);
    gravarFormato(f);
  }

  async function gerar(alvo: Pedido[], novaTentativa: boolean) {
    setFase('gerando');
    const novos = await gerarEtiquetasMock(alvo, novaTentativa);
    const porId = new Map(novos.map((r) => [r.id, r]));
    // Mantém no resultado o que já deu certo na rodada anterior.
    const anteriores = resultados.filter((r) => !porId.has(r.id));
    const juntos = [...anteriores, ...novos];
    setResultados(juntos);
    setFase('resultado');
    const idsOk = novos.filter((r) => !r.erro).map((r) => r.id);
    if (idsOk.length) onImpresso(idsOk);
  }

  function tentarNovamente() {
    const idsFalha = new Set(falhas.map((r) => r.id));
    void gerar(pedidos.filter((p) => idsFalha.has(p.id)), true);
  }

  const porId = new Map(pedidos.map((p) => [p.id, p]));
  const opcoes: { id: FormatoEtiqueta; titulo: string; desc: string }[] = [
    { id: 'termica-a6', titulo: t('pedidos.etiqueta.formatoTermica'), desc: t('pedidos.etiqueta.formatoTermicaDesc') },
    { id: 'a4', titulo: t('pedidos.etiqueta.formatoA4'), desc: t('pedidos.etiqueta.formatoA4Desc') },
  ];

  return (
    <>
      <div className="drawer-overlay" onClick={fase === 'gerando' ? undefined : onClose} />
      <div
        className="modal-center etq-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="etq-titulo"
        tabIndex={-1}
        ref={dialogRef}
        onKeyDown={aoTeclar}
      >
        <button type="button" className="modal-levar-x" onClick={onClose} disabled={fase === 'gerando'} aria-label={t('pedidos.etiqueta.cancelar')}>
          <Icon name="close" size={18} />
        </button>
        <h4 id="etq-titulo">{t('pedidos.etiqueta.titulo')}</h4>

        {fase === 'config' && (
          <>
            <p className="etq-resumo">{plural(t, 'pedidos.etiqueta.resumo', pedidos.length)}</p>
            {jaImpressas > 0 && <div className="alert etq-aviso">{plural(t, 'pedidos.etiqueta.jaImpressas', jaImpressas)}</div>}
            <div className="etq-grid">
              <div>
                <fieldset className="etq-formatos">
                  <legend className="divider-label">{t('pedidos.etiqueta.formato')}</legend>
                  {opcoes.map((o) => (
                    <label key={o.id} className={'etq-formato' + (formato === o.id ? ' active' : '')}>
                      <input type="radio" name="etq-formato" checked={formato === o.id} onChange={() => escolherFormato(o.id)} />
                      <span><b>{o.titulo}</b><small>{o.desc}</small></span>
                    </label>
                  ))}
                </fieldset>
                <p className="hint etq-nota">{t('pedidos.etiqueta.previaAviso')}</p>
              </div>
              <div className="etq-previa-col">
                {formato === 'a4' ? (
                  <div className="etq-folha etq-folha-a4">
                    {Array.from({ length: ETIQUETAS_POR_FOLHA_A4 }, (_, i) => (
                      <div className="etq-slot" key={i}>
                        {visiveis[i] && <Etiqueta pedido={visiveis[i]} />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="etq-folha etq-folha-a6">
                    <Etiqueta pedido={visiveis[0]} />
                  </div>
                )}
                {totalPaginas > 1 && (
                  <div className="etq-nav">
                    <button type="button" className="page-btn" onClick={() => setIndice((i) => Math.max(0, i - 1))} disabled={indice === 0} aria-label={t(formato === 'a4' ? 'pedidos.etiqueta.folhaAnterior' : 'pedidos.etiqueta.anterior')}>‹</button>
                    <span aria-live="polite">{t(formato === 'a4' ? 'pedidos.etiqueta.posicaoFolha' : 'pedidos.etiqueta.posicao').replace('{i}', String(indice + 1)).replace('{n}', String(totalPaginas))}</span>
                    <button type="button" className="page-btn" onClick={() => setIndice((i) => Math.min(totalPaginas - 1, i + 1))} disabled={indice === totalPaginas - 1} aria-label={t(formato === 'a4' ? 'pedidos.etiqueta.folhaProxima' : 'pedidos.etiqueta.proxima')}>›</button>
                  </div>
                )}
              </div>
            </div>
            <div className="cl-footer etq-footer">
              <button type="button" className="btn-outline" onClick={onClose}>{t('pedidos.etiqueta.cancelar')}</button>
              <button type="button" className="btn-outline" onClick={() => alert(t('pedidos.etiqueta.emBreveBaixar'))}>{t('pedidos.etiqueta.baixarPdf')}</button>
              <button type="button" className="btn-dark" onClick={() => void gerar(pedidos, false)}>
                <Icon name="printer" size={16} /> {plural(t, 'pedidos.etiqueta.imprimirLote', pedidos.length)}
              </button>
            </div>
          </>
        )}

        {fase === 'gerando' && (
          <div className="etq-gerando" role="status">
            <div className="etq-spinner" aria-hidden="true" />
            <p>{t('pedidos.etiqueta.gerando')}</p>
          </div>
        )}

        {fase === 'resultado' && (
          <>
            {okCount > 0 && (
              <div className="etq-res etq-res-ok" role="status">
                <Icon name="check" size={16} />
                <span>{plural(t, 'pedidos.etiqueta.enviadas', okCount)}</span>
              </div>
            )}
            {falhas.length > 0 && (
              <div className="etq-res etq-res-falha" role="alert">
                <div className="etq-res-titulo"><Icon name="alert" size={16} /><b>{plural(t, 'pedidos.etiqueta.falharam', falhas.length)}</b></div>
                <ul>
                  {falhas.map((r) => (
                    <li key={r.id}>
                      <b>#{(porId.get(r.id)?.id ?? r.id).slice(-8)}</b>
                      <span>{r.erro === 'codigo' ? t('pedidos.etiqueta.aguardandoCodigo') : t('pedidos.etiqueta.falha')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="cl-footer etq-footer">
              {falhas.length > 0 && <button type="button" className="btn-outline" onClick={tentarNovamente}>{t('pedidos.etiqueta.tentarNovamente')}</button>}
              <button type="button" className="btn-dark" onClick={onClose}>{t('pedidos.etiqueta.concluir')}</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
