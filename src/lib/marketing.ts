// Menu Marketing (Logo, Banners, Etiquetas) — v1 mockada, sem IA/backend real,
// no mesmo espírito do Gerador de anúncios. Geração é determinística no client
// (SVG/canvas), mas o arquivo final baixado é real (PNG de verdade).
// Ver docs/spec-marketing-leigos.md.
import { readJson, writeJson } from './storage';
import { CREDITOS } from './dashboardMock';

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
}

export interface LogoAtual {
  nomeLoja: string;
  variacao: LogoVariacao;
}

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
export const CUSTO_CREDITOS: Record<'logo' | 'banner' | 'etiquetas', number> = {
  logo: 10,
  banner: 10,
  etiquetas: 5,
};

// Dimensões de referência (não oficiais — ver Seção 4.2 da spec).
export const DIMENSOES_BANNER: Record<Plataforma, { largura: number; altura: number }> = {
  shopee: { largura: 2020, altura: 500 },
  'mercado-livre': { largura: 1140, altura: 220 },
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
) {
  const { largura, altura } = DIMENSOES_BANNER[plataforma];
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const corFundo = logo?.variacao.cor ?? CORES_LOGO[seedNumerico(nomeLoja || 'stlseller') % CORES_LOGO.length];
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
