// Progresso do checklist "Primeiros passos". Os passos só marcam "feito" numa
// ação deliberada do usuário, nunca a partir de dado de mock/seed que já vem
// pré-carregado (10 cálculos de exemplo no histórico, marketplaces já
// "conectados" por padrão em Configurações). Por isso Calculadora, Gerador e
// Marketplace usam um flag gravado no clique real de cada ação (salvar cálculo,
// salvar/publicar anúncio, conectar marketplace). O Buscador é lido direto dos
// favoritos (que nascem vazios), como a produção lê "ao menos 1 favorito".
//
// Duas regras seguem a produção:
// - o "assistido" do vídeo é guardado por usuário;
// - a conclusão do checklist é gravada uma vez e o menu não volta mais.
import { readJson, writeJson, BUSCADOR_FAVORITOS_KEY } from './storage';
import { USUARIO } from './dashboardMock';

export const ONBOARDING_MANUAL_KEY = 'stlseller_onboarding_manual';
export const ONBOARDING_VIDEO_KEY = `stlseller_onboarding_video_${USUARIO.id}`;
export const ONBOARDING_CONCLUIDO_KEY = `stlseller_onboarding_concluido_${USUARIO.id}`;
export const MARKETPLACES_CONECTADOS_KEY = 'stlseller_marketplaces_conectados';

export interface OnboardingManual {
  buscador: boolean;
  gerador: boolean;
  calculadora: boolean;
  marketplace: boolean;
  video: boolean;
}

type PassoManual = 'gerador' | 'calculadora' | 'marketplace';

const PADRAO: Record<PassoManual, boolean> = { gerador: false, calculadora: false, marketplace: false };

export function getOnboardingManual(): OnboardingManual {
  const manual = { ...PADRAO, ...readJson<Partial<Record<PassoManual, boolean>>>(ONBOARDING_MANUAL_KEY, {}) };
  const favoritos = readJson<unknown[]>(BUSCADOR_FAVORITOS_KEY, []);
  return {
    ...manual,
    buscador: Array.isArray(favoritos) && favoritos.length > 0,
    video: readJson<boolean>(ONBOARDING_VIDEO_KEY, false) === true,
  };
}

export function marcarOnboardingManual(chave: PassoManual | 'video', valor = true): void {
  if (chave === 'video') {
    writeJson(ONBOARDING_VIDEO_KEY, valor);
    return;
  }
  writeJson(ONBOARDING_MANUAL_KEY, { ...readJson<Partial<Record<PassoManual, boolean>>>(ONBOARDING_MANUAL_KEY, {}), [chave]: valor });
}

/** O maker já concluiu a tela? Gravado uma vez, nunca volta a "pendente". */
export function onboardingConcluido(): boolean {
  return readJson<boolean>(ONBOARDING_CONCLUIDO_KEY, false) === true;
}

export function marcarOnboardingConcluido(): void {
  writeJson(ONBOARDING_CONCLUIDO_KEY, true);
}
