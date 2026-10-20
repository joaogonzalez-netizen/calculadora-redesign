import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl, brlCurto, hoje, relativo, waLink } from '../lib/format';
import { ETAPAS, type Etapa, type Negocio } from '../lib/types';
import { Pagina } from '../components/ui';
import Icon from '../components/Icon';
import { useFeirasT } from '../lib/i18n';

export default function NegociosView() {
  const { db, moverNegocio, feiraAtiva } = useStore();
  const { abrir, avisar } = useUi();
  const { t } = useFeirasT();
  const [q, setQ] = useState('');
  const [feira, setFeira] = useState<string>('todas');
  const [soQuentes, setSoQuentes] = useState(false);
  const [etapaM, setEtapaM] = useState<Etapa>('novo');
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<Etapa | null>(null);

  const lista = useMemo(() => db.negocios.filter((n) => {
    const c = db.clientes.find((x) => x.id === n.clienteId);
    if (feira !== 'todas' && n.feiraId !== (feira === 'sem' ? null : feira)) return false;
    if (soQuentes && n.temperatura !== 'quente') return false;
    if (!q.trim()) return true;
    const termo = q.toLowerCase();
    return n.titulo.toLowerCase().includes(termo) || (c?.nome.toLowerCase().includes(termo) ?? false) || (c?.empresa.toLowerCase().includes(termo) ?? false);
  }), [db, q, feira, soQuentes]);

  const soltar = (etapa: Etapa) => {
    const n = db.negocios.find((x) => x.id === arrastando);
    setArrastando(null); setSobre(null);
    if (!n || n.etapa === etapa) return;
    if (etapa === 'fechado' || etapa === 'perdido') { abrir('negocio', n.id); avisar(etapa === 'fechado' ? t('feiras.negocios.paraFechar') : t('feiras.negocios.paraPerder')); return; }
    moverNegocio(n.id, etapa);
  };

  return (
    <Pagina titulo={t('feiras.negocios.titulo')} sub={t('feiras.negocios.sub')}
      acoes={<button className="fe-btn fe-btn-outline" onClick={() => abrir('negocio')}><Icon name="plus" /> {t('feiras.negocios.nova')}</button>}>
      <div className="fe-toolbar">
        <div className="fe-search"><Icon name="search" size={16} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('feiras.negocios.buscarPlaceholder')} aria-label={t('feiras.comum.buscar')} /></div>
        <select className="fe-select-sm" value={feira} onChange={(e) => setFeira(e.target.value)} aria-label={t('feiras.negocios.filtrarPonto')}>
          <option value="todas">{t('feiras.negocios.todosPontos')}</option>
          {db.feiras.map((f) => <option key={f.id} value={f.id}>{f.nome}{f.id === feiraAtiva?.id ? t('feiras.negocios.ativaSufixo') : ''}</option>)}
          <option value="sem">{t('feiras.negocios.semPonto')}</option>
        </select>
        <button className={'fe-chip' + (soQuentes ? ' fe-on' : '')} onClick={() => setSoQuentes(!soQuentes)}><Icon name="flame" size={14} /> {t('feiras.negocios.soQuentes')}</button>
      </div>

      <div className="fe-stage-tabs" role="tablist">
        {ETAPAS.map((e) => <button key={e.id} role="tab" aria-selected={etapaM === e.id} className={etapaM === e.id ? 'fe-on' : ''} onClick={() => setEtapaM(e.id)}>{t('feiras.etapa.' + e.id)}<b>{lista.filter((n) => n.etapa === e.id).length}</b></button>)}
      </div>

      <div className="fe-kanban">
        {ETAPAS.map((e) => {
          const col = lista.filter((n) => n.etapa === e.id).sort((a, b) => (a.proximoContato ?? '9').localeCompare(b.proximoContato ?? '9'));
          return (
            <section key={e.id} className={'fe-col' + (sobre === e.id ? ' fe-over' : '') + (etapaM === e.id ? ' fe-m-on' : '')} aria-label={t('feiras.etapa.' + e.id)}
              onDragOver={(ev) => { ev.preventDefault(); setSobre(e.id); }} onDragLeave={() => setSobre((s) => (s === e.id ? null : s))} onDrop={() => soltar(e.id)}>
              <div className="fe-col-head"><h3>{t('feiras.etapa.' + e.id)}</h3><span className="fe-n">{col.length}</span></div>
              <div className="fe-col-sum">{col.length ? brlCurto(col.reduce((s, n) => s + n.valor, 0)) : t('feiras.etapaHint.' + e.id)}</div>
              {col.length === 0 && <div className="fe-col-empty">{e.id === 'novo' ? t('feiras.negocios.colNovoVazio') : t('feiras.negocios.colVazio')}</div>}
              {col.map((n) => <Cartao key={n.id} n={n} arrastando={arrastando === n.id} onDrag={setArrastando} />)}
            </section>
          );
        })}
      </div>
    </Pagina>
  );
}

function Cartao({ n, arrastando, onDrag }: { n: Negocio; arrastando: boolean; onDrag: (id: string | null) => void }) {
  const { db } = useStore();
  const { abrir } = useUi();
  const { t } = useFeirasT();
  const c = db.clientes.find((x) => x.id === n.clienteId);
  const aberto = n.etapa !== 'fechado' && n.etapa !== 'perdido';
  const atraso = aberto && n.proximoContato && n.proximoContato < hoje();
  const hojeC = aberto && n.proximoContato === hoje();
  return (
    <div className={'fe-deal' + (arrastando ? ' fe-dragging' : '')} draggable onDragStart={() => onDrag(n.id)} onDragEnd={() => onDrag(null)}
      role="button" tabIndex={0} onClick={() => abrir('negocio', n.id)} onKeyDown={(e) => e.key === 'Enter' && abrir('negocio', n.id)} style={{ cursor: 'pointer' }}>
      <div className="fe-row"><span className="fe-who">{c?.nome ?? t('feiras.comum.cliente')}</span><span className={'fe-temp fe-' + n.temperatura}>{n.temperatura === 'quente' && <Icon name="flame" size={13} />}{t('feiras.temp.' + n.temperatura)}</span></div>
      <div className="fe-what">{n.titulo}</div>
      <div className="fe-row">
        <span className="fe-val">{n.valor ? brl(n.valor) : t('feiras.comum.nd')}</span>
        {aberto && c?.telefone && <a className="fe-btn fe-btn-wa fe-btn-sm" href={waLink(c.telefone)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} aria-label={t('feiras.comum.whatsappNome', { nome: c.nome })} style={{ padding: '4px 9px', minHeight: 30 }}><Icon name="whatsapp" size={14} /></a>}
      </div>
      {aberto && n.proximoContato && <div className={'fe-follow' + (atraso ? ' fe-late' : hojeC ? ' fe-today' : '')}><Icon name={atraso ? 'alert' : 'clock'} size={13} />{t('feiras.negocios.falar', { rel: relativo(n.proximoContato) })}</div>}
      {n.etapa === 'perdido' && n.motivoPerda && <div className="fe-follow">{n.motivoPerda}</div>}
    </div>
  );
}
