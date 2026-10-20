import { useMemo } from 'react';
import { useStore, totalPedido, custoPedido, horasPedido } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl, brlCurto, hoje, relativo, waLink } from '../lib/format';
import { ETAPAS } from '../lib/types';
import { Pagina, Vazio } from '../components/ui';
import Icon from '../components/Icon';
import { useFeirasT } from '../lib/i18n';
import { numero } from '../lib/format';

export default function PainelView() {
  const { db, feiraAtiva, carregarExemplo } = useStore();
  const { abrir, ir } = useUi();
  const { t } = useFeirasT();

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
      <Pagina titulo={t('feiras.painel.titulo')}>
        <div className="fe-card"><Vazio titulo={t('feiras.painel.primeiroTitulo')} texto={t('feiras.painel.primeiroTexto')}
          acao={<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}><button className="fe-btn fe-btn-primary" onClick={() => abrir('lead')}><Icon name="plus" /> {t('feiras.painel.registrar')}</button><button className="fe-btn fe-btn-outline" onClick={carregarExemplo}>{t('feiras.painel.carregarExemplo')}</button></div>} /></div>
      </Pagina>
    );
  }

  const maxFunil = Math.max(1, ...d.funil.map((f) => f.n));

  return (
    <Pagina titulo={t('feiras.painel.titulo')} sub={feiraAtiva ? t('feiras.painel.subAtiva', { nome: feiraAtiva.nome }) : t('feiras.painel.subGeral')}>
      <div className="fe-grid-kpi">
        <div className="fe-card fe-kpi fe-hi"><div className="fe-l">{t('feiras.painel.emNegociacao')}</div><div className="fe-v">{brlCurto(d.pipe)}</div><div className="fe-s">{t('feiras.painel.negAbertas', { n: d.abertos.length })}</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">{t('feiras.painel.vendasFechadas')}</div><div className="fe-v">{brlCurto(d.receita)}</div><div className="fe-s">{t('feiras.painel.lucroEstimado', { v: brlCurto(d.lucro) })}</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">{t('feiras.painel.taxaFechamento')}</div><div className="fe-v">{d.conv === null ? t('feiras.comum.nd') : d.conv + '%'}</div><div className="fe-s">{t('feiras.painel.entreDecididos')}</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">{t('feiras.painel.filaProducao')}</div><div className="fe-v">{numero(d.fila)} h</div><div className="fe-s">{t('feiras.painel.filaDesc')}</div></div>
      </div>

      <div className="fe-grid-2">
        <div className="fe-stack">
          <section className="fe-card fe-card-pad">
            <div className="fe-card-head"><h2>{t('feiras.painel.seguirHoje')}</h2><span className="fe-sub">{d.seguir.length ? t('feiras.painel.paraContatar', { n: d.seguir.length }) : t('feiras.painel.emDia')}</span></div>
            {d.seguir.length === 0 ? <Vazio titulo={t('feiras.painel.nadaAtrasadoTitulo')} texto={t('feiras.painel.nadaAtrasadoTexto')} /> : (
              <div className="fe-list">
                {d.seguir.map((n) => {
                  const c = db.clientes.find((x) => x.id === n.clienteId);
                  const atraso = n.proximoContato! < hoje();
                  return (
                    <div className="fe-list-item" key={n.id}>
                      <button className="fe-grow" style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0 }} onClick={() => abrir('negocio', n.id)}>
                        <div className="fe-t">{c?.nome ?? t('feiras.comum.cliente')} <span className={'fe-temp fe-' + n.temperatura}>{n.temperatura === 'quente' && <Icon name="flame" size={13} />}{t('feiras.temp.' + n.temperatura)}</span></div>
                        <div className="fe-s">{n.titulo} · <span style={{ color: atraso ? 'var(--red)' : 'var(--amber)', fontWeight: 600 }}>{relativo(n.proximoContato!)}</span></div>
                      </button>
                      {c?.telefone && <a className="fe-btn fe-btn-wa fe-btn-sm" href={waLink(c.telefone)} target="_blank" rel="noreferrer" aria-label={t('feiras.comum.whatsappNome', { nome: c.nome })}><Icon name="whatsapp" size={15} /></a>}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="fe-card fe-card-pad">
            <div className="fe-card-head"><h2>{t('feiras.painel.porPonto')}</h2><button className="fe-btn fe-btn-ghost fe-btn-sm" onClick={() => ir('eventos')}>{t('feiras.painel.verPontos')}</button></div>
            {d.porFeira.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: 14 }}>{t('feiras.painel.cadastrePonto')}</p> : (
              <div className="fe-tbl-wrap" style={{ display: 'block' }}>
                <table className="fe-tbl"><thead><tr><th>{t('feiras.painel.colPonto')}</th><th className="fe-num">{t('feiras.painel.colContatos')}</th><th className="fe-num">{t('feiras.painel.colFechados')}</th><th className="fe-num">{t('feiras.painel.colVendido')}</th></tr></thead>
                  <tbody>{d.porFeira.map((r) => <tr key={r.f.id} onClick={() => ir('eventos')}><td className="fe-nm">{r.f.nome}</td><td className="fe-num">{r.leads}</td><td className="fe-num">{r.fechados}</td><td className="fe-num">{brl(r.valor)}</td></tr>)}</tbody></table>
              </div>
            )}
          </section>
        </div>

        <section className="fe-card fe-card-pad">
          <div className="fe-card-head"><h2>{t('feiras.painel.funil')}</h2><button className="fe-btn fe-btn-ghost fe-btn-sm" onClick={() => ir('negocios')}>{t('feiras.painel.abrir')}</button></div>
          <div className="fe-bars">
            {d.funil.map((f) => (
              <div className={'fe-bar-row' + (f.id === 'perdido' ? ' fe-perdido' : '')} key={f.id}>
                <span>{t('feiras.etapa.' + f.id)}</span>
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
