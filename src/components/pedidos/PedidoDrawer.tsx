import type { Pedido } from '../../lib/pedidosMock';
import { brl } from '../../lib/format';
import { classeTagMarketplace } from '../../lib/marketplaceTag';
import { useI18n } from '../../context/I18nContext';
import { Drawer, Secao } from '../../feiras/components/ui';
import '../../feiras/feiras.css';

function alertaEmBreve(acao: string) {
  alert(`Em breve: ${acao}.`);
}

function traduzirStatusPedido(t: (chave: string) => string, s: string) {
  if (s === 'Pago') return t('pedidos.statusPago');
  if (s === 'Enviado') return t('pedidos.statusEnviado');
  if (s === 'Pendente') return t('pedidos.statusPendente');
  if (s === 'Cancelado') return t('pedidos.statusCancelado');
  if (s === 'Entregue') return t('pedidos.statusEntregue');
  return s;
}
function traduzirPagamento(t: (chave: string) => string, s: string) {
  if (s === 'Aprovado') return t('pedidos.pagamentoAprovado');
  if (s === 'Pendente') return t('pedidos.statusPendente');
  if (s === 'Reembolsado') return t('pedidos.pagamentoReembolsado');
  return s;
}

export default function PedidoDrawer({ pedido, onClose }: { pedido: Pedido; onClose: () => void }) {
  const { t, idioma } = useI18n();
  const en = idioma === 'en';
  const taxaValor = pedido.valorTotal * pedido.taxaPct;
  const margemLiquida = pedido.valorTotal + pedido.frete - taxaValor;
  const info = [
    { label: t('pedidos.colunaComprador'), valor: pedido.comprador, meta: `${pedido.compradorHandle} · ${pedido.compradorCompras} ${t('pedidos.comprasPlural')}` },
    { label: t('pedidos.colunaPagamento'), valor: traduzirPagamento(t, pedido.pagamento), meta: pedido.pagamentoData },
    { label: t('pedidos.envioLabel'), valor: pedido.envioMetodo, meta: pedido.envioCodigo },
    { label: t('pedidos.destinoLabel'), valor: pedido.destinoCidade, meta: `${t('pedidos.cepLabel')} ${pedido.destinoCep}` },
  ];

  // Mesmo Drawer do Clientes › Novo cliente (módulo Feiras); o wrapper .fe traz as variáveis de cor dele.
  return (
    <div className="fe">
      <Drawer aberto largo titulo={`${t('pedidos.pedidoLabel')} #${pedido.id}`} subtitulo={`#${pedido.codigoMlb}`} onClose={onClose}
        rodape={<>
          <button type="button" className="fe-btn fe-btn-outline" onClick={() => (en ? alert('Coming soon: copy tracking number.') : alertaEmBreve('copiar código de rastreio'))}>{t('pedidos.copiarRastreio')}</button>
          <button type="button" className="fe-btn fe-btn-primary fe-grow" onClick={() => (en ? alert('Coming soon: open order on the marketplace.') : alertaEmBreve('abrir pedido no marketplace'))}>{t('pedidos.abrirNoMarketplace')}</button></>}>
        <Secao titulo={t('pedidos.informacoesPrincipais')}>
          <div className="fe-chips">
            <span className={'mp-tag ' + classeTagMarketplace(pedido.marketplace)}>{pedido.marketplace}</span>
            <span className="fe-badge fe-green">{traduzirStatusPedido(t, pedido.status)}</span>
            <span className="fe-badge fe-green">{traduzirPagamento(t, pedido.pagamento)}</span>
          </div>
          <div className="fe-form-grid">
            {info.map((c) => (
              <div className="fe-field" key={c.label}>
                <span className="fe-lbl">{c.label}</span>
                <b>{c.valor}</b>
                <span className="fe-hint">{c.meta}</span>
              </div>
            ))}
          </div>
        </Secao>

        <Secao titulo={t('pedidos.itensDoPedido')}>
          <div className="fe-list">
            {pedido.itens.map((item, idx) => (
              <div className="fe-list-item" key={idx}>
                <div className="fe-grow">
                  <div className="fe-t">{item.nome}</div>
                  <div className="fe-s">{item.qtd} {en ? '×' : 'un. ×'} {brl(item.precoUnit)}{item.cor ? ' · ' + t('pedidos.corLabel') + ': ' + item.cor : ''}</div>
                </div>
                <b>{brl(item.precoUnit * item.qtd)}</b>
              </div>
            ))}
          </div>
        </Secao>

        <Secao titulo={t('pedidos.resumoFinanceiro')}>
          <div className="fe-list">
            <div className="fe-list-item"><span className="fe-grow">{t('pedidos.subtotal')}</span><b>{brl(pedido.valorTotal)}</b></div>
            <div className="fe-list-item"><span className="fe-grow">{t('pedidos.frete')}</span><b>{brl(pedido.frete)}</b></div>
            <div className="fe-list-item"><span className="fe-grow">{t('pedidos.taxaDoMarketplace')} ({(pedido.taxaPct * 100).toFixed(0)}%)</span><b style={{ color: 'var(--red)' }}>− {brl(taxaValor)}</b></div>
            <div className="fe-list-item"><span className="fe-grow fe-t">{t('pedidos.margemLiquida')}</span><b style={{ color: 'var(--primary-dark)' }}>{brl(margemLiquida)}</b></div>
          </div>
        </Secao>

        <Secao titulo={t('pedidos.linhaDoTempo')}>
          <div className="fe-timeline">
            {pedido.timeline.map((etapa, idx) => (
              <div className={'fe-tl' + (etapa.feito ? '' : ' fe-pend')} key={idx}>
                <span className="fe-pt" />
                <div style={{ flex: 1 }}>
                  <div className="fe-n"><b>{etapa.label}</b></div>
                  <div className="fe-h">{etapa.data}{etapa.detalhe ? ' · ' + etapa.detalhe : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </Secao>
      </Drawer>
    </div>
  );
}
