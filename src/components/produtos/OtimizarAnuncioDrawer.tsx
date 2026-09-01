import { useEffect, useState } from 'react';
import type { Produto } from '../../lib/produtosMock';
import { gerarSugestoes, notaGeral, type CategoriaOtimizacao } from '../../lib/otimizadorMock';
import Icon from '../Icon';

const ICONE_CATEGORIA: Record<CategoriaOtimizacao, string> = {
  titulo: '🔤', descricao: '📝', preco: '💰', imagem: '🖼️',
};

function corNota(n: number) {
  if (n >= 80) return 'var(--primary-dark)';
  if (n >= 60) return 'var(--accent)';
  return 'var(--red)';
}

export default function OtimizarAnuncioDrawer({ produto, onClose }: { produto: Produto; onClose: () => void }) {
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
            <h4><Icon name="otimizador" size={17} style={{ verticalAlign: '-3px', marginRight: 6 }} /> Otimizar anúncio com IA</h4>
            <div className="cl-sub">{produto.nome}</div>
          </div>
          <button type="button" className="cl-close" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>

        {carregando ? (
          <div className="otim-loading">
            <div className="otim-spinner" />
            Analisando título, descrição, preço e imagens...
          </div>
        ) : (
          <div className="cl-body">
            <div className="otim-nota-card">
              <div className="otim-nota" style={{ color: corNota(nota) }}>{nota}<span>/100</span></div>
              <div>
                <div className="otim-nota-label">Nota de otimização do anúncio</div>
                <div className="hint">Compara título, descrição, preço e imagens com anúncios de melhor performance no mesmo canal.</div>
              </div>
            </div>

            <div className="divider-label" style={{ margin: '20px 0 14px' }}>Sugestões da IA</div>

            {sugestoes.map((s, idx) => (
              <div className="otim-card" key={s.categoria}>
                <div className="otim-card-head">
                  <span className="otim-card-icon">{ICONE_CATEGORIA[s.categoria]}</span>
                  <span className="otim-card-label">{s.label}</span>
                  <span className="otim-impacto">{s.impacto}</span>
                </div>
                <div className="otim-problema">{s.problema}</div>
                <div className="otim-sugestao">{s.sugestao}</div>
                <button type="button" className="btn-outline otim-copiar" onClick={() => copiar(s.sugestao, idx)}>
                  {copiadoIdx === idx ? 'Copiado ✓' : 'Copiar sugestão'}
                </button>
              </div>
            ))}

            <div className="cl-note" style={{ marginTop: 4 }}>
              Sugestões geradas automaticamente — revise antes de aplicar no anúncio real.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
