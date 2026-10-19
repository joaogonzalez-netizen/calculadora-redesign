import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { dataCurta, iniciais, waLink } from '../lib/format';
import { ETAPAS } from '../lib/types';
import { Pagina, Vazio } from '../components/ui';
import Icon from '../components/Icon';

export default function ClientesView() {
  const { db } = useStore();
  const { abrir } = useUi();
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
    const etapa = ativo ? ETAPAS.find((e) => e.id === ativo.etapa)!.label : neg.some((n) => n.etapa === 'fechado') ? 'Cliente' : 'N/D';
    return { etapa, ultimo: c.contatos[0]?.data ?? null, feira: db.feiras.find((f) => f.id === c.feiraId)?.nome ?? 'N/D' };
  };

  return (
    <Pagina titulo="Clientes" sub={`${db.clientes.length} cadastrados`} acoes={<button className="fe-btn fe-btn-primary" onClick={() => abrir('cliente')}><Icon name="plus" /> Novo cliente</button>}>
      <div className="fe-toolbar">
        <div className="fe-search"><Icon name="search" size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome, empresa, cidade ou telefone" aria-label="Buscar" /></div>
        <select className="fe-select-sm" value={feira} onChange={(e) => setFeira(e.target.value)} aria-label="Filtrar por ponto de venda">
          <option value="todas">Todos os pontos de venda</option>{db.feiras.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}<option value="sem">Sem ponto de venda</option>
        </select>
      </div>
      <div className="fe-card">
        {lista.length === 0 ? <Vazio titulo="Nenhum cliente encontrado" texto={db.clientes.length ? 'Ajuste a busca ou o filtro.' : 'Contatos registrados no ponto de venda aparecem aqui automaticamente.'} /> : (
          <>
            <div className="fe-tbl-wrap"><table className="fe-tbl">
              <thead><tr><th>Cliente</th><th>Etapa</th><th>Ponto de venda</th><th>Cidade</th><th>Último contato</th><th></th></tr></thead>
              <tbody>{lista.map((c) => { const i = info(c.id); return (
                <tr key={c.id} onClick={() => abrir('cliente', c.id)}>
                  <td><div className="fe-nm">{c.nome}</div><div className="fe-sub">{[c.empresa, c.telefone].filter(Boolean).join(' · ')}</div></td>
                  <td><span className={'fe-badge' + (i.etapa === 'Cliente' ? ' fe-green' : '')}>{i.etapa}</span></td>
                  <td>{i.feira}</td><td>{c.cidade || 'N/D'}</td><td>{dataCurta(i.ultimo)}</td>
                  <td><div className="fe-row-actions">{c.telefone && <a className="fe-btn fe-btn-wa fe-btn-sm" href={waLink(c.telefone)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} aria-label="WhatsApp"><Icon name="whatsapp" size={15} /></a>}</div></td>
                </tr>); })}</tbody></table></div>
            <div className="fe-cards-m" style={{ padding: 12 }}>
              {lista.map((c) => { const i = info(c.id); return (
                <div key={c.id} className="fe-list-item" role="button" tabIndex={0} onClick={() => abrir('cliente', c.id)} style={{ cursor: 'pointer' }}>
                  <div className="fe-avatar">{iniciais(c.nome)}</div>
                  <div className="fe-grow"><div className="fe-t">{c.nome}</div><div className="fe-s">{i.etapa} · {i.feira}</div></div>
                  {c.telefone && <a className="fe-btn fe-btn-wa fe-btn-sm" href={waLink(c.telefone)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} aria-label="WhatsApp"><Icon name="whatsapp" size={15} /></a>}
                </div>); })}
            </div>
          </>
        )}
      </div>
    </Pagina>
  );
}
