// Menu Marketing (Logo, Banners, Etiquetas) — v1 mockada, sem IA/backend real,
// no mesmo espírito do Gerador de anúncios. Geração é determinística no client
// (SVG/canvas), mas o arquivo final baixado é real (PNG de verdade).
// Ver docs/spec-marketing-leigos.md.
import { readJson, writeJson } from './storage';
import { CREDITOS } from './dashboardMock';
import type { Idioma } from './i18n';

export type Estilo = 'minimalista' | 'divertido' | 'elegante' | 'colorido';
export type FormaLogo = 'circulo' | 'hexagono' | 'quadrado' | 'escudo';
export type Plataforma = 'shopee' | 'mercado-livre';
// Nichos comuns entre quem vende impressão 3D — cada um sugere um estilo
// default (usuário pode trocar), pra dar um contexto de negócio real pra IA
// no futuro, mesmo hoje sendo geração mockada.
export type Nicho = 'decoracao' | 'brinquedos' | 'casaJardim' | 'presentes' | 'pet' | 'papelaria' | 'pecasTecnicas' | 'miniaturasRpg' | 'outro';

export interface LogoVariacao {
  id: string;
  iniciais: string;
  cor: string;
  forma: FormaLogo;
  /** Só quando o maker não tem nome: o nome que a "IA" criou junto com a logo. */
  nome?: string;
}

export interface LogoAtual {
  nomeLoja: string;
  variacao: LogoVariacao;
  slogan?: string;
  usos?: UsoLogo[];
}

/** Onde a logo vai ser usada — contexto pra IA (formato, contraste, legibilidade). */
export type UsoLogo = 'redes' | 'marketplace' | 'embalagem' | 'site' | 'vestuario' | 'impressos';
export const USOS_LOGO: { id: UsoLogo; chaveLabel: string }[] = [
  { id: 'redes', chaveLabel: 'marketing.logo.usoRedes' },
  { id: 'marketplace', chaveLabel: 'marketing.logo.usoMarketplace' },
  { id: 'embalagem', chaveLabel: 'marketing.logo.usoEmbalagem' },
  { id: 'site', chaveLabel: 'marketing.logo.usoSite' },
  { id: 'vestuario', chaveLabel: 'marketing.logo.usoVestuario' },
  { id: 'impressos', chaveLabel: 'marketing.logo.usoImpressos' },
];
export const LIMITE_SLOGAN = 40;

export interface CorNomeada {
  cor: string;
  chaveLabel: string;
}

// Paleta nomeada pro seletor de "até 3 cores" — mesmos valores de CORES_LOGO,
// com rótulo pra exibir no swatch.
export const PALETA_LOGO: CorNomeada[] = [
  { cor: '#00955a', chaveLabel: 'marketing.logo.corVerde' },
  { cor: '#06b2a1', chaveLabel: 'marketing.logo.corCiano' },
  { cor: '#3b6fd4', chaveLabel: 'marketing.logo.corAzul' },
  { cor: '#8a3bd4', chaveLabel: 'marketing.logo.corRoxa' },
  { cor: '#c58a00', chaveLabel: 'marketing.logo.corDourada' },
  { cor: '#d4633b', chaveLabel: 'marketing.logo.corLaranja' },
  { cor: '#d43b6f', chaveLabel: 'marketing.logo.corRosa' },
];

export const LIMITE_CORES_LOGO = 3;

export const NICHOS: { id: Nicho; chaveLabel: string; estiloSugerido: Estilo }[] = [
  { id: 'decoracao', chaveLabel: 'marketing.logo.nichoDecoracao', estiloSugerido: 'elegante' },
  { id: 'brinquedos', chaveLabel: 'marketing.logo.nichoBrinquedos', estiloSugerido: 'divertido' },
  { id: 'casaJardim', chaveLabel: 'marketing.logo.nichoCasaJardim', estiloSugerido: 'minimalista' },
  { id: 'presentes', chaveLabel: 'marketing.logo.nichoPresentes', estiloSugerido: 'colorido' },
  { id: 'pet', chaveLabel: 'marketing.logo.nichoPet', estiloSugerido: 'divertido' },
  { id: 'papelaria', chaveLabel: 'marketing.logo.nichoPapelaria', estiloSugerido: 'minimalista' },
  { id: 'pecasTecnicas', chaveLabel: 'marketing.logo.nichoPecasTecnicas', estiloSugerido: 'minimalista' },
  { id: 'miniaturasRpg', chaveLabel: 'marketing.logo.nichoMiniaturasRpg', estiloSugerido: 'elegante' },
  { id: 'outro', chaveLabel: 'marketing.logo.nichoOutro', estiloSugerido: 'minimalista' },
];

// Sugestão de nome (mock) — combina um prefixo relacionado ao nicho com um
// sufixo genérico de marca maker/3D. Sem IA real: é uma combinatória fixa,
// mas dá um ponto de partida pra quem ainda não batizou a loja.
const SUFIXOS_NOME = ['3D', 'Prints', 'Studio', 'Maker', 'Lab', 'Co'];
const PREFIXOS_POR_NICHO: Record<Idioma, Record<Nicho, string[]>> = {
  pt: {
    decoracao: ['Traço', 'Ambiente', 'Decora'],
    brinquedos: ['Brinq', 'Lúdico', 'Play'],
    casaJardim: ['Verde', 'Raiz', 'Lar'],
    presentes: ['Mimo', 'Gesto', 'Presente'],
    pet: ['Patinha', 'Focinho', 'Pet'],
    papelaria: ['Folha', 'Nota', 'Papel'],
    pecasTecnicas: ['Precisão', 'Engrena', 'Tech'],
    miniaturasRpg: ['Lenda', 'Reino', 'Dado'],
    outro: ['Cubo', 'Prisma', 'Nova'],
  },
  en: {
    decoracao: ['Trace', 'Ambient', 'Decor'],
    brinquedos: ['Playful', 'Toy', 'Fun'],
    casaJardim: ['Green', 'Root', 'Home'],
    presentes: ['Charm', 'Gesture', 'Gift'],
    pet: ['Paw', 'Snout', 'Pet'],
    papelaria: ['Sheet', 'Note', 'Paper'],
    pecasTecnicas: ['Precision', 'Gear', 'Tech'],
    miniaturasRpg: ['Legend', 'Realm', 'Dice'],
    outro: ['Cube', 'Prism', 'Nova'],
  },
  es: {
    decoracao: ['Trazo', 'Ambiente', 'Decora'],
    brinquedos: ['Lúdico', 'Juguete', 'Play'],
    casaJardim: ['Verde', 'Raíz', 'Hogar'],
    presentes: ['Mimo', 'Gesto', 'Regalo'],
    pet: ['Patita', 'Hocico', 'Pet'],
    papelaria: ['Hoja', 'Nota', 'Papel'],
    pecasTecnicas: ['Precisión', 'Engrane', 'Tech'],
    miniaturasRpg: ['Leyenda', 'Reino', 'Dado'],
    outro: ['Cubo', 'Prisma', 'Nova'],
  },
};

/** Gera 4 sugestões de nome combinando um prefixo do nicho com um sufixo de marca — mock, sem IA. */
export function sugerirNomes(idioma: Idioma, nicho: Nicho | null): string[] {
  const prefixos = PREFIXOS_POR_NICHO[idioma][nicho ?? 'outro'];
  return prefixos.map((prefixo, i) => {
    const sufixo = SUFIXOS_NOME[(i + (nicho ? seedNumerico(nicho) : 0)) % SUFIXOS_NOME.length];
    return i % 2 === 0 ? `${prefixo}${sufixo}` : `${prefixo} ${sufixo}`;
  });
}

/** Nomes pro gerador de logo quando o maker não tem nome: mistura os prefixos
 * de até 3 nichos (um de cada, alternando) com os sufixos de marca. `rodada`
 * avança a combinação pra cada nova geração trazer nomes novos — mock, sem IA. */
export function sugerirNomesMarca(idioma: Idioma, nichos: Nicho[], rodada = 0, qtd = 6): string[] {
  const grupos = (nichos.length ? nichos : ['outro' as Nicho]).map((n) => PREFIXOS_POR_NICHO[idioma][n]);
  const prefixos: string[] = [];
  for (let i = 0; prefixos.length < grupos.length * 3; i++) {
    const g = grupos[i % grupos.length];
    const p = g[Math.floor(i / grupos.length) % g.length];
    if (!prefixos.includes(p)) prefixos.push(p);
    if (i > 30) break;
  }
  const nomes: string[] = [];
  const total = prefixos.length * SUFIXOS_NOME.length;
  for (let k = 0; nomes.length < qtd && k < total; k++) {
    const idx = (rodada * qtd + k) % total;
    const prefixo = prefixos[idx % prefixos.length];
    const sufixo = SUFIXOS_NOME[(Math.floor(idx / prefixos.length) + idx) % SUFIXOS_NOME.length];
    const nome = idx % 2 === 0 ? `${prefixo}${sufixo}` : `${prefixo} ${sufixo}`;
    if (!nomes.includes(nome)) nomes.push(nome);
  }
  return nomes;
}

export const LIMITE_NICHOS_LOGO = 3;
/** Quantos nomes (cada um com uma logo) a geração cria quando o maker não tem nome. */
export const QTD_NOMES_GERADOS = 10;

/** Uma logo por nome gerado: forma e cor giram entre as do estilo e as escolhidas. */
export function gerarLogosComNomes(nomes: string[], coresSelecionadas: string[], estilo: Estilo): LogoVariacao[] {
  const formas = FORMAS_POR_ESTILO[estilo] ?? FORMAS_LOGO;
  return nomes.map((nome, i) => {
    const base = gerarVariacoesLogo(nome, coresSelecionadas, estilo);
    const v = base[i % base.length];
    return { ...v, id: `nome-${i}-${seedNumerico(nome)}`, forma: formas[i % formas.length], nome };
  });
}

const CORES_LOGO = PALETA_LOGO.map((p) => p.cor);
// "Minimalista"/"Elegante" sorteiam de uma paleta mais contida; "Divertido"/"Colorido" usam a paleta cheia.
const CORES_LOGO_CONTIDAS = ['#00955a', '#06b2a1', '#3b6fd4'];
const FORMAS_LOGO: FormaLogo[] = ['circulo', 'hexagono', 'quadrado', 'escudo'];
// "Elegante" prioriza formas mais sóbrias (círculo/escudo); "Divertido" prioriza formas mais lúdicas (hexágono/quadrado).
const FORMAS_POR_ESTILO: Record<Estilo, FormaLogo[]> = {
  minimalista: ['circulo', 'quadrado', 'hexagono', 'escudo'],
  elegante: ['escudo', 'circulo', 'hexagono', 'quadrado'],
  divertido: ['hexagono', 'quadrado', 'circulo', 'escudo'],
  colorido: ['quadrado', 'hexagono', 'escudo', 'circulo'],
};

export const LOGO_ATUAL_KEY = 'stlseller_marketing_logo_atual';
export const CREDITOS_MOCK_KEY = 'stlseller_creditos_mock';

// Custo placeholder por geração — valor real é uma Pergunta em Aberto do PRD.
export const CUSTO_CREDITOS: Record<'logo' | 'banner' | 'etiquetas' | 'capaLoja' | 'carrosselSecao', number> = {
  logo: 10,
  banner: 10,
  etiquetas: 5,
  capaLoja: 15,
  carrosselSecao: 6,
};

// Dimensões de referência (não oficiais — ver Seção 4.2 da spec).
export const DIMENSOES_BANNER: Record<Plataforma, { largura: number; altura: number }> = {
  shopee: { largura: 2020, altura: 500 },
  'mercado-livre': { largura: 1140, altura: 220 },
};

// Specs oficiais da Shopee pro editor de decoração de loja — ver
// docs/prd-decoracao-loja-shopee.md.
export const SPEC_CAPA_LOJA = {
  largura: 1200,
  altura: 518,
  pesoMaximoBytes: 2 * 1024 * 1024,
};

export type Proporcao = '2:1' | '16:9' | '1:1' | 'livre';

export const RATIO_CARROSSEL: Record<Exclude<Proporcao, 'livre'>, number> = {
  '2:1': 2,
  '16:9': 16 / 9,
  '1:1': 1,
};

export const SPEC_CARROSSEL = {
  pesoMaximoBytes: 2 * 1024 * 1024,
  resolucaoMaxima: 2000,
  maxSecoes: 6,
};

function iniciaisDe(nomeLoja: string): string {
  const partes = nomeLoja.trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

// Pseudo-aleatório determinístico a partir de uma string — mesma entrada
// sempre gera a mesma "geração", pra parecer consistente entre re-renders.
function seedNumerico(texto: string): number {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h;
}

export function gerarVariacoesLogo(nomeLoja: string, coresSelecionadas: string[], estilo: Estilo = 'minimalista'): LogoVariacao[] {
  const iniciais = iniciaisDe(nomeLoja);
  const seed = seedNumerico(nomeLoja || 'stlseller');
  const formas = FORMAS_POR_ESTILO[estilo] ?? FORMAS_LOGO;
  // Com cores escolhidas pelo usuário, cada variação cicla entre elas — com só
  // 1 cor, as 4 variações saem na mesma cor (comportamento esperado).
  const paleta = coresSelecionadas.length
    ? coresSelecionadas
    : (estilo === 'divertido' || estilo === 'colorido' ? CORES_LOGO : CORES_LOGO_CONTIDAS);
  return formas.map((forma, i) => {
    const cor = paleta[(coresSelecionadas.length ? i : seed + i * 7) % paleta.length];
    return { id: `${forma}-${i}`, iniciais, cor, forma };
  });
}

function desenharFormaLogo(ctx: CanvasRenderingContext2D, forma: FormaLogo, tamanho: number) {
  const c = tamanho / 2;
  ctx.beginPath();
  if (forma === 'circulo') {
    ctx.arc(c, c, c, 0, Math.PI * 2);
  } else if (forma === 'quadrado') {
    const r = tamanho * 0.18;
    const m = tamanho * 0.04;
    const w = tamanho - m * 2;
    ctx.moveTo(m + r, m);
    ctx.arcTo(m + w, m, m + w, m + w, r);
    ctx.arcTo(m + w, m + w, m, m + w, r);
    ctx.arcTo(m, m + w, m, m, r);
    ctx.arcTo(m, m, m + w, m, r);
  } else if (forma === 'hexagono') {
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI / 3) * i - Math.PI / 2;
      const x = c + c * 0.96 * Math.cos(ang);
      const y = c + c * 0.96 * Math.sin(ang);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else {
    // escudo
    const m = tamanho * 0.04;
    const w = tamanho - m * 2;
    ctx.moveTo(m, m);
    ctx.lineTo(m + w, m);
    ctx.lineTo(m + w, m + w * 0.55);
    ctx.quadraticCurveTo(m + w, m + w * 0.95, c, m + w);
    ctx.quadraticCurveTo(m, m + w * 0.95, m, m + w * 0.55);
    ctx.closePath();
  }
}

/** Desenha a variação num canvas quadrado (fundo transparente) — usado tanto pro preview quanto pro export final. */
export function desenharLogoNoCanvas(canvas: HTMLCanvasElement, v: LogoVariacao, tamanho = 512) {
  canvas.width = tamanho;
  canvas.height = tamanho;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, tamanho, tamanho);
  ctx.fillStyle = v.cor;
  desenharFormaLogo(ctx, v.forma, tamanho);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `700 ${tamanho * 0.34}px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(v.iniciais, tamanho / 2, tamanho * 0.53);
}

/** Desenha o banner (fundo + nome da loja + destaque opcional + logo opcional) num canvas na dimensão oficial da plataforma. */
export function desenharBannerNoCanvas(
  canvas: HTMLCanvasElement,
  plataforma: Plataforma,
  nomeLoja: string,
  textoDestaque: string,
  logo: LogoAtual | null,
  estilo: Estilo = 'minimalista',
) {
  const { largura, altura } = DIMENSOES_BANNER[plataforma];
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Sem logo reaproveitada, o estilo escolhido no contexto decide a paleta —
  // mesma lógica de Logo/Decoração de Loja.
  const paletaEstilo = estilo === 'divertido' || estilo === 'colorido' ? CORES_LOGO : CORES_LOGO_CONTIDAS;
  const corFundo = logo?.variacao.cor ?? paletaEstilo[seedNumerico(nomeLoja || 'stlseller') % paletaEstilo.length];
  const grad = ctx.createLinearGradient(0, 0, largura, altura);
  grad.addColorStop(0, corFundo);
  grad.addColorStop(1, '#14181a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, largura, altura);

  const logoTamanho = altura * 0.62;
  const margem = altura * 0.19;
  let xTexto = largura / 2;
  if (logo) {
    const logoCanvas = document.createElement('canvas');
    desenharLogoNoCanvas(logoCanvas, logo.variacao, 256);
    ctx.drawImage(logoCanvas, margem, (altura - logoTamanho) / 2, logoTamanho, logoTamanho);
    xTexto = margem + logoTamanho + margem + (largura - (margem * 2 + logoTamanho)) / 2;
  }

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${altura * 0.16}px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.fillText(nomeLoja || 'Minha loja', xTexto, altura * (textoDestaque ? 0.42 : 0.5));
  if (textoDestaque) {
    ctx.font = `600 ${altura * 0.09}px "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.fillText(textoDestaque, xTexto, altura * 0.66);
  }
}

/**
 * Composição mock de "decoração de loja" — fundo em gradiente + colagem de
 * retângulos representando as fotos de produto "enviadas" (mesmo espírito
 * do CORES_MOCK do Gerador de Anúncios: sem foto real, sem IA, só uma
 * composição plausível pra provar o fluxo fim a fim).
 */
export function desenharDecoracaoNoCanvas(
  canvas: HTMLCanvasElement,
  largura: number,
  altura: number,
  promptTexto: string,
  qtdFotos: number,
  estilo: Estilo,
  variacao = 0,
) {
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // "variacao" muda a composição sem o usuário precisar alterar nada — é o
  // que faz "Regenerar" parecer uma nova tentativa, já que o resto da
  // composição é determinístico a partir do prompt/estilo/dimensão.
  const seed = seedNumerico((promptTexto || estilo) + estilo) + variacao * 97;
  const paleta = estilo === 'divertido' || estilo === 'colorido' ? CORES_LOGO : CORES_LOGO_CONTIDAS;
  const corA = paleta[seed % paleta.length];
  const corB = paleta[(seed + 3) % paleta.length];
  const grad = ctx.createLinearGradient(0, 0, largura, altura);
  grad.addColorStop(0, corA);
  grad.addColorStop(1, corB);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, largura, altura);

  const n = Math.max(1, qtdFotos);
  const margem = altura * 0.08;
  const gap = altura * 0.05;
  const larguraFoto = (largura - margem * 2 - gap * (n - 1)) / n;
  const alturaFoto = altura - margem * 2;
  const raio = Math.min(14, alturaFoto * 0.08);
  for (let i = 0; i < n; i++) {
    const x = margem + i * (larguraFoto + gap);
    const y = margem;
    ctx.fillStyle = paleta[(seed + i * 5) % paleta.length];
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.moveTo(x + raio, y);
    ctx.arcTo(x + larguraFoto, y, x + larguraFoto, y + alturaFoto, raio);
    ctx.arcTo(x + larguraFoto, y + alturaFoto, x, y + alturaFoto, raio);
    ctx.arcTo(x, y + alturaFoto, x, y, raio);
    ctx.arcTo(x, y, x + larguraFoto, y, raio);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Exporta o canvas como JPEG reduzindo a qualidade progressivamente até
 * caber em pesoMaximoBytes — validação real de peso (não só um selo visual),
 * conforme requisito P0 do PRD: nunca entregar arquivo fora da spec.
 */
export function gerarJpegValidado(
  canvas: HTMLCanvasElement,
  pesoMaximoBytes: number,
): Promise<{ blob: Blob | null; tamanhoBytes: number; dentroDoLimite: boolean; qualidade: number }> {
  return new Promise((resolve) => {
    let qualidade = 0.92;
    const tentar = () => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve({ blob: null, tamanhoBytes: 0, dentroDoLimite: false, qualidade });
          return;
        }
        if (blob.size <= pesoMaximoBytes || qualidade <= 0.4) {
          resolve({ blob, tamanhoBytes: blob.size, dentroDoLimite: blob.size <= pesoMaximoBytes, qualidade });
        } else {
          qualidade = Math.round((qualidade - 0.1) * 100) / 100;
          tentar();
        }
      }, 'image/jpeg', qualidade);
    };
    tentar();
  });
}

export function baixarBlob(blob: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

/** Clampa um valor (ex: largura/altura do modo Livre) a um máximo, nunca deixando passar da resolução máxima da spec. */
export function clamp(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}

/** Calcula largura×altura de uma seção do carrossel a partir da proporção e de uma largura-base, sempre dentro da resolução máxima. */
export function dimensaoCarrossel(proporcao: Proporcao, larguraBase: number, alturaLivre?: number): { largura: number; altura: number } {
  const max = SPEC_CARROSSEL.resolucaoMaxima;
  if (proporcao === 'livre') {
    return { largura: clamp(larguraBase, 200, max), altura: clamp(alturaLivre ?? larguraBase, 200, max) };
  }
  const ratio = RATIO_CARROSSEL[proporcao];
  const largura = clamp(larguraBase, 200, max);
  const altura = clamp(largura / ratio, 200, max);
  return { largura: Math.round(largura), altura: Math.round(altura) };
}

export function baixarCanvasComoPng(canvas: HTMLCanvasElement, nomeArquivo: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

export function getLogoAtual(): LogoAtual | null {
  return readJson<LogoAtual | null>(LOGO_ATUAL_KEY, null);
}
export function salvarLogoAtual(logo: LogoAtual): void {
  writeJson(LOGO_ATUAL_KEY, logo);
}

function creditosIniciais(): number {
  const num = Number(CREDITOS.replace(/\D/g, ''));
  return Number.isFinite(num) && num > 0 ? num : 0;
}

export function getCreditosMock(): number {
  return readJson<number>(CREDITOS_MOCK_KEY, creditosIniciais());
}
export function descontarCreditosMock(qtd: number): number {
  const atual = getCreditosMock();
  const novo = Math.max(0, atual - qtd);
  writeJson(CREDITOS_MOCK_KEY, novo);
  return novo;
}

/** Substitui {comprador} e {produto} na mensagem-base da etiqueta. */
export function preencherMensagemEtiqueta(mensagem: string, comprador: string, produto: string): string {
  return mensagem.replaceAll('{comprador}', comprador).replaceAll('{produto}', produto);
}
