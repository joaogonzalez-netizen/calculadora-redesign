import { useState } from 'react';
import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl, dataCurta, hoje } from '../lib/format';
import { Pagina, Vazio, Drawer, Field } from '../components/ui';
import Icon from '../components/Icon';
import type { Feira } from '../lib/types';
import { useFeirasT } from '../lib/i18n';

export default function FeirasView() {
  const { db, feiraAtiva, setFeiraAtiva, salvarFeira, excluirFeira } = useStore();
  const { avisar } = useUi();
  const { t } = useFeirasT();
  const [edit, setEdit] = useState<Partial<Feira> | null>(null);

  const metricas = (id: string) => {
    const ns = db.negocios.filter((n) => n.feiraId === id);
    const fe = ns.filter((n) => n.etapa === 'fechado');
    return { leads: ns.length, fechados: fe.length, valor: fe.reduce((s, n) => s + n.valor, 0) };
  };

  return (
    <Pagina titulo={t('feiras.pontos.titulo')} sub={t('feiras.pontos.sub')} acoes={<button className="fe-btn fe-btn-primary" onClick={() => setEdit({ nome: '', local: '', inicio: hoje(), fim: hoje() })}><Icon name="plus" /> {t('feiras.pontos.novo')}</button>}>
      {db.feiras.length === 0 ? <div className="fe-card"><Vazio titulo={t('feiras.pontos.vazioTitulo')} texto={t('feiras.pontos.vazioTexto')} acao={<button className="fe-btn fe-btn-primary" onClick={() => setEdit({ nome: '', local: '', inicio: hoje(), fim: hoje() })}>{t('feiras.pontos.cadastrar')}</button>} /></div> : (
        <div className="fe-feira-cards">
          {db.feiras.map((f) => {
            const m = metricas(f.id);
            const ativa = feiraAtiva?.id === f.id;
            return (
              <article key={f.id} className={'fe-card fe-feira-card' + (ativa ? ' fe-ativa' : '')}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><h3>{f.nome}</h3>{ativa && <span className="fe-badge fe-green">{t('feiras.comum.ativa')}</span>}</div>
                  <div className="fe-loc"><Icon name="pin" size={14} />{f.local || t('feiras.pontos.localNaoInformado')} · {t('feiras.pontos.datas', { a: dataCurta(f.inicio), b: dataCurta(f.fim) })}</div>
                </div>
                <div className="fe-metrics"><div><b>{m.leads}</b><span>{t('feiras.pontos.contatos')}</span></div><div><b>{m.fechados}</b><span>{t('feiras.pontos.fechados')}</span></div><div><b>{brl(m.valor)}</b><span>{t('feiras.pontos.vendido')}</span></div></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={'fe-btn ' + (ativa ? 'fe-btn-outline' : 'fe-btn-primary')} style={{ flex: 1 }} onClick={() => { setFeiraAtiva(ativa ? null : f.id); avisar(ativa ? t('feiras.pontos.desativado') : t('feiras.pontos.ativado', { nome: f.nome })); }}>{ativa ? t('feiras.pontos.desativar') : t('feiras.pontos.ativar')}</button>
                  <button className="fe-btn fe-btn-outline" onClick={() => setEdit(f)} aria-label={t('feiras.pontos.editar')}><Icon name="pencil" size={16} /></button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {edit && (
        <Drawer aberto titulo={edit.id ? t('feiras.pontos.editarTitulo') : t('feiras.pontos.novoTitulo')} onClose={() => setEdit(null)}
          rodape={<>{edit.id && <button className="fe-btn fe-btn-danger" onClick={() => { if (confirm(t('feiras.pontos.confirmarExcluir'))) { excluirFeira(edit.id!); setEdit(null); } }}><Icon name="trash" size={16} /></button>}
            <button className="fe-btn fe-btn-primary fe-grow" onClick={() => { if (!edit.nome?.trim()) return; salvarFeira({ ...edit, nome: edit.nome.trim() }); setEdit(null); avisar(t('feiras.pontos.salvo')); }}>{t('feiras.comum.salvar')}</button></>}>
          <Field label={t('feiras.pontos.nomeEvento')}><input autoFocus value={edit.nome ?? ''} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} placeholder={t('feiras.pontos.nomePlaceholder')} /></Field>
          <Field label={t('feiras.pontos.local')}><input value={edit.local ?? ''} onChange={(e) => setEdit({ ...edit, local: e.target.value })} placeholder={t('feiras.pontos.localPlaceholder')} /></Field>
          <div className="fe-form-grid">
            <Field label={t('feiras.pontos.inicio')}><input type="date" value={edit.inicio ?? ''} onChange={(e) => setEdit({ ...edit, inicio: e.target.value })} /></Field>
            <Field label={t('feiras.pontos.fim')}><input type="date" value={edit.fim ?? ''} onChange={(e) => setEdit({ ...edit, fim: e.target.value })} /></Field>
          </div>
        </Drawer>
      )}
    </Pagina>
  );
}
