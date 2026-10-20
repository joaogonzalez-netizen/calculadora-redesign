import { useState } from 'react';
import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl, dataCurta, hoje } from '../lib/format';
import { Pagina, Vazio, Drawer, Field, Secao, Seg } from '../components/ui';
import { precoAtacado, precoVarejo } from '../lib/pricing';
import Icon from '../components/Icon';
import type { Feira, ProdutoDaFeira } from '../lib/types';
import { useFeirasT } from '../lib/i18n';

export default function FeirasView() {
  const { db, feiraAtiva, setFeiraAtiva, salvarFeira, excluirFeira } = useStore();
  const { avisar, irParaCalculadora } = useUi();
  const { t } = useFeirasT();
  const [edit, setEdit] = useState<Partial<Feira> | null>(null);
  // Feira aberta no painel de produtos (clicar no card) e estado do seletor de produtos.
  const [detalheId, setDetalheId] = useState<string | null>(null);
  const detalhe = db.feiras.find((f) => f.id === detalheId) ?? null;

  function abrirDetalhe(id: string) { setDetalheId(id); }
  function fecharDetalhe() { setDetalheId(null); }
  function gravarProdutos(f: Feira, produtos: ProdutoDaFeira[]) { salvarFeira({ ...f, produtos }); }


  const metricas = (id: string) => {
    const ns = db.negocios.filter((n) => n.feiraId === id);
    const fe = ns.filter((n) => n.etapa === 'fechado');
    return { leads: ns.length, fechados: fe.length, valor: fe.reduce((s, n) => s + n.valor, 0) };
  };

  return (
    <Pagina titulo={t('feiras.pontos.titulo')} sub={t('feiras.pontos.sub')} acoes={<button className="fe-btn fe-btn-primary" onClick={() => setEdit({ nome: '', local: '', inicio: hoje(), fim: hoje() })}><Icon name="plus" /> {t('feiras.pontos.novo')}</button>}>
      {db.feiras.length === 0 ? <div className="fe-card"><Vazio titulo={t('feiras.pontos.vazioTitulo')} texto={t('feiras.pontos.vazioTexto')} acao={<button className="fe-btn fe-btn-primary" onClick={() => setEdit({ nome: '', local: '', inicio: hoje(), fim: hoje() })}>{t('feiras.pontos.cadastrar')}</button>} /></div> : (
        <div className="fe-feira-cards">
          {db.feiras.map((f) => {
            const m = metricas(f.id);
            const ativa = feiraAtiva?.id === f.id;
            return (
              <article key={f.id} className={'fe-card fe-feira-card fe-clicavel' + (ativa ? ' fe-ativa' : '')} role="button" tabIndex={0} aria-label={t('feiras.pontos.abrirProdutos')} onClick={() => abrirDetalhe(f.id)} onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrirDetalhe(f.id); } }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><h3>{f.nome}</h3>{ativa && <span className="fe-badge fe-green">{t('feiras.comum.ativa')}</span>}</div>
                  <div className="fe-loc"><Icon name="pin" size={14} />{f.local || t('feiras.pontos.localNaoInformado')} · {t('feiras.pontos.datas', { a: dataCurta(f.inicio), b: dataCurta(f.fim) })}</div>
                </div>
                <div className="fe-metrics"><div><b>{(f.produtos ?? []).length}</b><span>{t('feiras.pontos.produtos')}</span></div><div><b>{m.leads}</b><span>{t('feiras.pontos.contatos')}</span></div><div><b>{m.fechados}</b><span>{t('feiras.pontos.fechados')}</span></div><div><b>{brl(m.valor)}</b><span>{t('feiras.pontos.vendido')}</span></div></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={'fe-btn ' + (ativa ? 'fe-btn-outline' : 'fe-btn-primary')} style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); setFeiraAtiva(ativa ? null : f.id); avisar(ativa ? t('feiras.pontos.desativado') : t('feiras.pontos.ativado', { nome: f.nome })); }}>{ativa ? t('feiras.pontos.desativar') : t('feiras.pontos.ativar')}</button>
                  <button className="fe-btn fe-btn-outline" onClick={(e) => { e.stopPropagation(); setEdit(f); }} aria-label={t('feiras.pontos.editar')}><Icon name="pencil" size={16} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {detalhe && (
        <Drawer aberto largo titulo={detalhe.nome} subtitulo={t('feiras.pontos.detalheSub', { local: detalhe.local || t('feiras.pontos.localNaoInformado'), a: dataCurta(detalhe.inicio), b: dataCurta(detalhe.fim) })} onClose={fecharDetalhe}
          rodape={<button className="fe-btn fe-btn-primary fe-grow" onClick={fecharDetalhe}>{t('feiras.pontos.concluir')}</button>}>
          <ProdutosDoPonto key={detalhe.id} feira={detalhe} onSalvar={(produtos) => gravarProdutos(detalhe, produtos)} onCalculadora={irParaCalculadora} />
        </Drawer>
      )}

      {edit && (
        <Drawer aberto titulo={edit.id ? t('feiras.pontos.editarTitulo') : t('feiras.pontos.novoTitulo')} onClose={() => setEdit(null)}
          rodape={<>{edit.id && <button className="fe-btn fe-btn-danger" onClick={() => { if (confirm(t('feiras.pontos.confirmarExcluir'))) { excluirFeira(edit.id!); setEdit(null); } }}><Icon name="trash" size={16} /></button>}
            <button className="fe-btn fe-btn-primary fe-grow" onClick={() => { if (!edit.nome?.trim()) return; salvarFeira({ ...edit, nome: edit.nome.trim() }); setEdit(null); avisar(t('feiras.pontos.salvo')); }}>{t('feiras.comum.salvar')}</button></>}>
          <Secao titulo={t('feiras.secao.pontoDados')}>
          <Field label={t('feiras.pontos.nomeEvento')}><input autoFocus value={edit.nome ?? ''} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} placeholder={t('feiras.pontos.nomePlaceholder')} /></Field>
          <Field label={t('feiras.pontos.local')}><input value={edit.local ?? ''} onChange={(e) => setEdit({ ...edit, local: e.target.value })} placeholder={t('feiras.pontos.localPlaceholder')} /></Field>
          <div className="fe-form-grid">
            <Field label={t('feiras.pontos.inicio')}><input type="date" value={edit.inicio ?? ''} onChange={(e) => setEdit({ ...edit, inicio: e.target.value })} /></Field>
            <Field label={t('feiras.pontos.fim')}><input type="date" value={edit.fim ?? ''} onChange={(e) => setEdit({ ...edit, fim: e.target.value })} /></Field>
          </div>
          </Secao>
        </Drawer>
      )}
    </Pagina>
  );
}

/** Produtos que serão vendidos no ponto: mesma experiência dos itens da negociação (produto, qtd, valor un.). */
function ProdutosDoPonto({ feira, onSalvar, onCalculadora }: { feira: Feira; onSalvar: (p: ProdutoDaFeira[]) => void; onCalculadora: () => void }) {
  const { db } = useStore();
  const { t } = useFeirasT();
  const [tipo, setTipo] = useState<'atacado' | 'varejo'>('atacado');
  // Linhas em edição (inclui a linha nova ainda sem produto); só as com produto são gravadas.
  const [linhas, setLinhas] = useState<{ produtoId: string; qtd: number; unit: number }[]>(() => (feira.produtos ?? []).map((p) => {
    const prod = db.produtos.find((x) => x.id === p.produtoId);
    return { produtoId: p.produtoId, qtd: p.qtd, unit: p.unit ?? (prod ? precoAtacado(prod, db.config) : 0) };
  }));
  const preco = (id: string, tp = tipo) => { const p = db.produtos.find((x) => x.id === id); return p ? Math.round((tp === 'atacado' ? precoAtacado(p, db.config) : precoVarejo(p, db.config)) * 100) / 100 : 0; };
  const gravar = (novas: typeof linhas) => { setLinhas(novas); onSalvar(novas.filter((l) => l.produtoId).map((l) => ({ produtoId: l.produtoId, qtd: l.qtd, unit: l.unit }))); };
  const alterar = (i: number, p: Partial<(typeof linhas)[number]>) => gravar(linhas.map((l, k) => (k === i ? { ...l, ...p } : l)));
  const total = linhas.reduce((s, l) => s + l.qtd * l.unit, 0);

  if (db.produtos.length === 0) {
    return (
      <Secao titulo={t('feiras.pontos.prodTitulo')} desc={t('feiras.pontos.prodDesc')}>
        <Vazio titulo={t('feiras.pontos.prodCatalogoVazioTitulo')} texto={t('feiras.pontos.prodCatalogoVazioTexto')} acao={<button className="fe-btn fe-btn-primary" onClick={onCalculadora}>{t('feiras.pontos.prodIrCalculadora')}</button>} />
      </Secao>
    );
  }
  return (
    <Secao titulo={t('feiras.pontos.prodTitulo')} desc={t('feiras.pontos.prodDesc')}>
      <div>
        <div className="fe-sec-title">{t('feiras.itens.tabela')}</div>
        <Seg valor={tipo} onChange={(novo) => { setTipo(novo); gravar(linhas.map((l) => (l.produtoId ? { ...l, unit: preco(l.produtoId, novo) } : l))); }} opcoes={[{ id: 'atacado', label: t('feiras.itens.loja') }, { id: 'varejo', label: t('feiras.itens.clienteFinal') }]} />
      </div>
      {linhas.map((l, idx) => (
        <div key={idx} className="fe-item-row">
          <label className="fe-field">
            <span className="fe-lbl">{idx === 0 ? t('feiras.itens.produto') : <span style={{ visibility: 'hidden' }}>.</span>}</span>
            <select value={l.produtoId} onChange={(e) => alterar(idx, { produtoId: e.target.value, unit: preco(e.target.value) })}>
              <option value="">{t('feiras.itens.escolher')}</option>
              {db.produtos.filter((p) => p.id === l.produtoId || !linhas.some((x) => x.produtoId === p.id)).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </label>
          <label className="fe-field"><span className="fe-lbl">{idx === 0 ? t('feiras.itens.qtd') : <span style={{ visibility: 'hidden' }}>.</span>}</span>
            <input type="number" inputMode="numeric" min={1} value={l.qtd} onChange={(e) => alterar(idx, { qtd: Math.max(1, Number(e.target.value) || 1) })} /></label>
          <label className="fe-field"><span className="fe-lbl">{idx === 0 ? t('feiras.itens.valorUn') : <span style={{ visibility: 'hidden' }}>.</span>}</span>
            <input type="number" inputMode="decimal" min={0} step="0.01" value={l.unit} onChange={(e) => alterar(idx, { unit: Math.max(0, Number(e.target.value) || 0) })} /></label>
          <button type="button" className="fe-icon-btn" aria-label={t('feiras.pontos.prodRemover')} onClick={() => gravar(linhas.filter((_, k) => k !== idx))} style={{ marginBottom: 3 }}><Icon name="trash" size={16} /></button>
        </div>
      ))}
      <div><button type="button" className="fe-btn fe-btn-outline fe-btn-sm" disabled={linhas.length >= db.produtos.length} onClick={() => setLinhas([...linhas, { produtoId: '', qtd: 1, unit: 0 }])}><Icon name="plus" size={14} /> {t('feiras.pontos.prodAdicionar')}</button></div>
      <div className="fe-totals"><div><small>{t('feiras.pontos.prodTotal')}</small><br /><b>{brl(total)}</b></div><div style={{ textAlign: 'right' }}><small>{t('feiras.pontos.prodUnidades')}</small><br /><b>{linhas.filter((l) => l.produtoId).reduce((s, l) => s + l.qtd, 0)}</b></div></div>
    </Secao>
  );
}
