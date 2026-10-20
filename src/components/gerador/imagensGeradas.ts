// Imagens mockadas que a IA gera no passo "Imagens" e que o passo "Vídeo"
// reaproveita: 4 cenas já preparadas para o vídeo + 5 outras imagens que podem
// entrar no lugar de uma cena. As 4 imagens fixas (capa, medidas,
// características e detalhe) nunca entram na escolha do vídeo.
export const MAX_CENAS_VIDEO = 4;

export interface ImagemGerada {
  id: string;
  // Chave de i18n; nas cenas é só o número do "Ambiente".
  label: string;
  gradiente: string;
}

export const CENAS_VIDEO: ImagemGerada[] = [
  { id: 'cena1', label: '1', gradiente: 'linear-gradient(160deg,#efe6d8,#d9c7a3)' },
  { id: 'cena2', label: '2', gradiente: 'linear-gradient(160deg,#e9eee6,#cddac6)' },
  { id: 'cena3', label: '3', gradiente: 'linear-gradient(160deg,#dde6ee,#b8c9d8)' },
  { id: 'cena4', label: '4', gradiente: 'linear-gradient(160deg,#e6dfd3,#c4b79c)' },
];

export const OUTRAS_IMAGENS: ImagemGerada[] = [
  { id: 'uso1', label: 'gerador.imgAmbientadaUso1', gradiente: 'linear-gradient(160deg,#f1e8da,#dccaa6)' },
  { id: 'uso2', label: 'gerador.imgAmbientadaUso2', gradiente: 'linear-gradient(160deg,#ebefe8,#d0dcc9)' },
  { id: 'uso3', label: 'gerador.imgAmbientadaUso3', gradiente: 'linear-gradient(160deg,#f4f1ea,#e3ddca)' },
  { id: 'destaque', label: 'gerador.imgDestaqueBeneficio', gradiente: 'linear-gradient(160deg,#efe0cd,#d6b98c)' },
  { id: 'hero', label: 'gerador.imgHeroCenaFinal', gradiente: 'linear-gradient(160deg,#e8e3da,#c9beac)' },
];

export const SELECAO_INICIAL_VIDEO = new Set(CENAS_VIDEO.map((c) => c.id));
