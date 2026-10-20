import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl } from '../lib/format';
import { custoProduto, precoAtacado, precoVarejo } from '../lib/pricing';
import { getHistorico } from '../../lib/storage';
import { useCalculadora } from '../../context/CalculadoraContext';
import { marcarOrigemCatalogo } from '../../lib/origemCalculadora';
import { Pagina, Vazio } from '../components/ui';
import Icon from '../components/Icon';
import { useFeirasT } from '../lib/i18n';

// Catálogo de venda direta: os produtos vêm da Calculadora de preços
// (cálculos salvos no Histórico), custo e preços são os do cálculo, então
// mudar o preço é recalcular na Calculadora e salvar de novo.
export default function CatalogoView() {
  const { db } = useStore();
  const { irParaCalculadora, abrir } = useUi();
  const { t } = useFeirasT();
  const { restaurarHistorico, resetCalculadora, patch } = useCalculadora();
  const c = db.config;

  function abrirNaCalculadora(calcId?: number) {
    const entry = calcId ? getHistorico().find((h) => h.id === calcId) : undefined;
    if (entry) restaurarHistorico(entry); else resetCalculadora();
    // No catálogo o preço é de venda direta: abre a calculadora com as taxas de
    // venda direta (não as do marketplace). Salvar no histórico atualiza o produto aqui.
    patch({ canalAtivo: 'Venda direta' });
    marcarOrigemCatalogo();
    irParaCalculadora();
  }

  return (
    <Pagina titulo={t('feiras.catalogo.titulo')} sub={t('feiras.catalogo.sub')} acoes={<>
      <button className="fe-btn fe-btn-outline" onClick={() => abrir('produto-calc')}>{t('feiras.catalogo.produtoCalc')}</button>
      <button className="fe-btn fe-btn-primary" onClick={() => abrirNaCalculadora()}><Icon name="plus" /> {t('feiras.catalogo.novoProduto')}</button></>}>
      <div className="fe-card">
        {db.produtos.length === 0 ? (
          <Vazio titulo={t('feiras.catalogo.vazioTitulo')} texto={t('feiras.catalogo.vazioTexto')}
            acao={<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}><button className="fe-btn fe-btn-outline" onClick={() => abrir('produto-calc')}>{t('feiras.catalogo.produtoCalc')}</button><button className="fe-btn fe-btn-primary" onClick={() => abrirNaCalculadora()}>{t('feiras.catalogo.novoProduto')}</button></div>} />
        ) : (
          <>
            <div className="fe-tbl-wrap"><table className="fe-tbl">
              <thead><tr><th>{t('feiras.catalogo.colProduto')}</th><th className="fe-num">{t('feiras.catalogo.colTempo')}</th><th className="fe-num">{t('feiras.catalogo.colCusto')}</th><th className="fe-num">{t('feiras.catalogo.colLoja')}</th><th className="fe-num">{t('feiras.catalogo.colFinal')}</th><th /></tr></thead>
              <tbody>{db.produtos.map((p) => (
                <tr key={p.id} onClick={() => abrirNaCalculadora(p.calcId)}>
                  <td><div className="fe-nm">{p.nome}</div><div className="fe-sub">{p.material}</div></td>                  <td className="fe-num">{p.tempoH} h</td><td className="fe-num">{brl(custoProduto(p, c))}</td><td className="fe-num">{brl(precoAtacado(p, c))}</td><td className="fe-num"><b>{brl(precoVarejo(p, c))}</b></td>
                  <td className="fe-num"><button className="fe-btn fe-btn-outline" onClick={(e) => { e.stopPropagation(); abrirNaCalculadora(p.calcId); }}>{t('feiras.catalogo.abrirCalc')}</button></td>
                </tr>))}</tbody></table></div>
            <div className="fe-cards-m" style={{ padding: 12 }}>
              {db.produtos.map((p) => (
                <div key={p.id} className="fe-list-item" role="button" tabIndex={0} onClick={() => abrirNaCalculadora(p.calcId)} style={{ cursor: 'pointer' }}>
                  <div className="fe-grow"><div className="fe-t">{p.nome}</div><div className="fe-s">{t('feiras.catalogo.custoM', { v: brl(custoProduto(p, c)) })}</div></div>
                  <div style={{ textAlign: 'right' }}><b>{brl(precoVarejo(p, c))}</b><div className="fe-s">{t('feiras.catalogo.lojaM', { v: brl(precoAtacado(p, c)) })}</div></div>
                </div>))}
            </div>
          </>
        )}
      </div>
    </Pagina>
  );
}
