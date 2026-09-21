import type { Pedido } from '../../lib/pedidosMock';
import { brl } from '../../lib/format';
import { classeTagMarketplace } from '../../lib/marketplaceTag';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

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
  const { t } = useI18n();
  const taxaValor = pedido.valorTotal * pedido.taxaPct;
  const margemLiquida = pedido.valorTotal + pedido.frete - taxaValor;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer ped-drawer">
        <div className="cl-head">
          <div>
            <h4>{t('pedidos.pedidoLabel')} #{pedido.id}</h4>
            <div className="cl-sub">#{pedido.codigoMlb}</div>
          </div>
          <button type="button" className="cl-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>

        <div className="ped-drawer-badges">
          <span className={'mp-tag ' + classeTagMarketplace(pedido.marketplace)}>{pedido.marketplace}</span>
          <span className="status-tag status-ativo">{traduzirStatusPedido(t, pedido.status)}</span>
          <span className="status-tag status-ativo">{traduzirPagamento(t, pedido.pagamento)}</span>
        </div>

        <div className="cl-body">
          <div className="ped-section">
            <div className="divider-label">{t('pedidos.informacoesPrincipais')}</div>
            <div className="ped-info-grid">
              <div className="ped-info-cell">
                <span className="ped-info-label">{t('pedidos.colunaComprador')}</span>
                <b>{pedido.comprador}</b>
                <span className="ped-info-meta">{pedido.compradorHandle} · {pedido.compradorCompras} {t('pedidos.comprasPlural')}</span>
              </div>
              <div className="ped-info-cell">
                <span className="ped-info-label">{t('pedidos.colunaPagamento')}</span>
                <b>{traduzirPagamento(t, pedido.pagamento)}</b>
                <span className="ped-info-meta">{pedido.pagamentoData}</span>
              </div>
              <div className="ped-info-cell">
                <span className="ped-info-label">{t('pedidos.envioLabel')}</span>
                <b>{pedido.envioMetodo}</b>
                <span className="ped-info-meta">{pedido.envioCodigo}</span>
              </div>
              <div className="ped-info-cell">
                <span className="ped-info-label">{t('pedidos.destinoLabel')}</span>
                <b>{pedido.destinoCidade}</b>
                <span className="ped-info-meta">{t('pedidos.cepLabel')} {pedido.destinoCep}</span>
              </div>
            </div>
          </div>

          <div className="ped-section">
            <div className="divider-label">{t('pedidos.itensDoPedido')}</div>
            {pedido.itens.map((item, idx) => (
              <div className="ped-item-row" key={idx}>
                <div>
                  <b>{item.nome}</b>
                  <div className="ped-info-meta">{item.qtd} un. × {brl(item.precoUnit)}{item.cor ? ' · ' + t('pedidos.corLabel') + ': ' + item.cor : ''}</div>
                </div>
                <b>{brl(item.precoUnit * item.qtd)}</b>
              </div>
            ))}
          </div>

          <div className="ped-section">
            <div className="divider-label">{t('pedidos.resumoFinanceiro')}</div>
            <div className="ped-resumo-row"><span>{t('pedidos.subtotal')}</span><b>{brl(pedido.valorTotal)}</b></div>
            <div className="ped-resumo-row"><span>{t('pedidos.frete')}</span><b>{brl(pedido.frete)}</b></div>
            <div className="ped-resumo-row ped-resumo-taxa"><span>{t('pedidos.taxaDoMarketplace')} ({(pedido.taxaPct * 100).toFixed(0)}%)</span><b>− {brl(taxaValor)}</b></div>
            <div className="ped-resumo-row ped-resumo-total"><span>{t('pedidos.margemLiquida')}</span><b>{brl(margemLiquida)}</b></div>
          </div>

          <div className="ped-section">
            <div className="divider-label">{t('pedidos.linhaDoTempo')}</div>
            <div className="ped-timeline">
              {pedido.timeline.map((etapa, idx) => (
                <div className={'ped-timeline-item' + (etapa.feito ? ' feito' : '')} key={idx}>
                  <span className="ped-timeline-marca">{etapa.feito && <Icon name="check" size={11} />}</span>
                  <div>
                    <b>{etapa.label}</b>
                    <div className="ped-info-meta">{etapa.data}{etapa.detalhe ? ' · ' + etapa.detalhe : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ped-drawer-footer">
          <button type="button" className="btn-outline" onClick={() => alertaEmBreve('copiar código de rastreio')}>{t('pedidos.copiarRastreio')}</button>
          <button type="button" className="btn-dark" onClick={() => alertaEmBreve('abrir pedido no marketplace')}>{t('pedidos.abrirNoMarketplace')}</button>
        </div>
      </div>
    </>
  );
}
