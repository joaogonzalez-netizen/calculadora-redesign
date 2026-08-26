import { useEffect, useMemo, useState } from 'react';
import type { HistoricoEntry } from '../types';
import { brl } from '../lib/format';
import { getHistorico } from '../lib/storage';
import { useCalculadora } from '../context/CalculadoraContext';
import HistDrawer from '../components/drawers/HistDrawer';
import Icon from '../components/Icon';
import PopoverList from '../components/produtos/PopoverList';
import PastaRail from '../components/historico/PastaRail';
import PastaPicker from '../components/historico/PastaPicker';
import MarcadorPicker from '../components/historico/MarcadorPicker';
import ClusterDrawer, { type ClusterItem } from '../components/historico/ClusterDrawer';
import {
  getPastas, savePastas, getHistPastaVinculo, saveHistPastaVinculo,
  getMarcadores, saveMarcadores, getHistMarcadorVinculo, saveHistMarcadorVinculo,
  getModoCluster, saveModoCluster,
  type Pasta, type Marcador, type ModoCluster,
} from '../lib/cluster';

type SortKey = 'nome' | 'precoConsumidor' | 'lucroLiquido' | 'margem' | 'potMensal' | 'id';

const ORDENS_HIST = ['Data (mais recente)', 'Data (mais antiga)', 'Maior lucro', 'Maior margem', 'Nome A-Z'] as const;
const ORDEM_PARA_SORT: Record<(typeof ORDENS_HIST)[number], { key: SortKey; dir: 1 | -1 }> = {
  'Data (mais recente)': { key: 'id', dir: -1 },
  'Data (mais antiga)': { key: 'id', dir: 1 },
  'Maior lucro': { key: 'lucroLiquido', dir: -1 },
  'Maior margem': { key: 'margem', dir: -1 },
  'Nome A-Z': { key: 'nome', dir: 1 },
};

export default function HistoricoView({ onChange, onAbrirNaCalculadora }: { onChange: () => void; onAbrirNaCalculadora: () => void }) {
  const { restaurarHistorico, resetCalculadora } = useCalculadora();
  const [hist, setHist] = useState<HistoricoEntry[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [busca, setBusca] = useState('');
  const [ordem, setOrdem] = useState<(typeof ORDENS_HIST)[number]>('Data (mais recente)');
  const [selected, setSelected] = useState<HistoricoEntry | null>(null);

  // Experiência A/B de organização — só uma delas fica no fim (ver botão de troca).
  const [modo, setModo] = useState<ModoCluster>(getModoCluster);
  const [pastas, setPastas] = useState<Pasta[]>(getPastas);
  const [pastaVinculo, setPastaVinculo] = useState<Record<string, string>>(getHistPastaVinculo);
  const [pastaAtiva, setPastaAtiva] = useState<string | null>(null);
  const [marcadores, setMarcadores] = useState<Marcador[]>(getMarcadores);
  const [marcadorVinculo, setMarcadorVinculo] = useState<Record<string, string>>(getHistMarcadorVinculo);
  const [marcadorFiltro, setMarcadorFiltro] = useState('Todos');

  // Drawer de atribuição — 1 instância só, aberta na linha que o usuário clicou "Adicionar".
  const [drawerEntryId, setDrawerEntryId] = useState<number | null>(null);

  function reload() {
    setHist([...getHistorico()]);
  }

  useEffect(reload, []);

  function trocarModo(m: ModoCluster) {
    setModo(m);
    saveModoCluster(m);
    setPastaAtiva(null);
    setMarcadorFiltro('Todos');
  }

  function criarPasta(p: Pasta) {
    const next = [...pastas, p];
    setPastas(next);
    savePastas(next);
  }

  function escolherPasta(entryId: number, pastaId: string | undefined) {
    const next = { ...pastaVinculo };
    if (pastaId) next[entryId] = pastaId; else delete next[entryId];
    setPastaVinculo(next);
    saveHistPastaVinculo(next);
  }

  function criarMarcador(m: Marcador) {
    const next = [...marcadores, m];
    setMarcadores(next);
    saveMarcadores(next);
  }

  function escolherMarcador(entryId: number, marcadorId: string | undefined) {
    const next = { ...marcadorVinculo };
    if (marcadorId) next[entryId] = marcadorId; else delete next[entryId];
    setMarcadorVinculo(next);
    saveHistMarcadorVinculo(next);
  }

  const histFiltrado = useMemo(() => {
    let lista = [...hist];
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      lista = lista.filter((h) => (h.nome || '').toLowerCase().includes(termo) || (h.marketplace || '').toLowerCase().includes(termo));
    }
    if (modo === 'pastas' && pastaAtiva) {
      lista = lista.filter((h) => (pastaAtiva === 'sem-pasta' ? !pastaVinculo[h.id] : pastaVinculo[h.id] === pastaAtiva));
    }
    if (modo === 'marcadores' && marcadorFiltro !== 'Todos') {
      const alvo = marcadores.find((m) => m.nome === marcadorFiltro);
      lista = lista.filter((h) => marcadorVinculo[h.id] === alvo?.id);
    }
    return lista.sort((a, b) => ((a[sortKey] as any) > (b[sortKey] as any) ? 1 : -1) * sortDir);
  }, [hist, busca, sortKey, sortDir, modo, pastaAtiva, pastaVinculo, marcadorFiltro, marcadores, marcadorVinculo]);

  function sortHist(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d * -1) as 1 | -1);
    else { setSortKey(key); setSortDir(-1); }
  }

  function mudarOrdem(v: string) {
    const opt = v as (typeof ORDENS_HIST)[number];
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

  const drawerSelecionadoId = drawerEntryId === null
    ? undefined
    : (modo === 'pastas' ? pastaVinculo[drawerEntryId] : marcadorVinculo[drawerEntryId]);

  return (
    <div>
      <div className="hero-row">
        <div className="hero"><h1>Histórico de <span className="accent">cálculos</span></h1><p>Use o botão "Ações" pra ver o cálculo completo, renomear ou excluir.</p></div>
        <button type="button" className="btn-calc hist-nova-btn" onClick={novaCalculadora}>+ Nova calculadora</button>
      </div>

      <div className="cluster-modo-row">
        <span className="hint">Organizar por:</span>
        <div className="cluster-modo-toggle">
          <button type="button" className={modo === 'pastas' ? 'active' : ''} onClick={() => trocarModo('pastas')}>
            <Icon name="folder" size={14} /> Pastas
          </button>
          <button type="button" className={modo === 'marcadores' ? 'active' : ''} onClick={() => trocarModo('marcadores')}>
            <Icon name="tag" size={14} /> Marcadores
          </button>
        </div>
        <span className="hint cluster-modo-nota">Experimento — no fim fica só uma das duas experiências.</span>
      </div>

      <div className="prod-filters-row">
        <div className="cl-search prod-search"><Icon name="search" size={15} /><input type="text" placeholder="Buscar por nome ou canal..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
        <PopoverList label="" options={[...ORDENS_HIST]} value={ordem} onChange={mudarOrdem} />
        {modo === 'marcadores' && (
          <PopoverList label="Marcador" options={['Todos', ...marcadores.map((m) => m.nome)]} value={marcadorFiltro} onChange={setMarcadorFiltro} />
        )}
        <span className="hint hist-count">{histFiltrado.length} {histFiltrado.length === 1 ? 'cálculo' : 'cálculos'}</span>
      </div>

      <div className={modo === 'pastas' ? 'hist-layout-pastas' : ''}>
        {modo === 'pastas' && (
          <PastaRail pastas={pastas} vinculo={pastaVinculo} hist={hist} ativa={pastaAtiva} onSelecionar={setPastaAtiva} onCriar={criarPasta} />
        )}

        <div className="card">
          <div className="card-body" style={{ paddingTop: 22 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-3)' }}>
                  <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('nome')}>Produto</th>
                  <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('precoConsumidor')}>Preço final ↕</th>
                  <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('lucroLiquido')}>Lucro ↕</th>
                  <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('margem')}>Margem ↕</th>
                  <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('potMensal')}>Pot. mensal ↕</th>
                  <th style={{ padding: 10 }}>Canal</th>
                  <th style={{ padding: 10 }}>{modo === 'pastas' ? 'Pasta' : 'Marcador'}</th>
                  <th style={{ padding: 10 }}>Fonte STL</th>
                  <th style={{ padding: 10 }}>Concorrente</th>
                  <th style={{ padding: 10, cursor: 'pointer' }} onClick={() => sortHist('id')}>Data ↕</th>
                  <th style={{ padding: 10 }}>Ações</th>
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
                    <td style={{ padding: 10 }}>{brl(h.precoConsumidor)}</td>
                    <td style={{ padding: 10 }}>{brl(h.lucroLiquido)}</td>
                    <td style={{ padding: 10 }}>{(h.margem || 0).toFixed(1)}%</td>
                    <td style={{ padding: 10 }}>{brl(h.potMensal)}</td>
                    <td style={{ padding: 10 }}>{h.marketplace || '-'}</td>
                    <td style={{ padding: 10 }}>
                      {modo === 'pastas'
                        ? <PastaPicker pastas={pastas} pastaId={pastaVinculo[h.id]} onAbrir={() => setDrawerEntryId(h.id)} />
                        : <MarcadorPicker marcadores={marcadores} marcadorId={marcadorVinculo[h.id]} onAbrir={() => setDrawerEntryId(h.id)} />}
                    </td>
                    <td style={{ padding: 10 }}>
                      {h.stlLink
                        ? <button type="button" className="btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => window.open(h.stlLink, '_blank')}>Ver STL</button>
                        : '-'}
                    </td>
                    <td style={{ padding: 10 }}>
                      {h.concorrenteLink
                        ? <button type="button" className="btn-outline" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => window.open(h.concorrenteLink, '_blank')}>Ver anúncio</button>
                        : '-'}
                    </td>
                    <td style={{ padding: 10 }}>{new Date(h.id).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: 10 }}><button className="btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setSelected(h)}>Ações</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!histFiltrado.length && (
              <div className="hint" style={{ textAlign: 'center', padding: 24 }}>
                {hist.length ? 'Nenhum cálculo encontrado pra esse filtro.' : 'Nenhum cálculo salvo ainda.'}
              </div>
            )}
          </div>
        </div>
      </div>

      <ClusterDrawer
        open={drawerEntryId !== null}
        tipo={modo === 'pastas' ? 'pasta' : 'marcador'}
        itens={modo === 'pastas' ? pastas : marcadores}
        selecionadoId={drawerSelecionadoId}
        onClose={() => setDrawerEntryId(null)}
        onSelecionar={(id) => {
          if (drawerEntryId === null) return;
          if (modo === 'pastas') escolherPasta(drawerEntryId, id); else escolherMarcador(drawerEntryId, id);
        }}
        onCriar={(item: ClusterItem) => {
          if (drawerEntryId === null) return;
          if (modo === 'pastas') { criarPasta(item); escolherPasta(drawerEntryId, item.id); }
          else { criarMarcador(item); escolherMarcador(drawerEntryId, item.id); }
        }}
      />

      <HistDrawer entry={selected} onClose={() => setSelected(null)} onChange={handleChange} onAbrirNaCalculadora={onAbrirNaCalculadora} />
    </div>
  );
}
