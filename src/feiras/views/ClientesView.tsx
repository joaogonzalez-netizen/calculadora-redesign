import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { dataCurta, iniciais, waLink } from '../lib/format';
import { ETAPAS } from '../lib/types';
import { Pagina, Vazio } from '../components/ui';
import Icon from '../components/Icon';
import { useFeirasT } from '../lib/i18n';

export default function ClientesView() {
  const { db } = useStore();
  const { abrir } = useUi();
  const { t } = useFeirasT();
  const [q, setQ] = useState('');
  const [feira, setFeira] = useState('todas');

  const lista = useMemo(() => db.clientes.filter((c) => {
    if (feira !== 'todas' && c.feiraId !== (feira === 'sem' ? null : feira)) return false;
    const t = q.toLowerCase().trim();
    return !t || [c.nome, c.empresa, c.cidade, c.categoria, c.telefone].some((x) => x.toLowerCase().includes(t));
  }), [db.clientes, q, feira]);

  const info = (id: string) => {
    const c = db.clientes.find((x) => x.id === id)!;
    const neg = db.negocios.filter((n) => n.clienteId === id);
    const ativo = neg.find((n) => n.etapa !== 'fechado' && n.etapa !== 'perdido');
    const ehCliente = !ativo && neg.some((n) => n.etapa === 'fechado');
    const etapa = ativo ? t('feiras.etapa.' + ETAPAS.find((e) => e.id === ativo.etapa)!.id) : ehCliente ? t('feiras.clientes.etapaCliente') : t('feiras.comum.nd');
    return { etapa, ehCliente, ultimo: c.contatos[0]?.data ?? null, feira: db.feiras.find((f) => f.id === c.feiraId)?.nome ?? t('feiras.comum.nd') };
  };

  return (
    <Pagina titulo={t('feiras.clientes.titulo')} sub={t('feiras.clientes.cadastrados', { n: db.clientes.length })} acoes={<button className="fe-btn fe-btn-primary" onClick={() => abrir('cliente')}><Icon name="plus" /> {t('feiras.clientes.novo')}</button>}>
      <div className="fe-toolbar">
        <div className="fe-search"><Icon name="search" size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('feiras.clientes.buscarPlaceholder')} aria-label={t('feiras.comum.buscar')} /></div>
        <select className="fe-select-sm" value={feira} onChange={(e) => setFeira(e.target.value)} aria-label={t('feiras.negocios.filtrarPonto')}>
          <option value="todas">{t('feiras.negocios.todosPontos')}</option>{db.feiras.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}<option value="sem">{t('feiras.negocios.semPonto')}</option>
        </select>
      </div>
      <div className="fe-card">
        {lista.length === 0 ? <Vazio titulo={t('feiras.clientes.vazioTitulo')} texto={db.clientes.length ? t('feiras.clientes.vazioFiltro') : t('feiras.clientes.vazioNenhum')} /> : (
          <>
            <div className="fe-tbl-wrap"><table className="fe-tbl">
              <thead><tr><th>{t('feiras.clientes.colCliente')}</th><th>{t('feiras.clientes.colEtapa')}</th><th>{t('feiras.clientes.colPonto')}</th><th>{t('feiras.clientes.colCidade')}</th><th>{t('feiras.clientes.colUltimo')}</th><th></th></tr></thead>
              <tbody>{lista.map((c) => { const i = info(c.id); return (
                <tr key={c.id} onClick={() => abrir('cliente', c.id)}>
                  <td><div className="fe-nm">{c.nome}</div><div className="fe-sub">{[c.empresa, c.telefone].filter(Boolean).join(' · ')}</div></td>
                  <td><span className={'fe-badge' + (i.ehCliente ? ' fe-green' : '')}>{i.etapa}</span></td>
                  <td>{i.feira}</td><td>{c.cidade || t('feiras.comum.nd')}</td><td>{dataCurta(i.ultimo)}</td>
                  <td><div className="fe-row-actions">{c.telefone && <a className="fe-btn fe-btn-wa fe-btn-sm" href={waLink(c.telefone)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} aria-label={t('feiras.comum.whatsapp')}><Icon name="whatsapp" size={15} /></a>}</div></td>
                </tr>); })}</tbody></table></div>
            <div className="fe-cards-m" style={{ padding: 12 }}>
              {lista.map((c) => { const i = info(c.id); return (
                <div key={c.id} className="fe-list-item" role="button" tabIndex={0} onClick={() => abrir('cliente', c.id)} style={{ cursor: 'pointer' }}>
                  <div className="fe-avatar">{iniciais(c.nome)}</div>
                  <div className="fe-grow"><div className="fe-t">{c.nome}</div><div className="fe-s">{i.etapa} · {i.feira}</div></div>
                  {c.telefone && <a className="fe-btn fe-btn-wa fe-btn-sm" href={waLink(c.telefone)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} aria-label={t('feiras.comum.whatsapp')}><Icon name="whatsapp" size={15} /></a>}
                </div>); })}
            </div>
          </>
        )}
      </div>
    </Pagina>
  );
}
