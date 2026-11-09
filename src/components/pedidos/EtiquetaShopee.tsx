import type { Pedido } from '../../lib/pedidosMock';
import { dadosDaEtiqueta, gerador } from '../../lib/etiquetasShopee';

const MODULOS_QR = 21;

function ehEscuroNoLocalizador(l: number, c: number, topo: number, esquerda: number): boolean | null {
  const dl = l - topo;
  const dc = c - esquerda;
  if (dl < -1 || dl > 7 || dc < -1 || dc > 7) return null;
  if (dl === -1 || dl === 7 || dc === -1 || dc === 7) return false; // área livre em volta
  const borda = dl === 0 || dl === 6 || dc === 0 || dc === 6;
  const centro = dl >= 2 && dl <= 4 && dc >= 2 && dc <= 4;
  return borda || centro;
}

/** QR de mentira: três localizadores de verdade e o resto sorteado pela semente. Não lê. */
function Qr({ semente, rotulo }: { semente: string; rotulo: string }) {
  const r = gerador('qr' + semente);
  const modulos: { l: number; c: number }[] = [];
  for (let l = 0; l < MODULOS_QR; l++) {
    for (let c = 0; c < MODULOS_QR; c++) {
      const fixo =
        ehEscuroNoLocalizador(l, c, 0, 0) ?? ehEscuroNoLocalizador(l, c, 0, MODULOS_QR - 7) ?? ehEscuroNoLocalizador(l, c, MODULOS_QR - 7, 0);
      const escuro = fixo ?? r() > 0.52;
      if (escuro) modulos.push({ l, c });
    }
  }
  return (
    <svg className="etq-qr" viewBox={`0 0 ${MODULOS_QR} ${MODULOS_QR}`} shapeRendering="crispEdges" role="img" aria-label={rotulo}>
      {modulos.map((m) => <rect key={m.l * MODULOS_QR + m.c} x={m.c} y={m.l} width={1} height={1} fill="currentColor" />)}
    </svg>
  );
}

function Barras({ codigo }: { codigo: string }) {
  const r = gerador('barras' + codigo);
  const barras: { x: number; w: number }[] = [];
  let x = 0;
  while (x < 150) {
    const w = 1 + Math.floor(r() * 3);
    barras.push({ x, w });
    x += w + 1 + Math.floor(r() * 2);
  }
  return (
    <svg className="etq-barras" viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" role="img" aria-label={codigo}>
      {barras.map((b) => <rect key={b.x} x={b.x} y={0} width={b.w} height={40} fill="currentColor" />)}
    </svg>
  );
}

/**
 * Etiqueta de envio da Shopee, simulada, no desenho da térmica real (10×15 cm):
 * destinatário, rota de triagem, coleta, remetente e DANFE simplificada.
 * O texto fica em português de propósito: a etiqueta real não muda de idioma
 * com o app. Os dados são fictícios (ver `dadosDaEtiqueta`).
 */
export default function EtiquetaShopee({ pedido }: { pedido: Pedido }) {
  const d = dadosDaEtiqueta(pedido);
  return (
    <div className="etq-label-box">
      <div className="etq-label">
        <section className="etq-sec etq-dest">
          <div className="etq-dest-txt">
            <span className="etq-faixa">DESTINATÁRIO</span>
            <b className="etq-nome">{d.destinatario.nome}</b>
            <span>{d.destinatario.endereco}</span>
            <span><b>Bairro:</b> {d.destinatario.bairro}</span>
            <span><b>CEP:</b> {d.destinatario.cep}</span>
            <span><b>Pedido:</b> {d.destinatario.pedido}</span>
          </div>
          <div className="etq-dest-lado">
            <span className="etq-shopee">Shopee</span>
            <Qr semente={pedido.id + 'dest'} rotulo="QR do destinatário" />
            <span className="etq-r">R</span>
          </div>
        </section>

        <section className="etq-sec etq-rota">
          <div className="etq-rota-qr">
            <Qr semente={pedido.id + 'rota'} rotulo="QR da rota" />
            <span>{d.rota.cidade}</span>
          </div>
          <div className="etq-rota-codigos">
            <b>{d.rota.codigo1}</b>
            <b>{d.rota.codigo2}</b>
          </div>
        </section>

        <section className="etq-sec etq-coleta">
          <div className="etq-coleta-cod">
            <Barras codigo={d.rastreio} />
            <span>{d.rastreio}</span>
          </div>
          <b className="etq-coleta-txt">COLETA</b>
        </section>

        <section className="etq-sec etq-rem">
          <div className="etq-rem-txt">
            <span className="etq-faixa">REMETENTE</span>
            <b>{d.remetente.nome}</b>
            <span>{d.remetente.endereco}</span>
            <span><b>CEP:</b> {d.remetente.cep}</span>
            <span><b>Envio previsto:</b> {d.remetente.envioPrevisto}</span>
          </div>
          <div className="etq-rem-lado">
            <Qr semente={pedido.id + 'rem'} rotulo="QR do remetente" />
            <span className="etq-hub">{d.remetente.hub1}<br />{d.remetente.hub2}</span>
          </div>
        </section>

        <section className="etq-danfe">
          <div className="etq-danfe-titulo">DANFE SIMPLIFICADO - ETIQUETA</div>
          <div className="etq-danfe-meta">
            <span>1 - Saída</span>
            <span>NF: {d.danfe.nf}</span>
            <span>Série: {d.danfe.serie}</span>
            <span>Emissão: {d.danfe.emissao}</span>
          </div>
          <div className="etq-danfe-chave">{d.danfe.chave}</div>
          <Barras codigo={d.danfe.chave} />
          <div className="etq-danfe-item">{d.danfe.item}</div>
        </section>
      </div>
    </div>
  );
}
