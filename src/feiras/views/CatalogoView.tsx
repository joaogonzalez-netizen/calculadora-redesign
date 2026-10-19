import { useStore } from '../lib/store';
import { useUi } from '../lib/ui';
import { brl } from '../lib/format';
import { custoProduto, precoAtacado, precoVarejo } from '../lib/pricing';
import { getHistorico } from '../../lib/storage';
import { useCalculadora } from '../../context/CalculadoraContext';
import { marcarOrigemCatalogo } from '../../lib/origemCalculadora';
import { Pagina, Vazio } from '../components/ui';
import Icon from '../components/Icon';

// Catálogo de vendas físicas: os produtos vêm da Calculadora de preços
// (cálculos salvos no Histórico), custo e preços são os do cálculo, então
// mudar o preço é recalcular na Calculadora e salvar de novo.
export default function CatalogoView() {
  const { db } = useStore();
  const { irParaCalculadora, abrir } = useUi();
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
    <Pagina titulo="Catálogo de vendas físicas" sub="Todo cálculo de Venda direta salvo na Calculadora de preços aparece aqui, sem taxas de marketplace." acoes={<>
      <button className="fe-btn fe-btn-outline" onClick={() => abrir('produto-calc')}>Produto da calculadora</button>
      <button className="fe-btn fe-btn-primary" onClick={() => abrirNaCalculadora()}><Icon name="plus" /> Novo produto</button></>}>
      <div className="fe-card">
        {db.produtos.length === 0 ? (
          <Vazio titulo="Nenhum produto de venda direta" texto="Calcule um produto com o canal Venda direta (“Novo produto”) ou traga um já calculado com “Produto da calculadora”: tudo que for venda direta aparece aqui."
            acao={<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}><button className="fe-btn fe-btn-outline" onClick={() => abrir('produto-calc')}>Produto da calculadora</button><button className="fe-btn fe-btn-primary" onClick={() => abrirNaCalculadora()}>Novo produto</button></div>} />
        ) : (
          <>
            <div className="fe-tbl-wrap"><table className="fe-tbl">
              <thead><tr><th>Produto</th><th className="fe-num">Tempo</th><th className="fe-num">Custo</th><th className="fe-num">Loja</th><th className="fe-num">Cliente final</th><th /></tr></thead>
              <tbody>{db.produtos.map((p) => (
                <tr key={p.id} onClick={() => abrirNaCalculadora(p.calcId)}>
                  <td><div className="fe-nm">{p.nome}</div><div className="fe-sub">{p.material}</div></td>                  <td className="fe-num">{p.tempoH} h</td><td className="fe-num">{brl(custoProduto(p, c))}</td><td className="fe-num">{brl(precoAtacado(p, c))}</td><td className="fe-num"><b>{brl(precoVarejo(p, c))}</b></td>
                  <td className="fe-num"><button className="fe-btn fe-btn-outline" onClick={(e) => { e.stopPropagation(); abrirNaCalculadora(p.calcId); }}>Abrir na calculadora</button></td>
                </tr>))}</tbody></table></div>
            <div className="fe-cards-m" style={{ padding: 12 }}>
              {db.produtos.map((p) => (
                <div key={p.id} className="fe-list-item" role="button" tabIndex={0} onClick={() => abrirNaCalculadora(p.calcId)} style={{ cursor: 'pointer' }}>
                  <div className="fe-grow"><div className="fe-t">{p.nome}</div><div className="fe-s">custo {brl(custoProduto(p, c))}</div></div>
                  <div style={{ textAlign: 'right' }}><b>{brl(precoVarejo(p, c))}</b><div className="fe-s">loja {brl(precoAtacado(p, c))}</div></div>
                </div>))}
            </div>
          </>
        )}
      </div>
    </Pagina>
  );
}
