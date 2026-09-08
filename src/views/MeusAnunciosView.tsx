import { useState } from 'react';
import Icon from '../components/Icon';
import PopoverList from '../components/produtos/PopoverList';

// Réplica da tela "Meus Anúncios" em produção (print de João, 08/09/2026) —
// listagem dos anúncios criados pelo Gerador, com busca, ordenação e troca
// entre Cards/Lista. "Continuar" sempre reabre o wizard do zero (a tela de
// Criar Anúncio ainda não retoma um rascunho específico), duplicar e
// excluir mexem numa cópia local da lista, só pra essa sessão.
type StatusAnuncio = 'gerando' | 'rascunho' | 'publicado';

interface Anuncio {
  id: string;
  nome: string;
  status: StatusAnuncio;
  data: string;
  cor: string;
}

const STATUS_LABEL: Record<StatusAnuncio, string> = {
  gerando: 'Gerando…',
  rascunho: 'Rascunho',
  publicado: 'Publicado',
};
const STATUS_CLASSE: Record<StatusAnuncio, string> = {
  gerando: 'status-pausado',
  rascunho: 'ma-status-rascunho',
  publicado: 'status-ativo',
};

const MOCK_INICIAL: Anuncio[] = [
  { id: 'a1', nome: 'Incensário de Bicho-Preguiça', status: 'gerando', data: '08/09/2026', cor: 'linear-gradient(160deg,#e9eee6,#2b2f27)' },
  { id: 'a2', nome: 'draft-pendente', status: 'rascunho', data: '03/09/2026', cor: 'linear-gradient(160deg,#efe6d8,#d9c7a3)' },
  { id: 'a3', nome: 'Miniatura Dragão RPG', status: 'publicado', data: '28/08/2026', cor: 'linear-gradient(160deg,#e8e3da,#c9beac)' },
];

const ORDENS = ['Recentes', 'Mais antigos', 'Nome A-Z'];

function paraData(d: string) {
  const [dia, mes, ano] = d.split('/').map(Number);
  return new Date(ano, mes - 1, dia).getTime();
}

interface Props {
  onCriarAnuncio: () => void;
}

export default function MeusAnunciosView({ onCriarAnuncio }: Props) {
  const [anuncios, setAnuncios] = useState<Anuncio[]>(MOCK_INICIAL);
  const [busca, setBusca] = useState('');
  const [ordem, setOrdem] = useState(ORDENS[0]);
  const [modo, setModo] = useState<'cards' | 'lista'>('cards');

  const filtrados = anuncios
    .filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => {
      if (ordem === 'Nome A-Z') return a.nome.localeCompare(b.nome);
      const diff = paraData(b.data) - paraData(a.data);
      return ordem === 'Mais antigos' ? -diff : diff;
    });

  function duplicar(a: Anuncio) {
    const copia: Anuncio = { ...a, id: 'a' + Date.now(), nome: a.nome + ' (cópia)', status: 'rascunho', data: new Date().toLocaleDateString('pt-BR') };
    setAnuncios((prev) => [copia, ...prev]);
  }
  function excluir(a: Anuncio) {
    if (!confirm(`Excluir "${a.nome}"? Essa ação não pode ser desfeita.`)) return;
    setAnuncios((prev) => prev.filter((x) => x.id !== a.id));
  }

  return (
    <div>
      <div className="hero">
        <h1>Aqui estão <span className="accent">seus anúncios</span></h1>
        <p>Visualize, edite ou duplique anúncios já criados. Você pode filtrar por status, idioma ou tipo de produto pra encontrar o que precisa rápido.</p>
      </div>

      <div className="ma-toolbar">
        <div className="cl-search ma-busca"><Icon name="search" size={15} /><input type="text" placeholder="Buscar por nome, produto ou tag..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
        <PopoverList label="" options={ORDENS} value={ordem} onChange={setOrdem} />
        <div className="cluster-modo-toggle">
          <button type="button" className={modo === 'cards' ? 'active' : ''} onClick={() => setModo('cards')}><Icon name="dashboard" size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} /> Cards</button>
          <button type="button" className={modo === 'lista' ? 'active' : ''} onClick={() => setModo('lista')}><Icon name="folder" size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} /> Lista</button>
        </div>
        <button type="button" className="btn-dark ma-novo" onClick={onCriarAnuncio}>Novo anúncio</button>
      </div>

      {modo === 'cards' ? (
        <div className="ma-grid">
          <button type="button" className="ma-card-novo" onClick={onCriarAnuncio}>
            <span className="ma-card-novo-icone"><Icon name="plus" size={20} /></span>
            <b>Criar novo anúncio</b>
            <span>Comece com fotos do produto ou um modelo da sua biblioteca</span>
          </button>

          {filtrados.map((a) => (
            <div className="ma-card" key={a.id}>
              <div className="ma-card-topo">
                <span className={'status-tag ' + STATUS_CLASSE[a.status]}>{STATUS_LABEL[a.status]}</span>
              </div>
              <div className="ma-card-media" style={{ background: a.cor }} />
              <div className="ma-card-corpo">
                <b>{a.nome}</b>
                <span>{a.data}</span>
                <div className="ma-card-acoes">
                  <button type="button" className="btn-outline ma-continuar" onClick={onCriarAnuncio}>
                    <Icon name="chevron" size={12} style={{ transform: 'rotate(180deg)' }} /> {a.status === 'publicado' ? 'Ver anúncio' : 'Continuar'}
                  </button>
                  <button type="button" className="ma-icone-btn" title="Duplicar" onClick={() => duplicar(a)}><Icon name="copy" size={14} /></button>
                  <button type="button" className="ma-icone-btn ma-icone-btn-red" title="Excluir" onClick={() => excluir(a)}><Icon name="close" size={14} /></button>
                </div>
              </div>
            </div>
          ))}

          {filtrados.length === 0 && anuncios.length > 0 && (
            <div className="ma-vazio">Nenhum anúncio encontrado para "{busca}".</div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="prod-table">
              <thead><tr><th>Anúncio</th><th>Status</th><th>Data</th><th /></tr></thead>
              <tbody>
                {filtrados.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 34, height: 34, borderRadius: 8, background: a.cor, flex: '0 0 auto' }} />
                        <span className="prod-name">{a.nome}</span>
                      </div>
                    </td>
                    <td><span className={'status-tag ' + STATUS_CLASSE[a.status]}>{STATUS_LABEL[a.status]}</span></td>
                    <td>{a.data}</td>
                    <td>
                      <div className="ma-card-acoes" style={{ justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-outline ma-continuar" onClick={onCriarAnuncio}>{a.status === 'publicado' ? 'Ver anúncio' : 'Continuar'}</button>
                        <button type="button" className="ma-icone-btn" title="Duplicar" onClick={() => duplicar(a)}><Icon name="copy" size={14} /></button>
                        <button type="button" className="ma-icone-btn ma-icone-btn-red" title="Excluir" onClick={() => excluir(a)}><Icon name="close" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtrados.length === 0 && <div className="ma-vazio">Nenhum anúncio encontrado para "{busca}".</div>}
          </div>
        </div>
      )}
    </div>
  );
}
