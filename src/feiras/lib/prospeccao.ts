export interface Lugar {
  placeId: string;
  nome: string;
  endereco: string;
  bairro: string;
  telefone: string;
  site: string;
  nota: number;
  avaliacoes: number;
  aberto: boolean | null;
  tipo: string;
  mapsUrl: string;
}

export interface Busca { termo: string; local: string }

const CHAVE = import.meta.env.VITE_GOOGLE_PLACES_KEY as string | undefined;
export const usandoMock = !CHAVE;

const mapsUrl = (id: string) => `https://www.google.com/maps/place/?q=place_id:${id}`;

/** Dados fictícios (nomes, telefones e endereços inventados) para validar a tela sem chave do Google. */

const BASE: { id: string; nome: string; rua: string; bairro: string; tel: string; site: string; nota: number; n: number; aberto: boolean | null; tipo: string }[] = [
  { id: 'mock-01', nome: 'Casa dos Presentes Aurora', rua: 'Rua do Príncipe, 412', bairro: 'Centro', tel: '(47) 3422-1180', site: 'casadospresentesaurora.com.br', nota: 4.7, n: 312, aberto: true, tipo: 'Loja de presentes' },
  { id: 'mock-02', nome: 'Floricultura Jardim das Cores', rua: 'Av. Getúlio Vargas, 1150', bairro: 'Anita Garibaldi', tel: '(47) 99182-4410', site: '', nota: 4.8, n: 540, aberto: true, tipo: 'Floricultura' },
  { id: 'mock-03', nome: 'Empório Presente Certo', rua: 'Rua Visconde de Taunay, 88', bairro: 'América', tel: '(47) 3433-7721', site: 'emporiopresentecerto.com.br', nota: 4.5, n: 127, aberto: true, tipo: 'Loja de presentes' },
  { id: 'mock-04', nome: 'Buquê & Cia Boutique de Flores', rua: 'Rua Dr. João Colin, 2300', bairro: 'Saguaçu', tel: '(47) 99703-5521', site: 'buqueecia.com.br', nota: 4.9, n: 218, aberto: false, tipo: 'Floricultura' },
  { id: 'mock-05', nome: 'Mimos e Mais Presentes', rua: 'Rua Blumenau, 650', bairro: 'Atiradores', tel: '(47) 3425-9090', site: '', nota: 4.3, n: 96, aberto: true, tipo: 'Loja de presentes' },
  { id: 'mock-06', nome: 'Ateliê Flor de Lis', rua: 'Rua Max Colin, 305', bairro: 'América', tel: '(47) 99611-0834', site: 'atelieflordelis.com.br', nota: 4.9, n: 74, aberto: true, tipo: 'Floricultura e decoração' },
  { id: 'mock-07', nome: 'Cesta Cheia Presentes', rua: 'Av. Santos Dumont, 3010', bairro: 'Aventureiro', tel: '(47) 3466-2255', site: 'cestacheia.com.br', nota: 4.4, n: 189, aberto: true, tipo: 'Cestas e presentes' },
  { id: 'mock-08', nome: 'Raízes Floricultura', rua: 'Rua Itaiópolis, 1180', bairro: 'Glória', tel: '(47) 99144-7782', site: '', nota: 4.6, n: 161, aberto: true, tipo: 'Floricultura' },
  { id: 'mock-09', nome: 'Gift Store Joinville', rua: 'Rua Nove de Março, 75', bairro: 'Centro', tel: '(47) 3029-4417', site: 'giftstorejoinville.com.br', nota: 4.1, n: 58, aberto: true, tipo: 'Loja de presentes' },
  { id: 'mock-10', nome: 'Papelaria & Presentes Lume', rua: 'Rua Quinze de Novembro, 920', bairro: 'Bom Retiro', tel: '(47) 3433-0608', site: 'papelarialume.com.br', nota: 4.6, n: 233, aberto: true, tipo: 'Papelaria e presentes' },
  { id: 'mock-11', nome: 'Flor de Sal Decoração e Presentes', rua: 'Rua Gothard Kaesemodel, 640', bairro: 'Costa e Silva', tel: '(47) 99877-3319', site: '', nota: 4.7, n: 41, aberto: null, tipo: 'Decoração e presentes' },
  { id: 'mock-12', nome: 'Sabor de Mimo Cestas', rua: 'Rua Rio Grande do Sul, 210', bairro: 'Boa Vista', tel: '', site: 'sabordemimo.com.br', nota: 4.2, n: 33, aberto: true, tipo: 'Cestas e presentes' },
  { id: 'mock-13', nome: 'Universo Geek Presentes', rua: 'Rua Orestes Guimarães, 1450', bairro: 'América', tel: '(47) 3422-6603', site: 'universogeekpresentes.com.br', nota: 4.8, n: 402, aberto: true, tipo: 'Presentes criativos' },
  { id: 'mock-14', nome: 'Canto da Rosa Floricultura', rua: 'Rua Ottokar Doerffel, 902', bairro: 'Atiradores', tel: '(47) 99256-1043', site: '', nota: 3.9, n: 22, aberto: false, tipo: 'Floricultura' },
];

const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Busca de lugares. Com VITE_GOOGLE_PLACES_KEY usa a Places API (New); sem ela, devolve os dados fictícios. */
export async function buscarLugares({ termo, local }: Busca): Promise<Lugar[]> {
  if (CHAVE) return buscarGoogle(`${termo} em ${local}`);
  await new Promise((r) => setTimeout(r, 700));
  const cidade = local.split(',')[0].trim() || 'Joinville';
  const uf = (local.split(',')[1] ?? ' SC').trim().toUpperCase();
  const t = semAcento(termo);
  const quer = (tipo: string) => !t || t.split(/\s+/).some((w) => w.length > 3 && semAcento(tipo).includes(w.replace(/s$/, '')));
  // "flores" e "presentes" cobrem quase todo o conjunto; termos sem relação não trazem nada.
  const lista = BASE.filter((b) => quer(b.tipo) || quer(b.nome) || /presente|flor|cesta|decor/.test(t));
  return lista.map((b) => ({
    placeId: b.id, nome: b.nome, endereco: `${b.rua} - ${b.bairro}, ${cidade} - ${uf}`, bairro: b.bairro, telefone: b.tel, site: b.site ? 'https://' + b.site : '',
    nota: b.nota, avaliacoes: b.n, aberto: b.aberto, tipo: b.tipo, mapsUrl: mapsUrl(b.id),
  }));
}

interface PlaceApi {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  currentOpeningHours?: { openNow?: boolean };
  primaryTypeDisplayName?: { text: string };
  googleMapsUri?: string;
}

/** Places API (New) · Text Search. Até 3 páginas de 20. Ainda não testada contra a API real. */
async function buscarGoogle(consulta: string): Promise<Lugar[]> {
  const campos = 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.currentOpeningHours.openNow,places.primaryTypeDisplayName,places.googleMapsUri,nextPageToken';
  const saida: Lugar[] = [];
  let token: string | undefined;
  for (let pag = 0; pag < 3; pag++) {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': CHAVE!, 'X-Goog-FieldMask': campos },
      body: JSON.stringify({ textQuery: consulta, languageCode: 'pt-BR', regionCode: 'BR', pageSize: 20, ...(token ? { pageToken: token } : {}) }),
    });
    if (!r.ok) throw new Error(`Google Places respondeu ${r.status}`);
    const j = (await r.json()) as { places?: PlaceApi[]; nextPageToken?: string };
    for (const p of j.places ?? []) {
      const end = p.formattedAddress ?? '';
      saida.push({
        placeId: p.id, nome: p.displayName?.text ?? '', endereco: end, bairro: end.split(' - ')[1]?.split(',')[0] ?? '', telefone: p.nationalPhoneNumber ?? '',
        site: p.websiteUri ?? '', nota: p.rating ?? 0, avaliacoes: p.userRatingCount ?? 0, aberto: p.currentOpeningHours?.openNow ?? null,
        tipo: p.primaryTypeDisplayName?.text ?? '', mapsUrl: p.googleMapsUri ?? mapsUrl(p.id),
      });
    }
    token = j.nextPageToken;
    if (!token) break;
  }
  return saida;
}
