import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { readJson } from '../../lib/storage';
import { MARKETPLACES_CONECTADOS_KEY } from '../../lib/onboarding';

// Réplica do fluxo "Publicar anúncio" do Figma (STLSELLER, node 22260-24646,
// print de João 08/09/2026) — modal de 7 passos a partir do passo Resultado.
// Suporta Mercado Livre (fluxo original) e Shopee (requisitos passados por
// João em 08/09/2026): conta/loja habilitada, categoria só por árvore fixa,
// preço/estoque/SKU, atributos condicionais por categoria, variações e
// atacado opcionais, canal de logística obrigatório e um checklist de
// conformidade que também bloqueia a publicação. Tudo mockado, mas as
// regras (o que falta, o que bloqueia) são calculadas de verdade a partir
// do estado — nada hardcoded pra um único caminho "feliz".
type Marketplace = 'ml' | 'shopee';
type PassoPub = 'marketplace' | 'imagens' | 'titulo' | 'categoria' | 'ficha' | 'frete' | 'confirmar';

const PASSOS_PUB: { id: PassoPub; numero: number }[] = [
  { id: 'marketplace', numero: 1 },
  { id: 'imagens', numero: 2 },
  { id: 'titulo', numero: 3 },
  { id: 'categoria', numero: 4 },
  { id: 'ficha', numero: 5 },
  { id: 'frete', numero: 6 },
  { id: 'confirmar', numero: 7 },
];

function labelPasso(id: PassoPub, mp: Marketplace): string {
  switch (id) {
    case 'marketplace': return 'Marketplace';
    case 'imagens': return 'Imagens';
    case 'titulo': return 'Título e descrição';
    case 'categoria': return mp === 'shopee' ? 'Categoria e dados' : 'Categoria';
    case 'ficha': return mp === 'shopee' ? 'Variações e atacado' : 'Ficha técnica';
    case 'frete': return 'Frete e logística';
    case 'confirmar': return 'Confirmar';
  }
}

interface ImagemPub { id: string; label: string; }
const IMAGENS_PUB: ImagemPub[] = [
  { id: 'frente', label: 'Frente' },
  { id: 'lateral', label: 'Lateral' },
  { id: 'costas', label: 'Costas' },
  { id: 'detalhe', label: 'Detalhe' },
  { id: 'uso', label: 'Em uso' },
  { id: 'escala', label: 'Escala' },
];

interface TituloOpcao { id: string; texto: string; tags: string; }
const TITULOS_PUB: TituloOpcao[] = [
  { id: 't1', texto: 'Incensário Bicho-Preguiça Divertido para Decoração do Ambiente', tags: 'bicho-preguiça, incensário, decoração' },
  { id: 't2', texto: 'Incensário Bicho-Preguiça para Quarto Infantil e Área de Lazer com Design Lúdico e Colorido para Decoração', tags: 'quarto infantil, área de lazer, lúdico' },
  { id: 't3', texto: 'Incensário Decorativo Bicho-Preguiça Verde e Marrom em PLA', tags: 'incensário, verde, marrom' },
  { id: 't4', texto: 'Decoração Lúdica com Incensário Bicho-Preguiça para Crianças', tags: 'decoração, crianças, lúdica' },
];

const DESCRICAO_PADRAO = 'Incensário decorativo em formato de bicho-preguiça sobre uma folha estilizada. Peça estática, ideal para quartos infantis e áreas de lazer, com acabamento em PLA de origem vegetal.';

const CATEGORIAS_MANUAIS_ML = [
  'Manter sugestão do Mercado Livre',
  'Casa, Móveis e Decoração > Decoração > Enfeites',
  'Casa, Móveis e Decoração > Decoração > Incensários e Aromatizadores',
  'Brinquedos e Hobbies > Colecionáveis > Miniaturas',
];

const CATEGORIAS_SHOPEE = [
  'Casa e Decoração > Decoração > Enfeites e Objetos Decorativos',
  'Casa e Decoração > Decoração > Incensários e Aromatizadores',
  'Brinquedos e Hobbies > Colecionáveis',
];

const CANAIS_LOGISTICA_SHOPEE = ['Correios', 'Jadlog', 'Loggi', 'Shopee Envio'];
const PRAZOS_PRE_VENDA = ['7', '14', '21', '30'];

const NICHOS_SUGERIDOS = ['Decoração', 'Quarto infantil', 'Área de lazer', 'Presente', 'Genérico'];

const MOCK_MARGEM = 37;

interface Variacao { id: string; nome: string; estoque: string; preco: string; }
interface FaixaAtacado { id: string; qtd: string; preco: string; }

interface PubForm {
  marketplace: Marketplace;
  imagensSelecionadas: string[];
  tituloId: string;
  descricao: string;
  // Mercado Livre
  categoriaManual: string;
  condicao: 'novo' | 'usado';
  tipoAnuncio: 'gratis' | 'classico' | 'premium';
  acabamento: string;
  quantidade: string;
  tipoProduto: string;
  nicho: string[];
  nichoCustom: string;
  escala: string;
  freteGratis: boolean;
  enviosFull: boolean;
  prazoDespacho: string;
  // Compartilhados
  marca: string;
  modelo: string;
  material: string;
  cor: string;
  peso: string;
  altura: string;
  largura: string;
  comprimento: string;
  // Shopee
  shopeeCategoria: string;
  semMarca: boolean;
  precoVenda: string;
  estoque: string;
  sku: string;
  temVariacoes: boolean;
  variacoes: Variacao[];
  ofereceAtacado: boolean;
  faixasAtacado: FaixaAtacado[];
  preVenda: boolean;
  prazoEnvioPreVenda: string;
  canalLogistica: string;
  complianceSemMarcaDagua: boolean;
  complianceCategoriaPermitida: boolean;
  complianceDescricaoConforme: boolean;
}

const FORM_INICIAL: PubForm = {
  marketplace: 'ml',
  imagensSelecionadas: ['frente', 'lateral', 'detalhe', 'escala'],
  tituloId: 't1',
  descricao: DESCRICAO_PADRAO,
  categoriaManual: CATEGORIAS_MANUAIS_ML[0],
  condicao: 'novo',
  tipoAnuncio: 'classico',
  acabamento: 'Fosco',
  quantidade: '1 unidade',
  tipoProduto: 'Incensário decorativo',
  nicho: ['Decoração'],
  nichoCustom: '',
  escala: '',
  freteGratis: true,
  enviosFull: false,
  prazoDespacho: '1 dia útil',
  marca: '',
  modelo: '',
  material: 'PLA (padrão)',
  cor: 'Verde e Marrom',
  peso: '320',
  altura: '25',
  largura: '25',
  comprimento: '10',
  shopeeCategoria: '',
  semMarca: false,
  precoVenda: '89,90',
  estoque: '25',
  sku: '',
  temVariacoes: false,
  variacoes: [],
  ofereceAtacado: false,
  faixasAtacado: [],
  preVenda: false,
  prazoEnvioPreVenda: '7',
  canalLogistica: '',
  complianceSemMarcaDagua: false,
  complianceCategoriaPermitida: false,
  complianceDescricaoConforme: false,
};

const INFO_TIPO_ANUNCIO: Record<PubForm['tipoAnuncio'], { pct: string; titulo: string; desc: string }> = {
  gratis: { pct: '0%', titulo: 'Grátis · sem comissão', desc: 'Menor exposição — ideal pra testar um produto novo.' },
  classico: { pct: '12%', titulo: 'Clássico · comissão estimada', desc: 'Boa exposição e parcelamento. Equilíbrio entre custo e alcance.' },
  premium: { pct: '18%', titulo: 'Premium · comissão estimada', desc: 'Máxima exposição e parcelamento em mais vezes.' },
};

interface Props {
  onFechar: () => void;
  onIrParaConfiguracoes: () => void;
}

export default function PublicarAnuncioModal({ onFechar, onIrParaConfiguracoes }: Props) {
  const [passo, setPasso] = useState<PassoPub>('marketplace');
  const [form, setForm] = useState<PubForm>(FORM_INICIAL);
  const [fase, setFase] = useState<'wizard' | 'publicando' | 'sucesso'>('wizard');
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const [categoriaCarregando, setCategoriaCarregando] = useState(true);
  const [lojaShopeeHabilitada] = useState(() => readJson<Record<string, boolean>>(MARKETPLACES_CONECTADOS_KEY, {}).shopee === true);

  const [novaVarNome, setNovaVarNome] = useState('');
  const [novaVarEstoque, setNovaVarEstoque] = useState('');
  const [novaVarPreco, setNovaVarPreco] = useState('');
  const [novaFaixaQtd, setNovaFaixaQtd] = useState('');
  const [novaFaixaPreco, setNovaFaixaPreco] = useState('');

  const mp = form.marketplace;

  useEffect(() => {
    if (passo !== 'categoria' || mp !== 'ml') return;
    setCategoriaCarregando(true);
    const t = setTimeout(() => setCategoriaCarregando(false), 850);
    return () => clearTimeout(t);
  }, [passo, mp]);

  function set<K extends keyof PubForm>(campo: K, valor: PubForm[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  const idxAtual = PASSOS_PUB.findIndex((p) => p.id === passo);

  function avancar() {
    if (idxAtual < PASSOS_PUB.length - 1) setPasso(PASSOS_PUB[idxAtual + 1].id);
  }
  function voltar() {
    if (idxAtual > 0) setPasso(PASSOS_PUB[idxAtual - 1].id);
  }

  function tentarFechar() {
    if (fase === 'sucesso') { onFechar(); return; }
    setConfirmarDescarte(true);
  }

  function toggleImagem(id: string) {
    setForm((prev) => {
      const ja = prev.imagensSelecionadas.includes(id);
      return { ...prev, imagensSelecionadas: ja ? prev.imagensSelecionadas.filter((i) => i !== id) : [...prev.imagensSelecionadas, id] };
    });
  }

  function toggleNicho(n: string) {
    setForm((prev) => ({ ...prev, nicho: prev.nicho.includes(n) ? prev.nicho.filter((x) => x !== n) : [...prev.nicho, n] }));
  }
  function adicionarNichoCustom() {
    const v = form.nichoCustom.trim();
    if (!v) return;
    setForm((prev) => ({ ...prev, nicho: prev.nicho.includes(v) ? prev.nicho : [...prev.nicho, v], nichoCustom: '' }));
  }
  function removerNicho(n: string) {
    setForm((prev) => ({ ...prev, nicho: prev.nicho.filter((x) => x !== n) }));
  }

  function adicionarVariacao() {
    if (!novaVarNome.trim()) return;
    const v: Variacao = { id: 'v' + Date.now(), nome: novaVarNome.trim(), estoque: novaVarEstoque || '0', preco: novaVarPreco || form.precoVenda };
    setForm((prev) => ({ ...prev, variacoes: [...prev.variacoes, v] }));
    setNovaVarNome(''); setNovaVarEstoque(''); setNovaVarPreco('');
  }
  function removerVariacao(id: string) {
    setForm((prev) => ({ ...prev, variacoes: prev.variacoes.filter((v) => v.id !== id) }));
  }
  function adicionarFaixa() {
    if (!novaFaixaQtd.trim() || !novaFaixaPreco.trim()) return;
    const f: FaixaAtacado = { id: 'f' + Date.now(), qtd: novaFaixaQtd, preco: novaFaixaPreco };
    setForm((prev) => ({ ...prev, faixasAtacado: [...prev.faixasAtacado, f] }));
    setNovaFaixaQtd(''); setNovaFaixaPreco('');
  }
  function removerFaixa(id: string) {
    setForm((prev) => ({ ...prev, faixasAtacado: prev.faixasAtacado.filter((f) => f.id !== id) }));
  }

  const somaDimensoes = (Number(form.altura) || 0) + (Number(form.largura) || 0) + (Number(form.comprimento) || 0);
  const excedeEnvios = somaDimensoes > 200;

  const tituloEscolhido = TITULOS_PUB.find((t) => t.id === form.tituloId) ?? TITULOS_PUB[0];
  const categoriaResolvidaML = categoriaCarregando ? '' : (form.categoriaManual === CATEGORIAS_MANUAIS_ML[0] ? 'Casa, Móveis e Decoração > Decoração > Incensários e Aromatizadores' : form.categoriaManual);
  const categoriaAtual = mp === 'shopee' ? form.shopeeCategoria : categoriaResolvidaML;

  // Loja Shopee não habilitada só vira aviso — não trava mais o wizard, já
  // que hoje não há de fato uma conexão real por trás pra impedir o resto.
  const lojaShopeeAvisoPendente = mp === 'shopee' && !lojaShopeeHabilitada;

  const faltando: string[] = [];
  if (form.imagensSelecionadas.length === 0) faltando.push('imagens');
  if (!categoriaAtual) faltando.push('categoria');
  if (mp === 'ml') {
    if (!form.material.trim()) faltando.push('material');
    if (!form.tipoProduto.trim()) faltando.push('tipo de produto');
    if (!form.peso.trim() || !form.altura.trim() || !form.largura.trim() || !form.comprimento.trim()) faltando.push('peso/dimensões');
  } else {
    if (!form.precoVenda.trim()) faltando.push('preço de venda');
    if (!form.estoque.trim()) faltando.push('quantidade em estoque');
    if (!form.semMarca && !form.marca.trim()) faltando.push('marca (ou marcar "sem marca")');
    if (!form.material.trim()) faltando.push('material');
    if (!form.cor.trim()) faltando.push('cor');
    if (!form.altura.trim() || !form.largura.trim() || !form.comprimento.trim()) faltando.push('dimensões da embalagem');
    if (!form.peso.trim()) faltando.push('peso do produto');
    if (!form.canalLogistica) faltando.push('canal de logística');
  }
  const complianceOk = form.complianceSemMarcaDagua && form.complianceCategoriaPermitida && form.complianceDescricaoConforme;

  const scoreItensML = [
    { ok: form.imagensSelecionadas.length >= 4, texto: 'Suba 4+ fotos para CTR até 40% maior.' },
    { ok: !!form.material.trim(), texto: 'Informe o material principal.' },
    { ok: form.nicho.length > 0, texto: 'Adicione um nicho (ex: decoração, presente).' },
  ];
  const scoreItensShopee = [
    { ok: form.imagensSelecionadas.length >= 4, texto: 'Suba 4+ fotos (a Shopee aceita até 9).' },
    { ok: !!form.sku.trim(), texto: 'Informe um SKU próprio pra facilitar seu controle de estoque.' },
    { ok: form.temVariacoes || form.ofereceAtacado, texto: 'Configure variações ou preço por atacado, se fizer sentido.' },
  ];
  const scoreItens = mp === 'ml' ? scoreItensML : scoreItensShopee;
  const score = 10 + scoreItens.filter((s) => s.ok).length * 30;
  const prontoParaPublicar = faltando.length === 0 && (mp === 'ml' || complianceOk);

  function publicar() {
    if (!prontoParaPublicar) return;
    setFase('publicando');
    setTimeout(() => setFase('sucesso'), 1400);
  }

  const nomeMarketplace = mp === 'ml' ? 'Mercado Livre' : 'Shopee';

  if (fase === 'publicando') {
    return (
      <div className="pub-overlay">
        <div className="pub-modal">
          <div className="pub-status-card">
            <div className="pub-mp-badges">
              <span className="pub-mp-badge" style={{ background: mp === 'shopee' ? '#ee4d2d' : '#ffd400', color: mp === 'shopee' ? '#fff' : '#14181a' }}>{mp === 'shopee' ? 'S' : 'ML'}</span>
            </div>
            <h3>Publicando na {nomeMarketplace}…</h3>
            <p>Enviando seu anúncio. Isso leva alguns segundos.</p>
            <div className="pub-progresso-loading"><span /></div>
          </div>
        </div>
      </div>
    );
  }

  if (fase === 'sucesso') {
    return (
      <div className="pub-overlay">
        <div className="pub-modal">
          <div className="pub-status-card">
            <div className="pub-status-icone sucesso"><Icon name="check" size={26} /></div>
            <h3>Anúncio publicado</h3>
            <p>Seu anúncio já está no ar na {nomeMarketplace}. Acompanhe os primeiros acessos no painel.</p>
            <button type="button" className="btn-outline" onClick={onFechar}>Voltar ao gerador</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pub-overlay">
      <div className="pub-modal">
        <div className="pub-modal-head">
          <div>
            <h2>Publicar seu anúncio</h2>
            <p>Monte o anúncio passo a passo e publique no marketplace.</p>
          </div>
          <button type="button" className="pub-close" onClick={tentarFechar}><Icon name="close" size={15} /></button>
        </div>

        <div className="pub-progresso">
          {PASSOS_PUB.map((p, i) => <span key={p.id} className={i <= idxAtual ? 'feito' : ''} />)}
        </div>
        <div className="pub-passo-info">
          <span>Passo {idxAtual + 1} de 7</span>
          <b>{labelPasso(passo, mp)}</b>
        </div>

        {passo === 'marketplace' && (
          <>
            <div className="pub-secao-titulo">Onde publicar</div>
            <div className="pub-secao-desc">Escolha o marketplace. Categoria e dados obrigatórios se adaptam à escolha.</div>
            <div className="pub-radio-mp">
              <button type="button" className={'pub-radio-mp-card' + (mp === 'ml' ? ' selecionado' : '')} onClick={() => set('marketplace', 'ml')}>
                <span className="pub-titulo-radio" style={{ marginTop: 3 }} />
                <div className="pub-radio-mp-top">
                  <div>
                    <div className="pub-radio-mp-nome">Mercado Livre</div>
                    <div className="pub-radio-mp-sub">Conectado · 174 pedidos</div>
                  </div>
                  <span className="pub-tag-api">API conectada</span>
                </div>
              </button>
              <button type="button" className={'pub-radio-mp-card' + (mp === 'shopee' ? ' selecionado' : '')} onClick={() => set('marketplace', 'shopee')}>
                <span className="pub-titulo-radio" style={{ marginTop: 3 }} />
                <div className="pub-radio-mp-top">
                  <div>
                    <div className="pub-radio-mp-nome">Shopee</div>
                    <div className="pub-radio-mp-sub">{lojaShopeeHabilitada ? 'Loja habilitada' : 'Loja não habilitada'}</div>
                  </div>
                  <span className={lojaShopeeHabilitada ? 'pub-tag-api' : 'pub-tag-soon'}>{lojaShopeeHabilitada ? 'Conectada' : 'Pendente'}</span>
                </div>
              </button>
            </div>

            {lojaShopeeAvisoPendente && (
              <div className="pub-aviso pub-aviso-warn">
                <Icon name="alert" size={14} />
                <div>
                  <b>Sua loja Shopee ainda não está habilitada.</b>
                  <p style={{ margin: '4px 0 0' }}>Você pode continuar preenchendo o anúncio, mas a publicação de verdade exige conta verificada (KYC), um método de recebimento e ao menos um canal de logística configurados em Configurações → Marketplaces.</p>
                  <button type="button" className="btn-outline" style={{ marginTop: 10 }} onClick={onIrParaConfiguracoes}>Ir para Configurações</button>
                </div>
              </div>
            )}
          </>
        )}

        {passo === 'imagens' && (
          <>
            <div className="pub-secao-titulo">Imagens do anúncio</div>
            <div className="pub-secao-desc">Selecione as imagens geradas. A primeira selecionada vira a foto principal.</div>
            <div className="pub-aviso pub-aviso-info">
              <Icon name="tag" size={14} />
              {mp === 'ml'
                ? 'Anúncios com 4+ fotos têm CTR até 40% maior. Inclua frente, lateral e foto em contexto de uso.'
                : 'A Shopee aceita até 9 fotos (12 para Shopee Mall). Inclua pelo menos 1 foto do produto, sem marca d’água ou texto promocional.'}
            </div>
            <div className="pub-img-grid">
              {IMAGENS_PUB.map((img) => {
                const ordem = form.imagensSelecionadas.indexOf(img.id);
                const selecionada = ordem !== -1;
                return (
                  <button type="button" key={img.id} className={'pub-img-card' + (selecionada ? ' selecionada' : '')} onClick={() => toggleImagem(img.id)}>
                    <div className="pub-img-media" style={{ background: 'repeating-conic-gradient(#f1f2f1 0% 25%, #fafbfa 0% 50%) 0/14px 14px' }}>
                      {selecionada && <span className="pub-img-badge">{ordem + 1}</span>}
                      <span className="pub-img-check"><Icon name="check" size={12} /></span>
                    </div>
                    <div className="pub-img-label">
                      <span>{img.label}</span>
                      {ordem === 0 && <span className="pub-img-principal">Principal</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="pub-img-conta">Selecionadas: <b>{form.imagensSelecionadas.length} de {IMAGENS_PUB.length}</b></div>
          </>
        )}

        {passo === 'titulo' && (
          <>
            <div className="pub-secao-titulo">Título e descrição</div>
            <div className="pub-secao-desc">Escolha um título e revise a descrição antes de publicar.</div>
            <div className="field"><label>Título *</label></div>
            <div className="pub-titulo-lista">
              {TITULOS_PUB.map((t) => {
                const chars = t.texto.length;
                const corta = chars > 60;
                return (
                  <button type="button" key={t.id} className={'pub-titulo-opcao' + (form.tituloId === t.id ? ' selecionado' : '')} onClick={() => set('tituloId', t.id)}>
                    <span className="pub-titulo-radio" />
                    <div style={{ flex: 1 }}>
                      <div className="pub-titulo-texto">{t.texto}</div>
                      <div className="pub-titulo-meta">
                        <span className="pub-titulo-tags">{t.tags}</span>
                        <span className={'pub-titulo-contagem' + (corta ? ' erro' : '')}>{chars} caracteres — {corta ? 'corta no mobile' : 'ideal'}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="pub-titulo-hint">
              {mp === 'ml' ? 'O título escolhido alimenta a sugestão de categoria do Mercado Livre no próximo passo.' : 'Evite promessas ou termos vetados pelas políticas de anúncio da Shopee na descrição abaixo.'}
            </div>
            <div className="field">
              <label>Descrição *</label>
              <textarea rows={4} value={form.descricao} maxLength={4000} onChange={(e) => set('descricao', e.target.value)} />
              <div className="hint" style={{ textAlign: 'right', marginTop: 4 }}>{form.descricao.length} / 4.000 caracteres</div>
            </div>
          </>
        )}

        {passo === 'categoria' && mp === 'ml' && (
          <>
            <div className="pub-secao-titulo">Categoria e tipo de anúncio</div>
            <div className="pub-secao-desc">O Mercado Livre sugere a categoria pelo título. Confirme ou ajuste.</div>

            {categoriaCarregando ? (
              <div className="pub-cat-sugestao pub-cat-skeleton">
                <span style={{ width: '70%' }} />
                <span style={{ width: '45%' }} />
                <span style={{ width: '30%', marginBottom: 0 }} />
              </div>
            ) : form.categoriaManual === CATEGORIAS_MANUAIS_ML[0] ? (
              <div className="pub-cat-sugestao">
                <div className="pub-cat-sugestao-head">
                  <b>{categoriaResolvidaML}</b>
                  <span className="pub-tag-api"><Icon name="check" size={11} /> API ML</span>
                </div>
                <p>Sugerida a partir de "{tituloEscolhido.texto.slice(0, 40)}…"</p>
                <div className="cod">Código MLB284910</div>
              </div>
            ) : (
              <div className="pub-cat-sugestao">
                <div className="pub-cat-sugestao-head"><b>{form.categoriaManual}</b></div>
                <p>Categoria selecionada manualmente.</p>
              </div>
            )}

            <div className="field">
              <label>Selecionar outra categoria <span className="hint" style={{ fontWeight: 400 }}>opcional</span></label>
              <select value={form.categoriaManual} onChange={(e) => set('categoriaManual', e.target.value)} disabled={categoriaCarregando}>
                {CATEGORIAS_MANUAIS_ML.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="row2">
              <div className="field"><label>Marca</label><input type="text" value={form.marca} onChange={(e) => set('marca', e.target.value)} /></div>
              <div className="field"><label>Modelo</label><input type="text" value={form.modelo} onChange={(e) => set('modelo', e.target.value)} /></div>
            </div>
            <div className="hint" style={{ marginTop: -12, marginBottom: 18 }}>Informe a marca verdadeira do produto ou "Genérica" se não tiver marca.</div>

            <div className="field">
              <label>Condição do produto *</label>
              <div className="pub-toggle-row">
                <button type="button" className={'pub-toggle-pill' + (form.condicao === 'novo' ? ' ativo' : '')} onClick={() => set('condicao', 'novo')}>Novo</button>
                <button type="button" className={'pub-toggle-pill' + (form.condicao === 'usado' ? ' ativo' : '')} onClick={() => set('condicao', 'usado')}>Usado</button>
              </div>
            </div>

            <div className="field">
              <label>Tipo de anúncio *</label>
              <div className="pub-toggle-row">
                {(['gratis', 'classico', 'premium'] as const).map((t) => (
                  <button type="button" key={t} className={'pub-toggle-pill' + (form.tipoAnuncio === t ? ' ativo' : '')} onClick={() => set('tipoAnuncio', t)}>
                    {t === 'gratis' ? 'Grátis' : t === 'classico' ? 'Clássico' : 'Premium'}
                  </button>
                ))}
              </div>
            </div>
            <div className="pub-tipo-info">
              <b style={{ color: 'var(--accent)' }}>{INFO_TIPO_ANUNCIO[form.tipoAnuncio].pct}</b>
              <div><span>{INFO_TIPO_ANUNCIO[form.tipoAnuncio].titulo}</span><small>{INFO_TIPO_ANUNCIO[form.tipoAnuncio].desc}</small></div>
            </div>
          </>
        )}

        {passo === 'categoria' && mp === 'shopee' && (
          <>
            <div className="pub-secao-titulo">Categoria e dados do produto</div>
            <div className="pub-secao-desc">A categoria vem da árvore fixa da Shopee — não é um campo livre. Os atributos abaixo mudam conforme a categoria escolhida.</div>

            <div className="field">
              <label>Categoria *</label>
              <select value={form.shopeeCategoria} onChange={(e) => set('shopeeCategoria', e.target.value)}>
                <option value="">Selecione a categoria</option>
                {CATEGORIAS_SHOPEE.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {!form.shopeeCategoria && <div className="hint" style={{ color: 'var(--red)', marginTop: 4 }}>Selecione uma categoria para continuar.</div>}
            </div>

            <div className="row2">
              <div className="field"><label>Preço de venda (R$) *</label><input type="text" value={form.precoVenda} onChange={(e) => set('precoVenda', e.target.value)} /></div>
              <div className="field"><label>Quantidade em estoque *</label><input type="text" value={form.estoque} onChange={(e) => set('estoque', e.target.value)} /></div>
            </div>
            <div className="field"><label>SKU <span className="hint" style={{ fontWeight: 400 }}>opcional — seu controle interno</span></label><input type="text" placeholder="Ex: INC-BP-001" value={form.sku} onChange={(e) => set('sku', e.target.value)} /></div>

            <div className="field">
              <label className="switch-row" style={{ padding: 0, gap: 10 }}>
                <input type="checkbox" checked={form.semMarca} onChange={(e) => set('semMarca', e.target.checked)} style={{ width: 16, height: 16 }} />
                <span>Este produto não tem marca cadastrada</span>
              </label>
            </div>
            {!form.semMarca && (
              <div className="field"><label>Marca *</label><input type="text" value={form.marca} onChange={(e) => set('marca', e.target.value)} /></div>
            )}

            {form.shopeeCategoria && (
              <>
                <div className="divider-label">Atributos obrigatórios da categoria</div>
                <div className="row2">
                  <div className="field"><label>Material *</label><input type="text" value={form.material} onChange={(e) => set('material', e.target.value)} /></div>
                  <div className="field"><label>Cor *</label><input type="text" value={form.cor} onChange={(e) => set('cor', e.target.value)} /></div>
                </div>

                <div className="field"><label>Dimensões da embalagem (cm) *</label></div>
                <div className="row3" style={{ marginTop: -8 }}>
                  <div className="field"><input type="text" value={form.altura} onChange={(e) => set('altura', e.target.value)} /><span className="hint">Altura</span></div>
                  <div className="field"><input type="text" value={form.largura} onChange={(e) => set('largura', e.target.value)} /><span className="hint">Largura</span></div>
                  <div className="field"><input type="text" value={form.comprimento} onChange={(e) => set('comprimento', e.target.value)} /><span className="hint">Comprimento</span></div>
                </div>
              </>
            )}
          </>
        )}

        {passo === 'ficha' && mp === 'ml' && (
          <>
            <div className="pub-secao-titulo">Ficha técnica</div>
            <div className="pub-secao-desc">Atributos usados pelo Mercado Livre nos filtros e no ranqueamento.</div>

            <div className="field"><label>Material principal *</label><input type="text" value={form.material} onChange={(e) => set('material', e.target.value)} /></div>

            <div className="row3">
              <div className="field"><label>Cor *</label><input type="text" value={form.cor} onChange={(e) => set('cor', e.target.value)} /></div>
              <div className="field"><label>Acabamento <span className="hint" style={{ fontWeight: 400 }}>opcional</span></label><input type="text" value={form.acabamento} onChange={(e) => set('acabamento', e.target.value)} /></div>
              <div className="field">
                <label>Quantidade *</label>
                <select value={form.quantidade} onChange={(e) => set('quantidade', e.target.value)}>
                  {['1 unidade', '2 unidades', '3 unidades', 'Kit'].map((q) => <option key={q}>{q}</option>)}
                </select>
              </div>
            </div>

            <div className="field"><label>Tipo de produto *</label><input type="text" value={form.tipoProduto} onChange={(e) => set('tipoProduto', e.target.value)} /></div>

            <div className="field">
              <label>Compatibilidade / nicho <span className="hint" style={{ fontWeight: 400 }}>opcional</span></label>
              <div className="pub-chip-row">
                {NICHOS_SUGERIDOS.map((n) => (
                  <button type="button" key={n} className={'pub-chip' + (form.nicho.includes(n) ? ' ativo' : '')} onClick={() => toggleNicho(n)}>{n}</button>
                ))}
                {form.nicho.filter((n) => !NICHOS_SUGERIDOS.includes(n)).map((n) => (
                  <span className="pub-chip-custom" key={n}>{n} <button type="button" onClick={() => removerNicho(n)}><Icon name="close" size={11} /></button></span>
                ))}
                <input
                  type="text"
                  placeholder="+ Outro"
                  value={form.nichoCustom}
                  onChange={(e) => set('nichoCustom', e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarNichoCustom(); } }}
                  onBlur={adicionarNichoCustom}
                  style={{ width: 90, border: '1.5px solid var(--border-strong)', borderRadius: 999, padding: '7px 14px', fontSize: 12.5 }}
                />
              </div>
            </div>

            <div className="field">
              <label>Escala <span className="hint" style={{ fontWeight: 400 }}>opcional</span></label>
              <select value={form.escala} onChange={(e) => set('escala', e.target.value)}>
                <option value="">Selecione</option>
                <option value="pequena">Pequena (até 10cm)</option>
                <option value="media">Média (10 a 30cm)</option>
                <option value="grande">Grande (acima de 30cm)</option>
              </select>
            </div>
          </>
        )}

        {passo === 'ficha' && mp === 'shopee' && (
          <>
            <div className="pub-secao-titulo">Variações, atacado e pré-venda</div>
            <div className="pub-secao-desc">Tudo opcional, mas ajuda a vender mais — configure se fizer sentido pro seu produto.</div>

            <div className="pub-toggle-full">
              <div><b>Este produto tem variações?</b><p>Cada variação (tamanho, cor etc.) tem seu próprio preço e estoque.</p></div>
              <label className="switch"><input type="checkbox" checked={form.temVariacoes} onChange={(e) => set('temVariacoes', e.target.checked)} /><span className="track" /></label>
            </div>
            {form.temVariacoes && (
              <div className="pub-lista-add">
                {form.variacoes.map((v) => (
                  <div className="pub-lista-add-row" key={v.id}>
                    <span>{v.nome}</span><span>{v.estoque} un.</span><span>R$ {v.preco}</span>
                    <button type="button" onClick={() => removerVariacao(v.id)}><Icon name="close" size={12} /></button>
                  </div>
                ))}
                <div className="pub-lista-add-form">
                  <input type="text" placeholder="Nome (ex: Verde P)" value={novaVarNome} onChange={(e) => setNovaVarNome(e.target.value)} />
                  <input type="text" placeholder="Estoque" value={novaVarEstoque} onChange={(e) => setNovaVarEstoque(e.target.value)} />
                  <input type="text" placeholder="Preço" value={novaVarPreco} onChange={(e) => setNovaVarPreco(e.target.value)} />
                  <button type="button" className="btn-outline" onClick={adicionarVariacao}>+ Adicionar</button>
                </div>
              </div>
            )}

            <div className="pub-toggle-full">
              <div><b>Oferecer preço por atacado?</b><p>Defina faixas de desconto por quantidade mínima comprada.</p></div>
              <label className="switch"><input type="checkbox" checked={form.ofereceAtacado} onChange={(e) => set('ofereceAtacado', e.target.checked)} /><span className="track" /></label>
            </div>
            {form.ofereceAtacado && (
              <div className="pub-lista-add">
                {form.faixasAtacado.map((f) => (
                  <div className="pub-lista-add-row" key={f.id}>
                    <span>A partir de {f.qtd} un.</span><span>R$ {f.preco} / un.</span>
                    <button type="button" onClick={() => removerFaixa(f.id)}><Icon name="close" size={12} /></button>
                  </div>
                ))}
                <div className="pub-lista-add-form">
                  <input type="text" placeholder="Qtd. mínima" value={novaFaixaQtd} onChange={(e) => setNovaFaixaQtd(e.target.value)} />
                  <input type="text" placeholder="Preço por unidade" value={novaFaixaPreco} onChange={(e) => setNovaFaixaPreco(e.target.value)} />
                  <button type="button" className="btn-outline" onClick={adicionarFaixa}>+ Adicionar</button>
                </div>
              </div>
            )}

            <div className="pub-toggle-full">
              <div><b>Configurar pré-venda?</b><p>Prazo de envio maior (7 a 30 dias) — útil pra imprimir sob demanda.</p></div>
              <label className="switch"><input type="checkbox" checked={form.preVenda} onChange={(e) => set('preVenda', e.target.checked)} /><span className="track" /></label>
            </div>
            {form.preVenda && (
              <div className="field">
                <label>Prazo de envio (dias)</label>
                <select value={form.prazoEnvioPreVenda} onChange={(e) => set('prazoEnvioPreVenda', e.target.value)}>
                  {PRAZOS_PRE_VENDA.map((p) => <option key={p} value={p}>{p} dias</option>)}
                </select>
              </div>
            )}
          </>
        )}

        {passo === 'frete' && mp === 'ml' && (
          <>
            <div className="pub-secao-titulo">Frete e logística</div>
            <div className="pub-secao-desc">Pré-preenchido pela calculadora de preços quando disponível.</div>

            <div className="field"><label>Peso com embalagem (g) *</label><input type="text" value={form.peso} onChange={(e) => set('peso', e.target.value)} /></div>

            <div className="field"><label>Dimensões da embalagem (cm) *</label></div>
            <div className="row3" style={{ marginTop: -8 }}>
              <div className="field"><input type="text" value={form.altura} onChange={(e) => set('altura', e.target.value)} /><span className="hint">Altura</span></div>
              <div className="field"><input type="text" value={form.largura} onChange={(e) => set('largura', e.target.value)} /><span className="hint">Largura</span></div>
              <div className="field"><input type="text" value={form.comprimento} onChange={(e) => set('comprimento', e.target.value)} /><span className="hint">Comprimento</span></div>
            </div>

            {excedeEnvios && (
              <div className="pub-aviso pub-aviso-warn"><Icon name="alert" size={14} /> A soma das dimensões está em {somaDimensoes} cm. O limite do Mercado Envios é 200 cm.</div>
            )}

            <div className="pub-toggle-full travado">
              <div><b>Mercado Envios <span className="hint">obrigatório</span></b><p>Cálculo e etiqueta de frete pelo Mercado Livre.</p></div>
              <label className="switch"><input type="checkbox" checked disabled /><span className="track" /></label>
            </div>

            <div className="pub-toggle-full">
              <div><b>Frete grátis</b><p>Você assume o custo do frete para o comprador.</p></div>
              <label className="switch"><input type="checkbox" checked={form.freteGratis} onChange={(e) => set('freteGratis', e.target.checked)} /><span className="track" /></label>
            </div>
            {form.freteGratis && (
              MOCK_MARGEM >= 20
                ? <div className="pub-aviso pub-aviso-ok"><Icon name="check" size={14} /> Margem de {MOCK_MARGEM}% — suficiente para frete grátis sem comprometer o lucro.</div>
                : <div className="pub-aviso pub-aviso-warn"><Icon name="alert" size={14} /> Margem de {MOCK_MARGEM}% — abaixo de 20%. Frete grátis pode zerar seu lucro. Reveja o preço antes de ativar.</div>
            )}

            <div className="pub-toggle-full">
              <div><b>Mercado Envios Full</b><p>Estoque no centro de distribuição do ML, com entrega mais rápida.</p></div>
              <label className="switch"><input type="checkbox" checked={form.enviosFull} onChange={(e) => set('enviosFull', e.target.checked)} /><span className="track" /></label>
            </div>
            {form.enviosFull && (
              <div className="pub-aviso pub-aviso-ok"><Icon name="box" size={14} /> Requer envio físico do seu estoque ao centro de distribuição do Mercado Livre antes de o anúncio ficar elegível ao selo Full.</div>
            )}

            <div className="field">
              <label>Prazo de despacho *</label>
              <select value={form.prazoDespacho} onChange={(e) => set('prazoDespacho', e.target.value)}>
                {['1 dia útil', '2 dias úteis', '3 dias úteis'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </>
        )}

        {passo === 'frete' && mp === 'shopee' && (
          <>
            <div className="pub-secao-titulo">Frete e logística</div>
            <div className="pub-secao-desc">Sem um canal de logística habilitado, nenhum anúncio publica na Shopee.</div>

            <div className="field"><label>Peso do produto (g) *</label><input type="text" value={form.peso} onChange={(e) => set('peso', e.target.value)} /></div>

            <div className="field">
              <label>Canal de logística *</label>
              <select value={form.canalLogistica} onChange={(e) => set('canalLogistica', e.target.value)}>
                <option value="">Selecione um canal</option>
                {CANAIS_LOGISTICA_SHOPEE.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {!form.canalLogistica && <div className="hint" style={{ color: 'var(--red)', marginTop: 4 }}>Selecione ao menos um canal de logística para continuar.</div>}
            </div>

            <div className="field">
              <label>Prazo de despacho *</label>
              <select value={form.prazoDespacho} onChange={(e) => set('prazoDespacho', e.target.value)}>
                {['1 dia útil', '2 dias úteis', '3 dias úteis'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </>
        )}

        {passo === 'confirmar' && (
          <>
            <div className="pub-secao-titulo">Confirmar e publicar</div>
            <div className="pub-secao-desc">Revise o anúncio antes de enviar {mp === 'ml' ? 'ao Mercado Livre' : 'à Shopee'}.</div>

            {faltando.length === 0 ? (
              <div className="pub-aviso pub-aviso-ok"><Icon name="check" size={14} /> Todos os campos obrigatórios estão preenchidos.</div>
            ) : (
              <div className="pub-aviso pub-aviso-warn">
                <Icon name="alert" size={14} />
                <div><b>Faltam campos obrigatórios.</b>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{faltando.map((f) => <li key={f}>{f}</li>)}</ul>
                </div>
              </div>
            )}

            {mp === 'shopee' && (
              <div className="pub-compliance">
                <div className="pub-secao-titulo" style={{ fontSize: 14, marginBottom: 10 }}>Conformidade e políticas</div>
                <label className="pub-compliance-item">
                  <input type="checkbox" checked={form.complianceSemMarcaDagua} onChange={(e) => set('complianceSemMarcaDagua', e.target.checked)} />
                  <span>As imagens não têm marca d'água, texto promocional excessivo ou conteúdo proibido pelas diretrizes da Shopee.</span>
                </label>
                <label className="pub-compliance-item">
                  <input type="checkbox" checked={form.complianceCategoriaPermitida} onChange={(e) => set('complianceCategoriaPermitida', e.target.checked)} />
                  <span>Este produto não pertence a categorias restritas ou proibidas na plataforma.</span>
                </label>
                <label className="pub-compliance-item">
                  <input type="checkbox" checked={form.complianceDescricaoConforme} onChange={(e) => set('complianceDescricaoConforme', e.target.checked)} />
                  <span>A descrição não contém promessas ou termos vetados pelas políticas de anúncio da Shopee.</span>
                </label>
                {!complianceOk && <div className="hint" style={{ color: 'var(--red)', marginTop: 6 }}>Marque os três itens para poder publicar.</div>}
              </div>
            )}

            <div className="pub-resumo-grid">
              <div className="pub-resumo-cel full">
                <div className="pub-resumo-label"><Icon name="tag" size={12} /> Título selecionado</div>
                <div className="pub-resumo-valor">{tituloEscolhido.texto}</div>
              </div>
              <div className="pub-resumo-cel">
                <div className="pub-resumo-label"><Icon name="gerador" size={12} /> Marketplace</div>
                <div className="pub-resumo-valor">{nomeMarketplace}</div>
              </div>
              <div className="pub-resumo-cel">
                <div className="pub-resumo-label"><Icon name="upload" size={12} /> Imagens</div>
                <div className="pub-resumo-valor">{form.imagensSelecionadas.length ? `${form.imagensSelecionadas.length} fotos` : '—'}</div>
              </div>
              <div className="pub-resumo-cel full">
                <div className="pub-resumo-label"><Icon name="folder" size={12} /> Categoria</div>
                <div className="pub-resumo-valor">{categoriaAtual || '—'}</div>
              </div>

              {mp === 'ml' ? (
                <>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="flag" size={12} /> Tipo de anúncio</div>
                    <div className="pub-resumo-valor">{INFO_TIPO_ANUNCIO[form.tipoAnuncio].titulo.split(' ·')[0]} · {INFO_TIPO_ANUNCIO[form.tipoAnuncio].pct}</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="calculadora" size={12} /> Material</div>
                    <div className="pub-resumo-valor">{form.material || '—'}</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="tag" size={12} /> Nicho</div>
                    <div className="pub-resumo-valor">{form.nicho.length ? form.nicho.join(', ') : '—'}</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="box" size={12} /> Peso / dimensões</div>
                    <div className="pub-resumo-valor">{form.peso}g · {somaDimensoes}cm</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="bolt" size={12} /> Frete</div>
                    <div className="pub-resumo-valor">{form.freteGratis ? 'Frete grátis ativo' : 'Frete pago pelo comprador'}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="creditos" size={12} /> Preço / estoque</div>
                    <div className="pub-resumo-valor">R$ {form.precoVenda || '—'} · {form.estoque || '0'} un.</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="tag" size={12} /> Marca</div>
                    <div className="pub-resumo-valor">{form.semMarca ? 'Sem marca' : (form.marca || '—')}</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="box" size={12} /> Peso / dimensões</div>
                    <div className="pub-resumo-valor">{form.peso || '—'}g · {somaDimensoes}cm</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="bolt" size={12} /> Canal de logística</div>
                    <div className="pub-resumo-valor">{form.canalLogistica || '—'}</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="flag" size={12} /> Variações</div>
                    <div className="pub-resumo-valor">{form.temVariacoes ? `${form.variacoes.length} variação(ões)` : 'Nenhuma'}</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="creditos" size={12} /> Atacado / pré-venda</div>
                    <div className="pub-resumo-valor">{form.ofereceAtacado ? `${form.faixasAtacado.length} faixa(s)` : 'Sem atacado'}{form.preVenda ? ` · pré-venda ${form.prazoEnvioPreVenda}d` : ''}</div>
                  </div>
                </>
              )}
            </div>

            <div className="pub-score">
              <div className="pub-score-head"><b>{score === 100 ? 'Ficha completa' : 'Ficha básica'}</b><span className="pub-score-pct">{score}%</span></div>
              <div className="pub-score-trilha"><div className="pub-score-fill" style={{ width: score + '%' }} /></div>
              {score === 100
                ? <div className="pub-score-ok">Ficha completa — nada a melhorar.</div>
                : (
                  <>
                    <div className="pub-score-ok" style={{ marginBottom: 6 }}>Para subir de nível:</div>
                    <ul>{scoreItens.filter((s) => !s.ok).map((s) => <li key={s.texto}>{s.texto}</li>)}</ul>
                  </>
                )}
            </div>
          </>
        )}

        <div className="pub-footer">
          {idxAtual > 0 ? <button type="button" className="btn-outline" onClick={voltar}>Voltar</button> : <span />}
          {passo === 'confirmar' ? (
            <button type="button" className="btn-calc" style={{ width: 'auto', padding: '13px 28px' }} disabled={!prontoParaPublicar} onClick={publicar}>Publicar anúncio</button>
          ) : (
            <button type="button" className="btn-calc" style={{ width: 'auto', padding: '13px 28px' }} onClick={avancar}>Continuar</button>
          )}
        </div>
      </div>

      {confirmarDescarte && (
        <div className="pub-descartar-overlay" onClick={() => setConfirmarDescarte(false)}>
          <div className="pub-descartar-card" onClick={(e) => e.stopPropagation()}>
            <div className="pub-status-icone"><Icon name="alert" size={24} /></div>
            <h3>Descartar este anúncio?</h3>
            <p>Você ainda não publicou. Se sair agora, as escolhas feitas até aqui serão perdidas.</p>
            <div className="pub-descartar-acoes">
              <button type="button" className="btn-outline" onClick={() => setConfirmarDescarte(false)}>Continuar editando</button>
              <button type="button" className="pub-btn-descartar" onClick={onFechar}>Descartar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
