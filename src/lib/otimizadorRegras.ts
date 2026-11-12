// Regras do "Otimizar anúncio" (mock). Cada marketplace tem seus parâmetros
// (limite de título, nº de fotos, tags...) e as mesmas seis regras de pontuação somam 100.
// Sem backend: os dados do anúncio que não existem no mock (descrição, ficha técnica, preço
// médio do canal...) são derivados de um hash do id, estáveis por produto.
// Para mudar uma regra, edite PARAMS_POR_MARKETPLACE ou a função `avaliar` da regra.
import type { Idioma } from './i18n';
import type { Produto } from './produtosMock';

export type StatusRegra = 'ok' | 'atencao' | 'corrigir';
export type IdRegra = 'titulo' | 'descricao' | 'imagens' | 'ficha' | 'preco' | 'envio';

type Marketplace = Produto['marketplace'];

interface ParametrosMarketplace {
  /** Limite oficial de caracteres do título e o mínimo recomendado. */
  tituloMin: number;
  tituloMax: number;
  descricaoMin: number;
  imagensIdeal: number;
  /** Etsy e TikTok Shop também pontuam vídeo; ML e Shopee, só as fotos. */
  exigeVideo: boolean;
  /** Etsy: 13 tags. Nos demais é a ficha técnica. */
  fichaLabel: { pt: string; en: string };
  envioLabel: { pt: string; en: string };
}

export const PARAMS_POR_MARKETPLACE: Record<Marketplace, ParametrosMarketplace> = {
  'Mercado Livre': {
    tituloMin: 45, tituloMax: 60, descricaoMin: 400, imagensIdeal: 6, exigeVideo: false,
    fichaLabel: { pt: 'Ficha técnica', en: 'Item specifics' },
    envioLabel: { pt: 'Frete grátis e Pix', en: 'Free shipping and Pix' },
  },
  Shopee: {
    tituloMin: 60, tituloMax: 120, descricaoMin: 500, imagensIdeal: 8, exigeVideo: true,
    fichaLabel: { pt: 'Atributos do produto', en: 'Product attributes' },
    envioLabel: { pt: 'Frete grátis e cupom', en: 'Free shipping and voucher' },
  },
  Etsy: {
    tituloMin: 90, tituloMax: 140, descricaoMin: 300, imagensIdeal: 10, exigeVideo: true,
    fichaLabel: { pt: 'Tags (13 de 13)', en: 'Tags (13 of 13)' },
    envioLabel: { pt: 'Perfil de envio e prazo', en: 'Shipping profile and processing time' },
  },
  'TikTok Shop': {
    tituloMin: 60, tituloMax: 255, descricaoMin: 300, imagensIdeal: 9, exigeVideo: true,
    fichaLabel: { pt: 'Atributos do produto', en: 'Product attributes' },
    envioLabel: { pt: 'Frete e prazo de envio', en: 'Shipping and handling time' },
  },
};

export interface ResultadoRegra {
  id: IdRegra;
  titulo: string;
  peso: number;
  pontos: number;
  status: StatusRegra;
  /** O que foi encontrado no anúncio. */
  achado: string;
  /** O que fazer para ganhar os pontos que faltam; vazio quando está ok. */
  correcao: string;
}

export interface AnaliseAnuncio {
  marketplace: Marketplace;
  score: number;
  /** Score se todas as correções forem aplicadas. */
  potencial: number;
  regras: ResultadoRegra[];
}

type Texto = { pt: string; en: string };
const tx = (idioma: Idioma, t: Texto) => (idioma === 'en' ? t.en : t.pt);

/** Peso de cada regra; somam 100. */
export const PESOS: Record<IdRegra, number> = { titulo: 20, descricao: 15, imagens: 25, ficha: 15, preco: 15, envio: 10 };

export const TITULOS_REGRA: Record<IdRegra, Texto> = {
  titulo: { pt: 'Título', en: 'Title' },
  descricao: { pt: 'Descrição', en: 'Description' },
  imagens: { pt: 'Fotos e vídeo', en: 'Photos and video' },
  ficha: { pt: 'Ficha técnica', en: 'Attributes' },
  preco: { pt: 'Preço', en: 'Price' },
  envio: { pt: 'Envio e condições', en: 'Shipping and terms' },
};

export function tituloDaRegra(id: IdRegra, marketplace: Marketplace, idioma: Idioma): string {
  if (id === 'ficha') return tx(idioma, PARAMS_POR_MARKETPLACE[marketplace].fichaLabel);
  if (id === 'envio') return tx(idioma, PARAMS_POR_MARKETPLACE[marketplace].envioLabel);
  return tx(idioma, TITULOS_REGRA[id]);
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function status(fracao: number): StatusRegra {
  if (fracao >= 0.9) return 'ok';
  if (fracao >= 0.5) return 'atencao';
  return 'corrigir';
}

function regra(id: IdRegra, fracao: number, achado: string, correcao: string): ResultadoRegra {
  const f = Math.max(0, Math.min(1, fracao));
  const st = status(f);
  return { id, titulo: '', peso: PESOS[id], pontos: Math.round(PESOS[id] * f), status: st, achado, correcao: st === 'ok' ? '' : correcao };
}

export function analisarAnuncio(p: Produto, idioma: Idioma): AnaliseAnuncio {
  const par = PARAMS_POR_MARKETPLACE[p.marketplace];
  const h = hashId(p.id);
  const en = idioma === 'en';

  // Título: tamanho dentro da faixa do marketplace + palavras-chave de busca (mock: 0 a 3).
  const tam = p.nome.length;
  const keywords = h % 4;
  const fTam = tam > par.tituloMax ? 0.4 : Math.min(1, tam / par.tituloMin);
  const fTitulo = fTam * 0.7 + (keywords / 3) * 0.3;

  // Descrição: caracteres (mock: 120 a 780).
  const descChars = 120 + ((h >> 3) % 660);

  // Imagens: quantidade real do mock, vídeo (mock) conta 20% quando exigido.
  const temVideo = (h >> 5) % 2 === 0;
  const fFotos = Math.min(1, p.imagensQtd / par.imagensIdeal);
  const fImagens = par.exigeVideo ? fFotos * 0.8 + (temVideo ? 0.2 : 0) : fFotos;

  // Ficha técnica / tags preenchidas (mock: 40 a 100%).
  const fichaPct = 40 + ((h >> 7) % 61);

  // Preço vs. média de anúncios parecidos no canal (mock: -12% a +18%).
  const desvioPreco = ((h >> 9) % 31) - 12;
  const fPreco = desvioPreco <= 3 ? 1 : Math.max(0, 1 - (desvioPreco - 3) / 15);

  // Envio e condições: frete grátis + Pix/cupom/prazo, cada um vale metade (mock).
  const freteGratis = (h >> 11) % 3 !== 0;
  const condicao = (h >> 13) % 2 === 0;
  const fEnvio = (freteGratis ? 0.5 : 0) + (condicao ? 0.5 : 0);

  const regras: ResultadoRegra[] = [
    regra(
      'titulo', fTitulo,
      en ? `${tam} characters (ideal ${par.tituloMin}-${par.tituloMax}), ${keywords} of 3 search keywords.`
         : `${tam} caracteres (ideal ${par.tituloMin}-${par.tituloMax}), ${keywords} de 3 palavras-chave de busca.`,
      en ? `Use up to ${par.tituloMax} characters with material, size and use up front.`
         : `Use até ${par.tituloMax} caracteres, com material, tamanho e uso logo no início.`,
    ),
    regra(
      'descricao', descChars / par.descricaoMin,
      en ? `${descChars} characters (recommended ${par.descricaoMin}+).` : `${descChars} caracteres (recomendado ${par.descricaoMin}+).`,
      en ? 'Add measurements, care instructions, lead time and answers to common questions.'
         : 'Inclua medidas, cuidados, prazo e respostas para as dúvidas mais comuns.',
    ),
    regra(
      'imagens', fImagens,
      en ? `${p.imagensQtd} of ${par.imagensIdeal} photos${par.exigeVideo ? `, ${temVideo ? 'with' : 'no'} video` : ''}.`
         : `${p.imagensQtd} de ${par.imagensIdeal} fotos${par.exigeVideo ? `, ${temVideo ? 'com' : 'sem'} vídeo` : ''}.`,
      en ? `Reach ${par.imagensIdeal} photos (cover, scale, detail, in use)${par.exigeVideo ? ' and add a short video' : ''}.`
         : `Chegue a ${par.imagensIdeal} fotos (capa, escala, detalhe e em uso)${par.exigeVideo ? ' e adicione um vídeo curto' : ''}.`,
    ),
    regra(
      'ficha', fichaPct / 100,
      en ? `${fichaPct}% filled in.` : `${fichaPct}% preenchida.`,
      en ? 'Fill in every field the marketplace asks for: material, size, color and compatibility.'
         : 'Preencha todos os campos que o marketplace pede: material, tamanho, cor e compatibilidade.',
    ),
    regra(
      'preco', fPreco,
      desvioPreco > 0
        ? (en ? `${desvioPreco}% above the average of similar listings.` : `${desvioPreco}% acima da média de anúncios parecidos.`)
        : (en ? `${Math.abs(desvioPreco)}% below the average of similar listings.` : `${Math.abs(desvioPreco)}% abaixo da média de anúncios parecidos.`),
      en ? 'Adjust the price closer to the channel average or highlight what sets the item apart.'
         : 'Ajuste o preço mais perto da média do canal ou destaque o diferencial da peça.',
    ),
    regra(
      'envio', fEnvio,
      en ? `${freteGratis ? 'Free shipping on' : 'Free shipping off'}, ${condicao ? 'terms set' : 'no extra terms'}.`
         : `Frete grátis ${freteGratis ? 'ativo' : 'desativado'}, ${condicao ? 'condição extra configurada' : 'sem condição extra'}.`,
      en ? 'Turn on free shipping and set the extra term this marketplace highlights in search.'
         : 'Ative o frete grátis e configure a condição extra que o marketplace destaca na busca.',
    ),
  ];
  for (const r of regras) r.titulo = tituloDaRegra(r.id, p.marketplace, idioma);

  const score = regras.reduce((s, r) => s + r.pontos, 0);
  const perdido = regras.reduce((s, r) => s + (r.status === 'ok' ? 0 : r.peso - r.pontos), 0);
  return { marketplace: p.marketplace, score, potencial: Math.min(100, score + perdido), regras };
}

export function faixaScore(score: number): 'excelente' | 'bom' | 'melhorar' | 'critico' {
  if (score >= 85) return 'excelente';
  if (score >= 70) return 'bom';
  if (score >= 50) return 'melhorar';
  return 'critico';
}
