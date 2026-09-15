import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AccItem, CalculoResultado, CalculoState, FilamentoItem, HistoricoEntry } from '../types';
import { calcular, validar, type ValidacaoFaltando } from '../lib/calc';
import { getHistorico, saveHistoricoArr } from '../lib/storage';
import { useLibrarias } from './LibrariasContext';

let filCounter = 0;
let accCounter = 0;

export function novoFilamentoItem(nome = '', cor = '', precoKg = 0, pesoG = 0): FilamentoItem {
  return { id: 'fil_' + filCounter++, nome, cor, precoKg, pesoG };
}
export function novoAccItem(nome = '', valor = 0, categoria: AccItem['categoria'] = 'Embalagem'): AccItem {
  return { id: 'acc_' + accCounter++, nome, valor, categoria };
}

function estadoInicial(): CalculoState {
  return {
    nomePeca: '', stlLink: '', concorrenteLink: '',
    impressoraIdx: '', custoKwh: 0, precoKwh: 0.75, quantidade: 1,
    horasImpressao: 0, minutosImpressao: 0, taxaFalha: 2,
    filamentoItems: [novoFilamentoItem()],
    modoPrec: 'preco', precoVenda: 0, margemDesejada: 40, imposto: 0,
    comPromo: false, descontoPromo: 10,
    canalAtivo: 'Venda direta',
    pgtoSelecionado: 'debito', taxaCartaoPct: 1.99,
    pgtoPixTaxa: 0, pgtoPixDesconto: 0, outraParcelas: 1, pgtoCustom: 0,
    freteDiretoCusto: 0, embutirTaxas: true,
    mlTipo: 'classico', mlCategoria: '', mlComissaoManual: false, mlComissao: 0,
    mlPesoEmbalagem: 0.3, mlImposto: 0, mlAds: 0, mlExtras: 0,
    mlArCategoria: '', mlArTipo: 'classico', mlArComissaoManual: false,
    mlArComissao: 0, mlArPesoEmbalagem: 0.3,
    shopeeTipo: 'cnpj', shopeeCpfAlto: false, shopeeFrete: 0,
    shopeeCampanhaDestaque: false, shopeeComissaoExtra: 5,
    shopeeCupomProprio: false, shopeeCupomValor: 0,
    etsyFrete: 0,
    tiktokFrete: 0, tiktokNovoVendedor: false,
    accItems: [novoAccItem('Caixa de papelão', 1.20, 'Embalagem')],
    adsAtivo: false,
  };
}

interface Ctx {
  state: CalculoState;
  set: <K extends keyof CalculoState>(key: K, value: CalculoState[K]) => void;
  patch: (partial: Partial<CalculoState>) => void;
  resultado: CalculoResultado | null;
  faltando: ValidacaoFaltando[];
  errorIds: Set<string>;
  calcularClick: () => void;
  resetCalculadora: () => void;
  salvarHistorico: () => void;
  restaurarHistorico: (h: HistoricoEntry) => void;
}

const CalculadoraCtx = createContext<Ctx | null>(null);

export function CalculadoraProvider({ children }: { children: ReactNode }) {
  const { prefs, filamentos, impressoras, custosPadrao } = useLibrarias();
  const [state, setState] = useState<CalculoState>(estadoInicial);
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set());
  const aplicouPrefs = useRef(false);

  // Aplica impressora/filamento/imposto/margem/taxas padrão de Preferências (PRD seção 6)
  // uma única vez, ao montar — sempre editável depois, sem travar nem afetar o padrão salvo.
  useEffect(() => {
    if (aplicouPrefs.current) return;
    aplicouPrefs.current = true;
    setState((prev) => {
      const next: CalculoState = {
        ...prev,
        precoKwh: prefs.kwh || prev.precoKwh,
        imposto: prefs.imposto ?? prev.imposto,
        margemDesejada: prefs.margem || prev.margemDesejada,
        pgtoPixTaxa: prefs.taxaPix ?? prev.pgtoPixTaxa,
        pgtoPixDesconto: prefs.descontoPix ?? prev.pgtoPixDesconto,
        taxaCartaoPct: prefs.taxaDebito ?? prev.taxaCartaoPct,
      };
      let filamentoPadraoAplicado = false;
      if (prefs.filamento !== '' && prefs.filamento !== undefined && filamentos[Number(prefs.filamento)]) {
        const f = filamentos[Number(prefs.filamento)];
        next.filamentoItems = [novoFilamentoItem(f.nome, f.cor || '', f.preco, 0)];
        filamentoPadraoAplicado = true;
      }
      if (!filamentoPadraoAplicado) next.filamentoItems = [novoFilamentoItem()];
      if (prefs.impressora !== '' && prefs.impressora !== undefined && impressoras[Number(prefs.impressora)]) {
        next.impressoraIdx = prefs.impressora;
        next.custoKwh = impressoras[Number(prefs.impressora)].kwh;
      }
      // Custos padrão ativos entram sozinhos na lista de extras, no lugar do preset fixo (PRD seção 6).
      const ativos = custosPadrao.filter((c) => c.ativo);
      next.accItems = ativos.length
        ? ativos.map((c) => novoAccItem(c.nome, c.valor, c.categoria))
        : [novoAccItem('Caixa de papelão', 1.20, 'Embalagem')];
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof CalculoState>(key: K, value: CalculoState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };
  const patch = (partial: Partial<CalculoState>) => setState((prev) => ({ ...prev, ...partial }));

  const faltando = useMemo(() => validar(state), [state]);
  const resultado = useMemo(() => (faltando.length === 0 ? calcular(state) : null), [state, faltando]);

  const calcularClick = () => {
    if (faltando.length > 0) {
      setErrorIds(new Set(faltando.flatMap((f) => [f.id, f.idExtra].filter(Boolean) as string[])));
    } else {
      setErrorIds(new Set());
    }
  };

  // limpa o destaque de erro assim que o campo correspondente deixa de faltar
  useEffect(() => {
    if (errorIds.size === 0) return;
    const faltandoIds = new Set(faltando.flatMap((f) => [f.id, f.idExtra].filter(Boolean) as string[]));
    const stillMissing = new Set([...errorIds].filter((id) => faltandoIds.has(id)));
    if (stillMissing.size !== errorIds.size) setErrorIds(stillMissing);
  }, [faltando, errorIds]);

  const resetCalculadora = () => {
    setState(estadoInicial());
    aplicouPrefs.current = false;
    setErrorIds(new Set());
  };

  const salvarHistorico = () => {
    if (!resultado) return;
    const hist = getHistorico();
    const entry: HistoricoEntry = {
      id: Date.now(),
      nome: state.nomePeca,
      marketplace: state.canalAtivo,
      custoUnit: resultado.custoUnit,
      precoConsumidor: resultado.precoConsumidor,
      precoVarejo: resultado.precoVarejo,
      lucroBruto: resultado.lucroBruto,
      lucroLiquido: resultado.lucroLiquido,
      margem: resultado.margem,
      potMensal: resultado.potMensal,
      taxaFalha: state.taxaFalha,
      custoKwh: state.custoKwh,
      peso: state.filamentoItems.reduce((s, f) => s + (f.pesoG || 0), 0),
      filamentoItems: JSON.parse(JSON.stringify(state.filamentoItems)),
      tempoH: state.horasImpressao + state.minutosImpressao / 60,
      qtd: state.quantidade,
      imposto: state.imposto,
      modoPrec: state.modoPrec,
      margemDesejada: state.margemDesejada,
      precoVenda: state.precoVenda,
      stlLink: state.stlLink,
      concorrenteLink: state.concorrenteLink,
      comPromo: state.comPromo,
      descontoPromo: state.descontoPromo,
    };
    // Gap conhecido e documentado (PRD seção 9): reabrir + editar + salvar de novo
    // cria item duplicado, não atualiza o existente. Não corrigir sem validar com o time.
    hist.unshift(entry);
    saveHistoricoArr(hist);
  };

  const restaurarHistorico = (h: HistoricoEntry) => {
    const horas = Math.floor(h.tempoH || 0);
    const minutos = Math.round(((h.tempoH || 0) - horas) * 60);
    setState((prev) => ({
      ...prev,
      nomePeca: h.nome || '',
      custoKwh: h.custoKwh || 0,
      quantidade: h.qtd || 1,
      taxaFalha: h.taxaFalha || 2,
      filamentoItems: h.filamentoItems && h.filamentoItems.length
        ? JSON.parse(JSON.stringify(h.filamentoItems))
        : (h.peso ? [novoFilamentoItem('Filamento', '', h.custoFilamento || 75, h.peso)] : []),
      imposto: h.imposto ?? prev.imposto,
      margemDesejada: h.margemDesejada || prev.margemDesejada,
      precoVenda: h.precoVenda || prev.precoVenda,
      modoPrec: h.modoPrec || prev.modoPrec,
      canalAtivo: h.marketplace || prev.canalAtivo,
      comPromo: !!h.comPromo,
      descontoPromo: h.descontoPromo ?? prev.descontoPromo,
      stlLink: h.stlLink || '',
      concorrenteLink: h.concorrenteLink || '',
      horasImpressao: horas,
      minutosImpressao: minutos,
    }));
    setErrorIds(new Set());
  };

  const value: Ctx = { state, set, patch, resultado, faltando, errorIds, calcularClick, resetCalculadora, salvarHistorico, restaurarHistorico };
  return <CalculadoraCtx.Provider value={value}>{children}</CalculadoraCtx.Provider>;
}

export function useCalculadora() {
  const ctx = useContext(CalculadoraCtx);
  if (!ctx) throw new Error('useCalculadora deve ser usado dentro de CalculadoraProvider');
  return ctx;
}
