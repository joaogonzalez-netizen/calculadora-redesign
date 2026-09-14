import { useMemo, useState } from 'react';
import { DRE_LINHAS, DRE_MARGEM_LIQUIDA } from '../../lib/dashboardMock';
import { contarProdutosSemVinculo } from '../../lib/produtosMock';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';
import InfoDot from '../InfoDot';

const CHAVES_MES = [
  'dashboard.mesJaneiro', 'dashboard.mesFevereiro', 'dashboard.mesMarco', 'dashboard.mesAbril', 'dashboard.mesMaio', 'dashboard.mesJunho',
  'dashboard.mesJulho', 'dashboard.mesAgosto', 'dashboard.mesSetembro', 'dashboard.mesOutubro', 'dashboard.mesNovembro', 'dashboard.mesDezembro',
];

// Últimos 6 meses até o mês atual, sempre com o mês atual selecionado por
// padrão. Os dados ainda são mock, então trocar o mês não refiltra nada —
// fica pronto pra ligar quando existir API por período.
function gerarOpcoesMes(t: (chave: string) => string) {
  const hoje = new Date();
  const opcoes = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    opcoes.push({ valor: `${d.getFullYear()}-${d.getMonth()}`, label: `${t(CHAVES_MES[d.getMonth()])} ${d.getFullYear()}` });
  }
  return opcoes;
}

function fmt(v: number) {
  const sinal = v < 0 ? '− ' : '';
  return sinal + 'R$ ' + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function baixarRelatorioCompleto(mesLabel: string) {
  const linhas = ['Linha;Valor (R$)'];
  DRE_LINHAS.forEach((l) => {
    linhas.push(`${l.label};${l.valor.toFixed(2).replace('.', ',')}`);
    l.subitens?.forEach((s) => linhas.push(`  ${s.label};${s.valor.toFixed(2).replace('.', ',')}`));
  });
  linhas.push('');
  linhas.push(`Margem líquida;${DRE_MARGEM_LIQUIDA}`);
  const csv = '﻿' + linhas.join('\n'); // BOM pra acentuação abrir certo no Excel
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dre-${mesLabel.toLowerCase().replace(' ', '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function DreCard({ onVerProdutosSemCusto }: { onVerProdutosSemCusto: () => void }) {
  const { t } = useI18n();
  const { semVinculo, total } = contarProdutosSemVinculo();
  const opcoesMes = useMemo(() => gerarOpcoesMes(t), [t]);
  const [mes, setMes] = useState(opcoesMes[0].valor);
  const mesLabel = opcoesMes.find((o) => o.valor === mes)?.label ?? opcoesMes[0].label;
  // Teste visual: totalizadores com cor por tipo de linha (receita/dedução/
  // subtotal/resultado), em vez do cinza neutro padrão. Só estado local —
  // não persiste, é só pra comparar as duas versões lado a lado.
  const [colorido, setColorido] = useState(true);

  return (
    <div className="card dre-card">
      <div className="card-body" style={{ paddingTop: 22 }}>
        <div className="dre-head">
          <div>
            <h4>{t('dashboard.dreDoMes')}</h4>
            <div className="chart-sub">{t('dashboard.demonstrativoResultadoSimplificado')}</div>
            <div className="dre-filtro-mes">
              <label htmlFor="dre-mes">{t('dashboard.periodo')}</label>
              <select id="dre-mes" value={mes} onChange={(e) => setMes(e.target.value)}>
                {opcoesMes.map((o) => <option key={o.valor} value={o.valor}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <button type="button" className="btn-outline" onClick={() => baixarRelatorioCompleto(mesLabel)}>
            <Icon name="upload" size={14} style={{ transform: 'rotate(180deg)' }} /> {t('dashboard.baixarRelatorioCompleto')}
          </button>
        </div>

        <div className="cluster-modo-toggle dre-modo-toggle">
          <button type="button" className={!colorido ? 'active' : ''} onClick={() => setColorido(false)}>{t('dashboard.padrao')}</button>
          <button type="button" className={colorido ? 'active' : ''} onClick={() => setColorido(true)}>{t('dashboard.totalizadoresColoridos')}</button>
        </div>

        <div className={'dre-table' + (colorido ? ' dre-colorido' : '')}>
          {DRE_LINHAS.map((l) => (
            <div key={l.label}>
              <div className={'dre-row dre-' + l.tipo}>
                <span className="dre-label">
                  {l.label}
                  {l.pct && <span className="dre-pct">{l.pct}</span>}
                  {l.hint && <InfoDot text={l.hint} />}
                </span>
                <b className="dre-valor">{fmt(l.valor)}</b>
              </div>

              {l.subitens && (
                <div className="dre-subitens">
                  {l.subitens.map((s) => (
                    <div className="dre-subrow" key={s.label}>
                      <span>{s.label}</span>
                      <span>{fmt(s.valor)}</span>
                    </div>
                  ))}
                </div>
              )}

              {l.dependeDeVinculo && (
                <div className="dre-caption">{t('dashboard.dreCaptionTaxaMarketplace')}</div>
              )}

              {l.dependeDeVinculo && semVinculo > 0 && (
                <div className="dre-alerta">
                  <span>
                    ⚠ {t('dashboard.produtosSemCustoAlerta').replace('{sem}', String(semVinculo)).replace('{total}', String(total))}
                  </span>
                  <button type="button" className="btn-outline dre-alerta-btn" onClick={onVerProdutosSemCusto}>{t('dashboard.verProdutosSemCusto')}</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="dre-footer">
          <div className="dre-margem"><span>{t('dashboard.margemLiquida')}</span><b>{DRE_MARGEM_LIQUIDA}</b></div>
        </div>
      </div>
    </div>
  );
}
