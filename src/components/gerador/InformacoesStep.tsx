import { useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

interface InfoState {
  idioma: 'pt' | 'en';
  nome: string;
  contexto: string;
  descricaoConfirmada: boolean;
  largura: string;
  profundidade: string;
  altura: string;
  peso: string;
  material: string;
  kitUnidade: 'kit' | 'unidade';
  personalizavel: boolean;
  personalizacao: string;
  itensInclusos: string;
  compatibilidade: string;
  outrasCaracteristicas: string;
  termoBusca: string;
  sku: string;
  cuidadosEspeciais: string;
  usaEnergia: boolean;
  voltagem: string;
  sistemaEnergia: string;
  entradasConfirmadas: string;
  comNarracao: boolean;
  tomNarracao: string;
  vozNarracao: string;
}

// Sugestões que a IA "aplicou" a partir das imagens do passo 1 — mock fixo,
// mas em formato pronto pra trocar por uma geração real depois. "Reaplicar
// sugestões" só restaura esse mesmo mock (sem chamada real ainda).
const MOCK_INICIAL: InfoState = {
  idioma: 'pt',
  nome: 'Esqueleto de Dinossauro em 3D',
  contexto: 'Essa peça decorativa de esqueleto de dinossauro traz um toque divertido e educativo para sua decoração. Ideal para estudantes de paleontologia e entusiastas, é perfeita para exibições em salas de aula ou como adorno em escritórios e quartos.\nMaterial: PLA\nCor: Creme',
  descricaoConfirmada: false,
  largura: '10', profundidade: '8', altura: '6',
  peso: '55', material: 'PLA',
  kitUnidade: 'unidade',
  personalizavel: false,
  personalizacao: '',
  itensInclusos: '', compatibilidade: '',
  outrasCaracteristicas: 'Acabamento liso e detalhado, design inspirado em dinossauros, ideal para exibição em prateleiras ou mesas.',
  termoBusca: 'Dinossauro de brinquedo',
  sku: '', cuidadosEspeciais: '',
  usaEnergia: false,
  voltagem: 'N/A',
  sistemaEnergia: '', entradasConfirmadas: '',
  comNarracao: true,
  tomNarracao: 'emocional',
  vozNarracao: 'amelia',
};

// Materiais mais comuns entre quem imprime e vende peça 3D — cobre o caso
// comum com 1 clique; "Outro" mantém a porta aberta pro resto.
const MATERIAIS = ['PLA', 'PETG', 'ABS', 'TPU', 'Resina'];

const VOLTAGENS = ['110V', '220V', 'Bivolt', 'N/A'];

const TONS = [
  { id: 'persuasiva', nomeChave: 'gerador.tomPersuasiva', descChave: 'gerador.tomPersuasivaDesc' },
  { id: 'emocional', nomeChave: 'gerador.tomEmocional', descChave: 'gerador.tomEmocionalDesc' },
  { id: 'demonstrativa', nomeChave: 'gerador.tomDemonstrativa', descChave: 'gerador.tomDemonstrativaDesc' },
  { id: 'premium', nomeChave: 'gerador.tomPremium', descChave: 'gerador.tomPremiumDesc' },
];

const VOZES = [
  { id: 'amelia', nome: 'Amelia', tipoChave: 'gerador.vozFemininaInternacional', descChave: 'gerador.vozDescAmelia' },
  { id: 'sofia', nome: 'Sofia', tipoChave: 'gerador.vozFemininaInternacional', descChave: 'gerador.vozDescSofia' },
  { id: 'marcus', nome: 'Marcus', tipoChave: 'gerador.vozMasculinaInternacional', descChave: 'gerador.vozDescMarcus' },
  { id: 'valentina', nome: 'Valentina', tipoChave: 'gerador.vozFemininaLatina', descChave: 'gerador.vozDescValentina' },
];

interface Props {
  onVoltar: () => void;
  onContinuar: () => void;
}

export default function InformacoesStep({ onVoltar, onContinuar }: Props) {
  const { t } = useI18n();
  const [info, setInfo] = useState<InfoState>(MOCK_INICIAL);
  const materialEhOutro = !MATERIAIS.includes(info.material);

  function set<K extends keyof InfoState>(campo: K, valor: InfoState[K]) {
    setInfo((prev) => ({ ...prev, [campo]: valor }));
  }

  function tocarAudio(nome: string) {
    alert(`Em breve: prévia de áudio da voz "${nome}".`);
  }

  // Só os campos que realmente mudam o resultado e que a IA não tem como
  // advinhar sozinha — o resto fica opcional (ver discussão do plano).
  const podeContinuar =
    info.nome.trim() !== '' &&
    info.material.trim() !== '' &&
    info.largura.trim() !== '' &&
    info.profundidade.trim() !== '' &&
    info.altura.trim() !== '' &&
    info.descricaoConfirmada;

  return (
    <>
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> {t('gerador.cancelarEVoltar')}</button>

      <div className="card ger-subcard">
        <div className="card-body">
          <h3>{t('gerador.idiomaDoAnuncio')}</h3>
          <p className="ger-subcard-desc">Retirado da sua preferência de plataforma. Você pode alterá-lo abaixo.</p>
          <div className="toggle-cards cols-2 ger-idioma-grid">
            <button type="button" className={'toggle-card ger-idioma' + (info.idioma === 'pt' ? ' active' : '')} onClick={() => set('idioma', 'pt')}>
              <b>{t('gerador.portuguesBR')}{info.idioma === 'pt' && <Icon name="check" size={13} />}</b>
            </button>
            <button type="button" className={'toggle-card ger-idioma' + (info.idioma === 'en' ? ' active' : '')} onClick={() => set('idioma', 'en')}>
              <b>{t('gerador.inglesEUA')}{info.idioma === 'en' && <Icon name="check" size={13} />}</b>
            </button>
          </div>
        </div>
      </div>

      <div className="ger-ia-banner">
        <span><Icon name="gerador" size={16} /> {t('gerador.sugestoesIaAplicadas')}</span>
        <button type="button" className="btn-outline" onClick={() => setInfo(MOCK_INICIAL)}>{t('gerador.reaplicarSugestoes')}</button>
      </div>

      <div className="card ger-subcard">
        <div className="card-body">
          <h3>{t('gerador.informacoesDoProduto')}</h3>
          <p className="ger-subcard-desc">{t('gerador.camposObrigatorios')}</p>

          <h4 className="ger-secao-titulo" style={{ marginTop: 0 }}>{t('gerador.secaoIdentificacao')}</h4>
          <div className="field">
            <label>{t('gerador.nomeDoProduto')}</label>
            <input type="text" value={info.nome} onChange={(e) => set('nome', e.target.value)} />
          </div>
          <div className="field">
            <label>{t('gerador.contextoInformacoesProduto')}</label>
            <textarea rows={4} value={info.contexto} onChange={(e) => { set('contexto', e.target.value); set('descricaoConfirmada', false); }} />
          </div>
          <label className="mkt-checkbox-row">
            <input type="checkbox" checked={info.descricaoConfirmada} onChange={(e) => set('descricaoConfirmada', e.target.checked)} />
            {t('gerador.confirmarDescricao')}
          </label>

          <h4 className="ger-secao-titulo">{t('gerador.secaoMedidasMaterial')}</h4>
          <div className="row3">
            <div className="field">
              <label>{t('gerador.larguraX')}</label>
              <div className="suffix-wrap"><input type="text" value={info.largura} onChange={(e) => set('largura', e.target.value)} /><span className="sfx">cm</span></div>
            </div>
            <div className="field">
              <label>{t('gerador.profundidadeY')}</label>
              <div className="suffix-wrap"><input type="text" value={info.profundidade} onChange={(e) => set('profundidade', e.target.value)} /><span className="sfx">cm</span></div>
            </div>
            <div className="field">
              <label>{t('gerador.alturaZ')}</label>
              <div className="suffix-wrap"><input type="text" value={info.altura} onChange={(e) => set('altura', e.target.value)} /><span className="sfx">cm</span></div>
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
        </div>
      </div>

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
              <div className="row2">
                <div className="field"><label>{t('gerador.sistemaEnergia')}</label><input type="text" placeholder={t('gerador.sistemaEnergiaPlaceholder')} value={info.sistemaEnergia} onChange={(e) => set('sistemaEnergia', e.target.value)} /></div>
                <div className="field"><label>{t('gerador.entradasConfirmadas')}</label><input type="text" placeholder={t('gerador.entradasConfirmadasPlaceholder')} value={info.entradasConfirmadas} onChange={(e) => set('entradasConfirmadas', e.target.value)} /></div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card ger-subcard">
        <div className="card-body">
          <div className="ger-narracao-head">
            <div>
              <h3>{t('gerador.narracaoDoVideo')}</h3>
              <p className="ger-subcard-desc">{t('gerador.escolhaTomNarracao')}</p>
            </div>
            <div className="switch-row ger-narracao-switch">
              <label>{t('gerador.comNarracao')}</label>
              <label className="switch"><input type="checkbox" checked={info.comNarracao} onChange={(e) => set('comNarracao', e.target.checked)} /><span className="track" /></label>
            </div>
          </div>

          {info.comNarracao && (
            <>
              <div className="toggle-cards cols-2 ger-tom-grid">
                {TONS.map((tom) => (
                  <button type="button" key={tom.id} className={'toggle-card ger-tom' + (info.tomNarracao === tom.id ? ' active' : '')} onClick={() => set('tomNarracao', tom.id)}>
                    <b>{t(tom.nomeChave)}</b>
                    <span>{t(tom.descChave)}</span>
                  </button>
                ))}
              </div>

              <div className="divider-label">{t('gerador.escolhaVozNarracao')}</div>
              <p className="ger-subcard-desc" style={{ marginBottom: 14 }}>{t('gerador.useOuvirPreviewInstrucao')}</p>

              <div className="ger-voz-lista">
                {VOZES.map((v) => (
                  <div
                    key={v.id}
                    className={'ger-voz-row' + (info.vozNarracao === v.id ? ' selecionado' : '')}
                    onClick={() => set('vozNarracao', v.id)}
                  >
                    <div>
                      <div className="ger-voz-nome">{v.nome}</div>
                      <div className="ger-voz-tipo">{t(v.tipoChave)}</div>
                      <div className="ger-voz-desc">{t(v.descChave)}</div>
                    </div>
                    <button type="button" className="btn-outline ger-voz-audio" onClick={(e) => { e.stopPropagation(); tocarAudio(v.nome); }}>
                      <Icon name="volume" size={14} /> {t('gerador.ouvirAudio')}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="ger-footer" style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <button type="button" className="btn-dark pill" disabled={!podeContinuar} onClick={onContinuar}>{t('gerador.continuar')}</button>
        {!podeContinuar && <span className="hint">{t('gerador.camposFaltando')}</span>}
      </div>
    </>
  );
}
