// Mock do "Reportar item" do Buscador (Finder). Sem backend: tudo em localStorage,
// no mesmo padrão dos favoritos. Em produção o report vai pra API e o e-mail do
// moderador vem da sessão; aqui ele é simulado (ver emailLogado).

import { USUARIO } from './dashboardMock';
import { PRODUTOS_BUSCA } from './buscadorMock';
import { readJson, writeJson } from './storage';

export const FINDER_REPORTS_KEY = 'stlseller_finder_reports';
export const FINDER_REPORTS_SEEDED_KEY = 'stlseller_finder_reports_seeded';
/** Override do e-mail logado, só pra testar o bloqueio do menu no mock. */
export const MOCK_EMAIL_KEY = 'stlseller_mock_email';

/** Única conta que enxerga o menu "Reports do Finder" (login de alterações em prod). */
export const EMAIL_MODERADOR = 'vendedor@teste.com';
/** Limite de reports por seller por dia. */
export const LIMITE_REPORTS_DIA = 10;
export const MAX_TEXTO_REPORT = 200;

export type MotivoReport = 'nao3d' | 'categoria' | 'outro';
export type StatusReport = 'aberto' | 'aprovado' | 'recusado';

export interface FinderReport {
  id: string;
  produtoId: string;
  sellerId: string;
  sellerNome: string;
  motivo: MotivoReport;
  categoriaSugerida?: string;
  categoriaEscolhida?: string;
  texto?: string;
  status: StatusReport;
  decididoPor?: string;
  decididoEm?: number;
  criadoEm: number;
}

// PLACEHOLDER: a taxonomia real do Finder ainda não está neste repo. Trocar pela
// lista oficial quando for confirmada (a UI só consome CATEGORIAS_FINDER).
export const CATEGORIAS_FINDER = [
  'Decoração',
  'Vasos e plantas',
  'Organizadores',
  'Escritório',
  'Luminárias',
  'Suportes',
  'Joias e acessórios',
  'Brinquedos e jogos',
  'Chaveiros',
  'Outros',
] as const;

const PALAVRAS_CHAVE: Record<string, string[]> = {
  'Vasos e plantas': ['vaso', 'planta', 'cachepot', 'vasinho'],
  Organizadores: ['organizador', 'porta', 'suporte de cabos'],
  Escritório: ['escritório', 'mesa', 'caneta', 'pincéis', 'cabos'],
  Luminárias: ['luminária', 'led', 'lua', 'relógio'],
  Suportes: ['suporte', 'articulado', 'celular', 'tablet'],
  'Joias e acessórios': ['joia', 'joias'],
  'Brinquedos e jogos': ['quebra-cabeça', 'engrenagens', 'jogo'],
  Chaveiros: ['chaveiro'],
  Decoração: ['decorativ', 'decoração', 'espiral', 'moderno'],
};

/** As 3 categorias mais prováveis pro nome do item (regra simples por palavra-chave). */
export function sugerirCategorias(nome: string): string[] {
  const n = nome.toLowerCase();
  const pontos = Object.entries(PALAVRAS_CHAVE)
    .map(([cat, palavras]) => [cat, palavras.filter((p) => n.includes(p)).length] as const)
    .filter(([, pts]) => pts > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);
  const fallback = ['Decoração', 'Organizadores', 'Outros'];
  return [...new Set([...pontos, ...fallback])].slice(0, 3);
}

export function emailLogado(): string {
  return readJson<string>(MOCK_EMAIL_KEY, EMAIL_MODERADOR);
}

export function ehModerador(): boolean {
  return emailLogado().toLowerCase() === EMAIL_MODERADOR;
}

export function lerReports(): FinderReport[] {
  seedReportsExemplo();
  return readJson<FinderReport[]>(FINDER_REPORTS_KEY, []);
}

function gravar(reports: FinderReport[]) {
  writeJson(FINDER_REPORTS_KEY, reports);
}

function inicioDoDia(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function reportsRestantesHoje(sellerId: string, agora = Date.now()): number {
  const hoje = inicioDoDia(agora);
  const usados = lerReports().filter((r) => r.sellerId === sellerId && r.criadoEm >= hoje).length;
  return Math.max(0, LIMITE_REPORTS_DIA - usados);
}

export function jaReportou(sellerId: string, produtoId: string): boolean {
  return lerReports().some((r) => r.sellerId === sellerId && r.produtoId === produtoId && r.status !== 'recusado');
}

export type ResultadoReport = { ok: true; report: FinderReport } | { ok: false; erro: 'limite' | 'duplicado' | 'texto' };

export interface NovoReport {
  produtoId: string;
  motivo: MotivoReport;
  categoriaSugerida?: string;
  categoriaEscolhida?: string;
  texto?: string;
}

export function criarReport(novo: NovoReport, agora = Date.now()): ResultadoReport {
  const sellerId = USUARIO.id;
  if (novo.motivo === 'outro' && !novo.texto?.trim()) return { ok: false, erro: 'texto' };
  if (jaReportou(sellerId, novo.produtoId)) return { ok: false, erro: 'duplicado' };
  if (reportsRestantesHoje(sellerId, agora) === 0) return { ok: false, erro: 'limite' };
  const report: FinderReport = {
    id: `rp-${agora}-${novo.produtoId}`,
    produtoId: novo.produtoId,
    sellerId,
    sellerNome: USUARIO.nome,
    motivo: novo.motivo,
    categoriaSugerida: novo.categoriaSugerida,
    categoriaEscolhida: novo.categoriaEscolhida,
    texto: novo.texto?.trim().slice(0, MAX_TEXTO_REPORT) || undefined,
    status: 'aberto',
    criadoEm: agora,
  };
  gravar([report, ...lerReports()]);
  return { ok: true, report };
}

/** Aprovar: "não é 3D" e "outro" mandam o item pra lista negra (some pra todos,
 * como o botão excluir); "categoria errada" aplica a categoria escolhida. */
export function decidirReport(id: string, status: 'aprovado' | 'recusado', categoriaFinal?: string, agora = Date.now()) {
  gravar(
    lerReports().map((r) =>
      r.id === id
        ? { ...r, status, categoriaEscolhida: categoriaFinal ?? r.categoriaEscolhida, decididoPor: emailLogado(), decididoEm: agora }
        : r,
    ),
  );
}

/** Item na lista negra: report aprovado que não é de categoria. */
export function idsListaNegra(reports: FinderReport[] = lerReports()): Set<string> {
  return new Set(reports.filter((r) => r.status === 'aprovado' && r.motivo !== 'categoria').map((r) => r.produtoId));
}

/** Itens que somem da busca deste seller: os que ele reportou e ainda não foram
 * recusados, mais a lista negra global. Recusado = o item volta. */
export function idsOcultosPara(sellerId: string, reports: FinderReport[] = lerReports()): Set<string> {
  const ocultos = idsListaNegra(reports);
  for (const r of reports) if (r.sellerId === sellerId && r.status !== 'recusado') ocultos.add(r.produtoId);
  return ocultos;
}

/** Categoria vigente de um item após reports de categoria aprovados (mais recente vence). */
export function categoriaAprovada(produtoId: string, reports: FinderReport[] = lerReports()): string | undefined {
  return reports
    .filter((r) => r.produtoId === produtoId && r.status === 'aprovado' && r.motivo === 'categoria')
    .sort((a, b) => (b.decididoEm ?? 0) - (a.decididoEm ?? 0))[0]?.categoriaEscolhida;
}

/** Exemplos de outros sellers pra a tela de moderação não nascer vazia. */
function seedReportsExemplo() {
  if (readJson<boolean>(FINDER_REPORTS_SEEDED_KEY, false)) return;
  writeJson(FINDER_REPORTS_SEEDED_KEY, true);
  const agora = Date.now();
  const h = 3600_000;
  const p = (i: number) => PRODUTOS_BUSCA[i]?.id ?? 'b1';
  const exemplos: FinderReport[] = [
    { id: 'rp-seed-1', produtoId: p(3), sellerId: 'mariana-lima', sellerNome: 'Mariana Lima', motivo: 'nao3d', texto: 'Parece um relógio comum, sem peça impressa.', status: 'aberto', criadoEm: agora - 2 * h },
    { id: 'rp-seed-2', produtoId: p(8), sellerId: 'carlos-souza', sellerNome: 'Carlos Souza', motivo: 'categoria', categoriaSugerida: 'Suportes', categoriaEscolhida: 'Escritório', status: 'aberto', criadoEm: agora - 5 * h },
    { id: 'rp-seed-3', produtoId: p(10), sellerId: 'ana-ribeiro', sellerNome: 'Ana Ribeiro', motivo: 'outro', texto: 'Foto não bate com o nome do anúncio.', status: 'aberto', criadoEm: agora - 26 * h },
    { id: 'rp-seed-4', produtoId: p(6), sellerId: 'pedro-alves', sellerNome: 'Pedro Alves', motivo: 'nao3d', status: 'recusado', decididoPor: EMAIL_MODERADOR, decididoEm: agora - 20 * h, criadoEm: agora - 48 * h },
  ];
  gravar(exemplos);
}
