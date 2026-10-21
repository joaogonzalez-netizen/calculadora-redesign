import { useState } from 'react';
import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { addDias, brl, dataCurta, dataLonga, hoje } from '../lib/format';
import { Pagina, Vazio, Drawer, Field, Secao, Seg } from '../components/ui';
import { diasDaFeira, ocorrencias, proximaOcorrencia, regraEfetiva, regraDoPreset, presetDe, rotuloPreset, resumoRegra, nomeDiaSemana, PRESETS, type Preset } from '../lib/agenda';
import { precoAtacado } from '../lib/pricing';
import Icon from '../components/Icon';
import type { Feira, ProdutoDaFeira, RegraRepete } from '../lib/types';
import { useFeirasT } from '../lib/i18n';
import { localeNumeros } from '../../lib/format';

export default function FeirasView() {
  const { db, feiraAtiva, setFeiraAtiva, salvarFeira, excluirFeira } = useStore();
  const { avisar, irParaCalculadora } = useUi();
  const { t } = useFeirasT();
  const [visao, setVisao] = useState<'lista' | 'calendario'>('lista');
  const [edit, setEdit] = useState<Partial<Feira> | null>(null);
  const [preset, setPreset] = useState<Preset>('nao');
  const abrir = (f: Partial<Feira>) => { const r = f.inicio ? regraEfetiva(f as Feira) : undefined; setEdit({ ...f, regra: r, fim: undefined, dias: f.inicio ? diasDaFeira(f as Feira) : [hoje()] }); setPreset(presetDe(r, f.inicio ?? hoje())); };
  const mudarDias = (dias: string[]) => setEdit((e) => (e ? { ...e, dias, inicio: dias[0], regra: preset === 'custom' ? e.regra : regraDoPreset(preset, dias[0]) } : e));
  const mudarPreset = (p: Preset) => { setPreset(p); setEdit((e) => (e ? { ...e, regra: p === 'custom' ? (e.regra ?? { freq: 'semana', cada: 1, diasSemana: [new Date((e.inicio ?? hoje()) + 'T12:00:00').getDay()] }) : regraDoPreset(p, e.inicio ?? hoje()) } : e)); };
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

  const quando = (f: Feira) => {
    if (!regraEfetiva(f)) { const d = diasDaFeira(f); return d.length > 1 ? t('feiras.pontos.varios', { n: d.length, a: dataCurta(d[0]), b: dataCurta(d[d.length - 1]) }) : t('feiras.pontos.umaVez', { a: dataCurta(d[0]) }); }
    const p = proximaOcorrencia(f);
    return p ? t('feiras.pontos.proxima', { r: resumoRegra(f), a: dataCurta(p.inicio) }) : t('feiras.pontos.encerrada', { r: resumoRegra(f) });
  };

  return (
    <Pagina titulo={t('feiras.pontos.titulo')} sub={t('feiras.pontos.sub')} acoes={<button className="fe-btn fe-btn-primary" onClick={() => abrir({ nome: '', local: '', inicio: hoje(), dias: [hoje()] })}><Icon name="plus" /> {t('feiras.pontos.novo')}</button>}>
      {db.feiras.length > 0 && <div className="fe-toolbar"><Seg valor={visao} onChange={setVisao} opcoes={[{ id: 'lista', label: t('feiras.pontos.visaoLista') }, { id: 'calendario', label: t('feiras.pontos.visaoCalendario') }]} /></div>}
      {db.feiras.length > 0 && visao === 'calendario' ? <Calendario feiras={db.feiras} onAbrir={abrirDetalhe} /> : db.feiras.length === 0 ? <div className="fe-card"><Vazio titulo={t('feiras.pontos.vazioTitulo')} texto={t('feiras.pontos.vazioTexto')} acao={<button className="fe-btn fe-btn-primary" onClick={() => abrir({ nome: '', local: '', inicio: hoje(), dias: [hoje()] })}>{t('feiras.pontos.cadastrar')}</button>} /></div> : (
        <div className="fe-feira-cards">
          {db.feiras.map((f) => {
            const m = metricas(f.id);
            const ativa = feiraAtiva?.id === f.id;
            return (
              <article key={f.id} className={'fe-card fe-feira-card fe-clicavel' + (ativa ? ' fe-ativa' : '')} role="button" tabIndex={0} aria-label={t('feiras.pontos.abrirProdutos')} onClick={() => abrirDetalhe(f.id)} onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrirDetalhe(f.id); } }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><h3>{f.nome}</h3>{ativa && <span className="fe-badge fe-green">{t('feiras.comum.ativa')}</span>}</div>
                  <div className="fe-loc"><Icon name="pin" size={14} />{f.local || t('feiras.pontos.localNaoInformado')} · {quando(f)}</div>
                </div>
                <div className="fe-metrics"><div><b>{(f.produtos ?? []).length}</b><span>{t('feiras.pontos.produtos')}</span></div><div><b>{m.leads}</b><span>{t('feiras.pontos.contatos')}</span></div><div><b>{m.fechados}</b><span>{t('feiras.pontos.fechados')}</span></div><div><b>{brl(m.valor)}</b><span>{t('feiras.pontos.vendido')}</span></div></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={'fe-btn ' + (ativa ? 'fe-btn-outline' : 'fe-btn-primary')} style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); setFeiraAtiva(ativa ? null : f.id); avisar(ativa ? t('feiras.pontos.desativado') : t('feiras.pontos.ativado', { nome: f.nome })); }}>{ativa ? t('feiras.pontos.desativar') : t('feiras.pontos.ativar')}</button>
                  <button className="fe-btn fe-btn-outline" onClick={(e) => { e.stopPropagation(); abrir(f); }} aria-label={t('feiras.pontos.editar')}><Icon name="pencil" size={16} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {detalhe && (
        <Drawer aberto largo titulo={detalhe.nome} subtitulo={(detalhe.local || t('feiras.pontos.localNaoInformado')) + ' · ' + (regraEfetiva(detalhe) ? resumoRegra(detalhe) : diasDaFeira(detalhe).map(dataCurta).join(', '))} onClose={fecharDetalhe}
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
          <SeletorDatas dias={edit.dias ?? [hoje()]} onChange={mudarDias} />
          <Field label={t('feiras.pontos.repete')}>
            <select value={preset} onChange={(e) => mudarPreset(e.target.value as Preset)}>
              {PRESETS.map((p) => <option key={p} value={p}>{rotuloPreset(p, edit.inicio ?? hoje())}</option>)}
            </select>
          </Field>
          {preset === 'custom' && edit.regra && <RepetePersonalizada regra={edit.regra} inicio={edit.inicio ?? hoje()} onChange={(regra) => setEdit({ ...edit, regra })} />}
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
  // Linhas em edição (inclui a linha nova ainda sem produto); só as com produto são gravadas.
  const [linhas, setLinhas] = useState<{ produtoId: string; qtd: number; unit: number }[]>(() => (feira.produtos ?? []).map((p) => {
    const prod = db.produtos.find((x) => x.id === p.produtoId);
    return { produtoId: p.produtoId, qtd: p.qtd, unit: p.unit ?? (prod ? precoAtacado(prod, db.config) : 0) };
  }));
  const preco = (id: string) => { const p = db.produtos.find((x) => x.id === id); return p ? Math.round(precoAtacado(p, db.config) * 100) / 100 : 0; };
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

/** Grade do mês com as edições de cada feira (inclui as que se repetem). */
function Calendario({ feiras, onAbrir }: { feiras: Feira[]; onAbrir: (id: string) => void }) {
  const { t } = useFeirasT();
  const [mes, setMes] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const loc = localeNumeros();
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1 - mes.getDay());
  const dias = Array.from({ length: 42 }, (_, i) => new Date(primeiro.getFullYear(), primeiro.getMonth(), primeiro.getDate() + i));
  const de = iso(dias[0]); const ate = iso(dias[41]);
  const eventos = feiras.flatMap((f) => ocorrencias(f, de, ate).map((o) => ({ f, ...o })));
  const doDia = (d: string) => eventos.filter((e) => e.inicio <= d && d <= e.fim);
  const naoVazio = eventos.some((e) => e.fim >= iso(new Date(mes.getFullYear(), mes.getMonth(), 1)) && e.inicio <= iso(new Date(mes.getFullYear(), mes.getMonth() + 1, 0)));
  const nomes = Array.from({ length: 7 }, (_, i) => new Date(2023, 0, 1 + i).toLocaleDateString(loc, { weekday: 'short' }));
  const h = hoje();
  const ir = (n: number) => setMes(new Date(mes.getFullYear(), mes.getMonth() + n, 1));
  return (
    <div className="fe-card fe-cal">
      <div className="fe-cal-head">
        <h3>{mes.toLocaleDateString(loc, { month: 'long', year: 'numeric' })}</h3>
        <div className="fe-cal-nav">
          <button className="fe-btn fe-btn-outline fe-btn-sm" onClick={() => setMes(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>{t('feiras.pontos.hojeBtn')}</button>
          <button className="fe-icon-btn" aria-label={t('feiras.pontos.mesAnterior')} onClick={() => ir(-1)}><span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Icon name="chevron" size={16} /></span></button>
          <button className="fe-icon-btn" aria-label={t('feiras.pontos.mesSeguinte')} onClick={() => ir(1)}><Icon name="chevron" size={16} /></button>
        </div>
      </div>
      <div className="fe-cal-grid">
        {nomes.map((n) => <div key={n} className="fe-cal-dow">{n}</div>)}
        {dias.map((d) => {
          const k = iso(d);
          return (
            <div key={k} className={'fe-cal-dia' + (d.getMonth() !== mes.getMonth() ? ' fe-fora' : '') + (k === h ? ' fe-hoje' : '')}>
              <span className="fe-cal-num">{d.getDate()}</span>
              {doDia(k).map((e) => <button key={e.f.id + e.inicio} className="fe-cal-ev" title={e.f.nome} onClick={() => onAbrir(e.f.id)}>{e.f.nome}</button>)}
            </div>
          );
        })}
      </div>
      {!naoVazio && <p className="fe-cal-vazio">{t('feiras.pontos.agendaVazia')}</p>}
    </div>
  );
}

/** "Personalizar…": intervalo, dias da semana e fim da repetição, como no Google Agenda. */
function RepetePersonalizada({ regra, inicio, onChange }: { regra: RegraRepete; inicio: string; onChange: (r: RegraRepete) => void }) {
  const { t } = useFeirasT();
  const set = (p: Partial<RegraRepete>) => onChange({ ...regra, ...p });
  const un = (f: RegraRepete['freq']) => t('feiras.rep.un.' + f + (regra.cada === 1 ? '1' : 'N'));
  const dias = regra.diasSemana?.length ? regra.diasSemana : [new Date(inicio + 'T12:00:00').getDay()];
  const fim = regra.termina?.tipo ?? 'nunca';
  const mudarFim = (tipo: string) => set({ termina: tipo === 'data' ? { tipo: 'data', data: inicio } : tipo === 'vezes' ? { tipo: 'vezes', vezes: 4 } : undefined });
  return (
    <div className="fe-rep">
      <div className="fe-rep-linha">
        <span className="fe-lbl">{t('feiras.rep.cada')}</span>
        <input type="number" min={1} inputMode="numeric" value={regra.cada} onChange={(e) => set({ cada: Math.max(1, Number(e.target.value) || 1) })} />
        <select value={regra.freq} onChange={(e) => { const freq = e.target.value as RegraRepete['freq']; set({ freq, diasSemana: freq === 'semana' ? dias : undefined, mensal: freq === 'mes' ? (regra.mensal ?? 'dia') : undefined }); }}>
          {(['dia', 'semana', 'mes', 'ano'] as const).map((f) => <option key={f} value={f}>{un(f)}</option>)}
        </select>
      </div>
      {regra.freq === 'semana' && (
        <div>
          <span className="fe-lbl">{t('feiras.rep.diasSemana')}</span>
          <div className="fe-seg fe-rep-dias">
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <button key={d} type="button" aria-pressed={dias.includes(d)} aria-label={nomeDiaSemana(d)} className={dias.includes(d) ? 'fe-on' : ''}
                onClick={() => { const n = dias.includes(d) ? dias.filter((x) => x !== d) : [...dias, d]; if (n.length) set({ diasSemana: n.sort((a, b) => a - b) }); }}>{nomeDiaSemana(d, 'narrow').toUpperCase()}</button>
            ))}
          </div>
        </div>
      )}
      {regra.freq === 'mes' && (
        <select value={regra.mensal ?? 'dia'} onChange={(e) => set({ mensal: e.target.value as 'dia' | 'nesimo' })}>
          <option value="dia">{rotuloPreset('mes-dia', inicio)}</option>
          <option value="nesimo">{rotuloPreset('mes-nesimo', inicio)}</option>
        </select>
      )}
      <div>
        <span className="fe-lbl">{t('feiras.rep.termina')}</span>
        <div className="fe-rep-fim">
          <label><input type="radio" name="rep-fim" checked={fim === 'nunca'} onChange={() => mudarFim('nunca')} /> {t('feiras.rep.nunca')}</label>
          <label><input type="radio" name="rep-fim" checked={fim === 'data'} onChange={() => mudarFim('data')} /> {t('feiras.rep.emData')}
            <input type="date" min={inicio} disabled={fim !== 'data'} value={regra.termina?.tipo === 'data' ? regra.termina.data : ''} onChange={(e) => e.target.value && set({ termina: { tipo: 'data', data: e.target.value } })} /></label>
          <label><input type="radio" name="rep-fim" checked={fim === 'vezes'} onChange={() => mudarFim('vezes')} /> {t('feiras.rep.apos')}
            <input type="number" min={1} disabled={fim !== 'vezes'} value={regra.termina?.tipo === 'vezes' ? regra.termina.vezes : ''} onChange={(e) => set({ termina: { tipo: 'vezes', vezes: Math.max(1, Number(e.target.value) || 1) } })} /> {t('feiras.rep.ocorrencias')}</label>
        </div>
      </div>
          </div>
  );
}

/** Seleção de um ou mais dias num calendário (clique alterna; Shift + clique marca intervalo). */
function SeletorDatas({ dias, onChange }: { dias: string[]; onChange: (d: string[]) => void }) {
  const { t } = useFeirasT();
  const loc = localeNumeros();
  const [aberto, setAberto] = useState(false);
  const [mes, setMes] = useState(() => { const d = new Date(dias[0] + 'T12:00:00'); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [ancora, setAncora] = useState<string | null>(null);
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1 - mes.getDay());
  const grade = Array.from({ length: 42 }, (_, i) => new Date(primeiro.getFullYear(), primeiro.getMonth(), primeiro.getDate() + i));
  const h = hoje();

  function clicar(k: string, shift: boolean) {
    let novos: string[];
    if (shift && ancora) {
      const [a, b] = ancora < k ? [ancora, k] : [k, ancora];
      const faixa: string[] = [];
      for (let d = a; d <= b; d = addDias(1, d)) faixa.push(d);
      novos = [...new Set([...dias, ...faixa])];
    } else if (dias.includes(k)) novos = dias.filter((d) => d !== k);
    else novos = [...dias, k];
    setAncora(k);
    if (novos.length) onChange(novos.sort());
  }
  const resumo = dias.length === 1 ? dataLonga(dias[0]) : t('feiras.pontos.varios', { n: dias.length, a: dataCurta(dias[0]), b: dataCurta(dias[dias.length - 1]) });
  return (
    <div className="fe-field">
      <span className="fe-lbl">{t('feiras.pontos.datasSel')}</span>
      <button type="button" className="fe-sel-btn" aria-expanded={aberto} onClick={() => setAberto(!aberto)}><span>{resumo}</span><Icon name="clock" size={16} /></button>
      {aberto && (
        <div className="fe-sel">
          <div className="fe-cal-head">
            <b style={{ textTransform: 'capitalize' }}>{mes.toLocaleDateString(loc, { month: 'long', year: 'numeric' })}</b>
            <div className="fe-cal-nav">
              <button type="button" className="fe-icon-btn" aria-label={t('feiras.pontos.mesAnterior')} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}><span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Icon name="chevron" size={16} /></span></button>
              <button type="button" className="fe-icon-btn" aria-label={t('feiras.pontos.mesSeguinte')} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}><Icon name="chevron" size={16} /></button>
            </div>
          </div>
          <div className="fe-sel-grid">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => <span key={i} className="fe-sel-dow">{nomeDiaSemana(i, 'narrow').toUpperCase()}</span>)}
            {grade.map((d) => {
              const k = iso(d);
              return <button key={k} type="button" aria-pressed={dias.includes(k)} className={'fe-sel-dia' + (d.getMonth() !== mes.getMonth() ? ' fe-fora' : '') + (k === h ? ' fe-hoje' : '') + (dias.includes(k) ? ' fe-on' : '')} onClick={(e) => clicar(k, e.shiftKey)}>{d.getDate()}</button>;
            })}
          </div>
          <small className="fe-rep-dica">{t('feiras.pontos.datasDica')}</small>
          <button type="button" className="fe-btn fe-btn-outline fe-btn-sm" onClick={() => setAberto(false)}>{t('feiras.pontos.datasOk')}</button>
        </div>
      )}
    </div>
  );
}
