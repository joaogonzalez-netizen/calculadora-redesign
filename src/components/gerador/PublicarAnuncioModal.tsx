import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { readJson } from '../../lib/storage';
import { MARKETPLACES_CONECTADOS_KEY } from '../../lib/onboarding';
import { useI18n } from '../../context/I18nContext';

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

function labelPasso(id: PassoPub, mp: Marketplace, t: (chave: string) => string): string {
  switch (id) {
    case 'marketplace': return t('publicar.marketplace');
    case 'imagens': return t('publicar.imagens');
    case 'titulo': return t('publicar.tituloEDescricao');
    case 'categoria': return mp === 'shopee' ? t('publicar.categoriaEDados') : t('publicar.categoria');
    case 'ficha': return mp === 'shopee' ? t('publicar.variacoesEAtacado') : t('publicar.fichaTecnica');
    case 'frete': return t('publicar.freteELogistica');
    case 'confirmar': return t('publicar.confirmar');
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

const CHAVES_LABEL_IMAGEM: Record<string, string> = {
  frente: 'publicar.imgFrente',
  lateral: 'publicar.imgLateral',
  costas: 'publicar.imgCostas',
  detalhe: 'publicar.imgDetalhe',
  uso: 'publicar.imgEmUso',
  escala: 'publicar.imgEscala',
};

const CHAVES_LABEL_NICHO: Record<string, string> = {
  'Decoração': 'publicar.nichoDecoracao',
  'Quarto infantil': 'publicar.nichoQuartoInfantil',
  'Área de lazer': 'publicar.nichoAreaDeLazer',
  'Presente': 'publicar.nichoPresente',
  'Genérico': 'publicar.nichoGenerico',
};

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

function montarInfoTipoAnuncio(t: (chave: string) => string): Record<PubForm['tipoAnuncio'], { pct: string; titulo: string; desc: string }> {
  return {
    gratis: { pct: '0%', titulo: t('publicar.infoGratisTitulo'), desc: t('publicar.infoGratisDesc') },
    classico: { pct: '12%', titulo: t('publicar.infoClassicoTitulo'), desc: t('publicar.infoClassicoDesc') },
    premium: { pct: '18%', titulo: t('publicar.infoPremiumTitulo'), desc: t('publicar.infoPremiumDesc') },
  };
}

interface Props {
  onFechar: () => void;
  onIrParaConfiguracoes: () => void;
}

export default function PublicarAnuncioModal({ onFechar, onIrParaConfiguracoes }: Props) {
  const { t } = useI18n();
  const INFO_TIPO_ANUNCIO = montarInfoTipoAnuncio(t);
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

  const tituloEscolhido = TITULOS_PUB.find((tit) => tit.id === form.tituloId) ?? TITULOS_PUB[0];
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
    { ok: form.imagensSelecionadas.length >= 4, texto: t('publicar.scoreMlFotos') },
    { ok: !!form.material.trim(), texto: t('publicar.scoreMlMaterial') },
    { ok: form.nicho.length > 0, texto: t('publicar.scoreMlNicho') },
  ];
  const scoreItensShopee = [
    { ok: form.imagensSelecionadas.length >= 4, texto: t('publicar.scoreShopeeFotos') },
    { ok: !!form.sku.trim(), texto: t('publicar.scoreShopeeSku') },
    { ok: form.temVariacoes || form.ofereceAtacado, texto: t('publicar.scoreShopeeVariacoes') },
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
            <h3>{t('publicar.publicandoEm')} {nomeMarketplace}…</h3>
            <p>{t('publicar.enviandoAnuncio')}</p>
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
            <h3>{t('publicar.anuncioPublicado')}</h3>
            <p>{t('publicar.jaEstaNoAr')} {nomeMarketplace}. {t('publicar.acompanheAcessos')}</p>
            <button type="button" className="btn-outline" onClick={onFechar}>{t('publicar.voltarAoGerador')}</button>
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
            <h2>{t('publicar.publicarSeuAnuncio')}</h2>
            <p>{t('publicar.montarPassoAPasso')}</p>
          </div>
          <button type="button" className="pub-close" onClick={tentarFechar}><Icon name="close" size={15} /></button>
        </div>

        <div className="pub-progresso">
          {PASSOS_PUB.map((p, i) => <span key={p.id} className={i <= idxAtual ? 'feito' : ''} />)}
        </div>
        <div className="pub-passo-info">
          <span>{t('publicar.passo')} {idxAtual + 1} {t('publicar.de')} 7</span>
          <b>{labelPasso(passo, mp, t)}</b>
        </div>

        {passo === 'marketplace' && (
          <>
            <div className="pub-secao-titulo">{t('publicar.ondePublicar')}</div>
            <div className="pub-secao-desc">{t('publicar.escolhaMarketplaceDesc')}</div>
            <div className="pub-radio-mp">
              <button type="button" className={'pub-radio-mp-card' + (mp === 'ml' ? ' selecionado' : '')} onClick={() => set('marketplace', 'ml')}>
                <span className="pub-titulo-radio" style={{ marginTop: 3 }} />
                <div className="pub-radio-mp-top">
                  <div>
                    <div className="pub-radio-mp-nome">Mercado Livre</div>
                    <div className="pub-radio-mp-sub">{t('publicar.mlConectadoStatus')}</div>
                  </div>
                  <span className="pub-tag-api">{t('publicar.apiConectada')}</span>
                </div>
              </button>
              <button type="button" className={'pub-radio-mp-card' + (mp === 'shopee' ? ' selecionado' : '')} onClick={() => set('marketplace', 'shopee')}>
                <span className="pub-titulo-radio" style={{ marginTop: 3 }} />
                <div className="pub-radio-mp-top">
                  <div>
                    <div className="pub-radio-mp-nome">Shopee</div>
                    <div className="pub-radio-mp-sub">{lojaShopeeHabilitada ? t('publicar.lojaHabilitada') : t('publicar.lojaNaoHabilitada')}</div>
                  </div>
                  <span className={lojaShopeeHabilitada ? 'pub-tag-api' : 'pub-tag-soon'}>{lojaShopeeHabilitada ? t('publicar.conectada') : t('publicar.pendente')}</span>
                </div>
              </button>
            </div>

            {lojaShopeeAvisoPendente && (
              <div className="pub-aviso pub-aviso-warn">
                <Icon name="alert" size={14} />
                <div>
                  <b>Sua loja Shopee ainda não está habilitada.</b>
                  <p style={{ margin: '4px 0 0' }}>Você pode continuar preenchendo o anúncio, mas a publicação de verdade exige conta verificada (KYC), um método de recebimento e ao menos um canal de logística configurados em Configurações → Marketplaces.</p>
                  <button type="button" className="btn-outline" style={{ marginTop: 10 }} onClick={onIrParaConfiguracoes}>{t('publicar.irParaConfiguracoes')}</button>
                </div>
              </div>
            )}
          </>
        )}

        {passo === 'imagens' && (
          <>
            <div className="pub-secao-titulo">{t('publicar.imagensDoAnuncio')}</div>
            <div className="pub-secao-desc">{t('publicar.imagensDesc')}</div>
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
                      <span>{t(CHAVES_LABEL_IMAGEM[img.id] ?? '') || img.label}</span>
                      {ordem === 0 && <span className="pub-img-principal">{t('publicar.principal')}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="pub-img-conta">{t('publicar.selecionadas')} <b>{form.imagensSelecionadas.length} {t('publicar.de')} {IMAGENS_PUB.length}</b></div>
          </>
        )}

        {passo === 'titulo' && (
          <>
            <div className="pub-secao-titulo">{t('publicar.tituloEDescricao')}</div>
            <div className="pub-secao-desc">{t('publicar.tituloDesc')}</div>
            <div className="field"><label>{t('publicar.titulo')} *</label></div>
            <div className="pub-titulo-lista">
              {TITULOS_PUB.map((tit) => {
                const chars = tit.texto.length;
                const corta = chars > 60;
                return (
                  <button type="button" key={tit.id} className={'pub-titulo-opcao' + (form.tituloId === tit.id ? ' selecionado' : '')} onClick={() => set('tituloId', tit.id)}>
                    <span className="pub-titulo-radio" />
                    <div style={{ flex: 1 }}>
                      <div className="pub-titulo-texto">{tit.texto}</div>
                      <div className="pub-titulo-meta">
                        <span className="pub-titulo-tags">{tit.tags}</span>
                        <span className={'pub-titulo-contagem' + (corta ? ' erro' : '')}>{chars} {t('publicar.caracteres')} — {corta ? t('publicar.cortaNoMobile') : t('publicar.ideal')}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="pub-titulo-hint">
              {mp === 'ml' ? t('publicar.tituloHintMl') : t('publicar.tituloHintShopee')}
            </div>
            <div className="field">
              <label>{t('publicar.descricao')} *</label>
              <textarea rows={4} value={form.descricao} maxLength={4000} onChange={(e) => set('descricao', e.target.value)} />
              <div className="hint" style={{ textAlign: 'right', marginTop: 4 }}>{form.descricao.length} / 4.000 caracteres</div>
            </div>
          </>
        )}

        {passo === 'categoria' && mp === 'ml' && (
          <>
            <div className="pub-secao-titulo">{t('publicar.categoriaETipoAnuncio')}</div>
            <div className="pub-secao-desc">{t('publicar.categoriaMlDesc')}</div>

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
                  <span className="pub-tag-api"><Icon name="check" size={11} /> {t('publicar.apiMl')}</span>
                </div>
                <p>{t('publicar.sugeridaApartirDe')} "{tituloEscolhido.texto.slice(0, 40)}…"</p>
                <div className="cod">{t('publicar.codigo')} MLB284910</div>
              </div>
            ) : (
              <div className="pub-cat-sugestao">
                <div className="pub-cat-sugestao-head"><b>{form.categoriaManual}</b></div>
                <p>{t('publicar.categoriaSelecionadaManualmente')}</p>
              </div>
            )}

            <div className="field">
              <label>{t('publicar.selecionarOutraCategoria')} <span className="hint" style={{ fontWeight: 400 }}>{t('publicar.opcional')}</span></label>
              <select value={form.categoriaManual} onChange={(e) => set('categoriaManual', e.target.value)} disabled={categoriaCarregando}>
                {CATEGORIAS_MANUAIS_ML.map((c) => <option key={c} value={c}>{c === CATEGORIAS_MANUAIS_ML[0] ? t('publicar.manterSugestaoMl') : c}</option>)}
              </select>
            </div>

            <div className="row2">
              <div className="field"><label>{t('publicar.marca')}</label><input type="text" value={form.marca} onChange={(e) => set('marca', e.target.value)} /></div>
              <div className="field"><label>{t('publicar.modelo')}</label><input type="text" value={form.modelo} onChange={(e) => set('modelo', e.target.value)} /></div>
            </div>
            <div className="hint" style={{ marginTop: -12, marginBottom: 18 }}>Informe a marca verdadeira do produto ou "Genérica" se não tiver marca.</div>

            <div className="field">
              <label>{t('publicar.condicaoProduto')} *</label>
              <div className="pub-toggle-row">
                <button type="button" className={'pub-toggle-pill' + (form.condicao === 'novo' ? ' ativo' : '')} onClick={() => set('condicao', 'novo')}>{t('publicar.novo')}</button>
                <button type="button" className={'pub-toggle-pill' + (form.condicao === 'usado' ? ' ativo' : '')} onClick={() => set('condicao', 'usado')}>{t('publicar.usado')}</button>
              </div>
            </div>

            <div className="field">
              <label>{t('publicar.tipoAnuncio')} *</label>
              <div className="pub-toggle-row">
                {(['gratis', 'classico', 'premium'] as const).map((ta) => (
                  <button type="button" key={ta} className={'pub-toggle-pill' + (form.tipoAnuncio === ta ? ' ativo' : '')} onClick={() => set('tipoAnuncio', ta)}>
                    {ta === 'gratis' ? t('publicar.gratis') : ta === 'classico' ? t('publicar.classico') : t('publicar.premium')}
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
            <div className="pub-secao-titulo">{t('publicar.categoriaEDadosDoProduto')}</div>
            <div className="pub-secao-desc">{t('publicar.categoriaShopeeDesc')}</div>

            <div className="field">
              <label>{t('publicar.categoria')} *</label>
              <select value={form.shopeeCategoria} onChange={(e) => set('shopeeCategoria', e.target.value)}>
                <option value="">{t('publicar.selecioneACategoria')}</option>
                {CATEGORIAS_SHOPEE.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {!form.shopeeCategoria && <div className="hint" style={{ color: 'var(--red)', marginTop: 4 }}>Selecione uma categoria para continuar.</div>}
            </div>

            <div className="row2">
              <div className="field"><label>{t('publicar.precoVenda')} *</label><input type="text" value={form.precoVenda} onChange={(e) => set('precoVenda', e.target.value)} /></div>
              <div className="field"><label>{t('publicar.quantidadeEmEstoque')} *</label><input type="text" value={form.estoque} onChange={(e) => set('estoque', e.target.value)} /></div>
            </div>
            <div className="field"><label>{t('publicar.sku')} <span className="hint" style={{ fontWeight: 400 }}>{t('publicar.opcionalControleInterno')}</span></label><input type="text" placeholder="Ex: INC-BP-001" value={form.sku} onChange={(e) => set('sku', e.target.value)} /></div>

            <div className="field">
              <label className="switch-row" style={{ padding: 0, gap: 10 }}>
                <input type="checkbox" checked={form.semMarca} onChange={(e) => set('semMarca', e.target.checked)} style={{ width: 16, height: 16 }} />
                <span>{t('publicar.semMarcaCadastrada')}</span>
              </label>
            </div>
            {!form.semMarca && (
              <div className="field"><label>{t('publicar.marca')} *</label><input type="text" value={form.marca} onChange={(e) => set('marca', e.target.value)} /></div>
            )}

            {form.shopeeCategoria && (
              <>
                <div className="divider-label">{t('publicar.atributosObrigatorios')}</div>
                <div className="row2">
                  <div className="field"><label>{t('publicar.material')} *</label><input type="text" value={form.material} onChange={(e) => set('material', e.target.value)} /></div>
                  <div className="field"><label>{t('publicar.cor')} *</label><input type="text" value={form.cor} onChange={(e) => set('cor', e.target.value)} /></div>
                </div>

                <div className="field"><label>{t('publicar.dimensoesEmbalagem')} *</label></div>
                <div className="row3" style={{ marginTop: -8 }}>
                  <div className="field"><input type="text" value={form.altura} onChange={(e) => set('altura', e.target.value)} /><span className="hint">{t('publicar.altura')}</span></div>
                  <div className="field"><input type="text" value={form.largura} onChange={(e) => set('largura', e.target.value)} /><span className="hint">{t('publicar.largura')}</span></div>
                  <div className="field"><input type="text" value={form.comprimento} onChange={(e) => set('comprimento', e.target.value)} /><span className="hint">{t('publicar.comprimento')}</span></div>
                </div>
              </>
            )}
          </>
        )}

        {passo === 'ficha' && mp === 'ml' && (
          <>
            <div className="pub-secao-titulo">{t('publicar.fichaTecnica')}</div>
            <div className="pub-secao-desc">{t('publicar.fichaTecnicaDesc')}</div>

            <div className="field"><label>{t('publicar.materialPrincipal')} *</label><input type="text" value={form.material} onChange={(e) => set('material', e.target.value)} /></div>

            <div className="row3">
              <div className="field"><label>{t('publicar.cor')} *</label><input type="text" value={form.cor} onChange={(e) => set('cor', e.target.value)} /></div>
              <div className="field"><label>{t('publicar.acabamento')} <span className="hint" style={{ fontWeight: 400 }}>{t('publicar.opcional')}</span></label><input type="text" value={form.acabamento} onChange={(e) => set('acabamento', e.target.value)} /></div>
              <div className="field">
                <label>{t('publicar.quantidade')} *</label>
                <select value={form.quantidade} onChange={(e) => set('quantidade', e.target.value)}>
                  {['1 unidade', '2 unidades', '3 unidades', 'Kit'].map((q) => <option key={q}>{q}</option>)}
                </select>
              </div>
            </div>

            <div className="field"><label>{t('publicar.tipoProduto')} *</label><input type="text" value={form.tipoProduto} onChange={(e) => set('tipoProduto', e.target.value)} /></div>

            <div className="field">
              <label>{t('publicar.compatibilidadeNicho')} <span className="hint" style={{ fontWeight: 400 }}>{t('publicar.opcional')}</span></label>
              <div className="pub-chip-row">
                {NICHOS_SUGERIDOS.map((n) => (
                  <button type="button" key={n} className={'pub-chip' + (form.nicho.includes(n) ? ' ativo' : '')} onClick={() => toggleNicho(n)}>{t(CHAVES_LABEL_NICHO[n] ?? '') || n}</button>
                ))}
                {form.nicho.filter((n) => !NICHOS_SUGERIDOS.includes(n)).map((n) => (
                  <span className="pub-chip-custom" key={n}>{n} <button type="button" onClick={() => removerNicho(n)}><Icon name="close" size={11} /></button></span>
                ))}
                <input
                  type="text"
                  placeholder={t('publicar.maisOutro')}
                  value={form.nichoCustom}
                  onChange={(e) => set('nichoCustom', e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarNichoCustom(); } }}
                  onBlur={adicionarNichoCustom}
                  style={{ width: 90, border: '1.5px solid var(--border-strong)', borderRadius: 999, padding: '7px 14px', fontSize: 12.5 }}
                />
              </div>
            </div>

            <div className="field">
              <label>{t('publicar.escala')} <span className="hint" style={{ fontWeight: 400 }}>{t('publicar.opcional')}</span></label>
              <select value={form.escala} onChange={(e) => set('escala', e.target.value)}>
                <option value="">{t('publicar.selecione')}</option>
                <option value="pequena">{t('publicar.escalaPequena')}</option>
                <option value="media">{t('publicar.escalaMedia')}</option>
                <option value="grande">{t('publicar.escalaGrande')}</option>
              </select>
            </div>
          </>
        )}

        {passo === 'ficha' && mp === 'shopee' && (
          <>
            <div className="pub-secao-titulo">{t('publicar.variacoesAtacadoEPreVenda')}</div>
            <div className="pub-secao-desc">{t('publicar.fichaShopeeDesc')}</div>

            <div className="pub-toggle-full">
              <div><b>{t('publicar.temVariacoesPergunta')}</b><p>{t('publicar.temVariacoesDesc')}</p></div>
              <label className="switch"><input type="checkbox" checked={form.temVariacoes} onChange={(e) => set('temVariacoes', e.target.checked)} /><span className="track" /></label>
            </div>
            {form.temVariacoes && (
              <div className="pub-lista-add">
                {form.variacoes.map((v) => (
                  <div className="pub-lista-add-row" key={v.id}>
                    <span>{v.nome}</span><span>{v.estoque} {t('publicar.un')}</span><span>R$ {v.preco}</span>
                    <button type="button" onClick={() => removerVariacao(v.id)}><Icon name="close" size={12} /></button>
                  </div>
                ))}
                <div className="pub-lista-add-form">
                  <input type="text" placeholder={t('publicar.placeholderNomeVariacao')} value={novaVarNome} onChange={(e) => setNovaVarNome(e.target.value)} />
                  <input type="text" placeholder={t('publicar.estoquePlaceholder')} value={novaVarEstoque} onChange={(e) => setNovaVarEstoque(e.target.value)} />
                  <input type="text" placeholder={t('publicar.precoPlaceholder')} value={novaVarPreco} onChange={(e) => setNovaVarPreco(e.target.value)} />
                  <button type="button" className="btn-outline" onClick={adicionarVariacao}>{t('publicar.maisAdicionar')}</button>
                </div>
              </div>
            )}

            <div className="pub-toggle-full">
              <div><b>{t('publicar.ofereceAtacadoPergunta')}</b><p>{t('publicar.ofereceAtacadoDesc')}</p></div>
              <label className="switch"><input type="checkbox" checked={form.ofereceAtacado} onChange={(e) => set('ofereceAtacado', e.target.checked)} /><span className="track" /></label>
            </div>
            {form.ofereceAtacado && (
              <div className="pub-lista-add">
                {form.faixasAtacado.map((f) => (
                  <div className="pub-lista-add-row" key={f.id}>
                    <span>{t('publicar.apartirDe')} {f.qtd} {t('publicar.un')}</span><span>R$ {f.preco} / {t('publicar.un')}</span>
                    <button type="button" onClick={() => removerFaixa(f.id)}><Icon name="close" size={12} /></button>
                  </div>
                ))}
                <div className="pub-lista-add-form">
                  <input type="text" placeholder={t('publicar.qtdMinima')} value={novaFaixaQtd} onChange={(e) => setNovaFaixaQtd(e.target.value)} />
                  <input type="text" placeholder={t('publicar.precoPorUnidade')} value={novaFaixaPreco} onChange={(e) => setNovaFaixaPreco(e.target.value)} />
                  <button type="button" className="btn-outline" onClick={adicionarFaixa}>{t('publicar.maisAdicionar')}</button>
                </div>
              </div>
            )}

            <div className="pub-toggle-full">
              <div><b>{t('publicar.configurarPreVendaPergunta')}</b><p>{t('publicar.preVendaDesc')}</p></div>
              <label className="switch"><input type="checkbox" checked={form.preVenda} onChange={(e) => set('preVenda', e.target.checked)} /><span className="track" /></label>
            </div>
            {form.preVenda && (
              <div className="field">
                <label>{t('publicar.prazoEnvioDias')}</label>
                <select value={form.prazoEnvioPreVenda} onChange={(e) => set('prazoEnvioPreVenda', e.target.value)}>
                  {PRAZOS_PRE_VENDA.map((p) => <option key={p} value={p}>{p} {t('publicar.dias')}</option>)}
                </select>
              </div>
            )}
          </>
        )}

        {passo === 'frete' && mp === 'ml' && (
          <>
            <div className="pub-secao-titulo">{t('publicar.freteELogistica')}</div>
            <div className="pub-secao-desc">{t('publicar.freteMlDesc')}</div>

            <div className="field"><label>{t('publicar.pesoComEmbalagem')} *</label><input type="text" value={form.peso} onChange={(e) => set('peso', e.target.value)} /></div>

            <div className="field"><label>{t('publicar.dimensoesEmbalagem')} *</label></div>
            <div className="row3" style={{ marginTop: -8 }}>
              <div className="field"><input type="text" value={form.altura} onChange={(e) => set('altura', e.target.value)} /><span className="hint">{t('publicar.altura')}</span></div>
              <div className="field"><input type="text" value={form.largura} onChange={(e) => set('largura', e.target.value)} /><span className="hint">{t('publicar.largura')}</span></div>
              <div className="field"><input type="text" value={form.comprimento} onChange={(e) => set('comprimento', e.target.value)} /><span className="hint">{t('publicar.comprimento')}</span></div>
            </div>

            {excedeEnvios && (
              <div className="pub-aviso pub-aviso-warn"><Icon name="alert" size={14} /> A soma das dimensões está em {somaDimensoes} cm. O limite do Mercado Envios é 200 cm.</div>
            )}

            <div className="pub-toggle-full travado">
              <div><b>Mercado Envios <span className="hint">{t('publicar.obrigatorio')}</span></b><p>{t('publicar.mercadoEnviosDesc')}</p></div>
              <label className="switch"><input type="checkbox" checked disabled /><span className="track" /></label>
            </div>

            <div className="pub-toggle-full">
              <div><b>{t('publicar.freteGratis')}</b><p>{t('publicar.freteGratisDesc')}</p></div>
              <label className="switch"><input type="checkbox" checked={form.freteGratis} onChange={(e) => set('freteGratis', e.target.checked)} /><span className="track" /></label>
            </div>
            {form.freteGratis && (
              MOCK_MARGEM >= 20
                ? <div className="pub-aviso pub-aviso-ok"><Icon name="check" size={14} /> Margem de {MOCK_MARGEM}% — suficiente para frete grátis sem comprometer o lucro.</div>
                : <div className="pub-aviso pub-aviso-warn"><Icon name="alert" size={14} /> Margem de {MOCK_MARGEM}% — abaixo de 20%. Frete grátis pode zerar seu lucro. Reveja o preço antes de ativar.</div>
            )}

            <div className="pub-toggle-full">
              <div><b>Mercado Envios Full</b><p>{t('publicar.enviosFullDesc')}</p></div>
              <label className="switch"><input type="checkbox" checked={form.enviosFull} onChange={(e) => set('enviosFull', e.target.checked)} /><span className="track" /></label>
            </div>
            {form.enviosFull && (
              <div className="pub-aviso pub-aviso-ok"><Icon name="box" size={14} /> Requer envio físico do seu estoque ao centro de distribuição do Mercado Livre antes de o anúncio ficar elegível ao selo Full.</div>
            )}

            <div className="field">
              <label>{t('publicar.prazoDespacho')} *</label>
              <select value={form.prazoDespacho} onChange={(e) => set('prazoDespacho', e.target.value)}>
                {['1 dia útil', '2 dias úteis', '3 dias úteis'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </>
        )}

        {passo === 'frete' && mp === 'shopee' && (
          <>
            <div className="pub-secao-titulo">{t('publicar.freteELogistica')}</div>
            <div className="pub-secao-desc">{t('publicar.freteShopeeDesc')}</div>

            <div className="field"><label>{t('publicar.pesoDoProduto')} *</label><input type="text" value={form.peso} onChange={(e) => set('peso', e.target.value)} /></div>

            <div className="field">
              <label>{t('publicar.canalLogistica')} *</label>
              <select value={form.canalLogistica} onChange={(e) => set('canalLogistica', e.target.value)}>
                <option value="">{t('publicar.selecioneUmCanal')}</option>
                {CANAIS_LOGISTICA_SHOPEE.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {!form.canalLogistica && <div className="hint" style={{ color: 'var(--red)', marginTop: 4 }}>Selecione ao menos um canal de logística para continuar.</div>}
            </div>

            <div className="field">
              <label>{t('publicar.prazoDespacho')} *</label>
              <select value={form.prazoDespacho} onChange={(e) => set('prazoDespacho', e.target.value)}>
                {['1 dia útil', '2 dias úteis', '3 dias úteis'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </>
        )}

        {passo === 'confirmar' && (
          <>
            <div className="pub-secao-titulo">{t('publicar.confirmarEPublicar')}</div>
            <div className="pub-secao-desc">{t('publicar.reviseAnuncioAntesDeEnviar')} {mp === 'ml' ? t('publicar.aoMercadoLivre') : t('publicar.aShopee')}.</div>

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
                <div className="pub-secao-titulo" style={{ fontSize: 14, marginBottom: 10 }}>{t('publicar.conformidadeEPoliticas')}</div>
                <label className="pub-compliance-item">
                  <input type="checkbox" checked={form.complianceSemMarcaDagua} onChange={(e) => set('complianceSemMarcaDagua', e.target.checked)} />
                  <span>{t('publicar.complianceImagens')}</span>
                </label>
                <label className="pub-compliance-item">
                  <input type="checkbox" checked={form.complianceCategoriaPermitida} onChange={(e) => set('complianceCategoriaPermitida', e.target.checked)} />
                  <span>{t('publicar.complianceCategoria')}</span>
                </label>
                <label className="pub-compliance-item">
                  <input type="checkbox" checked={form.complianceDescricaoConforme} onChange={(e) => set('complianceDescricaoConforme', e.target.checked)} />
                  <span>{t('publicar.complianceDescricao')}</span>
                </label>
                {!complianceOk && <div className="hint" style={{ color: 'var(--red)', marginTop: 6 }}>Marque os três itens para poder publicar.</div>}
              </div>
            )}

            <div className="pub-resumo-grid">
              <div className="pub-resumo-cel full">
                <div className="pub-resumo-label"><Icon name="tag" size={12} /> {t('publicar.tituloSelecionado')}</div>
                <div className="pub-resumo-valor">{tituloEscolhido.texto}</div>
              </div>
              <div className="pub-resumo-cel">
                <div className="pub-resumo-label"><Icon name="gerador" size={12} /> {t('publicar.marketplace')}</div>
                <div className="pub-resumo-valor">{nomeMarketplace}</div>
              </div>
              <div className="pub-resumo-cel">
                <div className="pub-resumo-label"><Icon name="upload" size={12} /> {t('publicar.imagens')}</div>
                <div className="pub-resumo-valor">{form.imagensSelecionadas.length ? `${form.imagensSelecionadas.length} ${t('publicar.fotos')}` : '—'}</div>
              </div>
              <div className="pub-resumo-cel full">
                <div className="pub-resumo-label"><Icon name="folder" size={12} /> {t('publicar.categoria')}</div>
                <div className="pub-resumo-valor">{categoriaAtual || '—'}</div>
              </div>

              {mp === 'ml' ? (
                <>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="flag" size={12} /> {t('publicar.tipoAnuncio')}</div>
                    <div className="pub-resumo-valor">{INFO_TIPO_ANUNCIO[form.tipoAnuncio].titulo.split(' ·')[0]} · {INFO_TIPO_ANUNCIO[form.tipoAnuncio].pct}</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="calculadora" size={12} /> {t('publicar.material')}</div>
                    <div className="pub-resumo-valor">{form.material || '—'}</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="tag" size={12} /> {t('publicar.nicho')}</div>
                    <div className="pub-resumo-valor">{form.nicho.length ? form.nicho.map((n) => t(CHAVES_LABEL_NICHO[n] ?? '') || n).join(', ') : '—'}</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="box" size={12} /> {t('publicar.pesoDimensoes')}</div>
                    <div className="pub-resumo-valor">{form.peso}g · {somaDimensoes}cm</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="bolt" size={12} /> {t('publicar.frete')}</div>
                    <div className="pub-resumo-valor">{form.freteGratis ? t('publicar.freteGratisAtivo') : t('publicar.fretePagoPeloComprador')}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="creditos" size={12} /> {t('publicar.precoEstoque')}</div>
                    <div className="pub-resumo-valor">R$ {form.precoVenda || '—'} · {form.estoque || '0'} {t('publicar.un')}</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="tag" size={12} /> {t('publicar.marca')}</div>
                    <div className="pub-resumo-valor">{form.semMarca ? t('publicar.semMarca') : (form.marca || '—')}</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="box" size={12} /> {t('publicar.pesoDimensoes')}</div>
                    <div className="pub-resumo-valor">{form.peso || '—'}g · {somaDimensoes}cm</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="bolt" size={12} /> {t('publicar.canalLogistica')}</div>
                    <div className="pub-resumo-valor">{form.canalLogistica || '—'}</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="flag" size={12} /> {t('publicar.variacoes')}</div>
                    <div className="pub-resumo-valor">{form.temVariacoes ? `${form.variacoes.length} ${t('publicar.variacaoOes')}` : t('publicar.nenhuma')}</div>
                  </div>
                  <div className="pub-resumo-cel">
                    <div className="pub-resumo-label"><Icon name="creditos" size={12} /> {t('publicar.atacadoPreVenda')}</div>
                    <div className="pub-resumo-valor">{form.ofereceAtacado ? `${form.faixasAtacado.length} ${t('publicar.faixaS')}` : t('publicar.semAtacado')}{form.preVenda ? ` · ${t('publicar.preVenda')} ${form.prazoEnvioPreVenda}d` : ''}</div>
                  </div>
                </>
              )}
            </div>

            <div className="pub-score">
              <div className="pub-score-head"><b>{score === 100 ? t('publicar.fichaCompleta') : t('publicar.fichaBasica')}</b><span className="pub-score-pct">{score}%</span></div>
              <div className="pub-score-trilha"><div className="pub-score-fill" style={{ width: score + '%' }} /></div>
              {score === 100
                ? <div className="pub-score-ok">{t('publicar.fichaCompletaNadaAMelhorar')}</div>
                : (
                  <>
                    <div className="pub-score-ok" style={{ marginBottom: 6 }}>{t('publicar.paraSubirDeNivel')}</div>
                    <ul>{scoreItens.filter((s) => !s.ok).map((s) => <li key={s.texto}>{s.texto}</li>)}</ul>
                  </>
                )}
            </div>
          </>
        )}

        <div className="pub-footer">
          {idxAtual > 0 ? <button type="button" className="btn-outline" onClick={voltar}>{t('publicar.voltar')}</button> : <span />}
          {passo === 'confirmar' ? (
            <button type="button" className="btn-calc" style={{ width: 'auto', padding: '13px 28px' }} disabled={!prontoParaPublicar} onClick={publicar}>{t('publicar.publicarAnuncio')}</button>
          ) : (
            <button type="button" className="btn-calc" style={{ width: 'auto', padding: '13px 28px' }} onClick={avancar}>{t('publicar.continuar')}</button>
          )}
        </div>
      </div>

      {confirmarDescarte && (
        <div className="pub-descartar-overlay" onClick={() => setConfirmarDescarte(false)}>
          <div className="pub-descartar-card" onClick={(e) => e.stopPropagation()}>
            <div className="pub-status-icone"><Icon name="alert" size={24} /></div>
            <h3>{t('publicar.descartarEsteAnuncio')}</h3>
            <p>{t('publicar.descartarDesc')}</p>
            <div className="pub-descartar-acoes">
              <button type="button" className="btn-outline" onClick={() => setConfirmarDescarte(false)}>{t('publicar.continuarEditando')}</button>
              <button type="button" className="pub-btn-descartar" onClick={onFechar}>{t('publicar.descartar')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
