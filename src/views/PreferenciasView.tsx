import { useState } from 'react';
import { useLibrarias } from '../context/LibrariasContext';
import { useI18n } from '../context/I18nContext';
import type { CustoCategoria, Filamento, Impressora, Moeda } from '../types';
import { brl } from '../lib/format';
import InfoDot from '../components/InfoDot';
import {
  getPastas, getHistPastaVinculo, removerPasta,
  getMarcadores, getHistMarcadorVinculo, removerMarcador,
} from '../lib/cluster';

type Tab = 'moeda' | 'impressora' | 'margem' | 'vendadireta' | 'custos' | 'organizacao';
const TABS: { key: Tab; labelKey: string }[] = [
  { key: 'moeda', labelKey: 'calc.moeda' },
  { key: 'impressora', labelKey: 'calc.impressao' },
  { key: 'margem', labelKey: 'calc.precificacao' },
  { key: 'vendadireta', labelKey: 'calc.canalDeVenda' },
  { key: 'custos', labelKey: 'calc.custosExtras' },
  { key: 'organizacao', labelKey: 'calc.pastasMarcadores' },
];
const CATS: CustoCategoria[] = ['Embalagem', 'Mão de obra', 'Acabamento', 'Outro', 'Outras'];
const CATS_LABEL_KEYS: Record<CustoCategoria, string> = {
  'Embalagem': 'calc.catEmbalagem',
  'Mão de obra': 'calc.catMaoDeObra',
  'Acabamento': 'calc.catAcabamento',
  'Outro': 'calc.catOutro',
  'Outras': 'calc.catOutras',
};
const TIPOS_FIL = ['PLA', 'PETG', 'ABS', 'TPU', 'Resina'];
const MOEDAS: { m: Moeda; label: string }[] = [
  { m: 'BRL', label: 'R$' }, { m: 'USD', label: 'US$' }, { m: 'EUR', label: '€' }, { m: 'ARS', label: 'AR$' },
];

export default function PreferenciasView() {
  const {
    impressoras, setImpressoras, filamentos, setFilamentos, custosPadrao, setCustosPadrao,
    prefs, setPrefs,
  } = useLibrarias();
  const { t } = useI18n();

  const [tab, setTab] = useState<Tab>('moeda');

  // Buffer local — só grava em `prefs` (localStorage) ao clicar "Salvar preferências",
  // igual ao protótipo. As bibliotecas (impressoras/filamentos/custos) já são live.
  const [moeda, setMoedaBuf] = useState<Moeda>(prefs.moeda);
  const [kwh, setKwh] = useState(String(prefs.kwh));
  const [impressoraSel, setImpressoraSel] = useState(prefs.impressora);
  const [filamentoSel, setFilamentoSel] = useState(prefs.filamento);
  const [imposto, setImposto] = useState(String(prefs.imposto));
  const [margem, setMargem] = useState(String(prefs.margem));
  const [taxaDebito, setTaxaDebito] = useState(String(prefs.taxaDebito));
  const [taxaCredito, setTaxaCredito] = useState(String(prefs.taxaCredito));
  const [taxaPix, setTaxaPix] = useState(String(prefs.taxaPix));
  const [descontoPix, setDescontoPix] = useState(String(prefs.descontoPix));
  const [saved, setSaved] = useState(false);

  function salvar() {
    setPrefs({
      moeda, kwh: parseFloat(kwh) || 0, impressora: impressoraSel, filamento: filamentoSel,
      imposto: parseFloat(imposto) || 0, margem: parseFloat(margem) || 0,
      taxaDebito: parseFloat(taxaDebito) || 0, taxaCredito: parseFloat(taxaCredito) || 0,
      taxaPix: parseFloat(taxaPix) || 0, descontoPix: parseFloat(descontoPix) || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  // --- CRUD de bibliotecas (live, sem depender do botão Salvar) ---
  const [novaImpNome, setNovaImpNome] = useState('');
  const [novaImpKwh, setNovaImpKwh] = useState('');
  function addImpressora() {
    const n = novaImpNome.trim();
    if (!n) return;
    setImpressoras((p) => [...p, { nome: n, kwh: parseFloat(novaImpKwh) || 0 }]);
    setNovaImpNome(''); setNovaImpKwh('');
  }
  function updateImpressora(idx: number, patch: Partial<Impressora>) {
    setImpressoras((p) => p.map((i, ix) => (ix === idx ? { ...i, ...patch } : i)));
  }
  function removeImpressora(idx: number) {
    setImpressoras((p) => p.filter((_, ix) => ix !== idx));
  }

  const [novoFilNome, setNovoFilNome] = useState('');
  const [novoFilTipo, setNovoFilTipo] = useState(TIPOS_FIL[0]);
  const [novoFilCor, setNovoFilCor] = useState('');
  const [novoFilPreco, setNovoFilPreco] = useState('');
  function addFilamento() {
    const n = novoFilNome.trim();
    if (!n) return;
    setFilamentos((p) => [...p, { nome: n, tipo: novoFilTipo, cor: novoFilCor.trim(), preco: parseFloat(novoFilPreco) || 0 }]);
    setNovoFilNome(''); setNovoFilCor(''); setNovoFilPreco('');
  }
  function updateFilamento(idx: number, patch: Partial<Filamento>) {
    setFilamentos((p) => p.map((f, ix) => (ix === idx ? { ...f, ...patch } : f)));
  }
  function removeFilamento(idx: number) {
    setFilamentos((p) => p.filter((_, ix) => ix !== idx));
  }

  const [novoCustoNome, setNovoCustoNome] = useState('');
  const [novoCustoValor, setNovoCustoValor] = useState('');
  const [novoCustoCategoria, setNovoCustoCategoria] = useState<CustoCategoria>('Embalagem');
  function addCustoPadrao() {
    const n = novoCustoNome.trim();
    if (!n) return;
    setCustosPadrao((p) => [...p, { nome: n, valor: parseFloat(novoCustoValor) || 0, ativo: true, categoria: novoCustoCategoria }]);
    setNovoCustoNome(''); setNovoCustoValor('');
  }
  function updateCustoPadrao(idx: number, patch: Partial<(typeof custosPadrao)[0]>) {
    setCustosPadrao((p) => p.map((c, ix) => (ix === idx ? { ...c, ...patch } : c)));
  }
  function removeCustoPadrao(idx: number) {
    setCustosPadrao((p) => p.filter((_, ix) => ix !== idx));
  }

  // --- Pastas & marcadores (organização do Histórico) — leitura direta do
  // localStorage via lib/cluster, igual ao que HistoricoView já faz. ---
  const [pastasOrg, setPastasOrg] = useState(getPastas);
  const [pastaVinculoOrg, setPastaVinculoOrg] = useState(getHistPastaVinculo);
  const [marcadoresOrg, setMarcadoresOrg] = useState(getMarcadores);
  const [marcadorVinculoOrg, setMarcadorVinculoOrg] = useState(getHistMarcadorVinculo);

  function contarVinculos(vinculo: Record<string, string>, id: string) {
    return Object.values(vinculo).filter((v) => v === id).length;
  }

  function excluirPastaOrg(id: string, nome: string) {
    if (!confirm(t('calc.excluirPastaConfirm').replace('{nome}', nome))) return;
    removerPasta(id);
    setPastasOrg(getPastas());
    setPastaVinculoOrg(getHistPastaVinculo());
  }

  function excluirMarcadorOrg(id: string, nome: string) {
    if (!confirm(t('calc.excluirMarcadorConfirm').replace('{nome}', nome))) return;
    removerMarcador(id);
    setMarcadoresOrg(getMarcadores());
    setMarcadorVinculoOrg(getHistMarcadorVinculo());
  }

  return (
    <div>
      <div className="hero">
        <h1>{t('calc.prefsHeroTitlePart1')} <span className="accent">{t('calc.prefsHeroTitleAccent')}</span> {t('calc.prefsHeroTitlePart2')}</h1>
        <p>{t('calc.prefsHeroSubtitle')}</p>
      </div>

      <div className="chip-row" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map((tabItem) => (
          <button key={tabItem.key} type="button" className={'chip' + (tab === tabItem.key ? ' active' : '')} onClick={() => setTab(tabItem.key)}>{t(tabItem.labelKey)}</button>
        ))}
      </div>

      {tab === 'moeda' && (
        <div className="card pref-tab">
          <div className="card-body" style={{ paddingTop: 22 }}>
            <div className="field">
              <label>{t('calc.moedaDeExibicaoPadrao')} <InfoDot text={t('calc.moedaSoSimboloInfo')} /></label>
              <div className="chip-row sm">
                {MOEDAS.map((o) => (
                  <button key={o.m} type="button" className={'chip sm' + (moeda === o.m ? ' active' : '')} onClick={() => setMoedaBuf(o.m)}>{o.label}</button>
                ))}
              </div>
              <div className="hint">{t('calc.moedaDefineSimboloHint')}</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'impressora' && (
        <>
          <div className="card pref-tab">
            <div className="card-head" style={{ cursor: 'default' }}>
              <div className="htitle"><div className="ic-badge">🖶</div><h3>{t('calc.impressoraPadrao')}</h3></div>
            </div>
            <div className="card-body">
              <div className="row2">
                <div className="field">
                  <label>{t('calc.impressoraPadrao')}</label>
                  <select value={impressoraSel} onChange={(e) => setImpressoraSel(e.target.value)}>
                    <option value="">{t('calc.nenhuma')}</option>
                    {impressoras.map((i, idx) => <option key={idx} value={idx}>{i.nome}</option>)}
                  </select>
                  <div className="hint">{t('calc.impressoraPadraoGerenciadaHint')}</div>
                </div>
                <div className="field">
                  <label>{t('calc.valorDoKwhPadrao')}</label>
                  <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" step="0.01" value={kwh} onChange={(e) => setKwh(e.target.value)} /></div>
                  <div className="hint">{t('calc.mediaNacionalKwhHint')}</div>
                </div>
              </div>
              <div className="divider-label">{t('calc.bibliotecaDeImpressoras')}</div>
              <div className="custo-row" style={{ gridTemplateColumns: 'auto 1fr 110px 34px', background: 'transparent', border: 'none', padding: '0 12px', marginBottom: 2 }}>
                <span /><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{t('calc.nome')}</span><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'center' }}>kWh/h</span><span />
              </div>
              {impressoras.map((i, idx) => (
                <div className="custo-row" key={idx}>
                  <span style={{ color: 'var(--text-3)' }}>🖶</span>
                  <input type="text" value={i.nome} onChange={(e) => updateImpressora(idx, { nome: e.target.value })} />
                  <input type="number" step="0.01" value={i.kwh} onChange={(e) => updateImpressora(idx, { kwh: parseFloat(e.target.value) || 0 })} />
                  <button className="custo-remove" onClick={() => removeImpressora(idx)}>✕</button>
                </div>
              ))}
              <div className="add-custo-row">
                <input type="text" placeholder={t('calc.placeholderNomeImpressora')} value={novaImpNome} onChange={(e) => setNovaImpNome(e.target.value)} />
                <input type="number" placeholder="kWh/h" step="0.01" style={{ maxWidth: 100 }} value={novaImpKwh} onChange={(e) => setNovaImpKwh(e.target.value)} />
                <button className="btn-outline" onClick={addImpressora}>+ {t('calc.adicionar')}</button>
              </div>
            </div>
          </div>

          <div className="card pref-tab">
            <div className="card-head" style={{ cursor: 'default' }}>
              <div className="htitle"><div className="ic-badge">◆</div><h3>{t('calc.filamentoPadrao')}</h3></div>
            </div>
            <div className="card-body">
              <div className="field">
                <label>{t('calc.filamentoPadrao')}</label>
                <select value={filamentoSel} onChange={(e) => setFilamentoSel(e.target.value)}>
                  <option value="">{t('calc.nenhum')}</option>
                  {filamentos.map((f, idx) => <option key={idx} value={idx}>{f.nome} ({f.tipo}{f.cor ? ' · ' + f.cor : ''}): {brl(f.preco)}/kg</option>)}
                </select>
                <div className="hint">{t('calc.filamentoPadraoPreencheCampoHint')}</div>
              </div>
              <div className="divider-label">{t('calc.bibliotecaDeFilamentos')}</div>
              <div className="custo-row" style={{ gridTemplateColumns: 'auto 1fr 90px 90px 100px 34px', background: 'transparent', border: 'none', padding: '0 12px', marginBottom: 2 }}>
                <span /><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{t('calc.marca')}</span><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'center' }}>{t('calc.tipo')}</span><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'center' }}>{t('calc.cor')}</span><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>R$/kg</span><span />
              </div>
              {filamentos.map((f, idx) => (
                <div className="custo-row" style={{ gridTemplateColumns: 'auto 1fr 90px 90px 100px 34px' }} key={idx}>
                  <span style={{ color: 'var(--text-3)' }}>◆</span>
                  <input type="text" value={f.nome} onChange={(e) => updateFilamento(idx, { nome: e.target.value })} />
                  <input type="text" value={f.tipo} style={{ textAlign: 'center' }} onChange={(e) => updateFilamento(idx, { tipo: e.target.value })} />
                  <input type="text" value={f.cor || ''} style={{ textAlign: 'center' }} onChange={(e) => updateFilamento(idx, { cor: e.target.value })} />
                  <input type="number" step="0.01" value={f.preco} onChange={(e) => updateFilamento(idx, { preco: parseFloat(e.target.value) || 0 })} />
                  <button className="custo-remove" onClick={() => removeFilamento(idx)}>✕</button>
                </div>
              ))}
              <div className="row2" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr auto', display: 'grid', gap: 8 }}>
                <input type="text" placeholder={t('calc.placeholderMarcaFilamento')} value={novoFilNome} onChange={(e) => setNovoFilNome(e.target.value)} />
                <select value={novoFilTipo} onChange={(e) => setNovoFilTipo(e.target.value)}>
                  {TIPOS_FIL.map((tipoFil) => <option key={tipoFil}>{tipoFil}</option>)}
                </select>
                <input type="text" placeholder={t('calc.placeholderCorFilamento')} value={novoFilCor} onChange={(e) => setNovoFilCor(e.target.value)} />
                <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" placeholder="/kg" step="0.01" value={novoFilPreco} onChange={(e) => setNovoFilPreco(e.target.value)} /></div>
                <button className="btn-outline" onClick={addFilamento}>+</button>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'margem' && (
        <div className="card pref-tab">
          <div className="card-body" style={{ paddingTop: 22 }}>
            <div className="row2">
              <div className="field">
                <label>{t('calc.impostoPadrao')}</label>
                <div className="suffix-wrap"><input type="number" value={imposto} onChange={(e) => setImposto(e.target.value)} /><span className="sfx">%</span></div>
                <div className="hint">{t('calc.impostoSimplesMeiHint')}</div>
              </div>
              <div className="field">
                <label>{t('calc.margemPadrao')}</label>
                <div className="suffix-wrap"><input type="number" value={margem} onChange={(e) => setMargem(e.target.value)} /><span className="sfx">%</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'vendadireta' && (
        <div className="card pref-tab">
          <div className="card-body" style={{ paddingTop: 22 }}>
            <div className="custo-desc">{t('calc.vendaDiretaPrefsDesc')}</div>
            <div className="row2">
              <div className="field">
                <label>{t('calc.taxaDebitoPadrao')}</label>
                <div className="suffix-wrap"><input type="number" step="0.01" value={taxaDebito} onChange={(e) => setTaxaDebito(e.target.value)} /><span className="sfx">%</span></div>
              </div>
              <div className="field">
                <label>{t('calc.taxaCreditoPadrao')}</label>
                <div className="suffix-wrap"><input type="number" step="0.01" value={taxaCredito} onChange={(e) => setTaxaCredito(e.target.value)} /><span className="sfx">%</span></div>
              </div>
            </div>
            <div className="row2">
              <div className="field">
                <label>{t('calc.taxaPixPadrao')}</label>
                <div className="suffix-wrap"><input type="number" step="0.01" value={taxaPix} onChange={(e) => setTaxaPix(e.target.value)} /><span className="sfx">%</span></div>
              </div>
              <div className="field">
                <label>{t('calc.descontoPixPadrao')}</label>
                <div className="suffix-wrap"><input type="number" value={descontoPix} onChange={(e) => setDescontoPix(e.target.value)} /><span className="sfx">%</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'custos' && (
        <div className="card pref-tab">
          <div className="card-body" style={{ paddingTop: 22 }}>
            <div className="custo-desc">
              {t('calc.custosPadraoBibliotecaDesc1')} <b>{t('calc.ativo')}</b> {t('calc.custosPadraoBibliotecaDesc2')}
            </div>
            <div className="custo-row" style={{ gridTemplateColumns: 'auto 1fr 110px 130px 34px', background: 'transparent', border: 'none', padding: '0 12px', marginBottom: 2 }}>
              <span /><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{t('calc.nome')}</span><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{t('calc.valor')}</span><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{t('calc.categoria')}</span><span />
            </div>
            {custosPadrao.map((c, idx) => (
              <div className="custo-row" style={{ gridTemplateColumns: 'auto 1fr 110px 130px 34px' }} key={idx}>
                <label className="switch"><input type="checkbox" checked={c.ativo} onChange={(e) => updateCustoPadrao(idx, { ativo: e.target.checked })} /><span className="track" /></label>
                <input type="text" value={c.nome} onChange={(e) => updateCustoPadrao(idx, { nome: e.target.value })} />
                <input type="number" step="0.01" value={c.valor} onChange={(e) => updateCustoPadrao(idx, { valor: parseFloat(e.target.value) || 0 })} />
                <select value={c.categoria} onChange={(e) => updateCustoPadrao(idx, { categoria: e.target.value as CustoCategoria })}>
                  {CATS.map((cat) => <option key={cat} value={cat}>{t(CATS_LABEL_KEYS[cat])}</option>)}
                </select>
                <button className="custo-remove" onClick={() => removeCustoPadrao(idx)}>✕</button>
              </div>
            ))}
            <div className="add-custo-row">
              <input type="text" placeholder={t('calc.placeholderNomeCusto')} value={novoCustoNome} onChange={(e) => setNovoCustoNome(e.target.value)} />
              <div className="prefix-wrap" style={{ maxWidth: 130 }}><span className="pfx">R$</span><input type="number" placeholder="0,00" step="0.01" value={novoCustoValor} onChange={(e) => setNovoCustoValor(e.target.value)} /></div>
              <select style={{ maxWidth: 150 }} value={novoCustoCategoria} onChange={(e) => setNovoCustoCategoria(e.target.value as CustoCategoria)}>
                {CATS.map((cat) => <option key={cat} value={cat}>{t(CATS_LABEL_KEYS[cat])}</option>)}
              </select>
              <button className="btn-outline" onClick={addCustoPadrao}>+ {t('calc.adicionar')}</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'organizacao' && (
        <div className="card pref-tab">
          <div className="card-body" style={{ paddingTop: 22 }}>
            <div className="custo-desc">
              {t('calc.pastasMarcadoresOrganizacaoDesc')}
            </div>

            <div className="divider-label">{t('calc.pastasLabel')} ({pastasOrg.length})</div>
            {pastasOrg.length > 0 && (
              <div className="custo-row" style={{ gridTemplateColumns: 'auto 1fr 110px 34px', background: 'transparent', border: 'none', padding: '0 12px', marginBottom: 2 }}>
                <span /><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{t('calc.nome')}</span><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'center' }}>{t('calc.calculos')}</span><span />
              </div>
            )}
            {pastasOrg.map((p) => (
              <div className="custo-row" style={{ gridTemplateColumns: 'auto 1fr 110px 34px' }} key={p.id}>
                <span className="pasta-dot" style={{ background: p.cor }} />
                <span>{p.nome}</span>
                <span style={{ textAlign: 'center', color: 'var(--text-2)' }}>{contarVinculos(pastaVinculoOrg, p.id)}</span>
                <button className="custo-remove" onClick={() => excluirPastaOrg(p.id, p.nome)}>✕</button>
              </div>
            ))}
            {!pastasOrg.length && <div className="hint" style={{ padding: '4px 0 8px' }}>{t('calc.nenhumaPastaCriadaAinda')}</div>}

            <div className="divider-label" style={{ marginTop: 22 }}>{t('calc.marcadoresLabel')} ({marcadoresOrg.length})</div>
            {marcadoresOrg.length > 0 && (
              <div className="custo-row" style={{ gridTemplateColumns: 'auto 1fr 110px 34px', background: 'transparent', border: 'none', padding: '0 12px', marginBottom: 2 }}>
                <span /><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{t('calc.nome')}</span><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'center' }}>{t('calc.calculos')}</span><span />
              </div>
            )}
            {marcadoresOrg.map((m) => (
              <div className="custo-row" style={{ gridTemplateColumns: 'auto 1fr 110px 34px' }} key={m.id}>
                <span className="pasta-dot" style={{ background: m.cor }} />
                <span>{m.nome}</span>
                <span style={{ textAlign: 'center', color: 'var(--text-2)' }}>{contarVinculos(marcadorVinculoOrg, m.id)}</span>
                <button className="custo-remove" onClick={() => excluirMarcadorOrg(m.id, m.nome)}>✕</button>
              </div>
            ))}
            {!marcadoresOrg.length && <div className="hint" style={{ padding: '4px 0 8px' }}>{t('calc.nenhumMarcadorCriadoAinda')}</div>}
          </div>
        </div>
      )}

      <div className="actions-secondary" style={{ justifyContent: 'flex-start', marginTop: 6 }}>
        <button className="btn-calc" style={{ width: 'auto', padding: '12px 26px' }} onClick={salvar}>{t('calc.salvarPreferencias')}</button>
        <span className={'save-msg' + (saved ? ' show' : '')} style={{ alignSelf: 'center', fontSize: 13, color: 'var(--primary-dark)', fontWeight: 600, opacity: saved ? 1 : 0, transition: '.2s' }}>{t('calc.preferenciasSalvas')} ✓</span>
      </div>
    </div>
  );
}
