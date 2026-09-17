import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useI18n } from '../context/I18nContext';
import Icon from '../components/Icon';

interface Mensagem {
  id: number;
  autor: 'usuario' | 'assistente';
  texto: string;
}

// V1 do Assistente — só a UX do chat (réplica do Seller Tool 3D). Sem IA de
// verdade ainda: toda mensagem enviada recebe a mesma resposta padrão,
// simulando o "digitando..." antes de responder.
export default function AssistenteView() {
  const { t } = useI18n();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const [digitando, setDigitando] = useState(false);
  const fimDaThreadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimDaThreadRef.current?.scrollIntoView({ block: 'end' });
  }, [mensagens, digitando]);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo) return;

    setMensagens((prev) => [...prev, { id: Date.now(), autor: 'usuario', texto: conteudo }]);
    setTexto('');
    setDigitando(true);

    const respostaPadrao = t('assist.respostaPadrao');
    setTimeout(() => {
      setMensagens((prev) => [...prev, { id: Date.now() + 1, autor: 'assistente', texto: respostaPadrao }]);
      setDigitando(false);
    }, 900);
  }

  function aoPressionarTecla(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar(e);
    }
  }

  function novaConversa() {
    setMensagens([]);
    setTexto('');
    setDigitando(false);
  }

  return (
    <div>
      <div className="assist-toolbar">
        <button type="button" className="btn-outline" onClick={novaConversa}>
          <Icon name="plus" size={13} /> {t('assist.novaConversa')}
        </button>
      </div>

      {mensagens.length === 0 ? (
        <div className="assist-empty">
          <div className="assist-empty-icon"><Icon name="message" size={24} /></div>
          <h2>{t('assist.boasVindasTitulo')}</h2>
          <p>{t('assist.boasVindasSubtitulo')}</p>
        </div>
      ) : (
        <div className="assist-thread">
          {mensagens.map((m) => (
            <div key={m.id} className={'assist-msg ' + (m.autor === 'usuario' ? 'assist-msg-user' : 'assist-msg-bot')}>
              {m.texto.split('\n\n').map((par, i) => <p key={i}>{par}</p>)}
            </div>
          ))}
          {digitando && (
            <div className="assist-dots">
              <span className="assist-dot" /><span className="assist-dot" /><span className="assist-dot" />
            </div>
          )}
          <div ref={fimDaThreadRef} />
        </div>
      )}

      <form className="assist-input-row" onSubmit={enviar}>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={aoPressionarTecla}
          placeholder={t('assist.placeholder')}
          rows={1}
        />
        <button type="submit" className="assist-send-btn" disabled={!texto.trim()} aria-label={t('assist.novaConversa')}>
          <Icon name="send" size={16} />
        </button>
      </form>
    </div>
  );
}
