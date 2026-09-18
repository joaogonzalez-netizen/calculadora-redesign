import { useMemo, useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { PEDIDOS } from '../lib/pedidosMock';
import { preencherMensagemEtiqueta, getCreditosMock, descontarCreditosMock, CUSTO_CREDITOS } from '../lib/marketing';

// V1 mockada — fonte do dado é Pedidos (não o Histórico da Calculadora, que
// não guarda nome de comprador). Geração final usa impressão do navegador
// (@media print), não uma lib de PDF — ver Seção 5.3/10 da spec.
export default function MarketingEtiquetasView() {
  const { t } = useI18n();
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [mensagemBase, setMensagemBase] = useState(t('marketing.etiquetas.mensagemPadrao'));
  const [creditos, setCreditos] = useState(getCreditosMock);
  const [gerando, setGerando] = useState(false);

  const custo = CUSTO_CREDITOS.etiquetas;
  const semCredito = creditos < custo;
  const pedidosSelecionados = useMemo(() => PEDIDOS.filter((p) => selecionados.has(p.id)), [selecionados]);
  const primeiraSelecao = pedidosSelecionados[0] ?? null;
  const totalFolhas = Math.max(1, Math.ceil(pedidosSelecionados.length / 4));
  const folhas = useMemo(() => {
    const grupos: (typeof pedidosSelecionados)[] = [];
    for (let i = 0; i < pedidosSelecionados.length; i += 4) grupos.push(pedidosSelecionados.slice(i, i + 4));
    return grupos;
  }, [pedidosSelecionados]);

  function alternar(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function gerar() {
    if (!pedidosSelecionados.length || gerando || semCredito) return;
    setGerando(true);
    setTimeout(() => {
      setCreditos(descontarCreditosMock(custo));
      setGerando(false);
      window.print();
    }, 700);
  }

  return (
    <div>
      <div className="hero">
        <h1>{t('nav.etiquetasAgradecimento')}</h1>
      </div>

      {!PEDIDOS.length ? (
        <div className="mkt-empty">
          <p>{t('marketing.etiquetas.nenhumPedido')}</p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-body">
              <h3>{t('marketing.etiquetas.selecionarPedidos')}</h3>
              <table className="prod-table">
                <thead>
                  <tr>
                    <th style={{ width: 32 }} />
                    <th>{t('marketing.etiquetas.colunaProduto')}</th>
                    <th>{t('pedidos.colunaComprador')}</th>
                    <th>{t('pedidos.colunaMarketplace')}</th>
                  </tr>
                </thead>
                <tbody>
                  {PEDIDOS.slice(0, 20).map((p) => (
                    <tr key={p.id}>
                      <td><input type="checkbox" checked={selecionados.has(p.id)} onChange={() => alternar(p.id)} /></td>
                      <td><div className="prod-name">{p.produto}</div></td>
                      <td><div className="prod-name">{p.comprador}</div></td>
                      <td><span className="mp-tag">{p.marketplace}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <span className="hint">{t('marketing.etiquetas.pedidosSelecionados').replace('{n}', String(pedidosSelecionados.length))}</span>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="field">
                <label>{t('marketing.etiquetas.mensagemLabel')}</label>
                <textarea value={mensagemBase} onChange={(e) => setMensagemBase(e.target.value)} rows={3} />
                <span className="hint">{t('marketing.etiquetas.mensagemHint')}</span>
              </div>

              {primeiraSelecao && (
                <div className="field">
                  <label>{t('marketing.etiquetas.previewTitulo')}</label>
                  <div className="mkt-etiqueta-item">
                    <div className="mkt-etiqueta-produto">{primeiraSelecao.produto}</div>
                    <p>{preencherMensagemEtiqueta(mensagemBase, primeiraSelecao.comprador, primeiraSelecao.produto)}</p>
                  </div>
                </div>
              )}

              <div className="mkt-actions-row">
                <button type="button" className="btn-dark" disabled={!pedidosSelecionados.length || gerando || semCredito} onClick={gerar}>
                  {gerando ? t('marketing.gerando') : t('marketing.etiquetas.gerar')}
                </button>
                <span className="hint">
                  {t('marketing.creditosCusto').replace('{n}', String(custo))} · {t('marketing.creditosSaldo').replace('{n}', String(creditos))}
                </span>
              </div>
              {pedidosSelecionados.length > 0 && (
                <span className="hint">{t('marketing.etiquetas.folhasInfo').replace('{n}', String(totalFolhas))}</span>
              )}
              {semCredito && <span className="hint" style={{ color: 'var(--red)' }}>{t('marketing.creditosInsuficientes')}</span>}
            </div>
          </div>

          {/* Folhas de impressão — só ficam visíveis dentro de @media print (index.css), 4 etiquetas por folha A4. */}
          <div className="etiquetas-print-sheet">
            {folhas.map((grupo, i) => (
              <div className="etiquetas-print-folha" key={i}>
                {grupo.map((p) => (
                  <div className="etiqueta-print-item" key={p.id}>
                    <div className="etiqueta-print-produto">{p.produto}</div>
                    <p>{preencherMensagemEtiqueta(mensagemBase, p.comprador, p.produto)}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
