import { useEffect, useState } from 'react';
import type { Produto } from '../../lib/produtosMock';
import { gerarSugestoes, notaGeral } from '../../lib/otimizadorMock';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

function editarNoMarketplace(nome: string) {
  alert(`Em breve: editar "${nome}" direto no marketplace.`);
}

function corNota(n: number) {
  if (n >= 80) return 'var(--primary-dark)';
  if (n >= 60) return 'var(--accent)';
  return 'var(--red)';
}

export default function OtimizarAnuncioDrawer({ produto, onClose }: { produto: Produto; onClose: () => void }) {
  const { t } = useI18n();
  const [carregando, setCarregando] = useState(true);
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);

  useEffect(() => {
    setCarregando(true);
    const t = setTimeout(() => setCarregando(false), 700);
    return () => clearTimeout(t);
  }, [produto.id]);

  const sugestoes = gerarSugestoes(produto);
  const nota = notaGeral(produto);

  function copiar(texto: string, idx: number) {
    navigator.clipboard?.writeText(texto);
    setCopiadoIdx(idx);
    setTimeout(() => setCopiadoIdx((atual) => (atual === idx ? null : atual)), 1500);
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer otim-drawer">
        <div className="cl-head">
          <div>
            <h4><Icon name="otimizador" size={17} style={{ verticalAlign: '-3px', marginRight: 6 }} /> {t('produtos.otimizarAnuncioComIa')}</h4>
            <div className="cl-sub">{produto.nome}</div>
          </div>
          <button type="button" className="cl-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>

        {carregando ? (
          <div className="otim-loading">
            <div className="otim-spinner" />
            {t('produtos.analisandoAnuncio')}
          </div>
        ) : (
          <div className="cl-body">
            <div className="otim-nota-card">
              <div className="otim-nota" style={{ color: corNota(nota) }}>{nota}<span>/100</span></div>
              <div>
                <div className="otim-nota-label">{t('produtos.notaDeOtimizacao')}</div>
                <div className="hint">Compara título, descrição, preço e imagens com anúncios de melhor performance no mesmo canal.</div>
              </div>
            </div>

            <div className="divider-label" style={{ margin: '20px 0 14px' }}>{t('produtos.sugestoesDaIa')}</div>

            {sugestoes.map((s, idx) => (
              <div className="otim-card" key={s.categoria}>
                <div className="otim-card-head">
                  <span className="otim-card-label">{s.label}</span>
                  <span className="otim-impacto">{s.impacto}</span>
                </div>
                <div className="otim-problema">{s.problema}</div>
                <div className="otim-sugestao">{s.sugestao}</div>
                <div className="otim-card-actions">
                  <button type="button" className="btn-outline otim-copiar" onClick={() => copiar(s.sugestao, idx)}>
                    {copiadoIdx === idx ? <><Icon name="check" size={13} /> {t('produtos.copiado')}</> : t('produtos.copiarSugestao')}
                  </button>
                  <button type="button" className="btn-outline otim-copiar" onClick={() => editarNoMarketplace(produto.nome)}>
                    {t('produtos.editarNoMarketplace')}
                  </button>
                </div>
              </div>
            ))}

            <div className="cl-note" style={{ marginTop: 4 }}>
              {t('produtos.sugestoesGeradasAutomaticamente')}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
