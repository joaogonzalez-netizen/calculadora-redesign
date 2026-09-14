import { useCalculadora } from '../context/CalculadoraContext';
import { useLibrarias } from '../context/LibrariasContext';
import type { Canal, PgtoId } from '../types';
import { brl } from '../lib/format';
import { getTiktokFaixa, getTiktokTaxaServicoFrete } from '../lib/calc';
import Card from './Card';

const CANAIS: Canal[] = ['Venda direta', 'Mercado Livre', 'Shopee', 'Etsy', 'TikTok Shop'];

const ML_CATEGORIAS: { value: string; label: string }[] = [
  { value: 'eletronicos|12|17', label: 'Eletrônicos / Informática' },
  { value: 'casa|14|19', label: 'Casa e jardim' },
  { value: 'eletro|12|17', label: 'Eletrodomésticos' },
  { value: 'ferramentas|14|19', label: 'Ferramentas' },
  { value: 'esportes|14|19', label: 'Esportes e fitness' },
  { value: 'moda|16|19', label: 'Moda e vestuário' },
  { value: 'beleza|14|19', label: 'Beleza e cuidado pessoal' },
  { value: 'brinquedos|14|19', label: 'Brinquedos e hobbies' },
  { value: 'livros|10|15', label: 'Livros e revistas' },
  { value: 'alimentos|14|19', label: 'Alimentos e bebidas' },
  { value: 'autopecas|12|17', label: 'Autopeças' },
  { value: 'outra', label: 'Outra categoria (digitar %)' },
];

export default function CanalCard() {
  const { state, set, errorIds, resultado } = useCalculadora();
  const { prefs } = useLibrarias();

  function selectCanal(canal: Canal) {
    set('canalAtivo', canal);
  }

  function selectPgto(id: PgtoId, taxa: number) {
    set('pgtoSelecionado', id);
    if (id === 'pix') set('taxaCartaoPct', state.pgtoPixTaxa);
    else if (id === 'custom') set('taxaCartaoPct', state.pgtoCustom);
    else set('taxaCartaoPct', taxa);
  }

  function onMlCategoriaChange(v: string) {
    set('mlCategoria', v);
    const outra = v === 'outra';
    set('mlComissaoManual', outra);
    if (outra) { set('mlComissao', 0); return; }
    if (!v) return;
    const [, classico, premium] = v.split('|');
    const pct = state.mlTipo === 'premium' ? parseFloat(premium) : parseFloat(classico);
    set('mlComissao', pct || 0);
  }

  function setMlTipo(tipo: 'classico' | 'premium') {
    set('mlTipo', tipo);
    if (state.mlComissaoManual || !state.mlCategoria || state.mlCategoria === 'outra') return;
    const [, classico, premium] = state.mlCategoria.split('|');
    set('mlComissao', (tipo === 'premium' ? parseFloat(premium) : parseFloat(classico)) || 0);
  }

  const taxaDebitoPadrao = prefs.taxaDebito ?? 1.99;
  const taxaCreditoPadrao = prefs.taxaCredito ?? 2.99;

  const precoAtual = resultado?.precoConsumidor ?? 0;
  const tiktokFaixaAtual = getTiktokFaixa(precoAtual);
  const tiktokTaxaFreteAtual = getTiktokTaxaServicoFrete(precoAtual);

  return (
    <Card icon="⌂" title="Canal de venda">
      <div className="chip-row">
        {CANAIS.map((c) => (
          <button key={c} type="button" className={'chip' + (state.canalAtivo === c ? ' active' : '')} onClick={() => selectCanal(c)}>{c}</button>
        ))}
      </div>

      {state.canalAtivo === 'Venda direta' && (
        <>
          <div className="field">
            <label>Forma de pagamento</label>
            <div className="toggle-cards cols-4">
              <div className={'toggle-card' + (state.pgtoSelecionado === 'debito' ? ' active' : '')} onClick={() => selectPgto('debito', taxaDebitoPadrao)}>
                <b>Débito</b><span>{taxaDebitoPadrao.toString().replace('.', ',')}%</span>
              </div>
              <div className={'toggle-card' + (state.pgtoSelecionado === 'credito' ? ' active' : '')} onClick={() => selectPgto('credito', taxaCreditoPadrao)}>
                <b>Crédito</b><span>{taxaCreditoPadrao.toString().replace('.', ',')}%</span>
              </div>
              <div className={'toggle-card' + (state.pgtoSelecionado === 'pix' ? ' active' : '')} onClick={() => selectPgto('pix', 0)}>
                <b>Pix</b><span>taxa editável</span>
              </div>
              <div className={'toggle-card' + (state.pgtoSelecionado === 'custom' ? ' active' : '')} onClick={() => selectPgto('custom', 0)}>
                <b>Outra</b><span>digitar</span>
              </div>
            </div>
          </div>

          {state.pgtoSelecionado === 'pix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="row2">
                <div className="field">
                  <label>Taxa do Pix (%)</label>
                  <div className="suffix-wrap"><input type="number" step="0.01" value={state.pgtoPixTaxa} onChange={(e) => { const v = parseFloat(e.target.value) || 0; set('pgtoPixTaxa', v); set('taxaCartaoPct', v); }} /><span className="sfx">%</span></div>
                  <div className="hint">Soma no custo e afeta a margem. Pix direto costuma ser 0%. Só preencha se usar um gateway (ex: Mercado Pago).</div>
                </div>
                <div className="field">
                  <label>Desconto do Pix (%)</label>
                  <div className="suffix-wrap"><input type="number" step="0.01" value={state.pgtoPixDesconto} onChange={(e) => set('pgtoPixDesconto', parseFloat(e.target.value) || 0)} /><span className="sfx">%</span></div>
                  <div className="hint">Reduz o preço mostrado ao comprador no Pix. Não afeta a margem do preço no cartão.</div>
                </div>
              </div>
              <div className="field">
                <label>Preço no Pix (com desconto)</label>
                <input type="text" readOnly value={resultado ? brl(precoAtual * (1 - state.pgtoPixDesconto / 100)) : '-'} placeholder="-" />
              </div>
            </div>
          )}
          {state.pgtoSelecionado === 'custom' && (
            <div className="row2">
              <div className="field"><label>Parcelas</label><input type="number" min={1} max={24} value={state.outraParcelas} onChange={(e) => set('outraParcelas', parseInt(e.target.value, 10) || 1)} /></div>
              <div className="field"><label>Taxa da operação (%)</label><input type="number" step="0.01" value={state.pgtoCustom || ''} onChange={(e) => { const v = parseFloat(e.target.value) || 0; set('pgtoCustom', v); set('taxaCartaoPct', v); }} /></div>
            </div>
          )}

          <div className="divider-label">Frete</div>
          <div className="field">
            <label>Custo do envio (R$)</label>
            <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" step="0.01" placeholder="Ex: 15,00" value={state.freteDiretoCusto} onChange={(e) => set('freteDiretoCusto', parseFloat(e.target.value) || 0)} /></div>
          </div>

          <div className="switch-row">
            <label>Incluir imposto e taxa de pagamento no preço final</label>
            <label className="switch">
              <input type="checkbox" checked={state.embutirTaxas} onChange={(e) => set('embutirTaxas', e.target.checked)} />
              <span className="track" />
            </label>
          </div>
        </>
      )}

      {state.canalAtivo === 'Mercado Livre' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>1 · Tipo de anúncio</label>
            <div className="toggle-cards cols-2">
              <div className={'toggle-card' + (state.mlTipo === 'classico' ? ' active' : '')} onClick={() => setMlTipo('classico')}><b>Clássico</b><span>Comissão de 10–16%</span></div>
              <div className={'toggle-card' + (state.mlTipo === 'premium' ? ' active' : '')} onClick={() => setMlTipo('premium')}><b>Premium</b><span>Comissão de 15–19% · parcelamento sem juros</span></div>
            </div>
          </div>

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>2 · Categoria do anúncio</label>
            <select
              value={state.mlCategoria}
              onChange={(e) => onMlCategoriaChange(e.target.value)}
              className={errorIds.has('mlCategoria') ? 'input-error' : ''}
            >
              <option value="">Escolha uma das categorias</option>
              {ML_CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {state.mlComissaoManual && (
              <div className="row2">
                <div className="field"><label>Comissão (%)</label><input type="number" step="0.1" value={state.mlComissao || ''} onChange={(e) => set('mlComissao', parseFloat(e.target.value) || 0)} /></div>
              </div>
            )}
          </div>

          {resultado && resultado.precoConsumidor < 79 && (
            <div className="alert">⚠️ Preço abaixo de R$ 79: tarifa fixa de R$ 6,00 será aplicada.</div>
          )}

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>3 · Frete</label>
            <div className="callout">
              <b>Como funciona</b>
              O custo de envio é descontado automaticamente da sua venda pelo Mercado Livre, mesmo quando o comprador paga o frete. Ele depende do peso da embalagem e da faixa de preço do anúncio. Os valores já incluem um desconto de até 70% por reputação verde.
              {' '}<a href="https://www.mercadolivre.com.br/ajuda/40538" target="_blank" rel="noreferrer">Ver tabela oficial ↗</a>
            </div>
            <div className="field">
              <label>Peso da embalagem para envio (kg)</label>
              <div className="suffix-wrap"><input type="number" step="0.1" value={state.mlPesoEmbalagem} onChange={(e) => set('mlPesoEmbalagem', parseFloat(e.target.value) || 0)} /><span className="sfx">kg</span></div>
              <div className="hint">Peso total do item embalado, define a faixa da tabela de frete.</div>
            </div>
            <div className="mini-table">
              <div className="mini-row"><span>Faixa de peso</span><b>{resultado?.taxas.freteInfo?.faixaPesoLabel ?? '-'}</b></div>
              <div className="mini-row"><span>Faixa de preço do anúncio</span><b>{resultado?.taxas.freteInfo?.faixaPrecoLabel ?? '-'}</b></div>
              <div className="mini-row"><span>Custo de frete estimado</span><b>{resultado?.taxas.freteInfo ? brl(resultado.taxas.freteInfo.custo) : '-'}</b></div>
            </div>
            <div className="hint">Anúncios abaixo de R$ 19 pagam, no máximo, metade do preço do produto em frete. Calculado após clicar em "Calcular", usando o preço ao consumidor. Valores estimados, validar com a tabela oficial (29 faixas de peso × 8 faixas de preço).</div>
          </div>

          <div className="row3">
            <div className="field"><label>Imposto sobre venda (%)</label><input type="number" value={state.mlImposto} onChange={(e) => set('mlImposto', parseFloat(e.target.value) || 0)} /></div>
            <div className="field"><label>ML Ads (%)</label><input type="number" value={state.mlAds} onChange={(e) => set('mlAds', parseFloat(e.target.value) || 0)} /></div>
            <div className="field"><label>Full / extras (R$)</label><input type="number" value={state.mlExtras} onChange={(e) => set('mlExtras', parseFloat(e.target.value) || 0)} /></div>
          </div>
        </div>
      )}

      {state.canalAtivo === 'Shopee' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>1 · Tipo de conta</label>
            <div className="toggle-cards cols-2">
              <div className={'toggle-card' + (state.shopeeTipo === 'cnpj' ? ' active' : '')} onClick={() => { set('shopeeTipo', 'cnpj'); set('shopeeCpfAlto', false); }}><b>CNPJ</b><span>Sem taxa adicional</span></div>
              <div className={'toggle-card' + (state.shopeeTipo === 'cpf' ? ' active' : '')} onClick={() => set('shopeeTipo', 'cpf')}><b>CPF</b><span>R$ 3,00/item acima de 450 pedidos em 90 dias</span></div>
            </div>
          </div>
          {state.shopeeTipo === 'cpf' && (
            <div className="field">
              <label>Volume de pedidos (últimos 90 dias)</label>
              <div className="toggle-cards cols-2">
                <div className={'toggle-card' + (!state.shopeeCpfAlto ? ' active' : '')} onClick={() => set('shopeeCpfAlto', false)}><b>Até 450 pedidos</b></div>
                <div className={'toggle-card' + (state.shopeeCpfAlto ? ' active' : '')} onClick={() => set('shopeeCpfAlto', true)}><b>Mais de 450 pedidos</b></div>
              </div>
            </div>
          )}

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>2 · Comissão por faixa de preço</label>
            <div className="canal-tabela-wrap">
              <table className="canal-tabela">
                <thead><tr><th>Faixa</th><th>Comissão</th><th>Taxa fixa</th><th>Subsídio frete</th><th>Subsídio Pix</th></tr></thead>
                <tbody>
                  <tr><td>Até R$ 79,99</td><td>20%</td><td>R$ 4,00</td><td>R$ 20,00</td><td>—</td></tr>
                  <tr><td>R$ 80 – R$ 99,99</td><td>14%</td><td>R$ 16,00</td><td>R$ 30,00</td><td>5%</td></tr>
                  <tr><td>R$ 100 – R$ 199,99</td><td>14%</td><td>R$ 20,00</td><td>R$ 30,00</td><td>5%</td></tr>
                  <tr><td>R$ 200 – R$ 499,99</td><td>14%</td><td>R$ 26,00</td><td>R$ 40,00</td><td>5%</td></tr>
                  <tr><td>Acima de R$ 500</td><td>14%</td><td>R$ 26,00</td><td>R$ 40,00</td><td>8%</td></tr>
                </tbody>
              </table>
            </div>
            <div className="hint">A Shopee aplica os valores automaticamente conforme a faixa de preço do produto. Política 2026 — vigência 01/03/2026, valores oficiais em R$.</div>
          </div>

          <div className="callout">
            <b>Regras de baixo valor</b>
            CNPJ com produto abaixo de R$ 8,00: a taxa fixa passa a ser 50% do valor do produto. CPF com produto abaixo de R$ 12,00: taxa regressiva (R$ 6,00 até R$ 8,00; R$ 6,50 entre R$ 8,00 e R$ 12,00).
          </div>

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>3 · Frete</label>
            <div className="hint" style={{ marginBottom: 10 }}>O Programa de Frete Grátis oferece cupons de até R$20 (itens até R$79,99), R$30 (R$80–R$199,99) e R$40 (acima de R$200). O subsídio de frete e o subsídio Pix são apenas informativos e não entram neste cálculo.</div>
            <label>Custo do frete (R$)</label>
            <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" step="0.01" value={state.shopeeFrete} onChange={(e) => set('shopeeFrete', parseFloat(e.target.value) || 0)} /></div>
          </div>

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>4 · Configurações adicionais</label>
            <div className="switch-row">
              <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>Campanha de destaque?</div><div className="hint" style={{ marginTop: 2 }}>Comissão extra durante períodos de campanha</div></div>
              <label className="switch"><input type="checkbox" checked={state.shopeeCampanhaDestaque} onChange={(e) => set('shopeeCampanhaDestaque', e.target.checked)} /><span className="track" /></label>
            </div>
            {state.shopeeCampanhaDestaque && (
              <div className="field"><label>Comissão extra (%)</label><div className="suffix-wrap"><input type="number" step="0.1" value={state.shopeeComissaoExtra} onChange={(e) => set('shopeeComissaoExtra', parseFloat(e.target.value) || 0)} /><span className="sfx">%</span></div></div>
            )}

            <div className="switch-row">
              <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>Cupom de desconto próprio?</div><div className="hint" style={{ marginTop: 2 }}>Desconto bancado por você, absorvido como custo</div></div>
              <label className="switch"><input type="checkbox" checked={state.shopeeCupomProprio} onChange={(e) => set('shopeeCupomProprio', e.target.checked)} /><span className="track" /></label>
            </div>
            {state.shopeeCupomProprio && (
              <div className="field"><label>Valor do cupom por venda (R$)</label><div className="prefix-wrap"><span className="pfx">R$</span><input type="number" step="0.01" value={state.shopeeCupomValor} onChange={(e) => set('shopeeCupomValor', parseFloat(e.target.value) || 0)} /></div></div>
            )}

            <div className="switch-row">
              <label>Embutir imposto e taxas no preço final</label>
              <label className="switch"><input type="checkbox" checked={state.embutirTaxas} onChange={(e) => set('embutirTaxas', e.target.checked)} /><span className="track" /></label>
            </div>
          </div>
        </div>
      )}

      {state.canalAtivo === 'Etsy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="callout">
            <b>Taxas em USD, sem conversão de moeda</b>
            6,5% de transação + 3% de processamento + $0,20 de listagem + $0,25 de taxa regulatória operacional.
          </div>
          <div className="field">
            <label>Custo do frete (US$)</label>
            <div className="prefix-wrap"><span className="pfx" data-fixed="true">US$</span><input type="number" step="0.01" value={state.etsyFrete} onChange={(e) => set('etsyFrete', parseFloat(e.target.value) || 0)} /></div>
          </div>
        </div>
      )}

      {state.canalAtivo === 'TikTok Shop' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="callout">
            <b>Como as taxas de vendas são calculadas por item</b>
            Taxas de vendas = (preço de varejo do produto − desconto do vendedor) × tarifa de comissão da plataforma + tarifa por item vendido.
          </div>

          <div className="mini-table">
            <div className="mini-row"><span>Preço após desconto &lt; R$ 50,00</span><b>10% + R$ 4,00/item</b></div>
            <div className="mini-row"><span>Preço após desconto ≥ R$ 50,00</span><b>6% + R$ 6,00/item</b></div>
            <div className="mini-row"><span>Faixa aplicada ao preço atual</span><b>{Math.round(tiktokFaixaAtual.pct * 100)}% + {brl(tiktokFaixaAtual.fixo)}</b></div>
            <div className="mini-row"><span>Taxa do Programa de taxa de envio</span><b>{brl(tiktokTaxaFreteAtual)}</b></div>
          </div>
          <div className="hint">Taxa do programa de envio: 6% do preço, limitada a R$ 50,00 por item — todo vendedor no Brasil é inscrito automaticamente e não é reembolsável após a entrega.</div>

          <div className="switch-row">
            <label>Sou vendedor novo (isenção da comissão por 60 dias)</label>
            <label className="switch">
              <input type="checkbox" checked={state.tiktokNovoVendedor} onChange={(e) => set('tiktokNovoVendedor', e.target.checked)} />
              <span className="track" />
            </label>
          </div>
          {state.tiktokNovoVendedor && (
            <div className="hint">Oferta por tempo limitado pra novos vendedores: isenta só a tarifa de comissão da plataforma, limitada a R$ 17.000,00 em vendas. A tarifa por item e a taxa do programa de envio continuam sendo cobradas.</div>
          )}

          <div className="field">
            <label>Custo de frete adicional (R$)</label>
            <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" step="0.01" value={state.tiktokFrete} onChange={(e) => set('tiktokFrete', parseFloat(e.target.value) || 0)} /></div>
            <div className="hint">Custo de envio estimado pelas dimensões da embalagem, além da taxa do programa de envio acima. Se o TikTok Shop já cobrir o frete via cupom, deixe em R$ 0,00.</div>
          </div>
        </div>
      )}
    </Card>
  );
}
