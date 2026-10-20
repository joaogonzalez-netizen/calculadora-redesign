import { useMemo, useState } from 'react';
import { precoProdutoNumero, type Produto } from '../../lib/produtosMock';
import type { Idioma } from '../../lib/i18n';
import type { Canal, HistoricoEntry } from '../../types';
import type { ProdutoVinculo } from '../../lib/storage';
import { getHistorico } from '../../lib/storage';
import { brl } from '../../lib/format';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';
import InfoDot from '../InfoDot';

// Canais do filtro de cálculos por idioma: EN (mercado americano) usa Etsy e TikTok Shop.
const CANAIS_POR_IDIOMA: Record<Idioma, Canal[]> = {
  pt: ['Venda direta', 'Mercado Livre', 'Shopee'],
  es: ['Venda direta', 'Mercado Livre', 'Shopee'],
  en: ['Venda direta', 'Etsy', 'TikTok Shop'],
};
// Estimativa simples só pra pré-visualizar a taxa no modo manual, a fórmula real
// e completa por canal já existe em lib/calc.ts e é usada dentro da Calculadora.
const TAXA_ESTIMADA: Record<Produto['marketplace'], number> = { 'Mercado Livre': 0.14, Shopee: 0.14, Etsy: 0.095, 'TikTok Shop': 0.08 };

function numFromBrl(s: string) {
  return precoProdutoNumero(s) || 0;
}
function fmtData(id: number, en: boolean) {
  if (en) return new Date(id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return new Date(id).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
}
function resumoCalculo(h: HistoricoEntry, en: boolean) {
  const material = h.filamentoItems?.[0]?.nome || (en ? 'Filament' : 'Filamento');
  const peso = h.peso ? Math.round(h.peso) + 'g' : '';
  return `${en ? 'Calculated on' : 'Calculado em'} ${fmtData(h.id, en)} · ${material}${peso ? ', ' + peso : ''}`;
}

interface Props {
  produto: Produto;
  vinculo?: ProdutoVinculo;
  onClose: () => void;
  onSave: (v: ProdutoVinculo) => void;
}

export default function CustoLucroDrawer({ produto, vinculo, onClose, onSave }: Props) {
  const { t, idioma } = useI18n();
  const en = idioma === 'en';
  const CANAIS = CANAIS_POR_IDIOMA[idioma];
  const moeda = en ? '$' : 'R$';
  const jaVinculado = vinculo?.tipo === 'calculo';
  const [tab, setTab] = useState<'vincular' | 'manual'>(vinculo?.tipo === 'manual' ? 'manual' : 'vincular');
  const [canal, setCanal] = useState<Canal>('Venda direta');
  const [busca, setBusca] = useState(jaVinculado ? produto.nome : '');
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
    // custoProducao guarda só o custoUnit do cálculo (sem taxa de canal), é isso
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
            <h4>{t('produtos.custoLucroTitulo')}</h4>
            <div className="cl-sub">{produto.nome}</div>
          </div>
          <button type="button" className="cl-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>

        <div className="cl-tabs">
          <button type="button" className={'cl-tab' + (tab === 'vincular' ? ' active' : '')} onClick={() => setTab('vincular')}>{t('produtos.vincularCalculoSalvo')}</button>
          <button type="button" className={'cl-tab' + (tab === 'manual' ? ' active' : '')} onClick={() => setTab('manual')}>{t('produtos.adicionarManualmente')}</button>
        </div>

        {tab === 'vincular' && (
          <div className="cl-body">
            {en ? (
              <div className="cl-note cl-note-info">
                Only the <b>production cost</b> from the calculation (material, labor and energy) is used here. This product's marketplace fee already comes from the real {produto.marketplace} integration, not from the fee simulated in the calculator, so the channel cost isn't counted twice.
              </div>
            ) : (
              <div className="cl-note cl-note-info">
                Só o <b>custo de produção</b> do cálculo (material, mão de obra e energia) é usado aqui. A taxa de marketplace desse produto já vem da integração real com {produto.marketplace}, não da taxa simulada dentro da calculadora, pra não contar o custo de canal duas vezes.
              </div>
            )}

            <div className="field">
              <div className="cl-search"><Icon name="search" size={15} /><input type="text" placeholder={t('produtos.buscarProdutoPlaceholder')} value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
            </div>

            <div className="cl-label">{jaVinculado ? t('produtos.resultadoLabel') : t('produtos.calculosRecentesLabel')}</div>
            <div className="chip-row sm cl-chips">
              {CANAIS.map((c) => (
                <button key={c} type="button" className={'chip sm' + (canal === c ? ' active' : '')} onClick={() => setCanal(c)}>{c === 'Venda direta' ? t('produtos.vendaDireta') : c}</button>
              ))}
            </div>

            {filtrados.length === 0 && (
              en ? (
                <div className="cl-empty">
                  No saved calculations found. You don't have a calculation for this product yet.
                  Create one in the pricing calculator or use "{t('produtos.adicionarManualmente')}".
                </div>
              ) : (
                <div className="cl-empty">
                  Nenhum cálculo salvo encontrado. Você ainda não tem nenhum cálculo pronto pra esse produto.
                  Crie um na calculadora de preços ou use "Adicionar manualmente".
                </div>
              )
            )}

            {filtrados.map((h) => (
              <div
                key={h.id}
                className={'cl-calc-row' + (selecionadoId === h.id ? ' selected' : '')}
                onClick={() => setSelecionadoId(h.id)}
              >
                <span className="cl-radio" />
                <div className="cl-calc-main">
                  <div className="cl-calc-nome">{h.nome || (en ? 'Untitled' : 'Sem nome')}</div>
                  <div className="cl-calc-meta">{resumoCalculo(h, en)}</div>
                </div>
                <div className="cl-calc-preco">
                  <b>{brl(h.custoUnit)}</b>
                  <span>{t('produtos.custoDeProducao')}</span>
                </div>
              </div>
            ))}

            {jaVinculado ? (
              <div className="cl-note">{en
                ? 'This product already has a linked calculation. Each product accepts only one active link; selecting another calculation replaces the current one.'
                : 'Este produto já tem um cálculo vinculado. Cada produto aceita apenas um vínculo ativo, selecionar outro cálculo substitui o atual.'}</div>
            ) : filtrados.length > 0 && (
              <div className="cl-note">{en
                ? `Showing the ${filtrados.length} most recent calculations. Use the search above to find others.`
                : `Mostrando os ${filtrados.length} cálculos mais recentes. Use a busca acima pra encontrar outros cálculos.`}</div>
            )}

            <div className="cl-footer">
              <button type="button" className="btn-outline" onClick={onClose}>{t('produtos.cancelar')}</button>
              <button type="button" className="btn-calc cl-btn-sm" disabled={selecionadoId === null} onClick={confirmarVinculo}>
                {jaVinculado ? t('produtos.trocarVinculo') : t('produtos.vincular')}
              </button>
            </div>
          </div>
        )}

        {tab === 'manual' && (
          <div className="cl-body">
            {erro && <div className="cl-error">{en ? "Couldn't save the costs. Check your connection and try again." : 'Não foi possível salvar os custos. Verifique sua conexão e tente novamente.'}</div>}

            <div className="field">
              <label>{t('produtos.custoDeProducao')}</label>
              <div className="prefix-wrap"><span className="pfx">{moeda}</span><input type="number" step="0.01" value={custoProducao} onChange={(e) => setCustoProducao(e.target.value)} /></div>
            </div>
            <div className="field">
              <label>{t('produtos.custoDeAnuncioETaxas')} <InfoDot text={en ? 'Shipping, packaging or any other fixed per-unit cost that did not come from a saved calculation.' : 'Frete, embalagem ou qualquer outro custo fixo por unidade que não veio de um cálculo salvo.'} /></label>
              <div className="prefix-wrap"><span className="pfx">{moeda}</span><input type="number" step="0.01" value={custoAnuncio} onChange={(e) => setCustoAnuncio(e.target.value)} /></div>
            </div>

            <div className="cl-result">
              <div className="cl-result-row"><span>{t('produtos.precoDeVenda')}</span><b>{brl(precoNum)}</b></div>
              <div className="cl-result-row"><span>{t('produtos.taxaDeMarketplace')}</span><b>{brl(taxaMarketplace)}</b></div>
              <div className="cl-result-row strong"><span>{t('produtos.lucroEstimado')}</span><b className="cl-lucro">{brl(lucroEstimado)}</b></div>
              <div className="cl-result-sub">{t('produtos.margemEstSobrePrecoVenda').replace('{pct}', margemPct.toFixed(0))}</div>
            </div>

            <div className="cl-footer">
              <button type="button" className="btn-outline" onClick={onClose}>{t('produtos.cancelar')}</button>
              <button type="button" className="btn-calc cl-btn-sm" onClick={salvarManual}>{erro ? t('produtos.tentarNovamente') : t('produtos.salvar')}</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
