import { useMemo } from 'react';
import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl, brlCurto, dataCurta, hoje, relativo, waLink } from '../lib/format';
import { ETAPAS } from '../lib/types';
import { precoAtacado } from '../lib/pricing';
import { proximaOcorrencia, levarDoDia, totaisDaFeira } from '../lib/agenda';
import { Pagina, Vazio } from '../components/ui';
import Icon from '../components/Icon';
import { useFeirasT } from '../lib/i18n';
import { numero } from '../lib/format';

export default function PainelView() {
  const { db, carregarExemplo } = useStore();
  const { abrir, ir } = useUi();
  const { t } = useFeirasT();

  const d = useMemo(() => {
    // ---- Negociações
    const abertos = db.negocios.filter((n) => n.etapa !== 'fechado' && n.etapa !== 'perdido');
    const fechados = db.negocios.filter((n) => n.etapa === 'fechado');
    const perdidos = db.negocios.filter((n) => n.etapa === 'perdido');
    const soma = (l: { valor: number }[]) => l.reduce((s, n) => s + n.valor, 0);
    const decididos = fechados.length + perdidos.length;
    const seguir = abertos.filter((n) => n.proximoContato && n.proximoContato <= hoje()).sort((a, b) => a.proximoContato!.localeCompare(b.proximoContato!));
    const funil = ETAPAS.map((e) => {
      const l = db.negocios.filter((n) => n.etapa === e.id);
      return { ...e, n: l.length, v: soma(l) };
    });
    const quentes = abertos.filter((n) => n.temperatura === 'quente');
    // ---- Pontos de venda
    const pontos = db.feiras.map((f) => {
      const prox = proximaOcorrencia(f);
      const levar = prox ? levarDoDia(f, prox.inicio) : [];
      const itens = levar.flatMap((x) => { const p = db.produtos.find((y) => y.id === x.produtoId); return p ? [{ qtd: x.qtd, unit: x.unit ?? precoAtacado(p, db.config) }] : []; });
      const tot = totaisDaFeira(f);
      return {
        f, proxima: prox?.inicio ?? null, tot,
        unidades: itens.reduce((s, i) => s + i.qtd, 0), valorProdutos: itens.reduce((s, i) => s + i.qtd * i.unit, 0),
      };
    }).sort((a, b) => (a.proxima ?? '9999').localeCompare(b.proxima ?? '9999'));
    const ativos = pontos.filter((p) => p.proxima);
    return {
      abertos, pipe: soma(abertos), quentes, fechados, receita: soma(fechados), perdidos, perdido: soma(perdidos), seguir, funil,
      conv: decididos ? Math.round((fechados.length / decididos) * 100) : null,
      pontos, ativos, proximo: ativos[0] ?? null,
      unidades: ativos.reduce((s, p) => s + p.unidades, 0), valorProdutos: ativos.reduce((s, p) => s + p.valorProdutos, 0),
      receitaPontos: pontos.reduce((s, p) => s + p.tot.receita, 0), vendidasPontos: pontos.reduce((s, p) => s + p.tot.vendeu, 0),
      quebraPontos: pontos.reduce((s, p) => s + p.tot.quebra, 0), cortesiaPontos: pontos.reduce((s, p) => s + p.tot.cortesia, 0),
    };
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
    <Pagina titulo={t('feiras.painel.titulo')} sub={t('feiras.painel.subGeral')}>
      <h2 className="fe-painel-sec">{t('feiras.painel.secNegociacoes')}</h2>
      <div className="fe-grid-kpi">
        <div className="fe-card fe-kpi fe-hi"><div className="fe-l">{t('feiras.painel.emNegociacao')}</div><div className="fe-v">{brlCurto(d.pipe)}</div><div className="fe-s">{t('feiras.painel.negAbertas', { n: d.abertos.length })}{d.quentes.length ? ' · ' + t('feiras.painel.quentesN', { n: d.quentes.length }) : ''}</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">{t('feiras.painel.vendasFechadas')}</div><div className="fe-v">{brlCurto(d.receita)}</div><div className="fe-s">{t('feiras.painel.fechadasN', { n: d.fechados.length })}</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">{t('feiras.painel.taxaFechamento')}</div><div className="fe-v">{d.conv === null ? t('feiras.comum.nd') : d.conv + '%'}</div><div className="fe-s">{t('feiras.painel.entreDecididos')}</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">{t('feiras.painel.perdidas')}</div><div className="fe-v">{brlCurto(d.perdido)}</div><div className="fe-s">{t('feiras.painel.perdidasN', { n: d.perdidos.length })}</div></div>
      </div>

      <div className="fe-grid-2">
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
      </div>

      <h2 className="fe-painel-sec" style={{ marginTop: 26 }}>{t('feiras.painel.secPontos')}</h2>
      <div className="fe-grid-kpi">
        <div className="fe-card fe-kpi fe-hi"><div className="fe-l">{t('feiras.painel.pontosAbertos')}</div><div className="fe-v">{d.ativos.length}</div><div className="fe-s">{t('feiras.painel.pontosTotal', { n: d.pontos.length })}</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">{t('feiras.painel.proximoPonto')}</div><div className="fe-v" style={{ fontSize: 20 }}>{d.proximo ? dataCurta(d.proximo.proxima!) : t('feiras.comum.nd')}</div><div className="fe-s">{d.proximo ? d.proximo.f.nome : t('feiras.painel.nenhumAberto')}</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">{t('feiras.painel.aLevar')}</div><div className="fe-v">{numero(d.unidades)}</div><div className="fe-s">{t('feiras.painel.aLevarDesc', { v: brlCurto(d.valorProdutos) })}</div></div>
        <div className="fe-card fe-kpi"><div className="fe-l">{t('feiras.painel.vendidoPontos')}</div><div className="fe-v">{brlCurto(d.receitaPontos)}</div><div className="fe-s">{t('feiras.painel.vendidoPontosDesc', { n: numero(d.vendidasPontos) })}</div></div>
      </div>

      <section className="fe-card fe-card-pad">
        <div className="fe-card-head"><h2>{t('feiras.painel.porPonto')}</h2><button className="fe-btn fe-btn-ghost fe-btn-sm" onClick={() => ir('eventos')}>{t('feiras.painel.verPontos')}</button></div>
        {d.pontos.length === 0 ? <p style={{ color: 'var(--text-3)', fontSize: 14 }}>{t('feiras.painel.cadastrePonto')}</p> : (
          <div className="fe-tbl-wrap" style={{ display: 'block' }}>
            <table className="fe-tbl"><thead><tr><th>{t('feiras.painel.colPonto')}</th><th>{t('feiras.painel.colProxima')}</th><th className="fe-num">{t('feiras.painel.colUnidades')}</th><th className="fe-num">{t('feiras.pontos.vendidas')}</th><th className="fe-num">{t('feiras.pontos.receita')}</th></tr></thead>
              <tbody>{d.pontos.map((r) => <tr key={r.f.id} onClick={() => ir('eventos')}><td className="fe-nm">{r.f.nome}</td><td>{r.proxima ? dataCurta(r.proxima) : t('feiras.painel.encerrado')}</td><td className="fe-num">{numero(r.unidades)}</td><td className="fe-num">{numero(r.tot.vendeu)}</td><td className="fe-num">{brl(r.tot.receita)}</td></tr>)}</tbody></table>
          </div>
        )}
      </section>
    </Pagina>
  );
}
