import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl, dataCurta, hoje } from '../lib/format';
import { precoVarejo } from '../lib/pricing';
import { Pagina, Vazio, Drawer, Field } from '../components/ui';
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
  const [escolhendo, setEscolhendo] = useState(false);
  const [buscaProd, setBuscaProd] = useState('');
  const [marcados, setMarcados] = useState<string[]>([]);
  const detalhe = db.feiras.find((f) => f.id === detalheId) ?? null;
  const produtosDaFeira = detalhe?.produtos ?? [];

  function abrirDetalhe(id: string) { setDetalheId(id); setEscolhendo(false); setBuscaProd(''); setMarcados([]); }
  function fecharDetalhe() { setDetalheId(null); setEscolhendo(false); }
  function gravarProdutos(f: Feira, produtos: ProdutoDaFeira[]) { salvarFeira({ ...f, produtos }); }

  // Catálogo (calculadora) que ainda não está na feira, filtrado pela busca.
  const disponiveis = useMemo(() => {
    const jaIds = new Set(produtosDaFeira.map((p) => p.produtoId));
    const q = buscaProd.trim().toLowerCase();
    return db.produtos.filter((p) => !jaIds.has(p.id) && (!q || p.nome.toLowerCase().includes(q)));
  }, [db.produtos, produtosDaFeira, buscaProd]);
  const catalogoTodoAdicionado = db.produtos.length > 0 && db.produtos.every((p) => produtosDaFeira.some((x) => x.produtoId === p.id));
  const totalUnidades = produtosDaFeira.reduce((s, p) => s + p.qtd, 0);

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
          <div className="fe-prod-feira-head">
            <div>
              <h4>{t('feiras.pontos.prodTitulo')}</h4>
              <p>{t('feiras.pontos.prodDesc')}</p>
            </div>
            {!escolhendo && db.produtos.length > 0 && (
              <button className="fe-btn fe-btn-primary" onClick={() => { setEscolhendo(true); setBuscaProd(''); setMarcados([]); }} disabled={catalogoTodoAdicionado}><Icon name="plus" /> {t('feiras.pontos.prodAdicionar')}</button>
            )}
          </div>

          {escolhendo && (
            <div className="fe-prod-escolha">
              <input value={buscaProd} onChange={(e) => setBuscaProd(e.target.value)} placeholder={t('feiras.pontos.prodBuscar')} autoFocus />
              <div className="fe-prod-lista">
                {catalogoTodoAdicionado ? <p className="fe-sub">{t('feiras.pontos.prodTodos')}</p>
                  : disponiveis.length === 0 ? <p className="fe-sub">{t('feiras.pontos.prodNenhumResultado')}</p>
                  : disponiveis.map((p) => {
                    const marcado = marcados.includes(p.id);
                    return (
                      <label key={p.id} className={'fe-prod-opcao' + (marcado ? ' fe-marcado' : '')}>
                        <input type="checkbox" checked={marcado} onChange={() => setMarcados((m) => (marcado ? m.filter((x) => x !== p.id) : [...m, p.id]))} />
                        <span className="fe-grow"><span className="fe-nm">{p.nome}</span><span className="fe-sub">{p.material}</span></span>
                        <b>{brl(precoVarejo(p, db.config))}</b>
                      </label>
                    );
                  })}
              </div>
              <div className="fe-prod-escolha-acoes">
                <button className="fe-btn fe-btn-outline" onClick={() => { setEscolhendo(false); setMarcados([]); }}>{t('feiras.pontos.prodCancelarEscolha')}</button>
                <button className="fe-btn fe-btn-primary" disabled={marcados.length === 0} onClick={() => {
                  gravarProdutos(detalhe, [...produtosDaFeira, ...marcados.map((produtoId) => ({ produtoId, qtd: 1 }))]);
                  avisar(t('feiras.pontos.prodAdicionados', { n: marcados.length }));
                  setEscolhendo(false); setMarcados([]);
                }}>{t('feiras.pontos.prodAdicionarN', { n: marcados.length })}</button>
              </div>
            </div>
          )}

          {db.produtos.length === 0 ? (
            <Vazio titulo={t('feiras.pontos.prodCatalogoVazioTitulo')} texto={t('feiras.pontos.prodCatalogoVazioTexto')} acao={<button className="fe-btn fe-btn-primary" onClick={irParaCalculadora}>{t('feiras.pontos.prodIrCalculadora')}</button>} />
          ) : produtosDaFeira.length === 0 ? (
            !escolhendo && <Vazio titulo={t('feiras.pontos.prodVazioTitulo')} texto={t('feiras.pontos.prodVazioTexto')} acao={<button className="fe-btn fe-btn-primary" onClick={() => setEscolhendo(true)}>{t('feiras.pontos.prodAdicionar')}</button>} />
          ) : (
            <>
              <div className="fe-prod-resumo">{t('feiras.pontos.prodResumo', { n: produtosDaFeira.length, u: totalUnidades })}</div>
              <div className="fe-prod-feira-lista">
                {produtosDaFeira.map((item) => {
                  const p = db.produtos.find((x) => x.id === item.produtoId);
                  if (!p) return null;
                  return (
                    <div key={item.produtoId} className="fe-list-item">
                      <div className="fe-grow"><div className="fe-t">{p.nome}</div><div className="fe-s">{t('feiras.pontos.prodPreco', { v: brl(precoVarejo(p, db.config)) })}</div></div>
                      <label className="fe-prod-qtd"><span>{t('feiras.pontos.prodQtd')}</span>
                        <input type="number" min={1} value={item.qtd} onChange={(e) => gravarProdutos(detalhe, produtosDaFeira.map((x) => (x.produtoId === item.produtoId ? { ...x, qtd: Math.max(1, parseInt(e.target.value, 10) || 1) } : x)))} />
                      </label>
                      <button className="fe-icon-btn" onClick={() => { gravarProdutos(detalhe, produtosDaFeira.filter((x) => x.produtoId !== item.produtoId)); avisar(t('feiras.pontos.prodRemovido')); }} aria-label={t('feiras.pontos.prodRemover')} title={t('feiras.pontos.prodRemover')}><Icon name="trash" size={16} /></button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Drawer>
      )}

      {edit && (
        <Drawer aberto titulo={edit.id ? t('feiras.pontos.editarTitulo') : t('feiras.pontos.novoTitulo')} onClose={() => setEdit(null)}
          rodape={<>{edit.id && <button className="fe-btn fe-btn-danger" onClick={() => { if (confirm(t('feiras.pontos.confirmarExcluir'))) { excluirFeira(edit.id!); setEdit(null); } }}><Icon name="trash" size={16} /></button>}
            <button className="fe-btn fe-btn-primary fe-grow" onClick={() => { if (!edit.nome?.trim()) return; salvarFeira({ ...edit, nome: edit.nome.trim() }); setEdit(null); avisar(t('feiras.pontos.salvo')); }}>{t('feiras.comum.salvar')}</button></>}>
          <Field label={t('feiras.pontos.nomeEvento')}><input autoFocus value={edit.nome ?? ''} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} placeholder={t('feiras.pontos.nomePlaceholder')} /></Field>
          <Field label={t('feiras.pontos.local')}><input value={edit.local ?? ''} onChange={(e) => setEdit({ ...edit, local: e.target.value })} placeholder={t('feiras.pontos.localPlaceholder')} /></Field>
          <div className="fe-form-grid">
            <Field label={t('feiras.pontos.inicio')}><input type="date" value={edit.inicio ?? ''} onChange={(e) => setEdit({ ...edit, inicio: e.target.value })} /></Field>
            <Field label={t('feiras.pontos.fim')}><input type="date" value={edit.fim ?? ''} onChange={(e) => setEdit({ ...edit, fim: e.target.value })} /></Field>
          </div>
        </Drawer>
      )}
    </Pagina>
  );
}
