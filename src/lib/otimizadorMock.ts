// Mock do "Otimizador de anúncios com IA" — hoje gera sugestões determinísticas
// (por hash do id do produto) a partir dos dados que já temos do anúncio (título,
// descrição, preço, imagens). Sem backend: pronto pra trocar por uma chamada real
// de IA depois, mantendo a mesma interface (gerarSugestoes/notaGeral).
import type { Produto } from './produtosMock';

export type CategoriaOtimizacao = 'titulo' | 'descricao' | 'preco' | 'imagem';

export interface SugestaoOtimizacao {
  categoria: CategoriaOtimizacao;
  label: string;
  problema: string;
  sugestao: string;
  impacto: string;
}

const POOL_TITULO = [
  { problema: 'Título genérico, sem palavras-chave de busca.', sugestao: 'Inclua material, tamanho e uso — ex: "{nome} em PLA, 12cm".', impacto: '+18% cliques est.' },
  { problema: 'Título não destaca o diferencial da peça.', sugestao: 'Coloque o que torna a peça única logo nas primeiras palavras.', impacto: '+9% cliques est.' },
  { problema: 'Título curto demais pra ranquear bem no marketplace.', sugestao: 'Aproveite os caracteres disponíveis com termos que compradores buscam.', impacto: '+14% cliques est.' },
];

const POOL_DESCRICAO = [
  { problema: 'Descrição não responde dúvidas comuns (tamanho, cuidados, prazo).', sugestao: 'Adicione uma seção de perguntas frequentes direto na descrição.', impacto: '-22% perguntas no chat' },
  { problema: 'Descrição não menciona dimensões nem peso exatos.', sugestao: 'Liste medidas em cm — reduz devolução por expectativa errada.', impacto: '-15% devoluções' },
  { problema: 'Descrição curta, com pouco contexto sobre a peça.', sugestao: 'Conte o contexto de uso e sugestões de presente — aumenta tempo na página.', impacto: '+7% conversão' },
];

const POOL_PRECO = [
  { problema: 'Preço acima da média de anúncios parecidos no canal.', sugestao: 'Considere ajustar em até 8% ou reforçar o diferencial no título.', impacto: '+11% competitividade' },
  { problema: 'Sem desconto configurado pra Pix.', sugestao: 'Ative desconto Pix — o selo aparece destacado na busca do marketplace.', impacto: '+6% conversão' },
  { problema: 'Preço redondo, sem ancoragem psicológica de valor.', sugestao: 'Teste terminar o preço em ,90 em vez de um valor fechado.', impacto: '+3% conversão' },
];

const POOL_IMAGEM = [
  { problema: 'Poucas fotos — anúncios com mais imagens convertem mais.', sugestao: 'Adicione uma foto de escala (com objeto de referência) e uma de detalhe.', impacto: '+13% conversão' },
  { problema: 'Nenhuma foto mostra a peça em uso.', sugestao: 'Inclua ao menos 1 imagem de contexto/lifestyle com o produto em uso.', impacto: '+10% conversão' },
  { problema: 'A foto de capa não é a mais nítida do conjunto.', sugestao: 'Troque a capa pela imagem com melhor luz e fundo neutro.', impacto: '+8% cliques est.' },
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function gerarSugestoes(p: Produto): SugestaoOtimizacao[] {
  const h = hashId(p.id);
  const titulo = POOL_TITULO[h % POOL_TITULO.length];
  const descricao = POOL_DESCRICAO[(h >> 2) % POOL_DESCRICAO.length];
  const preco = POOL_PRECO[(h >> 4) % POOL_PRECO.length];
  const imagem = p.imagensQtd < 5 ? POOL_IMAGEM[0] : POOL_IMAGEM[(h >> 6) % POOL_IMAGEM.length];

  return [
    { categoria: 'titulo', label: 'Título', ...titulo, sugestao: titulo.sugestao.replace('{nome}', p.nome) },
    { categoria: 'descricao', label: 'Descrição', ...descricao },
    { categoria: 'preco', label: 'Preço', ...preco },
    { categoria: 'imagem', label: 'Imagens', ...imagem },
  ];
}

/** 52–91: variado por produto, mas sempre no mesmo produto retorna o mesmo valor. */
export function notaGeral(p: Produto): number {
  return 52 + (hashId(p.id) % 40);
}
