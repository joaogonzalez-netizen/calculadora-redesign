import { useMemo, useState } from 'react';
import { useStore } from '../../lib/store';
import { useUi } from '../../lib/ui';
import { addDias, mascaraTel } from '../../lib/format';
import type { Temperatura } from '../../lib/types';
import { Drawer, Field } from '../ui';

const PRAZOS = [{ d: 1, l: 'Amanhã' }, { d: 3, l: '3 dias' }, { d: 7, l: '1 semana' }, { d: 0, l: 'Sem data' }];

export default function LeadRapido() {
  const { db, feiraAtiva, capturarLead } = useStore();
  const { fechar, abrir, avisar } = useUi();
  const vazio = { nome: '', telefone: '', interesse: '', valor: '', nota: '' };
  const [f, setF] = useState(vazio);
  const [temp, setTemp] = useState<Temperatura>('morno');
  const [prazo, setPrazo] = useState(1);
  const [erro, setErro] = useState('');
  const set = (k: keyof typeof vazio) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const duplicado = useMemo(() => {
    const d = f.telefone.replace(/\D/g, '');
    return d.length >= 10 ? db.clientes.find((c) => c.telefone.replace(/\D/g, '') === d) : undefined;
  }, [f.telefone, db.clientes]);

  function salvar(continuar: boolean) {
    if (!f.nome.trim() && !duplicado) return setErro('Informe o nome de quem visitou o ponto de venda.');
    if (!f.telefone.replace(/\D/g, '') && !f.nome.trim()) return setErro('Informe ao menos nome ou WhatsApp.');
    const r = capturarLead({
      nome: f.nome.trim() || duplicado!.nome, telefone: f.telefone, interesse: f.interesse.trim(), valor: Number(f.valor) || 0,
      temperatura: temp, nota: f.nota.trim(), proximoContato: prazo ? addDias(prazo) : null,
    });
    if (continuar) {
      setF(vazio); setTemp('morno'); setPrazo(1); setErro('');
      avisar(`${f.nome.trim() || duplicado!.nome} salvo. Próximo!`);
    } else {
      fechar();
      avisar(`${f.nome.trim() || duplicado!.nome} salvo no funil`, { label: 'Abrir', fn: () => abrir('negocio', r.negocioId) });
    }
  }

  return (
    <Drawer aberto titulo="Contato rápido" subtitulo={feiraAtiva ? `Registrando em ${feiraAtiva.nome}` : 'Nenhum ponto de venda ativo: o contato ficará sem ponto de venda'} onClose={fechar}
      rodape={<><button className="fe-btn fe-btn-outline" onClick={() => salvar(true)}>Salvar e novo</button><button className="fe-btn fe-btn-primary fe-grow" onClick={() => salvar(false)}>Salvar lead</button></>}>
      {erro && <div className="fe-notice" role="alert">{erro}</div>}
      <div className="fe-form-grid">
        <Field label="Nome" className="fe-full"><input autoFocus value={f.nome} onChange={set('nome')} autoComplete="off" placeholder="Quem visitou o ponto de venda?" /></Field>
        <Field label="WhatsApp" className="fe-full" hint={duplicado ? undefined : 'Usado para o próximo contato'}>
          <input value={f.telefone} onChange={(e) => setF((s) => ({ ...s, telefone: mascaraTel(e.target.value) }))} inputMode="tel" autoComplete="off" placeholder="(47) 99999-9999" />
        </Field>
        {duplicado && <div className="fe-notice fe-full">Já existe <b>{duplicado.nome}</b> com esse número. Vamos adicionar uma nova negociação nele.</div>}
        <Field label="Interesse" className="fe-full">
          <input list="lead-prod" value={f.interesse} onChange={set('interesse')} autoComplete="off" placeholder="Ex: 20 capivaras para revenda" />
          <datalist id="lead-prod">{db.produtos.map((p) => <option key={p.id} value={p.nome} />)}</datalist>
        </Field>
      </div>
      <div>
        <div className="fe-sec-title">Temperatura</div>
        <div className="fe-seg" role="radiogroup">
          {([['frio', 'Curioso'], ['morno', 'Interessado'], ['quente', 'Quer comprar']] as const).map(([id, l]) => (
            <button key={id} type="button" role="radio" aria-checked={temp === id} data-t={id} className={temp === id ? 'fe-on' : ''} onClick={() => setTemp(id)}>{l}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="fe-sec-title">Voltar a falar</div>
        <div className="fe-chips">{PRAZOS.map((p) => <button key={p.d} type="button" className={'fe-chip' + (prazo === p.d ? ' fe-on' : '')} onClick={() => setPrazo(p.d)}>{p.l}</button>)}</div>
      </div>
      <div className="fe-form-grid">
        <Field label="Valor estimado (opcional)"><input type="number" inputMode="decimal" min={0} value={f.valor} onChange={set('valor')} placeholder="R$ 0,00" /></Field>
        <Field label="Anotação" className="fe-full"><textarea value={f.nota} onChange={set('nota')} placeholder="Ex: prefere pagar no Pix, quer cores neutras" /></Field>
      </div>
    </Drawer>
  );
}
