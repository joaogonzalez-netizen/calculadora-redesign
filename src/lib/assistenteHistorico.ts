// Histórico do Assistente: as últimas conversas ficam no localStorage pra o
// maker reabrir de onde parou. Guarda só as perguntas e qual resposta cada uma
// recebeu (perguntaId) — o texto da resposta é remontado na hora a partir dos
// dados mock, então sai no idioma atual e com os números atualizados.
import { readJson } from './storage';
import type { PerguntaId } from './assistenteRespostas';

export const ASSIST_HISTORICO_KEY = 'stlseller_assistente_conversas';
export const MAX_CONVERSAS = 5;

export interface MensagemSalva {
  id: number;
  autor: 'usuario' | 'assistente';
  texto?: string; // pergunta do maker
  perguntaId?: PerguntaId | null; // resposta: qual das 4 (null = não entendi)
}

export interface ConversaSalva {
  id: string;
  titulo: string; // primeira pergunta
  atualizadaEm: number;
  mensagens: MensagemSalva[];
}

function gravar(lista: ConversaSalva[]) {
  try {
    localStorage.setItem(ASSIST_HISTORICO_KEY, JSON.stringify(lista));
  } catch {
    // storage cheio ou bloqueado: o histórico só não persiste
  }
}

// Mais recente primeiro, no máximo MAX_CONVERSAS.
function normalizar(lista: ConversaSalva[]): ConversaSalva[] {
  return [...lista].sort((a, b) => b.atualizadaEm - a.atualizadaEm).slice(0, MAX_CONVERSAS);
}

const HORA = 60 * 60 * 1000;
const DIA = 24 * HORA;

// Primeira visita: 3 conversas de exemplo pra tela não nascer vazia (mesmo
// padrão do seed do Histórico da calculadora). Os textos são os das perguntas
// sugeridas em PT; a resposta é remontada no idioma atual ao abrir.
function exemplos(agora: number): ConversaSalva[] {
  const conversa = (id: string, atras: number, perguntas: [string, PerguntaId][]): ConversaSalva => {
    const base = agora - atras;
    return {
      id,
      titulo: perguntas[0][0],
      atualizadaEm: base,
      mensagens: perguntas.flatMap(([texto, perguntaId], i) => [
        { id: base + i * 2, autor: 'usuario' as const, texto },
        { id: base + i * 2 + 1, autor: 'assistente' as const, perguntaId },
      ]),
    };
  };
  return [
    conversa('exemplo-1', 3 * HORA, [['Como ficou meu DRE deste mês?', 'dre'], ['Quanto estou pagando de taxas em cada marketplace?', 'taxas']]),
    conversa('exemplo-2', DIA + 5 * HORA, [['Quais produtos estão perto de faltar ou parados?', 'estoque']]),
    conversa('exemplo-3', 4 * DIA, [['Como está minha operação este mês?', 'operacao'], ['Como ficou meu DRE deste mês?', 'dre'], ['Quais produtos estão perto de faltar ou parados?', 'estoque']]),
  ];
}

export function getConversas(): ConversaSalva[] {
  let salvo: string | null = null;
  try {
    salvo = localStorage.getItem(ASSIST_HISTORICO_KEY);
  } catch {
    return [];
  }
  if (salvo === null) {
    const seed = exemplos(Date.now());
    gravar(seed);
    return seed;
  }
  return normalizar(readJson<ConversaSalva[]>(ASSIST_HISTORICO_KEY, []));
}

export function salvarConversa(conversa: ConversaSalva): ConversaSalva[] {
  const lista = normalizar([conversa, ...getConversas().filter((c) => c.id !== conversa.id)]);
  gravar(lista);
  return lista;
}

export function removerConversa(id: string): ConversaSalva[] {
  const lista = getConversas().filter((c) => c.id !== id);
  gravar(lista);
  return lista;
}
