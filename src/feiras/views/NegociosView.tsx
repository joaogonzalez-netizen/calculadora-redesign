import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl, brlCurto, hoje, relativo, waLink } from '../lib/format';
import { ETAPAS, type Etapa, type Negocio } from '../lib/types';
import { Pagina } from '../components/ui';
import Icon from '../components/Icon';

export default function NegociosView() {
  const { db, moverNegocio, feiraAtiva } = useStore();
  const { abrir, avisar } = useUi();
  const [q, setQ] = useState('');
  const [feira, setFeira] = useState<string>('todas');
  const [soQuentes, setSoQuentes] = useState(false);
  const [etapaM, setEtapaM] = useState<Etapa>('novo');
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<Etapa | null>(null);

  const lista = useMemo(() => db.negocios.filter((n) => {
    const c = db.clientes.find((x) => x.id === n.clienteId);
    if (feira !== 'todas' && n.feiraId !== (feira === 'sem' ? null : feira)) return false;
    if (soQuentes && n.temperatura !== 'quente') return false;
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    return n.titulo.toLowerCase().includes(t) || (c?.nome.toLowerCase().includes(t) ?? false) || (c?.empresa.toLowerCase().includes(t) ?? false);
  }), [db, q, feira, soQuentes]);

  const soltar = (etapa: Etapa) => {
    const n = db.negocios.find((x) => x.id === arrastando);
    setArrastando(null); setSobre(null);
    if (!n || n.etapa === etapa) return;
    if (etapa === 'fechado' || etapa === 'perdido') { abrir('negocio', n.id); avisar(etapa === 'fechado' ? 'Para fechar, confirme os itens do pedido' : 'Conte por que o negócio não avançou'); return; }
    moverNegocio(n.id, etapa);
  };

  return (
    <Pagina titulo="Negociações" sub="Arraste os cartões entre as etapas ou toque para abrir."
      acoes={<button className="fe-btn fe-btn-outline" onClick={() => abrir('negocio')}><Icon name="plus" /> Nova negociação</button>}>
      <div className="fe-toolbar">
        <div className="fe-search"><Icon name="search" size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente ou produto" aria-label="Buscar" /></div>
        <select className="fe-select-sm" value={feira} onChange={(e) => setFeira(e.target.value)} aria-label="Filtrar por ponto de venda">
          <option value="todas">Todos os pontos de venda</option>
          {db.feiras.map((f) => <option key={f.id} value={f.id}>{f.nome}{f.id === feiraAtiva?.id ? ' (ativa)' : ''}</option>)}
          <option value="sem">Sem ponto de venda</option>
        </select>
        <button className={'fe-chip' + (soQuentes ? ' fe-on' : '')} onClick={() => setSoQuentes(!soQuentes)}><Icon name="flame" size={14} /> Só quentes</button>
      </div>

      <div className="fe-stage-tabs" role="tablist">
        {ETAPAS.map((e) => <button key={e.id} role="tab" aria-selected={etapaM === e.id} className={etapaM === e.id ? 'fe-on' : ''} onClick={() => setEtapaM(e.id)}>{e.label}<b>{lista.filter((n) => n.etapa === e.id).length}</b></button>)}
      </div>

      <div className="fe-kanban">
        {ETAPAS.map((e) => {
          const col = lista.filter((n) => n.etapa === e.id).sort((a, b) => (a.proximoContato ?? '9').localeCompare(b.proximoContato ?? '9'));
          return (
            <section key={e.id} className={'fe-col' + (sobre === e.id ? ' fe-over' : '') + (etapaM === e.id ? ' fe-m-on' : '')} aria-label={e.label}
              onDragOver={(ev) => { ev.preventDefault(); setSobre(e.id); }} onDragLeave={() => setSobre((s) => (s === e.id ? null : s))} onDrop={() => soltar(e.id)}>
              <div className="fe-col-head"><h3>{e.label}</h3><span className="fe-n">{col.length}</span></div>
              <div className="fe-col-sum">{col.length ? brlCurto(col.reduce((s, n) => s + n.valor, 0)) : e.hint}</div>
              {col.length === 0 && <div className="fe-col-empty">{e.id === 'novo' ? 'Contatos do ponto de venda chegam aqui' : 'Nada por aqui'}</div>}
              {col.map((n) => <Cartao key={n.id} n={n} arrastando={arrastando === n.id} onDrag={setArrastando} />)}
            </section>
          );
        })}
      </div>
    </Pagina>
  );
}

function Cartao({ n, arrastando, onDrag }: { n: Negocio; arrastando: boolean; onDrag: (id: string | null) => void }) {
  const { db } = useStore();
  const { abrir } = useUi();
  const c = db.clientes.find((x) => x.id === n.clienteId);
  const aberto = n.etapa !== 'fechado' && n.etapa !== 'perdido';
  const atraso = aberto && n.proximoContato && n.proximoContato < hoje();
  const hojeC = aberto && n.proximoContato === hoje();
  return (
    <div className={'fe-deal' + (arrastando ? ' fe-dragging' : '')} draggable onDragStart={() => onDrag(n.id)} onDragEnd={() => onDrag(null)}
      role="button" tabIndex={0} onClick={() => abrir('negocio', n.id)} onKeyDown={(e) => e.key === 'Enter' && abrir('negocio', n.id)} style={{ cursor: 'pointer' }}>
      <div className="fe-row"><span className="fe-who">{c?.nome ?? 'Cliente'}</span><span className={'fe-temp fe-' + n.temperatura}>{n.temperatura === 'quente' && <Icon name="flame" size={13} />}{n.temperatura}</span></div>
      <div className="fe-what">{n.titulo}</div>
      <div className="fe-row">
        <span className="fe-val">{n.valor ? brl(n.valor) : '—'}</span>
        {aberto && c?.telefone && <a className="fe-btn fe-btn-wa fe-btn-sm" href={waLink(c.telefone)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} aria-label={`WhatsApp ${c.nome}`} style={{ padding: '4px 9px', minHeight: 30 }}><Icon name="whatsapp" size={14} /></a>}
      </div>
      {aberto && n.proximoContato && <div className={'fe-follow' + (atraso ? ' fe-late' : hojeC ? ' fe-today' : '')}><Icon name={atraso ? 'alert' : 'clock'} size={13} />Falar {relativo(n.proximoContato)}</div>}
      {n.etapa === 'perdido' && n.motivoPerda && <div className="fe-follow">{n.motivoPerda}</div>}
    </div>
  );
}
