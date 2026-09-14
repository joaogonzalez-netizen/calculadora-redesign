// Progresso do checklist "Primeiros passos". Os 5 passos só marcam "feito"
// numa ação deliberada do usuário — nunca a partir de dado de mock/seed que
// já vem pré-carregado (10 cálculos de exemplo no histórico, marketplaces já
// "conectados" por padrão em Configurações). Por isso os 5 ficam nesse mesmo
// flag manual, gravado no clique real de cada ação (salvar cálculo, conectar
// marketplace, marcar o vídeo como assistido, ou o CTA — hoje "em breve" —
// de Buscador/Gerador).
import { readJson, writeJson } from './storage';

export const ONBOARDING_MANUAL_KEY = 'stlseller_onboarding_manual';
export const MARKETPLACES_CONECTADOS_KEY = 'stlseller_marketplaces_conectados';

export interface OnboardingManual {
  buscador: boolean;
  gerador: boolean;
  calculadora: boolean;
  marketplace: boolean;
  video: boolean;
}

const PADRAO: OnboardingManual = { buscador: false, gerador: false, calculadora: false, marketplace: false, video: false };

export function getOnboardingManual(): OnboardingManual {
  return { ...PADRAO, ...readJson<Partial<OnboardingManual>>(ONBOARDING_MANUAL_KEY, {}) };
}

export function marcarOnboardingManual(chave: keyof OnboardingManual, valor = true): void {
  const atual = getOnboardingManual();
  writeJson(ONBOARDING_MANUAL_KEY, { ...atual, [chave]: valor });
}
