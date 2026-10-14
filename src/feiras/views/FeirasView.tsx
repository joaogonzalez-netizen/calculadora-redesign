import { useState } from 'react';
import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl, dataCurta, hoje } from '../lib/format';
import { Pagina, Vazio, Drawer, Field } from '../components/ui';
import Icon from '../components/Icon';
import type { Feira } from '../lib/types';

export default function FeirasView() {
  const { db, feiraAtiva, setFeiraAtiva, salvarFeira, excluirFeira } = useStore();
  const { avisar } = useUi();
  const [edit, setEdit] = useState<Partial<Feira> | null>(null);

  const metricas = (id: string) => {
    const ns = db.negocios.filter((n) => n.feiraId === id);
    const fe = ns.filter((n) => n.etapa === 'fechado');
    return { leads: ns.length, fechados: fe.length, valor: fe.reduce((s, n) => s + n.valor, 0) };
  };

  return (
    <Pagina titulo="Pontos de venda (Lojas ou Feiras)" sub="O ponto de venda ativo recebe automaticamente os novos contatos." acoes={<button className="fe-btn fe-btn-primary" onClick={() => setEdit({ nome: '', local: '', inicio: hoje(), fim: hoje() })}><Icon name="plus" /> Novo ponto de venda</button>}>
      {db.feiras.length === 0 ? <div className="fe-card"><Vazio titulo="Nenhum ponto de venda ainda" texto="Cadastre o ponto de venda antes de começar a atender para saber de onde vem cada cliente." acao={<button className="fe-btn fe-btn-primary" onClick={() => setEdit({ nome: '', local: '', inicio: hoje(), fim: hoje() })}>Cadastrar ponto de venda</button>} /></div> : (
        <div className="fe-feira-cards">
          {db.feiras.map((f) => {
            const m = metricas(f.id);
            const ativa = feiraAtiva?.id === f.id;
            return (
              <article key={f.id} className={'fe-card fe-feira-card' + (ativa ? ' fe-ativa' : '')}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><h3>{f.nome}</h3>{ativa && <span className="fe-badge fe-green">Ativa</span>}</div>
                  <div className="fe-loc"><Icon name="pin" size={14} />{f.local || 'Local não informado'} · {dataCurta(f.inicio)} a {dataCurta(f.fim)}</div>
                </div>
                <div className="fe-metrics"><div><b>{m.leads}</b><span>Contatos</span></div><div><b>{m.fechados}</b><span>Fechados</span></div><div><b>{brl(m.valor)}</b><span>Vendido</span></div></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={'fe-btn ' + (ativa ? 'fe-btn-outline' : 'fe-btn-primary')} style={{ flex: 1 }} onClick={() => { setFeiraAtiva(ativa ? null : f.id); avisar(ativa ? 'Ponto de venda desativado' : `${f.nome} ativa: novos contatos vão para ela`); }}>{ativa ? 'Desativar ponto de venda' : 'Ativar ponto de venda'}</button>
                  <button className="fe-btn fe-btn-outline" onClick={() => setEdit(f)} aria-label="Editar"><Icon name="pencil" size={16} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {edit && (
        <Drawer aberto titulo={edit.id ? 'Editar ponto de venda' : 'Novo ponto de venda'} onClose={() => setEdit(null)}
          rodape={<>{edit.id && <button className="fe-btn fe-btn-danger" onClick={() => { if (confirm('Excluir este ponto de venda? Clientes e negociações são mantidos, apenas perdem a marcação.')) { excluirFeira(edit.id!); setEdit(null); } }}><Icon name="trash" size={16} /></button>}
            <button className="fe-btn fe-btn-primary fe-grow" onClick={() => { if (!edit.nome?.trim()) return; salvarFeira({ ...edit, nome: edit.nome.trim() }); setEdit(null); avisar('Ponto de venda salvo'); }}>Salvar</button></>}>
          <Field label="Nome do evento"><input autoFocus value={edit.nome ?? ''} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} placeholder="Ex: Feira Geek Joinville ou Loja Centro" /></Field>
          <Field label="Local"><input value={edit.local ?? ''} onChange={(e) => setEdit({ ...edit, local: e.target.value })} placeholder="Cidade / pavilhão" /></Field>
          <div className="fe-form-grid">
            <Field label="Início"><input type="date" value={edit.inicio ?? ''} onChange={(e) => setEdit({ ...edit, inicio: e.target.value })} /></Field>
            <Field label="Fim"><input type="date" value={edit.fim ?? ''} onChange={(e) => setEdit({ ...edit, fim: e.target.value })} /></Field>
          </div>
        </Drawer>
      )}
    </Pagina>
  );
}
