import type { Pedido } from '../../lib/pedidosMock';
import { brl } from '../../lib/format';
import Icon from '../Icon';

function alertaEmBreve(acao: string) {
  alert(`Em breve: ${acao}.`);
}

export default function PedidoDrawer({ pedido, onClose }: { pedido: Pedido; onClose: () => void }) {
  const taxaValor = pedido.valorTotal * pedido.taxaPct;
  const margemLiquida = pedido.valorTotal + pedido.frete - taxaValor;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer ped-drawer">
        <div className="cl-head">
          <div>
            <h4>Pedido #{pedido.id}</h4>
            <div className="cl-sub">#{pedido.codigoMlb}</div>
          </div>
          <button type="button" className="cl-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>

        <div className="ped-drawer-badges">
          <span className="mp-tag">{pedido.marketplace}</span>
          <span className="status-tag status-ativo">{pedido.status}</span>
          <span className="status-tag status-ativo">{pedido.pagamento}</span>
        </div>

        <div className="cl-body">
          <div className="ped-section">
            <div className="divider-label">Informações principais</div>
            <div className="ped-info-grid">
              <div className="ped-info-cell">
                <span className="ped-info-label">Comprador</span>
                <b>{pedido.comprador}</b>
                <span className="ped-info-meta">{pedido.compradorHandle} · {pedido.compradorCompras} compras</span>
              </div>
              <div className="ped-info-cell">
                <span className="ped-info-label">Pagamento</span>
                <b>{pedido.pagamento}</b>
                <span className="ped-info-meta">{pedido.pagamentoData}</span>
              </div>
              <div className="ped-info-cell">
                <span className="ped-info-label">Envio</span>
                <b>{pedido.envioMetodo}</b>
                <span className="ped-info-meta">{pedido.envioCodigo}</span>
              </div>
              <div className="ped-info-cell">
                <span className="ped-info-label">Destino</span>
                <b>{pedido.destinoCidade}</b>
                <span className="ped-info-meta">CEP {pedido.destinoCep}</span>
              </div>
            </div>
          </div>

          <div className="ped-section">
            <div className="divider-label">Itens do pedido</div>
            {pedido.itens.map((item, idx) => (
              <div className="ped-item-row" key={idx}>
                <div>
                  <b>{item.nome}</b>
                  <div className="ped-info-meta">{item.qtd} un. × {brl(item.precoUnit)}{item.cor ? ' · Cor: ' + item.cor : ''}</div>
                </div>
                <b>{brl(item.precoUnit * item.qtd)}</b>
              </div>
            ))}
          </div>

          <div className="ped-section">
            <div className="divider-label">Resumo financeiro</div>
            <div className="ped-resumo-row"><span>Subtotal</span><b>{brl(pedido.valorTotal)}</b></div>
            <div className="ped-resumo-row"><span>Frete</span><b>{brl(pedido.frete)}</b></div>
            <div className="ped-resumo-row ped-resumo-taxa"><span>Taxa do marketplace ({(pedido.taxaPct * 100).toFixed(0)}%)</span><b>− {brl(taxaValor)}</b></div>
            <div className="ped-resumo-row ped-resumo-total"><span>Margem líquida</span><b>{brl(margemLiquida)}</b></div>
          </div>

          <div className="ped-section">
            <div className="divider-label">Linha do tempo</div>
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
          <button type="button" className="btn-outline" onClick={() => alertaEmBreve('copiar código de rastreio')}>Copiar rastreio</button>
          <button type="button" className="btn-dark" onClick={() => alertaEmBreve('abrir pedido no marketplace')}>Abrir no marketplace</button>
        </div>
      </div>
    </>
  );
}
