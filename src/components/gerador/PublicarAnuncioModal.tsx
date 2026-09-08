import { useEffect, useState } from 'react';
import Icon from '../Icon';

// Réplica do fluxo "Publicar anúncio" do Figma (STLSELLER, node 22260-24646,
// print de João 08/09/2026) — modal de 7 passos que roda a partir do passo
// Resultado. Tudo mockado (sem marketplace real por trás), mas as regras
// de UX são reais: categoria sugerida carrega e pode ser trocada, frete
// grátis reage à margem, a soma das dimensões é conferida contra o limite
// do Mercado Envios, e o passo Confirmar calcula de verdade o que falta —
// nada disso é hardcoded pra um único estado "feliz".
type PassoPub = 'marketplace' | 'imagens' | 'titulo' | 'categoria' | 'ficha' | 'frete' | 'confirmar';

const PASSOS_PUB: { id: PassoPub; numero: number; label: string }[] = [
  { id: 'marketplace', numero: 1, label: 'Marketplace' },
  { id: 'imagens', numero: 2, label: 'Imagens' },
  { id: 'titulo', numero: 3, label: 'Título e descrição' },
  { id: 'categoria', numero: 4, label: 'Categoria' },
  { id: 'ficha', numero: 5, label: 'Ficha técnica' },
  { id: 'frete', numero: 6, label: 'Frete e logística' },
  { id: 'confirmar', numero: 7, label: 'Confirmar' },
];

interface ImagemPub {
  id: string;
  label: string;
}
const IMAGENS_PUB: ImagemPub[] = [
  { id: 'frente', label: 'Frente' },
  { id: 'lateral', label: 'Lateral' },
  { id: 'costas', label: 'Costas' },
  { id: 'detalhe', label: 'Detalhe' },
  { id: 'uso', label: 'Em uso' },
  { id: 'escala', label: 'Escala' },
];

interface TituloOpcao {
  id: string;
  texto: string;
  tags: string;
}
const TITULOS_PUB: TituloOpcao[] = [
  { id: 't1', texto: 'Incensário Bicho-Preguiça Divertido para Decoração do Ambiente', tags: 'bicho-preguiça, incensário, decoração' },
  { id: 't2', texto: 'Incensário Bicho-Preguiça para Quarto Infantil e Área de Lazer com Design Lúdico e Colorido para Decoração', tags: 'quarto infantil, área de lazer, lúdico' },
  { id: 't3', texto: 'Incensário Decorativo Bicho-Preguiça Verde e Marrom em PLA', tags: 'incensário, verde, marrom' },
  { id: 't4', texto: 'Decoração Lúdica com Incensário Bicho-Preguiça para Crianças', tags: 'decoração, crianças, lúdica' },
];

const DESCRICAO_PADRAO = 'Incensário decorativo em formato de bicho-preguiça sobre uma folha estilizada. Peça estática, ideal para quartos infantis e áreas de lazer, com acabamento em PLA de origem vegetal.';

const CATEGORIAS_MANUAIS = [
  'Manter sugestão do Mercado Livre',
  'Casa, Móveis e Decoração > Decoração > Enfeites',
  'Casa, Móveis e Decoração > Decoração > Incensários e Aromatizadores',
  'Brinquedos e Hobbies > Colecionáveis > Miniaturas',
];

const NICHOS_SUGERIDOS = ['Decoração', 'Quarto infantil', 'Área de lazer', 'Presente', 'Genérico'];

const MOCK_MARGEM = 37;

interface PubForm {
  imagensSelecionadas: string[];
  tituloId: string;
  descricao: string;
  categoriaManual: string;
  marca: string;
  modelo: string;
  condicao: 'novo' | 'usado';
  tipoAnuncio: 'gratis' | 'classico' | 'premium';
  material: string;
  cor: string;
  acabamento: string;
  quantidade: string;
  tipoProduto: string;
  nicho: string[];
  nichoCustom: string;
  escala: string;
  peso: string;
  altura: string;
  largura: string;
  comprimento: string;
  freteGratis: boolean;
  enviosFull: boolean;
  prazoDespacho: string;
}

const FORM_INICIAL: PubForm = {
  imagensSelecionadas: ['frente', 'lateral', 'detalhe', 'escala'],
  tituloId: 't1',
  descricao: DESCRICAO_PADRAO,
  categoriaManual: CATEGORIAS_MANUAIS[0],
  marca: '',
  modelo: '',
  condicao: 'novo',
  tipoAnuncio: 'classico',
  material: 'PLA (padrão)',
  cor: 'Verde e Marrom',
  acabamento: 'Fosco',
  quantidade: '1 unidade',
  tipoProduto: 'Incensário decorativo',
  nicho: ['Decoração'],
  nichoCustom: '',
  escala: '',
  peso: '320',
  altura: '25',
  largura: '25',
  comprimento: '10',
  freteGratis: true,
  enviosFull: false,
  prazoDespacho: '1 dia útil',
};

const INFO_TIPO_ANUNCIO: Record<PubForm['tipoAnuncio'], { pct: string; titulo: string; desc: string }> = {
  gratis: { pct: '0%', titulo: 'Grátis · sem comissão', desc: 'Menor exposição — ideal pra testar um produto novo.' },
  classico: { pct: '12%', titulo: 'Clássico · comissão estimada', desc: 'Boa exposição e parcelamento. Equilíbrio entre custo e alcance.' },
  premium: { pct: '18%', titulo: 'Premium · comissão estimada', desc: 'Máxima exposição e parcelamento em mais vezes.' },
};

interface Props {
  onFechar: () => void;
}

export default function PublicarAnuncioModal({ onFechar }: Props) {
  const [passo, setPasso] = useState<PassoPub>('marketplace');
  const [form, setForm] = useState<PubForm>(FORM_INICIAL);
  const [fase, setFase] = useState<'wizard' | 'publicando' | 'sucesso'>('wizard');
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const [categoriaCarregando, setCategoriaCarregando] = useState(true);

  useEffect(() => {
    if (passo !== 'categoria') return;
    setCategoriaCarregando(true);
    const t = setTimeout(() => setCategoriaCarregando(false), 850);
    return () => clearTimeout(t);
  }, [passo]);

  function set<K extends keyof PubForm>(campo: K, valor: PubForm[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  const idxAtual = PASSOS_PUB.findIndex((p) => p.id === passo);
  const passoInfo = PASSOS_PUB[idxAtual];

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

  const somaDimensoes = (Number(form.altura) || 0) + (Number(form.largura) || 0) + (Number(form.comprimento) || 0);
  const excedeEnvios = somaDimensoes > 200;

  const tituloEscolhido = TITULOS_PUB.find((t) => t.id === form.tituloId) ?? TITULOS_PUB[0];
  const categoriaResolvida = categoriaCarregando ? '' : (form.categoriaManual === CATEGORIAS_MANUAIS[0] ? 'Casa, Móveis e Decoração > Decoração > Incensários e Aromatizadores' : form.categoriaManual);

  const faltando: string[] = [];
  if (form.imagensSelecionadas.length === 0) faltando.push('imagens');
  if (!form.material.trim()) faltando.push('material');
  if (!form.tipoProduto.trim()) faltando.push('tipo de produto');
  if (!categoriaResolvida) faltando.push('categoria');
  if (!form.peso.trim() || !form.altura.trim() || !form.largura.trim() || !form.comprimento.trim()) faltando.push('peso/dimensões');

  const scoreItens = [
    { ok: form.imagensSelecionadas.length >= 4, texto: 'Suba 4+ fotos para CTR até 40% maior.' },
    { ok: !!form.material.trim(), texto: 'Informe o material principal.' },
    { ok: form.nicho.length > 0, texto: 'Adicione um nicho (ex: decoração, presente).' },
  ];
  const score = 10 + scoreItens.filter((s) => s.ok).length * 30;
  const prontoParaPublicar = faltando.length === 0;

  function publicar() {
    if (!prontoParaPublicar) return;
    setFase('publicando');
    setTimeout(() => setFase('sucesso'), 1400);
  }

  if (fase === 'publicando') {
    return (
      <div className="pub-overlay">
        <div className="pub-modal">
          <div className="pub-status-card">
            <div className="pub-mp-badges">
              <span className="pub-mp-badge" style={{ background: '#ff9900', color: '#fff' }}>S</span>
              <Icon name="chevron" size={12} style={{ transform: 'rotate(180deg)', color: 'var(--text-3)' }} />
              <span className="pub-mp-badge" style={{ background: '#ffd400', color: '#14181a' }}>ML</span>
            </div>
            <h3>Publicando no Mercado Livre…</h3>
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
            <p>Seu anúncio já está no ar no Mercado Livre. Acompanhe os primeiros acessos no painel.</p>
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
          <span>Passo {passoInfo.numero} de 7</span>
          <b>{passoInfo.label}</b>
        </div>

        {passo === 'marketplace' && (
          <>
            <div className="pub-secao-titulo">Onde publicar</div>
            <div className="pub-secao-desc">Escolha o marketplace. Categoria e ficha técnica se adaptam à escolha.</div>
            <div className="pub-radio-mp">
              <button type="button" className="pub-radio-mp-card selecionado">
                <span className="pub-titulo-radio" style={{ marginTop: 3 }} />
                <div className="pub-radio-mp-top">
                  <div>
                    <div className="pub-radio-mp-nome">Mercado Livre</div>
                    <div className="pub-radio-mp-sub">Conectado · 174 pedidos</div>
                  </div>
                  <span className="pub-tag-api">API conectada</span>
                </div>
              </button>
              <button type="button" className="pub-radio-mp-card" disabled>
                <span className="pub-titulo-radio" style={{ marginTop: 3 }} />
                <div className="pub-radio-mp-top">
                  <div>
                    <div className="pub-radio-mp-nome">Shopee</div>
                    <div className="pub-radio-mp-sub">Integração em desenvolvimento</div>
                  </div>
                  <span className="pub-tag-soon">Em breve</span>
                </div>
              </button>
            </div>
          </>
        )}

        {passo === 'imagens' && (
          <>
            <div className="pub-secao-titulo">Imagens do anúncio</div>
            <div className="pub-secao-desc">Selecione as imagens geradas. A primeira selecionada vira a foto principal.</div>
            <div className="pub-aviso pub-aviso-info"><Icon name="tag" size={14} /> Anúncios com 4+ fotos têm CTR até 40% maior. Inclua frente, lateral e foto em contexto de uso.</div>
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
                        <span className={'pub-titulo-contagem' + (corta ? ' erro' : '')}>{chars} caracteres — {corta ? 'corta no mobile' : 'ideal para ML'}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="pub-titulo-hint">O título escolhido alimenta a sugestão de categoria do Mercado Livre no próximo passo.</div>
            <div className="field">
              <label>Descrição *</label>
              <textarea rows={4} value={form.descricao} maxLength={4000} onChange={(e) => set('descricao', e.target.value)} />
              <div className="hint" style={{ textAlign: 'right', marginTop: 4 }}>{form.descricao.length} / 4.000 caracteres</div>
            </div>
          </>
        )}

        {passo === 'categoria' && (
          <>
            <div className="pub-secao-titulo">Categoria e tipo de anúncio</div>
            <div className="pub-secao-desc">O Mercado Livre sugere a categoria pelo título. Confirme ou ajuste.</div>

            {categoriaCarregando ? (
              <div className="pub-cat-sugestao pub-cat-skeleton">
                <span style={{ width: '70%' }} />
                <span style={{ width: '45%' }} />
                <span style={{ width: '30%', marginBottom: 0 }} />
              </div>
            ) : form.categoriaManual === CATEGORIAS_MANUAIS[0] ? (
              <div className="pub-cat-sugestao">
                <div className="pub-cat-sugestao-head">
                  <b>{categoriaResolvida}</b>
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
                {CATEGORIAS_MANUAIS.map((c) => <option key={c} value={c}>{c}</option>)}
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

        {passo === 'ficha' && (
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

        {passo === 'frete' && (
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

        {passo === 'confirmar' && (
          <>
            <div className="pub-secao-titulo">Confirmar e publicar</div>
            <div className="pub-secao-desc">Revise o anúncio antes de enviar ao Mercado Livre.</div>

            {prontoParaPublicar ? (
              <div className="pub-aviso pub-aviso-ok"><Icon name="check" size={14} /> Anúncio pronto para publicar. Todos os campos obrigatórios estão preenchidos.</div>
            ) : (
              <div className="pub-aviso pub-aviso-warn">
                <Icon name="alert" size={14} />
                <div><b>Faltam campos obrigatórios.</b>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>{faltando.map((f) => <li key={f}>{f}</li>)}</ul>
                </div>
              </div>
            )}

            <div className="pub-resumo-grid">
              <div className="pub-resumo-cel full">
                <div className="pub-resumo-label"><Icon name="tag" size={12} /> Título selecionado</div>
                <div className="pub-resumo-valor">{tituloEscolhido.texto}</div>
              </div>
              <div className="pub-resumo-cel">
                <div className="pub-resumo-label"><Icon name="gerador" size={12} /> Marketplace</div>
                <div className="pub-resumo-valor">Mercado Livre</div>
              </div>
              <div className="pub-resumo-cel">
                <div className="pub-resumo-label"><Icon name="flag" size={12} /> Tipo de anúncio</div>
                <div className="pub-resumo-valor">{INFO_TIPO_ANUNCIO[form.tipoAnuncio].titulo.split(' ·')[0]} · {INFO_TIPO_ANUNCIO[form.tipoAnuncio].pct}</div>
              </div>
              <div className="pub-resumo-cel">
                <div className="pub-resumo-label"><Icon name="upload" size={12} /> Imagens</div>
                <div className="pub-resumo-valor">{form.imagensSelecionadas.length ? `${form.imagensSelecionadas.length} fotos` : '—'}</div>
              </div>
              <div className="pub-resumo-cel">
                <div className="pub-resumo-label"><Icon name="folder" size={12} /> Categoria</div>
                <div className="pub-resumo-valor">{categoriaResolvida || '—'}</div>
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
