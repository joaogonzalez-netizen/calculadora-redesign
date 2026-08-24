import { useMemo, useState } from 'react';
import type { Produto } from '../../lib/produtosMock';
import type { Canal, HistoricoEntry } from '../../types';
import type { ProdutoVinculo } from '../../lib/storage';
import { getHistorico } from '../../lib/storage';
import { brl } from '../../lib/format';
import Icon from '../Icon';
import InfoDot from '../InfoDot';

const CANAIS: Canal[] = ['Venda direta', 'Mercado Livre', 'Shopee'];
// Estimativa simples só pra pré-visualizar a taxa no modo manual — a fórmula real
// e completa por canal já existe em lib/calc.ts e é usada dentro da Calculadora.
const TAXA_ESTIMADA: Record<Produto['marketplace'], number> = { 'Mercado Livre': 0.14, Shopee: 0.14 };

function numFromBrl(s: string) {
  return parseFloat(s.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
}
function fmtData(id: number) {
  return new Date(id).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
}
function resumoCalculo(h: HistoricoEntry) {
  const material = h.filamentoItems?.[0]?.nome || 'Filamento';
  const peso = h.peso ? Math.round(h.peso) + 'g' : '';
  return `Calculado em ${fmtData(h.id)} · ${material}${peso ? ', ' + peso : ''}`;
}

interface Props {
  produto: Produto;
  vinculo?: ProdutoVinculo;
  onClose: () => void;
  onSave: (v: ProdutoVinculo) => void;
}

export default function CustoLucroDrawer({ produto, vinculo, onClose, onSave }: Props) {
  const jaVinculado = vinculo?.tipo === 'calculo';
  const [tab, setTab] = useState<'vincular' | 'manual'>(vinculo?.tipo === 'manual' ? 'manual' : 'vincular');
  const [canal, setCanal] = useState<Canal>('Venda direta');
  const [busca, setBusca] = useState(jaVinculado ? produto.nome.split(' - ')[0] : '');
  const [selecionadoId, setSelecionadoId] = useState<number | null>(vinculo?.calculoId ?? null);

  const [custoProducao, setCustoProducao] = useState(String(vinculo?.custoProducao ?? 4.2));
  const [custoAnuncio, setCustoAnuncio] = useState(String(vinculo?.custoAnuncio ?? 0.9));
  const [erro, setErro] = useState(false);

  const historico = useMemo(() => getHistorico(), []);
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return historico
      .filter((h) => h.marketplace === canal)
      .filter((h) => !termo || (h.nome || '').toLowerCase().includes(termo))
      .slice(0, 3);
  }, [historico, canal, busca]);

  const precoNum = numFromBrl(produto.preco);
  const taxaPct = TAXA_ESTIMADA[produto.marketplace] ?? 0.14;
  const custoProducaoNum = parseFloat(custoProducao.replace(',', '.')) || 0;
  const custoAnuncioNum = parseFloat(custoAnuncio.replace(',', '.')) || 0;
  const taxaMarketplace = precoNum * taxaPct;
  const lucroEstimado = precoNum - custoProducaoNum - custoAnuncioNum - taxaMarketplace;
  const margemPct = precoNum > 0 ? (lucroEstimado / precoNum) * 100 : 0;

  function confirmarVinculo() {
    if (selecionadoId === null) return;
    const escolhido = historico.find((h) => h.id === selecionadoId);
    // custoProducao guarda só o custoUnit do cálculo (sem taxa de canal) — é isso
    // que entra no "Custo de produção" do DRE; a taxa real vem da integração do marketplace.
    onSave({ tipo: 'calculo', calculoId: selecionadoId, custoProducao: escolhido?.custoUnit });
  }
  function salvarManual() {
    if (!erro) { setErro(true); return; } // 1º clique simula falha, ver PRD-like nota abaixo
    onSave({ tipo: 'manual', custoProducao: custoProducaoNum, custoAnuncio: custoAnuncioNum });
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer cl-drawer">
        <div className="cl-head">
          <div>
            <h4>Custo e lucro</h4>
            <div className="cl-sub">{produto.nome}</div>
          </div>
          <button type="button" className="cl-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>

        <div className="cl-tabs">
          <button type="button" className={'cl-tab' + (tab === 'vincular' ? ' active' : '')} onClick={() => setTab('vincular')}>Vincular cálculo salvo</button>
          <button type="button" className={'cl-tab' + (tab === 'manual' ? ' active' : '')} onClick={() => setTab('manual')}>Adicionar manualmente</button>
        </div>

        {tab === 'vincular' && (
          <div className="cl-body">
            <div className="cl-note cl-note-info">
              Só o <b>custo de produção</b> do cálculo (material, mão de obra e energia) é usado aqui. A taxa de marketplace desse produto já vem da integração real com {produto.marketplace} — não da taxa simulada dentro da calculadora, pra não contar o custo de canal duas vezes.
            </div>

            <div className="field">
              <div className="cl-search"><Icon name="search" size={15} /><input type="text" placeholder="Buscar produto..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
            </div>

            <div className="cl-label">{jaVinculado ? 'RESULTADO' : 'CÁLCULOS RECENTES'}</div>
            <div className="chip-row sm cl-chips">
              {CANAIS.map((c) => (
                <button key={c} type="button" className={'chip sm' + (canal === c ? ' active' : '')} onClick={() => setCanal(c)}>{c}</button>
              ))}
            </div>

            {filtrados.length === 0 && (
              <div className="cl-empty">
                Nenhum cálculo salvo encontrado. Você ainda não tem nenhum cálculo pronto pra esse produto.
                Crie um na calculadora de preços ou use "Adicionar manualmente".
              </div>
            )}

            {filtrados.map((h) => (
              <div
                key={h.id}
                className={'cl-calc-row' + (selecionadoId === h.id ? ' selected' : '')}
                onClick={() => setSelecionadoId(h.id)}
              >
                <span className="cl-radio" />
                <div className="cl-calc-main">
                  <div className="cl-calc-nome">{h.nome || 'Sem nome'}</div>
                  <div className="cl-calc-meta">{resumoCalculo(h)}</div>
                </div>
                <div className="cl-calc-preco">
                  <b>{brl(h.custoUnit)}</b>
                  <span>custo de produção</span>
                </div>
              </div>
            ))}

            {jaVinculado ? (
              <div className="cl-note">Este produto já tem um cálculo vinculado. Cada produto aceita apenas um vínculo ativo — selecionar outro cálculo substitui o atual.</div>
            ) : filtrados.length > 0 && (
              <div className="cl-note">Mostrando os {filtrados.length} cálculos mais recentes. Use a busca acima pra encontrar outros cálculos.</div>
            )}

            <div className="cl-footer">
              <button type="button" className="btn-outline" onClick={onClose}>Cancelar</button>
              <button type="button" className="btn-calc cl-btn-sm" disabled={selecionadoId === null} onClick={confirmarVinculo}>
                {jaVinculado ? 'Trocar vínculo' : 'Vincular'}
              </button>
            </div>
          </div>
        )}

        {tab === 'manual' && (
          <div className="cl-body">
            {erro && <div className="cl-error">Não foi possível salvar os custos. Verifique sua conexão e tente novamente.</div>}

            <div className="field">
              <label>Custo de produção</label>
              <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" step="0.01" value={custoProducao} onChange={(e) => setCustoProducao(e.target.value)} /></div>
            </div>
            <div className="field">
              <label>Custo de anúncio e taxas <InfoDot text="Frete, embalagem ou qualquer outro custo fixo por unidade que não veio de um cálculo salvo." /></label>
              <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" step="0.01" value={custoAnuncio} onChange={(e) => setCustoAnuncio(e.target.value)} /></div>
            </div>

            <div className="cl-result">
              <div className="cl-result-row"><span>Preço de venda</span><b>{brl(precoNum)}</b></div>
              <div className="cl-result-row"><span>Taxa de marketplace</span><b>{brl(taxaMarketplace)}</b></div>
              <div className="cl-result-row strong"><span>Lucro estimado</span><b className="cl-lucro">{brl(lucroEstimado)}</b></div>
              <div className="cl-result-sub">Margem est. {margemPct.toFixed(0)}% sobre o preço de venda</div>
            </div>

            <div className="cl-footer">
              <button type="button" className="btn-outline" onClick={onClose}>Cancelar</button>
              <button type="button" className="btn-calc cl-btn-sm" onClick={salvarManual}>{erro ? 'Tentar novamente' : 'Salvar'}</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
