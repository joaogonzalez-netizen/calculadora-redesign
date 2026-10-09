// Rascunhos de anúncios copiados da Shopee pela extensão do Chrome.
//
// A extensão ainda não existe: a página de protótipo em
// public/_mock/copiar-anuncio-shopee.html grava o rascunho aqui (mesma
// origem, localStorage) e abre o STLSeller. Quando a extensão real existir,
// ela troca esta gravação por uma chamada de API — o resto do fluxo (lista em
// Meus anúncios → Gerador de anúncios) continua igual.

export interface RascunhoShopee {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoria: string;
  atributos: { nome: string; valor: string }[];
  imagens: string[]; // URLs das imagens originais do anúncio copiado
  origemUrl: string;
  criadoEm: number;
  // Escolhido na extensão na hora de copiar (é a única escolha sobre as imagens):
  //  'copia' = só copiar → revisa imagens e informações e publica com as imagens originais, sem IA;
  //  'ia'    = copiar e criar com IA → Gerador completo (textos e imagens novos, consome créditos).
  // Rascunhos antigos, sem o campo, contam como 'ia'.
  modo?: ModoCopia;
}

export type ModoCopia = 'copia' | 'ia';

export function modoDoRascunho(r: RascunhoShopee | null | undefined): ModoCopia {
  return r?.modo === 'copia' ? 'copia' : 'ia';
}

export function setModoRascunho(id: string, modo: ModoCopia) {
  saveRascunhosShopee(getRascunhosShopee().map((r) => (r.id === id ? { ...r, modo } : r)));
}

export const RASCUNHOS_SHOPEE_KEY = 'stlseller_rascunhos_shopee';
// Parâmetro de URL usado pela extensão pra abrir o STLSeller já na tela certa.
export const PARAM_ABRIR = 'abrir';

export function getRascunhosShopee(): RascunhoShopee[] {
  try {
    const raw = localStorage.getItem(RASCUNHOS_SHOPEE_KEY);
    const lista = raw ? JSON.parse(raw) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export function saveRascunhosShopee(lista: RascunhoShopee[]) {
  try { localStorage.setItem(RASCUNHOS_SHOPEE_KEY, JSON.stringify(lista)); } catch { /* storage indisponível */ }
}

export function excluirRascunhoShopee(id: string) {
  saveRascunhosShopee(getRascunhosShopee().filter((r) => r.id !== id));
}

export function ehUrlDeImagem(v: string) {
  return /^(https?:)?\/|^data:image\//.test(v);
}

/** Valor pronto pra `background` de um thumb: URL vira imagem, o resto (cor/gradiente) fica como está. */
export function fundoDeImagem(v: string) {
  return ehUrlDeImagem(v) ? `center / cover no-repeat url("${v}")` : v;
}

export function getRascunhoShopee(id: string | null | undefined): RascunhoShopee | null {
  return id ? getRascunhosShopee().find((r) => r.id === id) ?? null : null;
}

/** Campos do passo "Informações" do Gerador que dá pra preencher a partir do anúncio copiado. */
export function infoDoRascunho(r: RascunhoShopee): Record<string, string> {
  const attr = (nome: string) => r.atributos.find((a) => a.nome.toLowerCase() === nome.toLowerCase())?.valor ?? '';
  const linha = (re: RegExp) => r.descricao.match(re)?.[1]?.trim() ?? '';
  const material = linha(/Material:\s*([A-Za-z0-9]+)/i) || attr('Material');
  return {
    nome: r.titulo,
    contexto: r.descricao,
    ...(material ? { material } : {}),
    ...(linha(/Cor:\s*(.+)/i) ? { corConfirmada: linha(/Cor:\s*(.+)/i) } : {}),
    ...(attr('Quantidade da embalagem') ? { itensInclusos: attr('Quantidade da embalagem') } : {}),
    ...(linha(/Compatibilidade:\s*(.+)/i) ? { compatibilidade: linha(/Compatibilidade:\s*(.+)/i) } : {}),
  };
}
