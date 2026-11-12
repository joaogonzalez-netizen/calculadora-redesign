import { useEffect, useRef, useState } from 'react';
import type { Produto } from '../../lib/produtosMock';
import { PESOS, analisarAnuncio, faixaScore, tituloDaRegra, type IdRegra, type StatusRegra } from '../../lib/otimizadorRegras';
import { classeTagMarketplace } from '../../lib/marketplaceTag';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

type Fase = 'inicial' | 'analisando' | 'resultado';

const ORDEM_REGRAS: IdRegra[] = ['titulo', 'descricao', 'imagens', 'ficha', 'preco', 'envio'];
/** Tempo de cada critério na análise simulada. */
const PASSO_MS = 450;

function corScore(score: number) {
  const f = faixaScore(score);
  if (f === 'excelente' || f === 'bom') return 'var(--primary-dark)';
  if (f === 'melhorar') return 'var(--accent)';
  return 'var(--red)';
}

const ICONE_STATUS: Record<StatusRegra, 'check' | 'alert' | 'close'> = { ok: 'check', atencao: 'alert', corrigir: 'close' };

interface Props {
  produto: Produto;
  onClose: () => void;
  /** CTA final: leva o anúncio para o Gerador de anúncios. */
  onIrParaGerador: (produto: Produto) => void;
}

export default function OtimizarAnuncioDrawer({ produto, onClose, onIrParaGerador }: Props) {
  const { t, idioma } = useI18n();
  const [fase, setFase] = useState<Fase>('inicial');
  const [passo, setPasso] = useState(0);
  const corpo = useRef<HTMLDivElement>(null);

  const analise = analisarAnuncio(produto, idioma);
  const regrasPorId = Object.fromEntries(analise.regras.map((r) => [r.id, r])) as Record<IdRegra, (typeof analise.regras)[number]>;

  // Análise simulada: marca um critério por vez e abre o resultado no fim.
  useEffect(() => {
    if (fase !== 'analisando') return;
    if (passo >= ORDEM_REGRAS.length) {
      const fim = setTimeout(() => setFase('resultado'), PASSO_MS);
      return () => clearTimeout(fim);
    }
    const prox = setTimeout(() => setPasso((p) => p + 1), PASSO_MS);
    return () => clearTimeout(prox);
  }, [fase, passo]);

  useEffect(() => {
    if (fase === 'resultado') corpo.current?.scrollTo({ top: 0 });
  }, [fase]);

  function iniciar() {
    setPasso(0);
    setFase('analisando');
  }

  const cor = corScore(analise.score);
  const faixa = faixaScore(analise.score);

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer otim-drawer">
        <div className="cl-head">
          <div>
            <h4><Icon name="otimizador" size={17} style={{ verticalAlign: '-3px', marginRight: 6 }} /> {t('produtos.otimTitulo')}</h4>
            <div className="cl-sub">{produto.nome}</div>
          </div>
          <button type="button" className="cl-close" aria-label={t('produtos.otimFechar')} onClick={onClose}><Icon name="close" size={15} /></button>
        </div>

        <div className="cl-body" ref={corpo}>
          <div className="otim-nota-card">
            <div className="otim-nota" style={{ color: cor }}>{analise.score}<span>/100</span></div>
            <div>
              <div className="otim-nota-label">{t('produtos.otimScore')}</div>
              <div className="otim-faixa" style={{ color: cor }}>{t('produtos.otimFaixa.' + faixa)}</div>
              <span className={'mp-tag ' + classeTagMarketplace(produto.marketplace)}>{produto.marketplace}</span>
            </div>
          </div>

          {fase === 'inicial' && (
            <>
              <p className="hint otim-intro">{t('produtos.otimIntro').replace('{canal}', produto.marketplace).replace('{n}', String(ORDEM_REGRAS.length))}</p>
              <ul className="otim-criterios">
                {ORDEM_REGRAS.map((id) => (
                  <li key={id}>
                    <span>{tituloDaRegra(id, produto.marketplace, idioma)}</span>
                    <b>{PESOS[id]} {t('produtos.otimPts')}</b>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn-dark otim-cta" onClick={iniciar}>
                <Icon name="otimizador" size={15} /> {t('produtos.otimizarBtn')}
              </button>
            </>
          )}

          {fase === 'analisando' && (
            <>
              <div className="otim-analisando"><div className="otim-spinner" /> {t('produtos.otimAnalisando')}</div>
              <ul className="otim-passos">
                {ORDEM_REGRAS.map((id, i) => (
                  <li key={id} className={i < passo ? 'feito' : i === passo ? 'atual' : ''}>
                    <span className="otim-passo-icone">{i < passo ? <Icon name="check" size={12} /> : null}</span>
                    {tituloDaRegra(id, produto.marketplace, idioma)}
                  </li>
                ))}
              </ul>
            </>
          )}

          {fase === 'resultado' && (
            <>
              <div className="otim-potencial">
                <Icon name="trend" size={15} />
                <span>{t('produtos.otimPotencial').replace('{n}', String(analise.potencial))}</span>
              </div>

              <div className="divider-label" style={{ margin: '4px 0 0' }}>{t('produtos.otimResultadoPorCriterio')}</div>

              {ORDEM_REGRAS.map((id) => {
                const r = regrasPorId[id];
                return (
                  <div className={'otim-regra ' + r.status} key={id}>
                    <div className="otim-regra-head">
                      <span className="otim-regra-icone"><Icon name={ICONE_STATUS[r.status]} size={12} /></span>
                      <span className="otim-card-label">{r.titulo}</span>
                      <span className="otim-regra-pontos">{r.pontos}/{r.peso} {t('produtos.otimPts')}</span>
                    </div>
                    <div className="otim-problema">{r.achado}</div>
                    {r.correcao && <div className="otim-sugestao">{r.correcao}</div>}
                  </div>
                );
              })}

              <div className="otim-final">
                <div className="otim-final-titulo">{t('produtos.otimCtaTitulo')}</div>
                <p>{t('produtos.otimCtaTexto')}</p>
                <button type="button" className="btn-dark otim-cta" onClick={() => onIrParaGerador(produto)}>
                  {t('produtos.otimCtaBotao')} <Icon name="send" size={14} style={{ transform: 'rotate(90deg)' }} />
                </button>
                <button type="button" className="link-btn otim-reanalisar" onClick={iniciar}>{t('produtos.otimReanalisar')}</button>
              </div>

              <div className="cl-note">{t('produtos.otimMockNota')}</div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
