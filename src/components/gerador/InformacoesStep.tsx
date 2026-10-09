import { useState, type ReactNode } from 'react';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

interface InfoState {
  nome: string;
  contexto: string;
  corConfirmada: string;
  ondeFicaUsado: string;
  principalDiferencial: string;
  paraQueServe: string;
  largura: string;
  altura: string;
  comprimento: string;
  peso: string;
  material: string;
  kitUnidade: 'kit' | 'unidade';
  personalizavel: boolean;
  personalizacao: string;
  partesEspeciais: string;
  ocasiaoPrincipal: string;
  itensInclusos: string;
  compatibilidade: string;
  outrasCaracteristicas: string;
  termoBusca: string;
  sku: string;
  cuidadosEspeciais: string;
  estruturalSustentaPeso: string;
  contatoComAlimento: string;
  usaEnergia: boolean;
  voltagem: string;
  sistemaEnergia: string;
}

// Sugestões que a IA "aplicou" a partir das imagens do passo 1 — mock fixo,
// mas em formato pronto pra trocar por uma geração real depois. "Reaplicar
// sugestões" só restaura esse mesmo mock (sem chamada real ainda). Os campos
// de confirmação (cor, onde fica, diferencial, pra que serve...) existem pra
// o usuário revisar fato por fato, em vez de só marcar "li e confirmo" pro
// parágrafo inteiro — ver docs/print de referência do João, 28/09/2026.
const MOCK_INICIAL: InfoState = {
  nome: 'Esqueleto de Dinossauro em 3D',
  contexto: 'Essa peça decorativa de esqueleto de dinossauro traz um toque divertido e educativo para sua decoração. Ideal para estudantes de paleontologia e entusiastas, é perfeita para exibições em salas de aula ou como adorno em escritórios e quartos.\nMaterial: PLA\nCor: Branco osso',
  corConfirmada: 'Branco osso',
  ondeFicaUsado: 'Estante, mesa ou sala de aula',
  principalDiferencial: 'Peças articuladas, montagem sem cola',
  paraQueServe: 'Decoração e material educativo sobre paleontologia',
  largura: '10', altura: '6', comprimento: '8',
  peso: '55', material: 'PLA',
  kitUnidade: 'unidade',
  personalizavel: false,
  personalizacao: '',
  partesEspeciais: 'Articulado nas juntas',
  ocasiaoPrincipal: '',
  itensInclusos: '', compatibilidade: '',
  outrasCaracteristicas: 'Acabamento liso e detalhado, design inspirado em dinossauros, ideal para exibição em prateleiras ou mesas.',
  termoBusca: 'Dinossauro de brinquedo',
  sku: '', cuidadosEspeciais: '',
  estruturalSustentaPeso: 'Não, decorativo',
  contatoComAlimento: 'Não',
  usaEnergia: false,
  voltagem: 'N/A',
  sistemaEnergia: '',
};

// Materiais mais comuns entre quem imprime e vende peça 3D — cobre o caso
// comum com 1 clique; "Outro" mantém a porta aberta pro resto.
const MATERIAIS = ['PLA', 'PETG', 'ABS', 'TPU', 'Resina'];

const VOLTAGENS = ['110V', '220V', 'Bivolt', 'N/A'];

interface Props {
  onVoltar: () => void;
  onContinuar: () => void;
  // Campos já conhecidos (ex.: vindos de um anúncio copiado da Shopee) que
  // sobrescrevem as sugestões mockadas da IA.
  inicial?: Partial<InfoState>;
  // Modo "apenas copiar": não há próxima etapa de IA — o fim do fluxo é publicar ou salvar o rascunho.
  // Aviso exibido logo acima dos botões de avançar/publicar.
  avisoCopia?: ReactNode;
  modoCopia?: { onPublicar: () => void; onSalvarRascunho: () => void };
}

export default function InformacoesStep({ onVoltar, onContinuar, inicial, modoCopia, avisoCopia }: Props) {
  const { t } = useI18n();
  const [info, setInfo] = useState<InfoState>(() => ({ ...MOCK_INICIAL, ...inicial }));
  const [identificacaoConfirmada, setIdentificacaoConfirmada] = useState(false);
  const materialEhOutro = !MATERIAIS.includes(info.material);

  function set<K extends keyof InfoState>(campo: K, valor: InfoState[K]) {
    setInfo((prev) => ({ ...prev, [campo]: valor }));
  }

  // Acompanha a altura do texto digitado — sem isso, um contexto mais longo
  // fica cortado dentro de uma caixa de rolagem interna de 4 linhas fixas.
  function ajustarAlturaTextarea(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  // Só o que realmente muda o resultado e que a IA não tem como advinhar
  // sozinha (nome + dimensões) trava o "Continuar" — os campos de confirmação
  // (cor, onde fica, diferencial...) vêm pré-preenchidos e o usuário ajusta
  // se quiser, sem precisar de um checkbox à parte pra "liberar" a tela.
  const podeContinuar =
    identificacaoConfirmada &&
    info.nome.trim() !== '' &&
    info.largura.trim() !== '' &&
    info.altura.trim() !== '' &&
    info.comprimento.trim() !== '';

  return (
    <>
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> {t('gerador.cancelarEVoltar')}</button>

      {/* No fluxo de apenas cópia não há IA: os campos vêm do anúncio original. */}
      {!modoCopia && (
        <div className="ger-ia-banner">
          <span><Icon name="gerador" size={16} /> {t('gerador.sugestoesIaAplicadas')}</span>
          <button type="button" className="btn-outline" onClick={() => { setInfo({ ...MOCK_INICIAL, ...inicial }); setIdentificacaoConfirmada(false); }}>{t('gerador.reaplicarSugestoes')}</button>
        </div>
      )}

      <div className="card ger-subcard">
        <div className="card-body">
          <h3>{t('gerador.informacoesDoProduto')}</h3>
          <p className="ger-subcard-desc">{t('gerador.camposObrigatorios')}</p>

          <h4 className="ger-secao-titulo">{t('gerador.secaoIdentificacao')}</h4>
          <div className="field">
            <label>{t('gerador.nomeDoProduto')}</label>
            <input type="text" value={info.nome} onChange={(e) => set('nome', e.target.value)} />
          </div>
          <div className="field">
            <label>{t('gerador.contextoInformacoesProduto')}</label>
            <textarea
              rows={4}
              className="ger-textarea-auto"
              value={info.contexto}
              onChange={(e) => { set('contexto', e.target.value); ajustarAlturaTextarea(e.target); }}
              ref={(el) => { if (el) ajustarAlturaTextarea(el); }}
            />
          </div>

          {!identificacaoConfirmada ? (
            <div className="ger-footer" style={{ marginTop: 4 }}>
              <button
                type="button"
                className="btn-dark pill"
                disabled={info.nome.trim() === '' || info.contexto.trim() === ''}
                onClick={() => setIdentificacaoConfirmada(true)}
              >
                {t('gerador.confirmarIdentificacao')}
              </button>
            </div>
          ) : (
            <>
              {/* Campos de confirmação — cada fato que a IA "leu" da imagem vira um
                  campo próprio, pra revisar de verdade em vez de só marcar uma
                  caixinha genérica pro parágrafo inteiro. */}
              <div className="row2">
                <div className="field"><label>{t('gerador.corConfirmada')}</label><input type="text" value={info.corConfirmada} onChange={(e) => set('corConfirmada', e.target.value)} /></div>
                <div className="field"><label>{t('gerador.ondeFicaUsado')}</label><input type="text" placeholder={t('gerador.ondeFicaUsadoPlaceholder')} value={info.ondeFicaUsado} onChange={(e) => set('ondeFicaUsado', e.target.value)} /></div>
              </div>
              <div className="row2">
                <div className="field"><label>{t('gerador.principalDiferencial')}</label><input type="text" placeholder={t('gerador.principalDiferencialPlaceholder')} value={info.principalDiferencial} onChange={(e) => set('principalDiferencial', e.target.value)} /></div>
                <div className="field"><label>{t('gerador.paraQueServe')}</label><input type="text" placeholder={t('gerador.paraQueServePlaceholder')} value={info.paraQueServe} onChange={(e) => set('paraQueServe', e.target.value)} /></div>
              </div>

              <h4 className="ger-secao-titulo">{t('gerador.secaoMedidasMaterial')}</h4>
              <div className="row3">
                <div className="field">
                  <label>{t('gerador.larguraX')}</label>
                  <div className="suffix-wrap"><input type="text" value={info.largura} onChange={(e) => set('largura', e.target.value)} /><span className="sfx">cm</span></div>
                </div>
                <div className="field">
                  <label>{t('gerador.alturaY')}</label>
                  <div className="suffix-wrap"><input type="text" value={info.altura} onChange={(e) => set('altura', e.target.value)} /><span className="sfx">cm</span></div>
                </div>
                <div className="field">
                  <label>{t('gerador.comprimentoZ')}</label>
                  <div className="suffix-wrap"><input type="text" value={info.comprimento} onChange={(e) => set('comprimento', e.target.value)} /><span className="sfx">cm</span></div>
                </div>
              </div>
              <div className="field"><label>{t('gerador.pesoGramas')}</label><input type="text" value={info.peso} onChange={(e) => set('peso', e.target.value)} /></div>

              <div className="field">
                <label>{t('gerador.material')}</label>
                <div className="chip-row">
                  {MATERIAIS.map((m) => (
                    <button type="button" key={m} className={'chip' + (info.material === m ? ' active' : '')} onClick={() => set('material', m)}>{m}</button>
                  ))}
                  <button type="button" className={'chip' + (materialEhOutro ? ' active' : '')} onClick={() => !materialEhOutro && set('material', '')}>
                    {t('gerador.materialOutro')}
                  </button>
                </div>
                {materialEhOutro && (
                  <input type="text" value={info.material} onChange={(e) => set('material', e.target.value)} placeholder={t('gerador.materialOutroPlaceholder')} />
                )}
              </div>

              <h4 className="ger-secao-titulo">{t('gerador.secaoKitPersonalizacao')}</h4>
              <div className="field">
                <label>{t('gerador.kitOuUnidade')}</label>
                <div className="toggle-cards cols-2">
                  <button type="button" className={'toggle-card' + (info.kitUnidade === 'unidade' ? ' active' : '')} onClick={() => set('kitUnidade', 'unidade')}>
                    <b>{t('gerador.unidadeLabel')}</b>
                  </button>
                  <button type="button" className={'toggle-card' + (info.kitUnidade === 'kit' ? ' active' : '')} onClick={() => set('kitUnidade', 'kit')}>
                    <b>{t('gerador.kitLabel')}</b>
                  </button>
                </div>
              </div>

              <div className="field">
                <label>{t('gerador.personalizavelPergunta')}</label>
                <div className="toggle-cards cols-2">
                  <button type="button" className={'toggle-card' + (!info.personalizavel ? ' active' : '')} onClick={() => set('personalizavel', false)}>
                    <b>{t('gerador.personalizavelNao')}</b>
                  </button>
                  <button type="button" className={'toggle-card' + (info.personalizavel ? ' active' : '')} onClick={() => set('personalizavel', true)}>
                    <b>{t('gerador.personalizavelSim')}</b>
                  </button>
                </div>
                {info.personalizavel && (
                  <input type="text" value={info.personalizacao} onChange={(e) => set('personalizacao', e.target.value)} placeholder={t('gerador.personalizacaoDetalhesPlaceholder')} />
                )}
              </div>

              <div className="row2">
                <div className="field"><label>{t('gerador.partesEspeciais')}</label><input type="text" placeholder={t('gerador.partesEspeciaisPlaceholder')} value={info.partesEspeciais} onChange={(e) => set('partesEspeciais', e.target.value)} /></div>
                <div className="field"><label>{t('gerador.ocasiaoPrincipal')}</label><input type="text" placeholder={t('gerador.ocasiaoPrincipalPlaceholder')} value={info.ocasiaoPrincipal} onChange={(e) => set('ocasiaoPrincipal', e.target.value)} /></div>
              </div>
              <div className="row2">
                <div className="field"><label>{t('gerador.itensInclusos')}</label><input type="text" placeholder={t('gerador.itensInclusosPlaceholder')} value={info.itensInclusos} onChange={(e) => set('itensInclusos', e.target.value)} /></div>
                <div className="field"><label>{t('gerador.compatibilidade')}</label><input type="text" placeholder={t('gerador.compatibilidadePlaceholder')} value={info.compatibilidade} onChange={(e) => set('compatibilidade', e.target.value)} /></div>
              </div>

              <h4 className="ger-secao-titulo">{t('gerador.secaoOutrasInformacoes')}</h4>
              <div className="field"><label>{t('gerador.outrasCaracteristicas')}</label><input type="text" value={info.outrasCaracteristicas} onChange={(e) => set('outrasCaracteristicas', e.target.value)} /></div>
              <div className="row2">
                <div className="field"><label>{t('gerador.termoBusca')}</label><input type="text" value={info.termoBusca} onChange={(e) => set('termoBusca', e.target.value)} /></div>
                <div className="field"><label>{t('gerador.skuOuCodigo')}</label><input type="text" placeholder={t('gerador.skuPlaceholder')} value={info.sku} onChange={(e) => set('sku', e.target.value)} /></div>
              </div>
              <div className="field"><label>{t('gerador.cuidadosEspeciais')}</label><input type="text" placeholder={t('gerador.cuidadosEspeciaisPlaceholder')} value={info.cuidadosEspeciais} onChange={(e) => set('cuidadosEspeciais', e.target.value)} /></div>
              <div className="row2">
                <div className="field"><label>{t('gerador.estruturalSustentaPeso')}</label><input type="text" placeholder={t('gerador.estruturalSustentaPesoPlaceholder')} value={info.estruturalSustentaPeso} onChange={(e) => set('estruturalSustentaPeso', e.target.value)} /></div>
                <div className="field"><label>{t('gerador.contatoComAlimento')}</label><input type="text" placeholder={t('gerador.contatoComAlimentoPlaceholder')} value={info.contatoComAlimento} onChange={(e) => set('contatoComAlimento', e.target.value)} /></div>
              </div>
            </>
          )}
        </div>
      </div>

      {identificacaoConfirmada && (
        <div className="card ger-subcard">
          <div className="card-body">
            <div className="ger-narracao-head">
              <div><h3>{t('gerador.secaoEnergia')}</h3></div>
              <div className="switch-row ger-narracao-switch">
                <label>{t('gerador.produtoUsaEnergia')}</label>
                <label className="switch"><input type="checkbox" checked={info.usaEnergia} onChange={(e) => set('usaEnergia', e.target.checked)} /><span className="track" /></label>
              </div>
            </div>

            {info.usaEnergia && (
              <>
                <div className="field">
                  <label>{t('gerador.voltagem')}</label>
                  <div className="toggle-cards cols-4">
                    {VOLTAGENS.map((v) => (
                      <button type="button" key={v} className={'toggle-card ger-voltagem' + (info.voltagem === v ? ' active' : '')} onClick={() => set('voltagem', v)}>
                        <b>{v}</b>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field"><label>{t('gerador.sistemaEnergia')}</label><input type="text" placeholder={t('gerador.sistemaEnergiaPlaceholder')} value={info.sistemaEnergia} onChange={(e) => set('sistemaEnergia', e.target.value)} /></div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Só depois de confirmar nome e contexto — antes disso o foco é revisar a identificação. */}
      {avisoCopia && identificacaoConfirmada && <div style={{ marginTop: 22 }}>{avisoCopia}</div>}

      <div className="ger-footer" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        {modoCopia ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-outline" onClick={modoCopia.onSalvarRascunho}>{t('gerador.salvarRascunho')}</button>
            <button type="button" className="btn-dark pill" disabled={!podeContinuar} onClick={modoCopia.onPublicar}>{t('gerador.publicarAnuncio')}</button>
          </div>
        ) : (
          <button type="button" className="btn-dark pill" disabled={!podeContinuar} onClick={onContinuar}>{t('gerador.continuar')}</button>
        )}
        {!podeContinuar && identificacaoConfirmada && <span className="hint">{t('gerador.camposFaltando')}</span>}
      </div>
    </>
  );
}
