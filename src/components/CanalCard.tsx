import { useCalculadora } from '../context/CalculadoraContext';
import { useLibrarias } from '../context/LibrariasContext';
import { useI18n } from '../context/I18nContext';
import type { Canal, PgtoId } from '../types';
import { brl } from '../lib/format';
import { getTiktokFaixa, getTiktokTaxaServicoFrete } from '../lib/calc';
import Card from './Card';

const CANAIS: Canal[] = ['Venda direta', 'Mercado Livre', 'Mercado Livre Argentina', 'Shopee', 'Etsy', 'TikTok Shop'];

const CANAL_LABEL_KEYS: Record<Canal, string> = {
  'Venda direta': 'calc.canalVendaDireta',
  'Mercado Livre': 'calc.canalMercadoLivre',
  'Mercado Livre Argentina': 'calc.canalMercadoLivreArgentina',
  'Shopee': 'calc.canalShopee',
  'Etsy': 'calc.canalEtsy',
  'TikTok Shop': 'calc.canalTiktokShop',
};

function usd(v: number): string {
  const n = isNaN(v) || v === null ? 0 : v;
  return '$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const ML_CATEGORIAS: { value: string; labelKey: string }[] = [
  { value: 'eletronicos|12|17', labelKey: 'calc.catEletronicos' },
  { value: 'casa|14|19', labelKey: 'calc.catCasaJardim' },
  { value: 'eletro|12|17', labelKey: 'calc.catEletrodomesticos' },
  { value: 'ferramentas|14|19', labelKey: 'calc.catFerramentas' },
  { value: 'esportes|14|19', labelKey: 'calc.catEsportesFitness' },
  { value: 'moda|16|19', labelKey: 'calc.catModaVestuario' },
  { value: 'beleza|14|19', labelKey: 'calc.catBelezaCuidadoPessoal' },
  { value: 'brinquedos|14|19', labelKey: 'calc.catBrinquedosHobbies' },
  { value: 'livros|10|15', labelKey: 'calc.catLivrosRevistas' },
  { value: 'alimentos|14|19', labelKey: 'calc.catAlimentosBebidas' },
  { value: 'autopecas|12|17', labelKey: 'calc.catAutopecas' },
  { value: 'outra', labelKey: 'calc.catOutraCategoria' },
];

// Mercado Livre Argentina — comissão por categoria (Clásica|Premium). Fonte
// terceirizada, ainda não validada oficialmente (ver aviso na UI, spec Argentina v1).
const ML_AR_CATEGORIAS: { value: string; labelKey: string }[] = [
  { value: 'alimentosBebidas|11.8|14.80', labelKey: 'calc.mlArCatAlimentosBebidas' },
  { value: 'supermercado|11.8|14.80', labelKey: 'calc.mlArCatSupermercado' },
  { value: 'celularesTelefonia|13.0|16.50', labelKey: 'calc.mlArCatCelularesTelefonia' },
  { value: 'eletrodomesticos|13.0|16.50', labelKey: 'calc.mlArCatEletrodomesticos' },
  { value: 'casaMoveisJardim|13.0|16.50', labelKey: 'calc.mlArCatCasaMoveisJardim' },
  { value: 'bebes|13.5|17.14', labelKey: 'calc.mlArCatBebes' },
  { value: 'esportesFitness|13.5|17.14', labelKey: 'calc.mlArCatEsportesFitness' },
  { value: 'ferramentas|13.5|17.14', labelKey: 'calc.mlArCatFerramentas' },
  { value: 'vestuarioAcessorios|13.5|17.14', labelKey: 'calc.mlArCatVestuarioAcessorios' },
  { value: 'jogosBrinquedos|13.5|17.14', labelKey: 'calc.mlArCatJogosBrinquedos' },
  { value: 'acessoriosVeiculos|14.0|17.14', labelKey: 'calc.mlArCatAcessoriosVeiculos' },
  { value: 'belezaCuidadoPessoal|14.0|17.14', labelKey: 'calc.mlArCatBelezaCuidadoPessoal' },
  { value: 'consolesVideogames|14.0|17.14', labelKey: 'calc.mlArCatConsolesVideogames' },
  { value: 'industriasEscritorios|14.0|17.14', labelKey: 'calc.mlArCatIndustriasEscritorios' },
  { value: 'musicaFilmesSeries|14.0|17.14', labelKey: 'calc.mlArCatMusicaFilmesSeries' },
  { value: 'saudeEquipamentoMedico|14.0|17.14', labelKey: 'calc.mlArCatSaudeEquipamentoMedico' },
  { value: 'servicos|14.0|17.14', labelKey: 'calc.mlArCatServicos' },
  { value: 'livrosRevistasQuadrinhos|14.5|17.14', labelKey: 'calc.mlArCatLivrosRevistasQuadrinhos' },
  { value: 'computacao|15.0|17.14', labelKey: 'calc.mlArCatComputacao' },
  { value: 'eletronicaAudioVideo|15.0|17.14', labelKey: 'calc.mlArCatEletronicaAudioVideo' },
  { value: 'outra', labelKey: 'calc.catOutraCategoria' },
];

export default function CanalCard() {
  const { state, set, errorIds, resultado } = useCalculadora();
  const { prefs } = useLibrarias();
  const { t } = useI18n();

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

  function onMlArCategoriaChange(v: string) {
    set('mlArCategoria', v);
    const outra = v === 'outra';
    set('mlArComissaoManual', outra);
    if (outra) { set('mlArComissao', 0); return; }
    if (!v) return;
    const [, classico, premium] = v.split('|');
    const pct = state.mlArTipo === 'premium' ? parseFloat(premium) : parseFloat(classico);
    set('mlArComissao', pct || 0);
  }

  function setMlArTipo(tipo: 'classico' | 'premium') {
    set('mlArTipo', tipo);
    if (state.mlArComissaoManual || !state.mlArCategoria || state.mlArCategoria === 'outra') return;
    const [, classico, premium] = state.mlArCategoria.split('|');
    set('mlArComissao', (tipo === 'premium' ? parseFloat(premium) : parseFloat(classico)) || 0);
  }

  function restaurarMlComissaoAutomatica() {
    if (!state.mlCategoria || state.mlCategoria === 'outra') return;
    const [, classico, premium] = state.mlCategoria.split('|');
    set('mlComissao', (state.mlTipo === 'premium' ? parseFloat(premium) : parseFloat(classico)) || 0);
    set('mlComissaoManual', false);
  }

  function restaurarMlArComissaoAutomatica() {
    if (!state.mlArCategoria || state.mlArCategoria === 'outra') return;
    const [, classico, premium] = state.mlArCategoria.split('|');
    set('mlArComissao', (state.mlArTipo === 'premium' ? parseFloat(premium) : parseFloat(classico)) || 0);
    set('mlArComissaoManual', false);
  }

  const taxaDebitoPadrao = prefs.taxaDebito ?? 1.99;
  const taxaCreditoPadrao = prefs.taxaCredito ?? 2.99;

  const precoAtual = resultado?.precoConsumidor ?? 0;
  const tiktokFaixaAtual = getTiktokFaixa(precoAtual);
  const tiktokTaxaFreteAtual = getTiktokTaxaServicoFrete(precoAtual);

  return (
    <Card icon="⌂" title={t('calc.canalDeVenda')}>
      <div className="chip-row">
        {CANAIS.map((c) => (
          <button key={c} type="button" className={'chip' + (state.canalAtivo === c ? ' active' : '')} onClick={() => selectCanal(c)}>{t(CANAL_LABEL_KEYS[c])}</button>
        ))}
      </div>

      {state.canalAtivo === 'Venda direta' && (
        <>
          <div className="field">
            <label>{t('calc.formaPagamento')}</label>
            <div className="toggle-cards cols-4">
              <div className={'toggle-card' + (state.pgtoSelecionado === 'debito' ? ' active' : '')} onClick={() => selectPgto('debito', taxaDebitoPadrao)}>
                <b>{t('calc.debito')}</b><span>{taxaDebitoPadrao.toString().replace('.', ',')}%</span>
              </div>
              <div className={'toggle-card' + (state.pgtoSelecionado === 'credito' ? ' active' : '')} onClick={() => selectPgto('credito', taxaCreditoPadrao)}>
                <b>{t('calc.credito')}</b><span>{taxaCreditoPadrao.toString().replace('.', ',')}%</span>
              </div>
              <div className={'toggle-card' + (state.pgtoSelecionado === 'pix' ? ' active' : '')} onClick={() => selectPgto('pix', 0)}>
                <b>{t('calc.pix')}</b><span>{t('calc.taxaEditavel')}</span>
              </div>
              <div className={'toggle-card' + (state.pgtoSelecionado === 'custom' ? ' active' : '')} onClick={() => selectPgto('custom', 0)}>
                <b>{t('calc.outraFormaPagamento')}</b><span>{t('calc.digitar')}</span>
              </div>
            </div>
          </div>

          {state.pgtoSelecionado === 'pix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="row2">
                <div className="field">
                  <label>{t('calc.taxaDoPix')}</label>
                  <div className="suffix-wrap"><input type="number" step="0.01" value={state.pgtoPixTaxa} onChange={(e) => { const v = parseFloat(e.target.value) || 0; set('pgtoPixTaxa', v); set('taxaCartaoPct', v); }} /><span className="sfx">%</span></div>
                  <div className="hint">{t('calc.pixTaxaGatewayHint')}</div>
                </div>
                <div className="field">
                  <label>{t('calc.descontoDoPix')}</label>
                  <div className="suffix-wrap"><input type="number" step="0.01" value={state.pgtoPixDesconto} onChange={(e) => set('pgtoPixDesconto', parseFloat(e.target.value) || 0)} /><span className="sfx">%</span></div>
                  <div className="hint">{t('calc.pixDescontoNaoAfetaMargemHint')}</div>
                </div>
              </div>
              <div className="field">
                <label>{t('calc.precoNoPixComDesconto')}</label>
                <input type="text" readOnly value={resultado ? brl(precoAtual * (1 - state.pgtoPixDesconto / 100)) : '-'} placeholder="-" />
              </div>
            </div>
          )}
          {state.pgtoSelecionado === 'custom' && (
            <div className="row2">
              <div className="field"><label>{t('calc.parcelas')}</label><input type="number" min={1} max={24} value={state.outraParcelas} onChange={(e) => set('outraParcelas', parseInt(e.target.value, 10) || 1)} /></div>
              <div className="field"><label>{t('calc.taxaDaOperacao')}</label><input type="number" step="0.01" value={state.pgtoCustom || ''} onChange={(e) => { const v = parseFloat(e.target.value) || 0; set('pgtoCustom', v); set('taxaCartaoPct', v); }} /></div>
            </div>
          )}

          <div className="divider-label">{t('calc.frete')}</div>
          <div className="field">
            <label>{t('calc.custoDoEnvio')}</label>
            <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" step="0.01" placeholder={t('calc.placeholderCustoEnvio')} value={state.freteDiretoCusto} onChange={(e) => set('freteDiretoCusto', parseFloat(e.target.value) || 0)} /></div>
          </div>

          <div className="switch-row">
            <label>{t('calc.incluirImpostoTaxaPagamento')}</label>
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
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>{t('calc.mlTipoAnuncio1')}</label>
            <div className="toggle-cards cols-2">
              <div className={'toggle-card' + (state.mlTipo === 'classico' ? ' active' : '')} onClick={() => setMlTipo('classico')}><b>{t('calc.classico')}</b><span>{t('calc.classicoDesc')}</span></div>
              <div className={'toggle-card' + (state.mlTipo === 'premium' ? ' active' : '')} onClick={() => setMlTipo('premium')}><b>{t('calc.premium')}</b><span>{t('calc.premiumDesc')}</span></div>
            </div>
          </div>

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>{t('calc.mlCategoriaDoAnuncio2')}</label>
            <select
              value={state.mlCategoria}
              onChange={(e) => onMlCategoriaChange(e.target.value)}
              className={errorIds.has('mlCategoria') ? 'input-error' : ''}
            >
              <option value="">{t('calc.escolhaCategorias')}</option>
              {ML_CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{t(c.labelKey)}</option>)}
            </select>
            {state.mlCategoria && state.mlCategoria !== 'outra' && !state.mlComissaoManual && (
              <div className="mini-table mini-table-muted" style={{ marginTop: 10 }}>
                <div className="mini-row">
                  <span>{t('calc.comissaoMlLabel')}</span>
                  <span><b>{state.mlComissao}%</b>{' '}<button type="button" className="link-btn" onClick={() => set('mlComissaoManual', true)}>{t('calc.editar')}</button></span>
                </div>
              </div>
            )}
            {state.mlComissaoManual && (
              <div className="row2" style={{ marginTop: 10, alignItems: 'flex-end' }}>
                <div className="field"><label>{t('calc.comissaoPct')}</label><input type="number" step="0.1" value={state.mlComissao || ''} onChange={(e) => set('mlComissao', parseFloat(e.target.value) || 0)} /></div>
                {state.mlCategoria && state.mlCategoria !== 'outra' && (
                  <button type="button" className="link-btn" style={{ marginBottom: 12 }} onClick={restaurarMlComissaoAutomatica}>{t('calc.restaurarAutomatico')}</button>
                )}
              </div>
            )}
          </div>

          {resultado && resultado.precoConsumidor < 79 && (
            <div className="alert">⚠️ {t('calc.alertaTarifaFixaMl')}</div>
          )}

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>{t('calc.mlFrete3')}</label>
            <div className="callout">
              <b>{t('calc.comoFunciona')}</b>
              {t('calc.mlBrasilFreteCalloutTexto')}
              {' '}<a href="https://www.mercadolivre.com.br/ajuda/40538" target="_blank" rel="noreferrer">{t('calc.verTabelaOficial')}</a>
            </div>
            <div className="field">
              <label>{t('calc.pesoEmbalagemEnvio')}</label>
              <div className="suffix-wrap"><input type="number" step="0.1" value={state.mlPesoEmbalagem} onChange={(e) => set('mlPesoEmbalagem', parseFloat(e.target.value) || 0)} /><span className="sfx">kg</span></div>
              <div className="hint">{t('calc.pesoEmbaladoFaixaFreteHint')}</div>
            </div>
            <div className="mini-table">
              <div className="mini-row"><span>{t('calc.faixaDePeso')}</span><b>{resultado?.taxas.freteInfo?.faixaPesoLabel ?? '-'}</b></div>
              <div className="mini-row"><span>{t('calc.faixaPrecoAnuncio')}</span><b>{resultado?.taxas.freteInfo?.faixaPrecoLabel ?? '-'}</b></div>
              <div className="mini-row"><span>{t('calc.custoFreteEstimado')}</span><b>{resultado?.taxas.freteInfo ? brl(resultado.taxas.freteInfo.custo) : '-'}</b></div>
            </div>
            <div className="hint">{t('calc.mlBrasilFreteAbaixo19Hint')}</div>
          </div>

          <div className="row3">
            <div className="field"><label>{t('calc.impostoSobreVenda')}</label><input type="number" value={state.mlImposto} onChange={(e) => set('mlImposto', parseFloat(e.target.value) || 0)} /></div>
            <div className="field"><label>{t('calc.mlAdsPct')}</label><input type="number" value={state.mlAds} onChange={(e) => set('mlAds', parseFloat(e.target.value) || 0)} /></div>
            <div className="field"><label>{t('calc.fullExtras')}</label><input type="number" value={state.mlExtras} onChange={(e) => set('mlExtras', parseFloat(e.target.value) || 0)} /></div>
          </div>
        </div>
      )}

      {state.canalAtivo === 'Mercado Livre Argentina' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>{t('calc.mlTipoAnuncio1')}</label>
            <div className="toggle-cards cols-2">
              <div className={'toggle-card' + (state.mlArTipo === 'classico' ? ' active' : '')} onClick={() => setMlArTipo('classico')}><b>{t('calc.classico')}</b><span>{t('calc.classicoDesc')}</span></div>
              <div className={'toggle-card' + (state.mlArTipo === 'premium' ? ' active' : '')} onClick={() => setMlArTipo('premium')}><b>{t('calc.premium')}</b><span>{t('calc.premiumDesc')}</span></div>
            </div>
          </div>

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>{t('calc.mlCategoriaDoAnuncio2')}</label>
            <select
              value={state.mlArCategoria}
              onChange={(e) => onMlArCategoriaChange(e.target.value)}
              className={errorIds.has('mlArCategoria') ? 'input-error' : ''}
            >
              <option value="">{t('calc.escolhaCategorias')}</option>
              {ML_AR_CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{t(c.labelKey)}</option>)}
            </select>
            {state.mlArCategoria && state.mlArCategoria !== 'outra' && !state.mlArComissaoManual && (
              <div className="mini-table mini-table-muted" style={{ marginTop: 10 }}>
                <div className="mini-row">
                  <span>{t('calc.comissaoMlLabel')}</span>
                  <span><b>{state.mlArComissao}%</b>{' '}<button type="button" className="link-btn" onClick={() => set('mlArComissaoManual', true)}>{t('calc.editar')}</button></span>
                </div>
              </div>
            )}
            {state.mlArComissaoManual && (
              <div className="row2" style={{ marginTop: 10, alignItems: 'flex-end' }}>
                <div className="field"><label>{t('calc.comissaoPct')}</label><input type="number" step="0.1" value={state.mlArComissao || ''} onChange={(e) => set('mlArComissao', parseFloat(e.target.value) || 0)} /></div>
                {state.mlArCategoria && state.mlArCategoria !== 'outra' && (
                  <button type="button" className="link-btn" style={{ marginBottom: 12 }} onClick={restaurarMlArComissaoAutomatica}>{t('calc.restaurarAutomatico')}</button>
                )}
              </div>
            )}
            <div className="hint">{t('calc.mlArDadosVigentesAviso')}</div>
          </div>

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>{t('calc.mlFrete3')}</label>
            <div className="callout">
              <b>{t('calc.comoFunciona')}</b>
              {t('calc.mlArgentinaFreteCalloutTexto')}
              {' '}<a href="https://www.mercadolibre.com.ar/knowledge-hub/42400" target="_blank" rel="noreferrer">{t('calc.verTabelaOficial')}</a>
            </div>
            <div className="field">
              <label>{t('calc.pesoEmbalagemEnvio')}</label>
              <div className="suffix-wrap"><input type="number" step="0.1" value={state.mlArPesoEmbalagem} onChange={(e) => set('mlArPesoEmbalagem', parseFloat(e.target.value) || 0)} /><span className="sfx">kg</span></div>
              <div className="hint">{t('calc.pesoEmbaladoFaixaFreteHint')}</div>
            </div>
            <div className="mini-table">
              <div className="mini-row"><span>{t('calc.faixaDePeso')}</span><b>{resultado?.taxas.freteInfo?.faixaPesoLabel ?? '-'}</b></div>
              <div className="mini-row"><span>{t('calc.faixaPrecoAnuncio')}</span><b>{resultado?.taxas.freteInfo?.faixaPrecoLabel ?? '-'}</b></div>
              <div className="mini-row"><span>{t('calc.custoFreteEstimado')}</span><b>{resultado?.taxas.freteInfo ? usd(resultado.taxas.freteInfo.custo) : '-'}</b></div>
            </div>
            <div className="hint">{t('calc.mlArgentinaCalculadoAposClicarHint')}</div>
          </div>
        </div>
      )}

      {state.canalAtivo === 'Shopee' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>{t('calc.tipoDeConta1')}</label>
            <div className="toggle-cards cols-2">
              <div className={'toggle-card' + (state.shopeeTipo === 'cnpj' ? ' active' : '')} onClick={() => { set('shopeeTipo', 'cnpj'); set('shopeeCpfAlto', false); }}><b>{t('calc.cnpj')}</b><span>{t('calc.cnpjDesc')}</span></div>
              <div className={'toggle-card' + (state.shopeeTipo === 'cpf' ? ' active' : '')} onClick={() => set('shopeeTipo', 'cpf')}><b>{t('calc.cpf')}</b><span>{t('calc.cpfDesc')}</span></div>
            </div>
          </div>
          {state.shopeeTipo === 'cpf' && (
            <div className="field">
              <label>{t('calc.volumeDePedidos')}</label>
              <div className="toggle-cards cols-2">
                <div className={'toggle-card' + (!state.shopeeCpfAlto ? ' active' : '')} onClick={() => set('shopeeCpfAlto', false)}><b>{t('calc.ate450Pedidos')}</b></div>
                <div className={'toggle-card' + (state.shopeeCpfAlto ? ' active' : '')} onClick={() => set('shopeeCpfAlto', true)}><b>{t('calc.maisDe450Pedidos')}</b></div>
              </div>
            </div>
          )}

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>{t('calc.comissaoPorFaixaPreco2')}</label>
            <div className="canal-tabela-wrap">
              <table className="canal-tabela">
                <thead><tr><th>{t('calc.thFaixa')}</th><th>{t('calc.thComissao')}</th><th>{t('calc.thTaxaFixa')}</th><th>{t('calc.thSubsidioFrete')}</th><th>{t('calc.thSubsidioPix')}</th></tr></thead>
                <tbody>
                  <tr><td>{t('calc.shopeeFaixaAte79')}</td><td>20%</td><td>R$ 4,00</td><td>R$ 20,00</td><td>—</td></tr>
                  <tr><td>{t('calc.shopeeFaixa80a99')}</td><td>14%</td><td>R$ 16,00</td><td>R$ 30,00</td><td>5%</td></tr>
                  <tr><td>{t('calc.shopeeFaixa100a199')}</td><td>14%</td><td>R$ 20,00</td><td>R$ 30,00</td><td>5%</td></tr>
                  <tr><td>{t('calc.shopeeFaixa200a499')}</td><td>14%</td><td>R$ 26,00</td><td>R$ 40,00</td><td>5%</td></tr>
                  <tr><td>{t('calc.shopeeFaixaAcima500')}</td><td>14%</td><td>R$ 26,00</td><td>R$ 40,00</td><td>8%</td></tr>
                </tbody>
              </table>
            </div>
            <div className="hint">{t('calc.shopeeValoresAutomaticosPoliticaHint')}</div>
          </div>

          <div className="callout">
            <b>{t('calc.shopeeRegrasBaixoValorTitulo')}</b>
            {t('calc.shopeeRegrasBaixoValorTexto')}
          </div>

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>{t('calc.shopeeFrete3')}</label>
            <div className="hint" style={{ marginBottom: 10 }}>{t('calc.shopeeProgramaFreteGratisHint')}</div>
            <label>{t('calc.custoDoFrete')}</label>
            <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" step="0.01" value={state.shopeeFrete} onChange={(e) => set('shopeeFrete', parseFloat(e.target.value) || 0)} /></div>
          </div>

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>{t('calc.configuracoesAdicionaisShopee4')}</label>
            <div className="switch-row">
              <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{t('calc.campanhaDeDestaque')}</div><div className="hint" style={{ marginTop: 2 }}>{t('calc.comissaoExtraCampanhaHint')}</div></div>
              <label className="switch"><input type="checkbox" checked={state.shopeeCampanhaDestaque} onChange={(e) => set('shopeeCampanhaDestaque', e.target.checked)} /><span className="track" /></label>
            </div>
            {state.shopeeCampanhaDestaque && (
              <div className="field"><label>{t('calc.comissaoExtra')}</label><div className="suffix-wrap"><input type="number" step="0.1" value={state.shopeeComissaoExtra} onChange={(e) => set('shopeeComissaoExtra', parseFloat(e.target.value) || 0)} /><span className="sfx">%</span></div></div>
            )}

            <div className="switch-row">
              <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{t('calc.cupomDescontoProprio')}</div><div className="hint" style={{ marginTop: 2 }}>{t('calc.descontoBancadoPorVoceHint')}</div></div>
              <label className="switch"><input type="checkbox" checked={state.shopeeCupomProprio} onChange={(e) => set('shopeeCupomProprio', e.target.checked)} /><span className="track" /></label>
            </div>
            {state.shopeeCupomProprio && (
              <div className="field"><label>{t('calc.valorCupomPorVenda')}</label><div className="prefix-wrap"><span className="pfx">R$</span><input type="number" step="0.01" value={state.shopeeCupomValor} onChange={(e) => set('shopeeCupomValor', parseFloat(e.target.value) || 0)} /></div></div>
            )}

            <div className="switch-row">
              <label>{t('calc.embutirImpostoTaxas')}</label>
              <label className="switch"><input type="checkbox" checked={state.embutirTaxas} onChange={(e) => set('embutirTaxas', e.target.checked)} /><span className="track" /></label>
            </div>
          </div>
        </div>
      )}

      {state.canalAtivo === 'Etsy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="callout">
            <b>{t('calc.etsyCanalDolarTitulo')}</b>
            {t('calc.etsyCanalDolarTexto')}
          </div>

          <div className="field">
            <label>{t('calc.custoDoFreteUsd')}</label>
            <div className="prefix-wrap"><span className="pfx" data-fixed="true">US$</span><input type="number" step="0.01" value={state.etsyFrete} onChange={(e) => set('etsyFrete', parseFloat(e.target.value) || 0)} /></div>
          </div>

          <div className="divider-label">{t('calc.taxasAplicadas')}</div>
          <div className="mini-table">
            <div className="mini-row"><span>Transaction fee</span><b>6,5%</b></div>
            <div className="mini-row"><span>Processing fee</span><b>3%</b></div>
            <div className="mini-row"><span>Listing fee</span><b>{usd(0.20)}</b></div>
            <div className="mini-row"><span>Regulatory operating fee</span><b>{usd(0.25)}</b></div>
          </div>

          <div className="divider-label">{t('calc.resumoEtsy')}</div>
          <div className="mini-table mini-table-muted">
            <div className="mini-row"><span>{t('calc.totalDeTaxas')}</span><b>{resultado ? usd(resultado.taxaValor) : '—'}</b></div>
            <div className="mini-row"><span>{t('calc.lucroEstimado')}</span><b>{resultado ? usd(resultado.lucroLiquido) : '—'}</b></div>
            <div className="mini-row"><span>{t('calc.margemLabel')}</span><b>{resultado ? `${resultado.margem.toFixed(1).replace('.', ',')}%` : '—'}</b></div>
          </div>
          <div className="hint">{t('calc.painelSomenteLeituraHint')}</div>
        </div>
      )}

      {state.canalAtivo === 'TikTok Shop' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="callout">
            <b>{t('calc.tiktokComoTaxasCalculadasTitulo')}</b>
            {t('calc.tiktokComoTaxasCalculadasTexto')}
          </div>

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>{t('calc.tiktokComissaoPorFaixaPreco1')}</label>
            <div className="canal-tabela-wrap">
              <table className="canal-tabela">
                <thead><tr><th>{t('calc.thFaixa')}</th><th>{t('calc.thComissao')}</th><th>{t('calc.thTarifaPorItem')}</th></tr></thead>
                <tbody>
                  <tr><td>{t('calc.tiktokFaixaAbaixo50')}</td><td>10%</td><td>R$ 4,00</td></tr>
                  <tr><td>{t('calc.tiktokFaixaAcimaIgual50')}</td><td>6%</td><td>R$ 6,00</td></tr>
                </tbody>
              </table>
            </div>
            <div className="hint">{t('calc.tiktokFaixaAplicadaPrefixo')} {Math.round(tiktokFaixaAtual.pct * 100)}% + {brl(tiktokFaixaAtual.fixo)}.</div>
          </div>

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>{t('calc.programaTaxaEnvio2')}</label>
            <div className="hint" style={{ marginBottom: 10 }}>{t('calc.tiktokTaxaServicoHint')}</div>
            <div className="mini-table">
              <div className="mini-row"><span>{t('calc.taxaDoPrograma')}</span><b>{brl(tiktokTaxaFreteAtual)}</b></div>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>{t('calc.custoFreteAdicional')}</label>
              <div className="prefix-wrap"><span className="pfx">R$</span><input type="number" step="0.01" value={state.tiktokFrete} onChange={(e) => set('tiktokFrete', parseFloat(e.target.value) || 0)} /></div>
              <div className="hint">{t('calc.tiktokCustoEnvioEstimadoHint')}</div>
            </div>
          </div>

          <div className="field">
            <label style={{ textTransform: 'uppercase', fontSize: 11.5, letterSpacing: '.06em', color: 'var(--text-3)' }}>{t('calc.configuracoesAdicionaisTiktok3')}</label>
            <div className="switch-row">
              <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{t('calc.souVendedorNovo')}</div><div className="hint" style={{ marginTop: 2 }}>{t('calc.tiktokIsencaoComissao60DiasHint')}</div></div>
              <label className="switch"><input type="checkbox" checked={state.tiktokNovoVendedor} onChange={(e) => set('tiktokNovoVendedor', e.target.checked)} /><span className="track" /></label>
            </div>
            {state.tiktokNovoVendedor && (
              <div className="hint">{t('calc.tiktokOfertaTempoLimitadoHint')}</div>
            )}
          </div>

          <div className="divider-label">{t('calc.resumoTiktokShop')}</div>
          <div className="mini-table mini-table-muted">
            <div className="mini-row"><span>{t('calc.totalDeTaxas')}</span><b>{resultado ? brl(resultado.taxaValor) : '—'}</b></div>
            <div className="mini-row"><span>{t('calc.lucroEstimado')}</span><b>{resultado ? brl(resultado.lucroLiquido) : '—'}</b></div>
            <div className="mini-row"><span>{t('calc.margemLabel')}</span><b>{resultado ? `${resultado.margem.toFixed(1).replace('.', ',')}%` : '—'}</b></div>
          </div>
          <div className="hint">{t('calc.painelSomenteLeituraHint')}</div>
        </div>
      )}
    </Card>
  );
}
