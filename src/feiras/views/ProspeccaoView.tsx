import { useMemo, useState, type FormEvent } from 'react';
import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { buscarLugares, usandoMock, type Lugar } from '../lib/prospeccao';
import { waLink } from '../lib/format';
import { Field, Pagina, Vazio } from '../components/ui';
import Icon from '../components/Icon';
import { useFeirasT } from '../lib/i18n';

type Filtro = 'todos' | 'novos' | 'leads' | 'descartados';

export default function ProspeccaoView() {
  const { db, adicionarProspecto, descartarProspecto, restaurarProspecto } = useStore();
  const { abrir, avisar } = useUi();
  const { t, idioma } = useFeirasT();
  const [termo, setTermo] = useState(() => t('feiras.prosp.termoInicial'));
  const [local, setLocal] = useState(() => t('feiras.prosp.localInicial'));
  const [resultados, setResultados] = useState<Lugar[] | null>(null);
  const [buscado, setBuscado] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [soComTel, setSoComTel] = useState(false);

  const statusDe = (placeId: string) => db.prospectos.find((p) => p.placeId === placeId);

  async function buscar(e?: FormEvent) {
    e?.preventDefault();
    if (!termo.trim() || !local.trim()) return setErro(t('feiras.prosp.informe'));
    setErro(''); setCarregando(true);
    try {
      setResultados(await buscarLugares({ termo: termo.trim(), local: local.trim() }));
      setBuscado(t('feiras.prosp.buscadoEm', { termo: termo.trim(), local: local.trim() }));
      setFiltro('todos');
    } catch (x) {
      setErro(x instanceof Error ? x.message : t('feiras.prosp.falha'));
    }
    setCarregando(false);
  }

  const lista = useMemo(() => (resultados ?? []).filter((r) => {
    const st = db.prospectos.find((p) => p.placeId === r.placeId)?.status;
    if (soComTel && !r.telefone) return false;
    if (filtro === 'novos') return !st;
    if (filtro === 'leads') return st === 'lead';
    if (filtro === 'descartados') return st === 'descartado';
    return st !== 'descartado';
  }), [resultados, filtro, soComTel, db.prospectos]);

  const contagem = useMemo(() => {
    const base = resultados ?? [];
    const c = { novos: 0, leads: 0, descartados: 0 };
    for (const r of base) {
      const st = db.prospectos.find((p) => p.placeId === r.placeId)?.status;
      if (!st) c.novos++; else if (st === 'lead') c.leads++; else c.descartados++;
    }
    return c;
  }, [resultados, db.prospectos]);

  function adicionar(r: Lugar) {
    const res = adicionarProspecto({ placeId: r.placeId, nome: r.nome, telefone: r.telefone, endereco: r.endereco, bairro: r.bairro, tipo: r.tipo, site: r.site });
    avisar(res.existente ? t('feiras.prosp.jaCliente', { nome: r.nome }) : t('feiras.prosp.adicionado', { nome: r.nome }), { label: t('feiras.prosp.verClientes'), fn: () => abrir('cliente', res.clienteId) });
  }

  const acoes = (r: Lugar) => {
    const st = statusDe(r.placeId)?.status;
    if (st === 'lead') return <button className="fe-btn fe-btn-outline fe-btn-sm" onClick={(e) => { e.stopPropagation(); abrir('cliente', statusDe(r.placeId)!.clienteId); }}><Icon name="check" size={14} /> {t('feiras.prosp.noCrm')}</button>;
    if (st === 'descartado') return <button className="fe-btn fe-btn-ghost fe-btn-sm" onClick={(e) => { e.stopPropagation(); restaurarProspecto(r.placeId); }}>{t('feiras.prosp.restaurar')}</button>;
    return (
      <>
        <button className="fe-btn fe-btn-primary fe-btn-sm" onClick={(e) => { e.stopPropagation(); adicionar(r); }}><Icon name="plus" size={14} /> {t('feiras.prosp.adicionarContato')}</button>
        <button className="fe-btn fe-btn-ghost fe-btn-sm" onClick={(e) => { e.stopPropagation(); descartarProspecto(r.placeId, r.nome); }} aria-label={t('feiras.prosp.descartarNome', { nome: r.nome })}>{t('feiras.prosp.descartar')}</button>
      </>
    );
  };

  const estrela = (r: Lugar) => r.nota ? <span style={{ whiteSpace: 'nowrap' }}><b>★ {r.nota.toLocaleString(idioma === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: 1 })}</b> <span className="fe-sub">({r.avaliacoes})</span></span> : <span className="fe-sub">{t('feiras.prosp.semNota')}</span>;
  const aberto = (r: Lugar) => r.aberto === null ? null : <span className={'fe-badge ' + (r.aberto ? 'fe-green' : '')}>{r.aberto ? t('feiras.prosp.abertoAgora') : t('feiras.prosp.fechado')}</span>;

  return (
    <Pagina titulo={t('feiras.prosp.titulo')} sub={t('feiras.prosp.sub')}>
      {usandoMock && (
        <div className="fe-notice" style={{ marginBottom: 16 }}>
          <b>{t('feiras.prosp.mockTitulo')}</b> {t('feiras.prosp.mockTexto')} <code>VITE_GOOGLE_PLACES_KEY</code> {t('feiras.prosp.mockNo')} <code>.env.local</code>.
        </div>
      )}

      <form className="fe-card fe-card-pad" onSubmit={buscar} style={{ marginBottom: 18 }}>
        <div className="fe-form-grid" style={{ gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr) auto', alignItems: 'end' }}>
          <Field label={t('feiras.prosp.oQueProcurar')}><input value={termo} onChange={(e) => setTermo(e.target.value)} placeholder={t('feiras.prosp.oQueEx')} /></Field>
          <Field label={t('feiras.prosp.onde')}><input value={local} onChange={(e) => setLocal(e.target.value)} placeholder={t('feiras.prosp.ondePlaceholder')} /></Field>
          <button className="fe-btn fe-btn-primary" disabled={carregando}><Icon name="search" size={16} /> {carregando ? t('feiras.prosp.buscando') : t('feiras.prosp.buscarBtn')}</button>
        </div>
        {erro && <div className="fe-notice" role="alert" style={{ marginTop: 12 }}>{erro}</div>}
        <div className="fe-chips" style={{ marginTop: 12 }}>
          {t('feiras.prosp.sugestoes').split('|').map((s) => (
            <button type="button" key={s} className={'fe-chip' + (termo === s ? ' fe-on' : '')} onClick={() => setTermo(s)}>{s}</button>
          ))}
        </div>
      </form>

      {resultados === null && !carregando && (
        <div className="fe-card"><Vazio titulo={t('feiras.prosp.primeiraTitulo')} texto={t('feiras.prosp.primeiraTexto')} acao={<button className="fe-btn fe-btn-primary" onClick={() => buscar()}>{t('feiras.prosp.buscarTermoEm', { termo, local })}</button>} /></div>
      )}
      {carregando && <div className="fe-card"><div className="fe-boot">{t('feiras.prosp.buscandoGoogle')}</div></div>}

      {resultados !== null && !carregando && (
        <>
          <div className="fe-toolbar" style={{ justifyContent: 'space-between' }}>
            <div className="fe-chips">
              {([['todos', t('feiras.prosp.fTodos')], ['novos', t('feiras.prosp.fNovos', { n: contagem.novos })], ['leads', t('feiras.prosp.fCrm', { n: contagem.leads })], ['descartados', t('feiras.prosp.fDescartados', { n: contagem.descartados })]] as const).map(([id, l]) => (
                <button key={id} className={'fe-chip' + (filtro === id ? ' fe-on' : '')} onClick={() => setFiltro(id)}>{l}</button>
              ))}
              <button className={'fe-chip' + (soComTel ? ' fe-on' : '')} onClick={() => setSoComTel(!soComTel)}><Icon name="phone" size={13} /> {t('feiras.prosp.soComTel')}</button>
            </div>
            <span className="fe-sub" style={{ fontSize: 13, color: 'var(--text-3)' }}>{t('feiras.prosp.lugaresPara', { n: resultados.length, termo: buscado })}</span>
          </div>

          <div className="fe-card">
            {lista.length === 0 ? <Vazio titulo={t('feiras.prosp.nadaFiltroTitulo')} texto={t('feiras.prosp.nadaFiltroTexto')} /> : (
              <>
                <div className="fe-tbl-wrap"><table className="fe-tbl">
                  <thead><tr><th>{t('feiras.prosp.colLoja')}</th><th>{t('feiras.prosp.colContato')}</th><th>{t('feiras.prosp.colAvaliacao')}</th><th></th></tr></thead>
                  <tbody>{lista.map((r) => (
                    <tr key={r.placeId} style={{ cursor: 'default' }}>
                      <td style={{ maxWidth: 340 }}>
                        <div className="fe-nm">{r.nome}</div>
                        <div className="fe-sub">{r.tipo} · {r.bairro}</div>
                        <div className="fe-sub">{r.endereco}</div>
                      </td>
                      <td>
                        <div>{r.telefone || <span className="fe-sub">{t('feiras.prosp.semTelefone')}</span>}</div>
                        {r.site && <a className="fe-sub" href={r.site} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-dark)' }}>{r.site.replace(/^https?:\/\//, '')}</a>}
                      </td>
                      <td>{estrela(r)}<div style={{ marginTop: 4 }}>{aberto(r)}</div></td>
                      <td><div className="fe-row-actions">
                        {r.telefone && <a className="fe-btn fe-btn-wa fe-btn-sm" href={waLink(r.telefone)} target="_blank" rel="noreferrer" aria-label={t('feiras.comum.whatsappNome', { nome: r.nome })}><Icon name="whatsapp" size={15} /></a>}
                        <a className="fe-btn fe-btn-ghost fe-btn-sm" href={r.mapsUrl} target="_blank" rel="noreferrer">Maps</a>
                        {acoes(r)}
                      </div></td>
                    </tr>))}</tbody></table></div>
                <div className="fe-cards-m" style={{ padding: 12 }}>
                  {lista.map((r) => (
                    <div key={r.placeId} className="fe-deal" style={{ cursor: 'default' }}>
                      <div className="fe-row"><span className="fe-who">{r.nome}</span>{estrela(r)}</div>
                      <div className="fe-what">{r.tipo} · {r.endereco}</div>
                      <div className="fe-row"><span>{r.telefone || <span className="fe-sub">{t('feiras.prosp.semTelefone')}</span>}</span>{aberto(r)}</div>
                      <div className="fe-deal-actions" style={{ flexWrap: 'wrap' }}>
                        {r.telefone && <a className="fe-btn fe-btn-wa fe-btn-sm" href={waLink(r.telefone)} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={14} /> WhatsApp</a>}
                        {acoes(r)}
                      </div>
                    </div>))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </Pagina>
  );
}
