import { useMemo, useState } from 'react';
import { useStore, horasPedido, totalPedido } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl, brlCurto, dataCurta, hoje, numero } from '../lib/format';
import { useFeirasT } from '../lib/i18n';
import type { StatusPedido } from '../lib/types';
import { pedidosDoIdioma, type Pedido as PedidoMarketplace } from '../../lib/pedidosMock';
import PedidoMarketplaceDrawer from '../../components/pedidos/PedidoDrawer';
import { Pagina } from '../components/ui';
import { precoAtacado } from '../lib/pricing';
import Icon from '../components/Icon';

type Etapa = 'fila' | 'imprimindo' | 'preparacao' | 'pronto' | 'concluido';
type Origem = PedidoMarketplace['marketplace'] | 'Venda direta' | 'Ponto de venda';

// Rótulos e dicas de cada etapa vêm do dicionário (feiras.fila.etapa.<id> e feiras.fila.hint.<id>).
const ETAPAS: { id: Etapa }[] = [{ id: 'fila' }, { id: 'imprimindo' }, { id: 'preparacao' }, { id: 'pronto' }, { id: 'concluido' }];

// Venda direta: etapa da fila <-> status do pedido da feira.
const STATUS_DA_ETAPA: Record<Etapa, StatusPedido> = { fila: 'Na fila', imprimindo: 'Imprimindo', preparacao: 'Em preparação para envio', pronto: 'Pronto', concluido: 'Entregue' };
const ETAPA_DO_STATUS: Partial<Record<StatusPedido, Etapa>> = { 'Na fila': 'fila', Imprimindo: 'imprimindo', 'Em preparação para envio': 'preparacao', Pronto: 'pronto', Entregue: 'concluido', Pago: 'concluido' };

// Marketplace: o mock só conhece Pago/Enviado/Entregue. Mover o cartão guarda a etapa aqui.
const KEY_ETAPAS = 'stlseller.fila.etapas.v1';
const lerEtapas = (): Record<string, Etapa> => { try { return JSON.parse(localStorage.getItem(KEY_ETAPAS) || '{}'); } catch { return {}; } };
// Todo pedido novo do marketplace cai direto na fila (pago ou com pagamento pendente). Cancelado não entra.
// Quando o marketplace marca Enviado/Entregue, o pedido vai para Concluídos sozinho, mesmo que o cartão tenha sido movido à mão.
const etapaMarketplace = (p: PedidoMarketplace, manual?: Etapa): Etapa | null => {
  if (p.status === 'Cancelado') return null;
  if (p.status === 'Enviado' || p.status === 'Entregue') return 'concluido';
  return manual ?? 'fila';
};
// Data do pedido: dd/mm/aaaa em pt/es, mm/dd/yyyy em en.
const isoDaData = (d: string, en: boolean) => { const [a, b, aa] = d.split('/'); return en ? `${aa}-${a}-${b}` : `${aa}-${b}-${a}`; };
const somaDias = (iso: string, n: number) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

interface Cartao {
  chave: string;
  id: string;
  origem: Origem;
  cliente: string;
  resumo: string;
  pecas: number;
  horas: number | null;
  prazo: string;
  valor: number;
  etapa: Etapa;
  pagamentoPendente?: boolean;
}

const COR_ORIGEM: Record<Origem, string> = { 'Mercado Livre': 'fe-amber', Shopee: 'fe-red', Etsy: 'fe-amber', 'TikTok Shop': 'fe-red', 'Venda direta': 'fe-green', 'Ponto de venda': 'fe-green' };
type FiltroOrigem = 'todas' | 'marketplace' | 'direta' | 'ponto';
const grupoDe = (o: Origem): FiltroOrigem => (o === 'Venda direta' ? 'direta' : o === 'Ponto de venda' ? 'ponto' : 'marketplace');

export default function FilaView() {
  const { db, statusPedido } = useStore();
  const { abrir, avisar, ir } = useUi();
  const { t, idioma } = useFeirasT();
  // Pedidos de marketplace do idioma ativo (EN: Etsy/TikTok Shop, em dólar).
  const PEDIDOS = useMemo(() => pedidosDoIdioma(idioma), [idioma]);
  const [etapas, setEtapas] = useState(lerEtapas);
  const [filtro, setFiltro] = useState<FiltroOrigem>('todas');
  const [verConcluidos, setVerConcluidos] = useState(false);
  const [etapaM, setEtapaM] = useState<Etapa>('fila');
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<Etapa | null>(null);
  const [aberto, setAberto] = useState<PedidoMarketplace | null>(null);

  const cartoes = useMemo<Cartao[]>(() => {
    const diretos = db.pedidos.flatMap((p): Cartao[] => {
      const etapa = ETAPA_DO_STATUS[p.status];
      if (!etapa) return [];
      return [{
        chave: 'f:' + p.id, id: p.id, origem: 'Venda direta', cliente: db.clientes.find((c) => c.id === p.clienteId)?.nome ?? t('feiras.comum.nd'),
        resumo: p.itens.map((i) => `${i.qtd}× ${i.nome}`).join(', '), pecas: p.itens.reduce((s, i) => s + i.qtd, 0), horas: horasPedido(p),
        prazo: p.entrega, valor: totalPedido(p), etapa,
      }];
    });
    const mkt = PEDIDOS.flatMap((p): Cartao[] => {
      const etapa = etapaMarketplace(p, etapas[p.id]);
      if (!etapa) return [];
      return [{
        chave: 'm:' + p.id, id: p.id, origem: p.marketplace, cliente: p.comprador, resumo: `${p.qtd}× ${p.produto}`, pecas: p.qtd, horas: null,
        prazo: somaDias(isoDaData(p.data, idioma === 'en'), 2), valor: p.valorTotal, etapa, pagamentoPendente: p.status === 'Pendente',
      }];
    });
    // Pontos de venda abertos (ainda não terminaram): o que você vai levar entra na fila de produção.
    const pontos = db.feiras.flatMap((f): Cartao[] => {
      const itens = (f.produtos ?? []).flatMap((x) => { const p = db.produtos.find((y) => y.id === x.produtoId); return p ? [{ p, qtd: x.qtd, unit: x.unit ?? precoAtacado(p, db.config) }] : []; });
      if (!itens.length || f.fim < hoje()) return [];
      return [{
        chave: 'p:' + f.id, id: f.id, origem: 'Ponto de venda', cliente: f.nome, resumo: itens.map((i) => `${i.qtd}× ${i.p.nome}`).join(', '),
        pecas: itens.reduce((s, i) => s + i.qtd, 0), horas: itens.reduce((s, i) => s + i.qtd * i.p.tempoH, 0), prazo: f.inicio,
        valor: itens.reduce((s, i) => s + i.qtd * i.unit, 0), etapa: etapas['p:' + f.id] ?? 'fila',
      }];
    });
    return [...diretos, ...pontos, ...mkt].sort((a, b) => a.prazo.localeCompare(b.prazo));
  }, [db.pedidos, db.clientes, db.feiras, db.produtos, db.config, etapas, t, PEDIDOS, idioma]);

  const visiveis = cartoes.filter((c) => filtro === 'todas' || grupoDe(c.origem) === filtro);
  const colunas = verConcluidos ? ETAPAS : ETAPAS.filter((e) => e.id !== 'concluido');

  function mover(c: Cartao, etapa: Etapa) {
    if (c.etapa === etapa) return;
    if (c.origem === 'Venda direta') statusPedido(c.id, STATUS_DA_ETAPA[etapa]);
    else {
      const novo = { ...etapas, [c.origem === 'Ponto de venda' ? c.chave : c.id]: etapa };
      setEtapas(novo);
      try { localStorage.setItem(KEY_ETAPAS, JSON.stringify(novo)); } catch { /* sem storage */ }
    }
    avisar(t('feiras.fila.movido', { cliente: c.cliente, etapa: t('feiras.fila.etapa.' + etapa) }));
  }
  const soltar = (etapa: Etapa) => {
    const c = cartoes.find((x) => x.chave === arrastando);
    setArrastando(null); setSobre(null);
    if (c) mover(c, etapa);
  };
  const abrirCartao = (c: Cartao) => {
    if (c.origem === 'Venda direta') abrir('pedido', c.id);
    else if (c.origem === 'Ponto de venda') ir('eventos');
    else setAberto(PEDIDOS.find((p) => p.id === c.id) ?? null);
  };

  return (
    <Pagina titulo={t('feiras.fila.titulo')} sub={t('feiras.fila.sub')}
      acoes={<button className="fe-btn fe-btn-primary" onClick={() => abrir('pedido')}><Icon name="plus" /> {t('feiras.fila.novoPedido')}</button>}>
      <div className="fe-toolbar">
        <div className="fe-chips">
          {([['todas', t('feiras.fila.todosCanais')], ['marketplace', t('feiras.fila.marketplaces')], ['direta', t('feiras.fila.diretas')], ['ponto', t('feiras.fila.pontosChip')]] as const).map(([id, l]) => (
            <button key={id} className={'fe-chip' + (filtro === id ? ' fe-on' : '')} onClick={() => setFiltro(id)}>{l}</button>
          ))}
          <button className={'fe-chip' + (verConcluidos ? ' fe-on' : '')} onClick={() => setVerConcluidos(!verConcluidos)}>{t('feiras.fila.mostrarConcluidos')}</button>
        </div>
      </div>

      <div className="fe-stage-tabs" role="tablist">
        {colunas.map((e) => <button key={e.id} role="tab" aria-selected={etapaM === e.id} className={etapaM === e.id ? 'fe-on' : ''} onClick={() => setEtapaM(e.id)}>{t('feiras.fila.etapa.' + e.id)}<b>{visiveis.filter((c) => c.etapa === e.id).length}</b></button>)}
      </div>

      <div className="fe-kanban" style={{ gridTemplateColumns: `repeat(${colunas.length}, minmax(250px, 1fr))` }}>
        {colunas.map((e) => {
          const col = visiveis.filter((c) => c.etapa === e.id);
          return (
            <section key={e.id} className={'fe-col' + (sobre === e.id ? ' fe-over' : '') + (etapaM === e.id ? ' fe-m-on' : '')} aria-label={t('feiras.fila.etapa.' + e.id)}
              onDragOver={(ev) => { ev.preventDefault(); setSobre(e.id); }} onDragLeave={() => setSobre((x) => (x === e.id ? null : x))} onDrop={() => soltar(e.id)}>
              <div className="fe-col-head"><h3>{t('feiras.fila.etapa.' + e.id)}</h3><span className="fe-n">{col.length}</span></div>
              <div className="fe-col-sum">{col.length ? brlCurto(col.reduce((s, c) => s + c.valor, 0)) : t('feiras.fila.hint.' + e.id)}</div>
              {col.length === 0 && <div className="fe-col-empty">{t('feiras.fila.nenhumPedido')}</div>}
              {col.map((c) => {
                const atraso = c.etapa !== 'concluido' && c.prazo < hoje();
                return (
                  <div key={c.chave} className={'fe-deal' + (arrastando === c.chave ? ' fe-dragging' : '')} draggable onDragStart={() => setArrastando(c.chave)} onDragEnd={() => setArrastando(null)}
                    role="button" tabIndex={0} onClick={() => abrirCartao(c)} onKeyDown={(ev) => ev.key === 'Enter' && abrirCartao(c)} style={{ cursor: 'pointer' }}>
                    <div className="fe-row"><span className="fe-who">{c.cliente}</span><span className={'fe-badge ' + COR_ORIGEM[c.origem]}>{c.origem === 'Venda direta' ? t('feiras.fila.origem.direta') : c.origem === 'Ponto de venda' ? t('feiras.fila.origem.ponto') : c.origem}</span></div>
                    <div className="fe-what">{c.resumo}</div>
                    <div className="fe-row"><span className="fe-val">{brl(c.valor)}</span><span className="fe-sub" style={{ color: 'var(--text-3)', fontSize: 12 }}>{c.pagamentoPendente ? t('feiras.fila.pagPendente') : ''}{c.pecas} {c.pecas === 1 ? t('feiras.fila.peca') : t('feiras.fila.pecas')}{c.horas ? ` · ${numero(c.horas)} h` : ''}</span></div>
                    {c.etapa !== 'concluido' && <div className={'fe-follow' + (atraso ? ' fe-late' : '')}><Icon name={atraso ? 'alert' : 'clock'} size={13} />{t('feiras.fila.prazo', { d: dataCurta(c.prazo) })}</div>}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>

      {aberto && <PedidoMarketplaceDrawer pedido={aberto} onClose={() => setAberto(null)} />}
    </Pagina>
  );
}
