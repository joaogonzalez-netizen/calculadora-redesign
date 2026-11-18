import { useEffect, useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import { fundoDeImagem, setAceiteRascunho, type RascunhoShopee } from '../../lib/rascunhosShopee';
import { registrarAceiteCopia, type AceiteCopia } from '../../lib/termoCopia';
import Icon from '../Icon';
import GeradorStepper from './GeradorStepper';
import RascunhoCopiaHeader from './RascunhoCopiaHeader';

type PassoId = 'escolha' | 'imagens' | 'info' | 'publicar';

interface Props {
  rascunho: RascunhoShopee;
  // Aceite já registrado pra este rascunho (null = ainda precisa marcar o termo).
  aceite: AceiteCopia | null;
  onAceite: (a: AceiteCopia) => void;
  onGerarIa: () => void;
  onPublicar: () => void;
  onSalvarRascunho: () => void;
  onVoltar: () => void;
}

// Revisão do anúncio copiado pela extensão, no mesmo formato da criação de
// anúncio (stepper). A extensão só copia. O primeiro passo oferece as duas saídas:
// gerar com IA (destaque: conteúdo novo, caminho mais seguro) ou copiar como está.
// Continuar com "Copiar como está" abre o modal do termo de responsabilidade (checkbox
// obrigatório); o aceite vai pro log (termoCopia.ts) e só então libera a revisão. Gerar com
// IA vai direto pro Gerador, sem termo.
export default function RevisarCopia({ rascunho, aceite, onAceite, onGerarIa, onPublicar, onSalvarRascunho, onVoltar }: Props) {
  const { t, idioma } = useI18n();
  const [passo, setPasso] = useState<PassoId>('escolha');
  const [visitados, setVisitados] = useState<Set<string>>(new Set());
  const [modalTermo, setModalTermo] = useState(false);
  const [escolha, setEscolha] = useState<'ia' | 'copia'>('ia');
  const [imagens, setImagens] = useState(rascunho.imagens);
  const [titulo, setTitulo] = useState(rascunho.titulo);
  const [descricao, setDescricao] = useState(rascunho.descricao);
  const [preco, setPreco] = useState(String(rascunho.preco));
  const [estoque, setEstoque] = useState(String(rascunho.estoque));
  const [atributos, setAtributos] = useState(rascunho.atributos);

  const PASSOS = [
    { id: 'escolha', numero: 1, label: t('rv.stepEscolha') },
    { id: 'imagens', numero: 2, label: t('rv.stepImagens') },
    { id: 'info', numero: 3, label: t('rv.stepInfo') },
    { id: 'publicar', numero: 4, label: t('rv.stepPublicar') },
  ] as const;
  const ordem = PASSOS.map((p) => p.id);
  const idx = ordem.indexOf(passo);

  function ir(proximo: PassoId) {
    setVisitados((prev) => new Set(prev).add(passo));
    setPasso(proximo);
  }
  function voltar() {
    if (idx > 0) setPasso(ordem[idx - 1]);
  }

  // Confirmou o termo no modal: registra o aceite no log e segue pra revisão da cópia.
  function aceitarTermo() {
    try {
      const novo = registrarAceiteCopia({ idioma, anuncioTitulo: rascunho.titulo, anuncioOrigemUrl: rascunho.origemUrl, marketplaceOrigem: 'shopee' });
      setAceiteRascunho(rascunho.id, novo.id);
      onAceite(novo);
    } catch (e) {
      console.error('Falha ao registrar o aceite do termo de cópia', e);
      alert(t('copia.erroLog'));
      return;
    }
    setModalTermo(false);
    ir('imagens');
  }
  // Gerar com IA não copia o conteúdo original: segue direto pro Gerador, sem termo.
  // Copiar como está pede o termo antes (já aceito neste rascunho, não pede de novo).
  function continuarEscolha() {
    if (escolha === 'ia') onGerarIa();
    else if (aceite) ir('imagens');
    else setModalTermo(true);
  }

  function mover(i: number, delta: -1 | 1) {
    setImagens((prev) => {
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const novo = [...prev];
      [novo[i], novo[j]] = [novo[j], novo[i]];
      return novo;
    });
  }

  const rodape = (onContinuar: () => void, podeContinuar = true) => (
    <div className="ger-footer" style={{ justifyContent: 'space-between' }}>
      <button type="button" className="btn-outline pill ger-btn" onClick={voltar}>{t('gerador.voltar')}</button>
      <button type="button" className="btn-dark pill ger-btn" disabled={!podeContinuar} onClick={onContinuar}>{t('gerador.continuar')}</button>
    </div>
  );

  return (
    <div>
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> {t('gerador.cancelarEVoltar')}</button>
      <RascunhoCopiaHeader rascunho={rascunho} aceite={aceite} modo="revisando" />
      <div className="ger-stepper-row">
        <GeradorStepper passos={PASSOS} atual={passo} visitados={visitados} onIrPara={(id) => setPasso(id as PassoId)} />
      </div>

      <div className="card ger-card">
        <div className="card-body">
          {passo === 'escolha' && (
            <>
              <div className="ger-titulo-bloco" style={{ marginTop: 28 }}>
                <h2>{t('rv.escolhaTitulo')}</h2>
                <p>{t('rv.escolhaDesc')}</p>
              </div>
              <div className="ger-plano-grid">
                <button type="button" className={'ger-plano-card' + (escolha === 'ia' ? ' selecionado' : '')} onClick={() => setEscolha('ia')} aria-pressed={escolha === 'ia'}>
                  <span className="ger-plano-badge">{t('gerador.recomendado')}</span>
                  <div className="ger-plano-head">
                    <span className="ger-plano-icon"><Icon name="gerador" size={16} /></span>
                    <span className="ger-plano-nome">{t('rv.opIaNome')}</span>
                    <span className="ger-radio-dot" />
                  </div>
                  <p className="ger-plano-tagline">{t('rv.opIaTagline')}</p>
                  <ul className="ger-plano-lista">
                    <li className="sim"><Icon name="check" size={13} /> {t('rv.opIa1')}</li>
                    <li className="sim"><Icon name="check" size={13} /> {t('rv.opIa2')}</li>
                    <li className="sim"><Icon name="check" size={13} /> {t('rv.opIa3')}</li>
                  </ul>
                  <div className="ger-plano-creditos">{t('rv.opIaCreditos')}</div>
                </button>
                <button type="button" className={'ger-plano-card' + (escolha === 'copia' ? ' selecionado' : '')} onClick={() => setEscolha('copia')} aria-pressed={escolha === 'copia'}>
                  <div className="ger-plano-head">
                    <span className="ger-plano-icon"><Icon name="copy" size={16} /></span>
                    <span className="ger-plano-nome">{t('rv.opCopiaNome')}</span>
                    <span className="ger-radio-dot" />
                  </div>
                  <p className="ger-plano-tagline">{t('rv.opCopiaTagline')}</p>
                  <ul className="ger-plano-lista">
                    <li className="sim"><Icon name="check" size={13} /> {t('rv.opCopia1')}</li>
                    <li className="sim"><Icon name="check" size={13} /> {t('rv.opCopia2')}</li>
                    <li className="nao"><Icon name="close" size={13} /> {t('rv.opCopia3')}</li>
                  </ul>
                  <div className="ger-plano-creditos"><b>0</b> {t('gerador.creditos')}</div>
                </button>
              </div>
              <div className="ger-footer">
                <button type="button" className="btn-dark pill ger-btn" onClick={continuarEscolha}>{t('gerador.continuar')}</button>
              </div>
            </>
          )}

          {passo === 'imagens' && (
            <>
              <div className="ger-info-card">
                <b>{t('rv.imagens')} <span className="rv-contagem">{imagens.length}/5</span></b>
                <p>{t('rv.imagensDesc')}</p>
              </div>
              <div className="rv-imagens">
                {imagens.map((img, i) => (
                  <div className="rv-img" key={img + i}>
                    <div className="rv-img-fundo" style={{ background: fundoDeImagem(img) }}>
                      {i === 0 && <span className="rv-capa">{t('rv.capa')}</span>}
                    </div>
                    <div className="rv-img-acoes">
                      <button type="button" className="ma-icone-btn" aria-label={t('rv.moverEsq')} disabled={i === 0} onClick={() => mover(i, -1)}><Icon name="chevron" size={12} style={{ transform: 'rotate(180deg)' }} /></button>
                      <button type="button" className="ma-icone-btn" aria-label={t('rv.moverDir')} disabled={i === imagens.length - 1} onClick={() => mover(i, 1)}><Icon name="chevron" size={12} /></button>
                      <button type="button" className="ma-icone-btn ma-icone-btn-red" aria-label={t('rv.remover')} onClick={() => setImagens((p) => p.filter((_, k) => k !== i))}><Icon name="trash" size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
              {imagens.length === 0 && <div className="ger-dropzone-aviso">{t('gerador.avisoMinImagem')}</div>}
              {rodape(() => ir('info'), imagens.length >= 1)}
            </>
          )}

          {passo === 'info' && (
            <>
              <div className="rv-avisos" role="note">
                <b><Icon name="alert" size={16} /> {t('rv.avisosTitulo')}</b>
                <p>{t('rv.avisosIntro')}</p>
                <ul>
                  <li>{t('rv.aviso1')}</li>
                  <li>{t('rv.aviso2')}</li>
                  <li>{t('rv.aviso3')}</li>
                </ul>
              </div>
              <div className="field"><label>{t('rv.campoTitulo')}</label><input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} /></div>
              <div className="field"><label>{t('rv.campoDescricao')}</label><textarea rows={8} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></div>
              <div className="rv-linha">
                <div className="field"><label>{t('rv.campoPreco')}</label><input type="number" value={preco} onChange={(e) => setPreco(e.target.value)} /></div>
                <div className="field"><label>{t('rv.campoEstoque')}</label><input type="number" value={estoque} onChange={(e) => setEstoque(e.target.value)} /></div>
              </div>
              {atributos.length > 0 && (
                <div className="rv-atributos">
                  <b>{t('rv.atributos')}</b>
                  {atributos.map((a, i) => (
                    <div className="rv-linha" key={a.nome + i}>
                      <div className="field"><input type="text" aria-label={a.nome} value={a.nome} onChange={(e) => setAtributos((p) => p.map((x, k) => (k === i ? { ...x, nome: e.target.value } : x)))} /></div>
                      <div className="field"><input type="text" aria-label={a.nome} value={a.valor} onChange={(e) => setAtributos((p) => p.map((x, k) => (k === i ? { ...x, valor: e.target.value } : x)))} /></div>
                    </div>
                  ))}
                </div>
              )}
              {rodape(() => ir('publicar'), titulo.trim() !== '')}
            </>
          )}

          {passo === 'publicar' && (
            <>
              <div className="ger-info-card">
                <b>{t('rv.publicarTitulo')}</b>
                <p>{t('rv.publicarDesc')}</p>
              </div>
              <p className="rv-risco-solto"><Icon name="alert" size={14} /> {t('rv.publicarRisco')}</p>
              <div className="ger-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" className="btn-outline pill ger-btn" onClick={voltar}>{t('gerador.voltar')}</button>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button type="button" className="btn-outline pill ger-btn" onClick={onSalvarRascunho}>{t('gerador.salvarRascunho')}</button>
                  <button type="button" className="btn-dark pill ger-btn" onClick={onPublicar}>{t('gerador.publicarAnuncio')}</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {modalTermo && <TermoCopiaModal onConfirmar={aceitarTermo} onCancelar={() => setModalTermo(false)} />}
    </div>
  );
}

// Termo de responsabilidade ao copiar o anúncio como está. Sem marcar o checkbox
// não há como confirmar: clicar no botão travado só destaca o termo.
function TermoCopiaModal({ onConfirmar, onCancelar }: { onConfirmar: () => void; onCancelar: () => void }) {
  const { t } = useI18n();
  const [marcado, setMarcado] = useState(false);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    const fechar = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancelar(); };
    window.addEventListener('keydown', fechar);
    return () => window.removeEventListener('keydown', fechar);
  }, [onCancelar]);

  return (
    <>
      <div className="drawer-overlay" onClick={onCancelar} />
      <div className="modal-center modal-levar modal-termo" role="dialog" aria-modal="true" aria-labelledby="modal-termo-titulo">
        <button type="button" className="modal-levar-x" onClick={onCancelar} aria-label={t('rv.modalCancelar')}><Icon name="close" size={16} /></button>
        <h4 id="modal-termo-titulo">{t('rv.modalTitulo')}</h4>
        <p>{t('rv.modalIntro')}</p>
        <ul className="rv-termo-lista">
          <li>{t('copia.termo1')}</li>
          <li>{t('copia.termo2')}</li>
          <li>{t('copia.termo3')}</li>
          <li>{t('copia.termo4')}</li>
        </ul>
        <div className={'rv-termo' + (erro && !marcado ? ' erro' : '')}>
          <label className="rv-termo-check">
            <input type="checkbox" autoFocus checked={marcado} onChange={(e) => { setMarcado(e.target.checked); if (e.target.checked) setErro(false); }} aria-describedby={erro ? 'rv-termo-erro' : undefined} />
            <span>{t('copia.termoCheck')}</span>
          </label>
          {erro && !marcado && <p id="rv-termo-erro" className="rv-termo-erro" role="alert">{t('copia.termoErro')}</p>}
        </div>
        <div className="ger-footer" style={{ marginTop: 6, gap: 12 }}>
          <button type="button" className="btn-outline pill ger-btn" onClick={onCancelar}>{t('rv.modalCancelar')}</button>
          <button type="button" className="btn-dark pill ger-btn" aria-disabled={!marcado} onClick={() => (marcado ? onConfirmar() : setErro(true))}>{t('rv.modalAceitar')}</button>
        </div>
      </div>
    </>
  );
}
