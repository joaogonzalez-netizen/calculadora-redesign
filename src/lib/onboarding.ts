// Progresso do checklist "Primeiros passos". Buscador de produtos e Gerador de
// anúncios ainda não existem de verdade (telas "Em breve"), então marcamos
// esses dois manualmente quando o usuário clica no CTA do passo — o mesmo
// clique que hoje já cai num alert de "em breve" nesses recursos. Calculadora
// e Conectar marketplace já têm sinal real (histórico salvo / marketplace
// conectado), então são sempre derivados, nunca marcados à mão.
import { readJson, writeJson } from './storage';

export const ONBOARDING_MANUAL_KEY = 'stlseller_onboarding_manual';
export const MARKETPLACES_CONECTADOS_KEY = 'stlseller_marketplaces_conectados';

export interface OnboardingManual {
  buscador: boolean;
  gerador: boolean;
}

export function getOnboardingManual(): OnboardingManual {
  return readJson<OnboardingManual>(ONBOARDING_MANUAL_KEY, { buscador: false, gerador: false });
}

export function marcarOnboardingManual(chave: keyof OnboardingManual): void {
  const atual = getOnboardingManual();
  writeJson(ONBOARDING_MANUAL_KEY, { ...atual, [chave]: true });
}

export function getMarketplaceConectado(): boolean {
  const conexoes = readJson<Record<string, boolean>>(MARKETPLACES_CONECTADOS_KEY, {});
  return Object.values(conexoes).some(Boolean);
}
