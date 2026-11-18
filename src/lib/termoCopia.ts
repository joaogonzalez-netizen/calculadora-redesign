// Termo de responsabilidade da cópia de anúncios (extensão do Finder).
//
// Copiar fotos, descrições e atributos de outro vendedor pode banir a conta do
// mentorado na Shopee e no Mercado Livre. Toda cópia exige o aceite do termo e
// cada aceite vira uma linha no log abaixo (usuário, data/hora, anúncio copiado).
//
// O aceite é o primeiro passo da "Revisar cópia" no Seller (a extensão só copia).
// O log é append-only. Com a extensão e o Seller reais, a gravação vira um POST
// pra API e o log passa a morar no servidor: o formato de AceiteCopia é o contrato.

export const LOG_ACEITE_COPIA_KEY = 'stlseller_log_aceite_copia';
// Muda quando o texto do termo muda; cada aceite guarda a versão que foi lida.
export const TERMO_COPIA_VERSAO = '2026-11-v1';

export interface AceiteCopia {
  id: string;
  usuario: string;
  aceitoEm: string; // ISO 8601, UTC
  termoVersao: string;
  idioma: 'pt' | 'es' | 'en';
  anuncioTitulo: string;
  anuncioOrigemUrl: string;
  marketplaceOrigem: 'shopee';
}

// Mesmo usuário simulado da página da extensão (STLSeller ainda não tem login).
export const USUARIO_SIMULADO = 'joao.gonzalez@stlflix.com';

export function getLogAceitesCopia(): AceiteCopia[] {
  try {
    const raw = localStorage.getItem(LOG_ACEITE_COPIA_KEY);
    const lista = raw ? JSON.parse(raw) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export function getAceiteCopia(id: string | null | undefined): AceiteCopia | null {
  return id ? getLogAceitesCopia().find((a) => a.id === id) ?? null : null;
}

/** Grava o aceite no log e devolve o registro (o rascunho guarda só o id). */
export function registrarAceiteCopia(dados: Omit<AceiteCopia, 'id' | 'aceitoEm' | 'termoVersao' | 'usuario'>): AceiteCopia {
  const aceite: AceiteCopia = {
    ...dados,
    id: 'aceite-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    usuario: USUARIO_SIMULADO,
    aceitoEm: new Date().toISOString(),
    termoVersao: TERMO_COPIA_VERSAO,
  };
  // Se o storage falhar o aceite não existe: quem chama não pode seguir como se existisse.
  localStorage.setItem(LOG_ACEITE_COPIA_KEY, JSON.stringify([aceite, ...getLogAceitesCopia()]));
  return aceite;
}
