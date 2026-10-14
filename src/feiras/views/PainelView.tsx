import { useMemo } from 'react';
import { useStore, totalPedido, custoPedido, horasPedido } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl, brlCurto, hoje, relativo, waLink } from '../lib/format';
import { ETAPAS } from '../lib/types';
import { Pagina, Vazio } from '../components/ui';
import Icon from '../components/Icon';

export default function PainelView() {
  const { db, feiraAtiva, carregarExemplo } = useStore();
  const { abrir, ir } = useUi();

  const d = useMemo(() => {
    const abertos = db.negocios.filter((n) => n.etapa !== 'fechado' && n.etapa !== 'perdido');
    const fechados = db.negocios.filter((n) => n.etapa === 'fechado');
    const perdidos = db.negocios.filter((n) => n.etapa === 'perdido');
    const validos = db.pedidos.filter((p) => p.status !== 'Cancelado');
    const receita = validos.reduce((s, p) => s + totalPedido(p), 0);
    const lucro = receita - validos.reduce((s, p) => s + custoPedido(p), 0);
    const fila = db.pedidos.filter((p) => p.status === 'Na fila' || p.status === 'Imprimindo').reduce((s, p) => s + horasPedido(p), 0);
    const decididos = fechados.length + perdidos.length;
    const seguir = abertos.filter((n) => n.proximoContato && n.proximoContato <= hoje()).sort((a, b) => a.proximoContato!.localeCompare(b.proximoContato!));
    const funil = ETAPAS.map((e) => {
      const l = db.negocios.filter((n) => n.etapa === e.id);
      return { ...e, n: l.length, v: l.reduce((s, n) => s + n.valor, 0) };
    });
    const porFeira = db.feiras.map((f) => {
      const ns = db.negocios.filter((n) => n.feiraId === f.id);
      const fe = ns.filter((n) => n.etapa === 'fechado');
      return { f, leads: ns.length, fechados: fe.length, valor: fe.reduce((s, n) => s + n.valor, 0) };
    });
    return { abertos, receita, lucro, fila, seguir, funil, porFeira, conv: decididos ? Math.round((fechados.length / decididos) * 100) : null, pipe: abertos.reduce((s, n) => s + n.valor, 0) };
  }, [db]);

  if (db.clientes.length === 0 && db.negocios.length === 0) {
    return (
      <Pagina titulo="Painel">
        <div className="fe-card"><Vazio titulo="Vamos registrar o primeiro contato" texto="No ponto de venda, toque em “Contato rápido” a cada pessoa que passar por lá. Depois é só acompanhar aqui."
          acao={<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}><button className="fe-btn fe-btn-primary" onClick={() => abrir('lead')}><Icon name="plus" /> Registrar lead</button><button className="fe-btn fe-btn-outline" onClick={carregarExemplo}>Carregar dados de exemplo</button></div>} /></div>
      </Pagina>
    );
  }

  const maxFunil = Math.max(1, ...d.funil.map((f) => f.n));

  return (
    <Pagina titulo="Painel" sub={feiraAtiva ? `Feira ativa: ${feiraAtiva.nome}` : 'Visão geral das suas vendas'}>
      <div className="fe-grid-kpi">
        <div className="fe-card fe-kpi fe-hi"><div className="fe-l">Em negociação</div><div className="fe-v">{brlCurto(d.pipe)}</div><div className="fe-s">{d.abertos.length} negociações abertas</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">Vendas fechadas</div><div className="fe-v">{brlCurto(d.receita)}</div><div className="fe-s">Lucro estimado {brlCurto(d.lucro)}</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">Taxa de fechamento</div><div className="fe-v">{d.conv === null ? '—' : d.conv + '%'}</div><div className="fe-s">Entre negócios decididos</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">Fila de produção</div><div className="fe-v">{d.fila.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h</div><div className="fe-s">Pedidos na fila e imprimindo</div></div>
      </div>

      <div className="fe-grid-2">
        <div className="fe-stack">
          <section className="fe-card fe-card-pad">
            <div className="fe-card-head"><h2>Seguir hoje</h2><span className="fe-sub">{d.seguir.length ? `${d.seguir.length} para contatar` : 'Em dia'}</span></div>
            {d.seguir.length === 0 ? <Vazio titulo="Nada atrasado" texto="Nenhum retorno vence hoje ou está atrasado. Bom trabalho." /> : (
              <div className="fe-list">
                {d.seguir.map((n) => {
                  const c = db.clientes.find((x) => x.id === n.clienteId);
                  const atraso = n.proximoContato! < hoje();
                  return (
                    <div className="fe-list-item" key={n.id}>
                      <button className="fe-grow" style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0 }} onClick={() => abrir('negocio', n.id)}>
                        <div className="fe-t">{c?.nome ?? 'Cliente'} <span className={'fe-temp fe-' + n.temperatura}>{n.temperatura === 'quente' && <Icon name="flame" size={13} />}{n.temperatura}</span></div>
                        <div className="fe-s">{n.titulo} · <span style={{ color: atraso ? 'var(--red)' : 'var(--amber)', fontWeight: 600 }}>{relativo(n.proximoContato!)}</span></div>
                      </button>
                      {c?.telefone && <a className="fe-btn fe-btn-wa fe-btn-sm" href={waLink(c.telefone)} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${c.nome}`}><Icon name="whatsapp" size={15} /></a>}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="fe-card fe-card-pad">
            <div className="fe-card-head"><h2>Por ponto de venda</h2><button className="fe-btn fe-btn-ghost fe-btn-sm" onClick={() => ir('eventos')}>Ver pontos de venda</button></div>
            {d.porFeira.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Cadastre um ponto de venda para comparar resultados entre feiras, eventos e lojas.</p> : (
              <div className="fe-tbl-wrap" style={{ display: 'block' }}>
                <table className="fe-tbl"><thead><tr><th>Ponto de venda</th><th className="fe-num">Contatos</th><th className="fe-num">Fechados</th><th className="fe-num">Vendido</th></tr></thead>
                  <tbody>{d.porFeira.map((r) => <tr key={r.f.id} onClick={() => ir('eventos')}><td className="fe-nm">{r.f.nome}</td><td className="fe-num">{r.leads}</td><td className="fe-num">{r.fechados}</td><td className="fe-num">{brl(r.valor)}</td></tr>)}</tbody></table>
              </div>
            )}
          </section>
        </div>

        <section className="fe-card fe-card-pad">
          <div className="fe-card-head"><h2>Funil</h2><button className="fe-btn fe-btn-ghost fe-btn-sm" onClick={() => ir('negocios')}>Abrir</button></div>
          <div className="fe-bars">
            {d.funil.map((f) => (
              <div className={'fe-bar-row' + (f.id === 'perdido' ? ' fe-perdido' : '')} key={f.id}>
                <span>{f.label}</span>
                <div className="fe-track"><div className="fe-fill" style={{ width: (f.n / maxFunil) * 100 + '%', opacity: f.n ? 1 : 0.2 }} /></div>
                <span className="fe-v">{f.n} · {brlCurto(f.v)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Pagina>
  );
}
