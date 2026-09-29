import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { useI18n } from '../context/I18nContext';
import Icon, { type IconName } from '../components/Icon';
import { MOSTRAR_MENUS_PRINCIPAIS } from '../lib/versoes';
import { USUARIO } from '../lib/dashboardMock';
import {
  PERGUNTAS, identificarPergunta, responder, respostaFallback,
  type Bloco, type PerguntaId, type Resposta,
} from '../lib/assistenteRespostas';
import {
  getConversas, removerConversa, salvarConversa,
  type ConversaSalva, type MensagemSalva as Mensagem,
} from '../lib/assistenteHistorico';
import type { Idioma } from '../lib/i18n';

type Destino = 'dashboard' | 'produtos' | 'calculadora';

const ICONE: Record<PerguntaId, IconName> = {
  operacao: 'dashboard',
  dre: 'list',
  taxas: 'creditos',
  estoque: 'box',
};

// A resposta é remontada a partir de qual pergunta foi entendida — assim uma
// conversa reaberta do histórico sai no idioma atual.
function respostaDe(m: Mensagem, idioma: Idioma): Resposta {
  return m.perguntaId ? responder(m.perguntaId, idioma) : respostaFallback(idioma);
}

const LOCALE: Record<Idioma, string> = { pt: 'pt-BR', es: 'es-AR', en: 'en-US' };

// "há 3 horas", "ontem", "há 4 dias"
function quando(ts: number, idioma: Idioma): string {
  const rtf = new Intl.RelativeTimeFormat(LOCALE[idioma], { numeric: 'auto' });
  const min = Math.round((ts - Date.now()) / 60000);
  if (min > -60) return rtf.format(Math.min(min, -1), 'minute');
  const horas = Math.round(min / 60);
  if (horas > -24) return rtf.format(horas, 'hour');
  return rtf.format(Math.round(horas / 24), 'day');
}

// **negrito** → <b>
function comNegrito(texto: string): ReactNode {
  return texto.split('**').map((parte, i) => (i % 2 === 1 ? <b key={i}>{parte}</b> : <Fragment key={i}>{parte}</Fragment>));
}

// V2 do Assistente (layout do Seller Tool 3D em produção): tela inicial com a
// caixa de pergunta no centro e 4 perguntas sugeridas. Ainda sem IA — as
// sugestões e perguntas digitadas que batem por palavra-chave respondem com os
// dados mock do Painel/Produtos (ver lib/assistenteRespostas.ts).
// Na conversa, cada pergunta abre um bloco com a resposta embaixo, e a pergunta
// fica presa no topo enquanto o maker rola uma resposta longa. Toda entrada na
// tela é uma conversa nova: o App remonta a view (key) ao clicar em Assistente
// ou em "Nova conversa" na topbar. As últimas conversas ficam no histórico
// (lib/assistenteHistorico.ts) e podem ser reabertas pela tela inicial.
interface Props {
  onNavegar: (destino: Destino) => void;
  onConversaAtiva: (ativa: boolean) => void;
}

export default function AssistenteView({ onNavegar, onConversaAtiva }: Props) {
  const { t, idioma } = useI18n();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [digitando, setDigitando] = useState(false);
  const [conversas, setConversas] = useState<ConversaSalva[]>(getConversas);
  const conversaIdRef = useRef<string | null>(null);
  // Quantas mensagens a conversa já tinha salvas — reabrir uma conversa sem
  // perguntar nada não deve mexer na data dela.
  const qtdSalvaRef = useRef(0);

  // Salva a conversa quando uma resposta nova chega.
  useEffect(() => {
    const ultima = mensagens[mensagens.length - 1];
    if (!ultima || ultima.autor !== 'assistente' || mensagens.length <= qtdSalvaRef.current) return;
    if (!conversaIdRef.current) conversaIdRef.current = 'conv_' + Date.now();
    qtdSalvaRef.current = mensagens.length;
    setConversas(salvarConversa({
      id: conversaIdRef.current,
      titulo: mensagens.find((m) => m.autor === 'usuario')?.texto ?? '',
      atualizadaEm: Date.now(),
      mensagens,
    }));
  }, [mensagens]);

  function reabrir(c: ConversaSalva) {
    conversaIdRef.current = c.id;
    qtdSalvaRef.current = c.mensagens.length;
    setMensagens(c.mensagens);
  }

  const conversaAtiva = mensagens.length > 0;
  useEffect(() => { onConversaAtiva(conversaAtiva); }, [conversaAtiva, onConversaAtiva]);
  useEffect(() => () => onConversaAtiva(false), [onConversaAtiva]);

  // A pergunta presa no topo fica logo abaixo da topbar (que também é sticky).
  useEffect(() => {
    const topbar = document.querySelector<HTMLElement>('.topbar');
    if (topbar) document.documentElement.style.setProperty('--topbar-h', topbar.offsetHeight + 'px');
  }, []);

  // Nova pergunta: rola até o bloco dela (e não até o fim da resposta).
  const ultimoTurnoRef = useRef<HTMLElement>(null);
  const qtdPerguntas = mensagens.filter((m) => m.autor === 'usuario').length;
  useEffect(() => {
    if (qtdPerguntas) ultimoTurnoRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [qtdPerguntas]);

  function perguntar(conteudo: string, perguntaId: PerguntaId | null) {
    if (digitando) return;
    setMensagens((prev) => [...prev, { id: Date.now(), autor: 'usuario', texto: conteudo }]);
    setTexto('');
    setDigitando(true);
    setTimeout(() => {
      setMensagens((prev) => [...prev, { id: Date.now() + 1, autor: 'assistente', perguntaId }]);
      setDigitando(false);
    }, 900);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo) return;
    perguntar(conteudo, identificarPergunta(conteudo));
  }

  function aoPressionarTecla(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar(e);
    }
  }

  // Painel e Produtos não existem em todas as versões — sem o menu, o botão some.
  const destinoVisivel = (d: Destino) => d === 'calculadora' || MOSTRAR_MENUS_PRINCIPAIS[idioma];

  function renderBloco(b: Bloco, i: number) {
    if (b.tipo === 'p') return <p key={i}>{comNegrito(b.texto)}</p>;
    if (b.tipo === 'lista') return <ul key={i} className="assist-lista">{b.itens.map((it, j) => <li key={j}>{comNegrito(it)}</li>)}</ul>;
    if (b.tipo === 'tabela') {
      return (
        <div key={i} className="assist-tabela">
          {b.linhas.map((l, j) => (
            <div key={j} className={'assist-tabela-linha' + (l.destaque ? ' ' + l.destaque : '')}>
              <span className="assist-tabela-label">{l.label}</span>
              <span className="assist-tabela-valor">
                <b>{l.valor}</b>
                {l.detalhe && <small>{l.detalhe}</small>}
              </span>
            </div>
          ))}
        </div>
      );
    }
    if (!destinoVisivel(b.destino)) return null;
    return (
      <button key={i} type="button" className="btn-outline assist-acao" onClick={() => onNavegar(b.destino)}>
        {b.label} <Icon name="chevron" size={12} style={{ transform: 'rotate(180deg)' }} />
      </button>
    );
  }

  const sugestoes = (excluir?: PerguntaId | null, compacto = false) => (
    <div className={compacto ? 'assist-sugestoes-chips' : 'assist-sugestoes'}>
      {PERGUNTAS.filter((p) => p !== excluir).map((p) => (
        <button key={p} type="button" className={compacto ? 'assist-chip' : 'assist-sugestao'} disabled={digitando}
          onClick={() => perguntar(t('assist.pergunta.' + p), p)}>
          {!compacto && <span className="assist-sugestao-icone"><Icon name={ICONE[p]} size={15} /></span>}
          {t('assist.pergunta.' + p)}
        </button>
      ))}
    </div>
  );

  const caixa = (inicial: boolean) => (
    <form className={'assist-input-row' + (inicial ? ' assist-input-inicial' : '')} onSubmit={enviar}>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={aoPressionarTecla}
        placeholder={t('assist.placeholder')}
        rows={inicial ? 3 : 1}
        autoFocus={inicial}
      />
      <button type="submit" className="assist-send-btn" disabled={!texto.trim() || digitando} aria-label={t('assist.enviar')}>
        <Icon name="send" size={16} />
      </button>
    </form>
  );

  if (mensagens.length === 0) {
    return (
      <div className="assist-inicio">
        <h2>{t('assist.boasVindasTitulo')}</h2>
        {caixa(true)}
        {sugestoes()}
        {conversas.length > 0 && (
          <div className="assist-historico">
            <h3>{t('assist.conversasRecentes')}</h3>
            <ul>
              {conversas.map((c) => {
                const perguntas = c.mensagens.filter((m) => m.autor === 'usuario').length;
                return (
                  <li key={c.id}>
                    <button type="button" className="assist-historico-item" onClick={() => reabrir(c)}>
                      <Icon name="message" size={15} />
                      <span className="assist-historico-texto">
                        <b>{c.titulo}</b>
                        <small>
                          {perguntas} {t(perguntas === 1 ? 'assist.pergunta1' : 'assist.perguntasN')} · {quando(c.atualizadaEm, idioma)}
                        </small>
                      </span>
                    </button>
                    <button
                      type="button" className="assist-historico-remover" aria-label={t('assist.removerConversa')} title={t('assist.removerConversa')}
                      onClick={() => setConversas(removerConversa(c.id))}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Agrupa em turnos: cada pergunta + a resposta que veio depois dela.
  const turnos: { pergunta: Mensagem; resposta?: Mensagem }[] = [];
  mensagens.forEach((m) => {
    if (m.autor === 'usuario') turnos.push({ pergunta: m });
    else if (turnos.length) turnos[turnos.length - 1].resposta = m;
  });
  const ultimo = turnos[turnos.length - 1];

  return (
    <div className="assist-conversa">
      <div className="assist-thread">
        {turnos.map((turno, i) => (
          <section key={turno.pergunta.id} className="assist-turno" ref={i === turnos.length - 1 ? ultimoTurnoRef : undefined}>
            <div className="assist-pergunta">
              <span className="assist-avatar assist-avatar-user">{USUARIO.iniciais}</span>
              <div>
                <span className="assist-pergunta-label">{t('assist.vocePerguntou')}</span>
                <p>{turno.pergunta.texto}</p>
              </div>
            </div>
            <div className="assist-resposta">
              <span className="assist-avatar assist-avatar-bot"><Icon name="message" size={14} /></span>
              <div className="assist-resposta-corpo">
                {turno.resposta ? respostaDe(turno.resposta, idioma).blocos.map(renderBloco) : (
                  <div className="assist-dots"><span className="assist-dot" /><span className="assist-dot" /><span className="assist-dot" /></div>
                )}
                {turno === ultimo && turno.resposta && !digitando && (
                  <div className="assist-continuar">
                    <span>{t(respostaDe(turno.resposta, idioma).sugerir ? 'assist.experimente' : 'assist.outrasPerguntas')}</span>
                    {sugestoes(turno.resposta.perguntaId, true)}
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      {caixa(false)}
    </div>
  );
}
