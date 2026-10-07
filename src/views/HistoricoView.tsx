import { useEffect, useMemo, useState } from 'react';
import type { Canal, HistoricoEntry } from '../types';
import { brl } from '../lib/format';
import { getHistorico } from '../lib/storage';
import { CANAIS } from '../lib/canal';
import { useCalculadora } from '../context/CalculadoraContext';
import { useI18n } from '../context/I18nContext';
import HistDrawer from '../components/drawers/HistDrawer';
import Icon from '../components/Icon';
import PopoverList from '../components/produtos/PopoverList';
import MarcadorPicker from '../components/historico/MarcadorPicker';
import MarcadoresDrawer from '../components/historico/MarcadoresDrawer';
import MarcadorFiltro, { type ModoFiltro } from '../components/historico/MarcadorFiltro';
import CanalFiltro from '../components/historico/CanalFiltro';
import { CANAL_COR } from '../lib/canal';
import {
  getMarcadores, saveMarcadores, getHistMarcadores, saveHistMarcadores, migrarPastas, seedMarcadoresExemplo,
  MAX_POR_CALCULO, type Marcador, type VinculoMarcadores,
} from '../lib/cluster';

type SortKey = 'nome' | 'precoConsumidor' | 'lucroLiquido' | 'margem' | 'potMensal' | 'id';

const ORDEM_KEYS = ['id_desc', 'id_asc', 'lucro_desc', 'margem_desc', 'nome_asc'] as const;
type OrdemKey = (typeof ORDEM_KEYS)[number];
const ORDEM_LABEL_KEYS: Record<OrdemKey, string> = {
  id_desc: 'calc.ordemDataRecente',
  id_asc: 'calc.ordemDataAntiga',
  lucro_desc: 'calc.ordemMaiorLucro',
  margem_desc: 'calc.ordemMaiorMargem',
  nome_asc: 'calc.ordemNomeAZ',
};
const ORDEM_PARA_SORT: Record<OrdemKey, { key: SortKey; dir: 1 | -1 }> = {
  id_desc: { key: 'id', dir: -1 },
  id_asc: { key: 'id', dir: 1 },
  lucro_desc: { key: 'lucroLiquido', dir: -1 },
  margem_desc: { key: 'margem', dir: -1 },
  nome_asc: { key: 'nome', dir: 1 },
};

export default function HistoricoView({ onChange, onAbrirNaCalculadora }: { onChange: () => void; onAbrirNaCalculadora: () => void }) {
  const { restaurarHistorico, resetCalculadora } = useCalculadora();
  const { t } = useI18n();
  const [hist, setHist] = useState<HistoricoEntry[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [busca, setBusca] = useState('');
  const [ordem, setOrdem] = useState<OrdemKey>('id_desc');
  const [selected, setSelected] = useState<HistoricoEntry | null>(null);

  // Marcadores (até MAX_POR_CALCULO por cálculo) — única forma de organizar o Histórico.
  const [marcadores, setMarcadores] = useState<Marcador[]>([]);
  const [vinculo, setVinculo] = useState<VinculoMarcadores>({});
  const [filtroIds, setFiltroIds] = useState<Set<string>>(new Set());
  const [filtroSemMarcador, setFiltroSemMarcador] = useState(false);
  const [modoFiltro, setModoFiltro] = useState<ModoFiltro>('qualquer');

  // Filtro por canal de venda — cada cálculo tem só um canal, então marcar
  // vários é sempre "qualquer um deles" (união).
  const [filtroCanais, setFiltroCanais] = useState<Set<Canal>>(new Set());

  // Drawer de marcadores — 1 instância só, aberta na linha que o usuário clicou.
  const [drawerEntryId, setDrawerEntryId] = useState<number | null>(null);

  function reload() {
    setHist([...getHistorico()]);
  }

  useEffect(() => {
    const lista = getHistorico();
    // Exemplos antes da migração: a migração cria marcadores e travaria o seed.
    seedMarcadoresExemplo(lista);
    migrarPastas();
    setHist([...lista]);
    setMarcadores(getMarcadores());
    setVinculo(getHistMarcadores());
  }, []);

  const idsDe = (entryId: number) => vinculo[entryId] ?? [];

  function salvarVinculo(next: VinculoMarcadores) {
    setVinculo(next);
    saveHistMarcadores(next);
  }

  function alternarMarcador(entryId: number, marcadorId: string) {
    const atuais = idsDe(entryId);
    if (atuais.includes(marcadorId)) salvarVinculo({ ...vinculo, [entryId]: atuais.filter((id) => id !== marcadorId) });
    else if (atuais.length < MAX_POR_CALCULO) salvarVinculo({ ...vinculo, [entryId]: [...atuais, marcadorId] });
  }

  function criarMarcador(entryId: number, m: Marcador) {
    const next = [...marcadores, m];
    setMarcadores(next);
    saveMarcadores(next);
    alternarMarcador(entryId, m.id);
  }

  // Filtro: marcadores e "Sem marcador" são excludentes — escolher um limpa o outro.
  function alternarFiltro(id: string) {
    setFiltroSemMarcador(false);
    setFiltroIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function alternarSemMarcador() {
    setFiltroIds(new Set());
    setFiltroSemMarcador((v) => !v);
  }
  function limparFiltro() {
    setFiltroIds(new Set());
    setFiltroSemMarcador(false);
    setModoFiltro('qualquer');
  }

  function alternarFiltroCanal(c: Canal) {
    setFiltroCanais((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c); else next.add(c);
      return next;
    });
  }

  const histFiltrado = useMemo(() => {
    let lista = [...hist];
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      lista = lista.filter((h) => (h.nome || '').toLowerCase().includes(termo) || (h.marketplace || '').toLowerCase().includes(termo));
    }
    if (filtroSemMarcador) {
      lista = lista.filter((h) => !(vinculo[h.id] ?? []).length);
    } else if (filtroIds.size) {
      const alvo = [...filtroIds];
      lista = lista.filter((h) => {
        const ids = vinculo[h.id] ?? [];
        return modoFiltro === 'todos' ? alvo.every((id) => ids.includes(id)) : alvo.some((id) => ids.includes(id));
      });
    }
    if (filtroCanais.size) lista = lista.filter((h) => h.marketplace && filtroCanais.has(h.marketplace));
    return lista.sort((a, b) => {
      const va = a[sortKey] as any;
      const vb = b[sortKey] as any;
      const cmp = typeof va === 'string' && typeof vb === 'string' ? va.localeCompare(vb, 'pt-BR', { sensitivity: 'base' }) : va > vb ? 1 : va < vb ? -1 : 0;
      return cmp * sortDir;
    });
  }, [hist, busca, sortKey, sortDir, vinculo, filtroIds, filtroSemMarcador, modoFiltro, filtroCanais]);

  const contagemPorCanal = useMemo(() => {
    const mapa = Object.fromEntries(CANAIS.map((c) => [c, 0])) as Record<Canal, number>;
    for (const h of hist) if (h.marketplace) mapa[h.marketplace] = (mapa[h.marketplace] ?? 0) + 1;
    return mapa;
  }, [hist]);

  const totalSemMarcador = hist.filter((h) => !(vinculo[h.id] ?? []).length).length;

  function sortHist(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d * -1) as 1 | -1);
    else { setSortKey(key); setSortDir(-1); }
  }

  function mudarOrdem(v: string) {
    const opt = ORDEM_KEYS.find((k) => t(ORDEM_LABEL_KEYS[k]) === v) ?? 'id_desc';
    setOrdem(opt);
    const { key, dir } = ORDEM_PARA_SORT[opt];
    setSortKey(key);
    setSortDir(dir);
  }

  function handleChange() {
    reload();
    onChange();
  }

  function abrirNaCalculadora(h: HistoricoEntry) {
    restaurarHistorico(h);
    onAbrirNaCalculadora();
  }

  function novaCalculadora() {
    resetCalculadora();
    onAbrirNaCalculadora();
  }

  return (
    <div>
      <div className="hero-row">
        <div className="hero"><h1>{t('calc.historicoDeTitle')} <span className="accent">{t('calc.historicoDeAccent')}</span></h1><p>{t('calc.historicoSubtitle')}</p></div>
        <button type="button" className="btn-calc hist-nova-btn" onClick={novaCalculadora}>+ {t('calc.novaCalculadora')}</button>
      </div>

      <div className="prod-filters-row">
        <div className="cl-search prod-search"><Icon name="search" size={15} /><input type="text" placeholder={t('calc.buscarPorNomeOuCanal')} value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
        <PopoverList label="" options={ORDEM_KEYS.map((k) => t(ORDEM_LABEL_KEYS[k]))} value={t(ORDEM_LABEL_KEYS[ordem])} onChange={mudarOrdem} />
        <MarcadorFiltro
          marcadores={marcadores} vinculo={vinculo} totalSemMarcador={totalSemMarcador}
          selecionados={filtroIds} semMarcador={filtroSemMarcador} modo={modoFiltro}
          onAlternar={alternarFiltro} onSemMarcador={alternarSemMarcador} onModo={setModoFiltro} onLimpar={limparFiltro}
        />
        <CanalFiltro contagem={contagemPorCanal} selecionados={filtroCanais} onAlternar={alternarFiltroCanal} onLimpar={() => setFiltroCanais(new Set())} />
        <span className="hint hist-count">{histFiltrado.length} {histFiltrado.length === 1 ? t('calc.calculo') : t('calc.calculos')}</span>
      </div>

      <div>
        <div className="card hist-table-card">
          <div className="card-body" style={{ paddingTop: 22 }}>
            <div className="table-scroll-x">
            <table className="hist-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-3)' }}>
                  <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('nome')}>{t('calc.thProduto')} ↕</th>
                  <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('id')}>{t('calc.thData')} ↕</th>
                  <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('precoConsumidor')}>{t('calc.thPrecoFinal')} ↕</th>
                  <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('lucroLiquido')}>{t('calc.thLucro')} ↕</th>
                  <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('margem')}>{t('calc.thMargemHist')} ↕</th>
                  <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('potMensal')}>{t('calc.thPotMensal')} ↕</th>
                  <th style={{ padding: 10 }}>{t('calc.thCanal')}</th>
                  <th style={{ padding: '10px 6px' }}>{t('calc.thAnuncios')}</th>
                  <th style={{ padding: '10px 6px' }}>{t('calc.thFonteStl')}</th>
                  <th style={{ padding: '10px 6px' }}>{t('calc.thConcorrente')}</th>
                  <th style={{ padding: 10 }}>{t('calc.marcadoresLabel')}</th>
                  <th className="col-acoes-sticky" style={{ padding: 10 }}>{t('calc.acoes')}</th>
                </tr>
              </thead>
              <tbody>
                {histFiltrado.map((h) => (
                  <tr key={h.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: 10 }}>
                      <button
                        type="button"
                        onClick={() => abrirNaCalculadora(h)}
                        style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary-dark)', fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontSize: 13 }}
                      >
                        {h.nome || '-'}
                      </button>
                    </td>
                    <td style={{ padding: 10 }}>{new Date(h.id).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: 10 }}>{brl(h.precoConsumidor)}</td>
                    <td style={{ padding: 10 }}>{brl(h.lucroLiquido)}</td>
                    <td style={{ padding: 10 }}>{(h.margem || 0).toFixed(1)}%</td>
                    <td style={{ padding: 10 }}>{brl(h.potMensal)}</td>
                    <td style={{ padding: 10, whiteSpace: 'nowrap' }}>
                      {h.marketplace ? (
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: CANAL_COR[h.marketplace]?.bg, color: CANAL_COR[h.marketplace]?.fg, boxShadow: 'inset 0 0 0 1px color-mix(in srgb, currentColor 22%, transparent)' }}>{h.marketplace}</span>
                      ) : '-'}
                    </td>
                    {([
                      [h.anuncioLink, 'calc.verMeuAnuncio'],
                      [h.stlLink, 'calc.verStl'],
                      [h.concorrenteLink, 'calc.verAnuncio'],
                    ] as const).map(([url, titulo]) => (
                      <td key={titulo} style={{ padding: '10px 6px' }}>
                        {url
                          ? <button type="button" className="btn-outline" title={t(titulo)} aria-label={t(titulo)} style={{ padding: '3px 10px', fontSize: 11.5, whiteSpace: 'nowrap' }} onClick={() => window.open(url, '_blank')}>{t('calc.ver')}</button>
                          : '-'}
                      </td>
                    ))}
                    <td style={{ padding: 10 }}>
                      <MarcadorPicker
                        marcadores={marcadores} ids={idsDe(h.id)} filtrados={filtroIds}
                        onAbrir={() => setDrawerEntryId(h.id)} onFiltrar={alternarFiltro}
                      />
                    </td>
                    <td className="col-acoes-sticky" style={{ padding: 10 }}><button className="btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setSelected(h)}>{t('calc.acoes')}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {!histFiltrado.length && (
              <div className="hint" style={{ textAlign: 'center', padding: 24 }}>
                {hist.length ? t('calc.nenhumCalculoEncontradoFiltro') : t('calc.nenhumCalculoSalvo')}
              </div>
            )}
          </div>
        </div>
      </div>

      <MarcadoresDrawer
        open={drawerEntryId !== null}
        marcadores={marcadores}
        selecionados={drawerEntryId === null ? [] : idsDe(drawerEntryId)}
        onClose={() => setDrawerEntryId(null)}
        onAlternar={(id) => drawerEntryId !== null && alternarMarcador(drawerEntryId, id)}
        onCriar={(m) => drawerEntryId !== null && criarMarcador(drawerEntryId, m)}
      />

      <HistDrawer entry={selected} onClose={() => setSelected(null)} onChange={handleChange} onAbrirNaCalculadora={onAbrirNaCalculadora} />
    </div>
  );
}
