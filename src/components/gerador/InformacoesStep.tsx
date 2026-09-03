import { useState } from 'react';
import Icon from '../Icon';

interface InfoState {
  idioma: 'pt' | 'en';
  nome: string;
  contexto: string;
  largura: string;
  profundidade: string;
  altura: string;
  peso: string;
  material: string;
  voltagem: string;
  outrasCaracteristicas: string;
  termoBusca: string;
  personalizacao: string;
  kitUnidade: string;
  sistemaEnergia: string;
  itensInclusos: string;
  compatibilidade: string;
  sku: string;
  cuidadosEspeciais: string;
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
  largura: '10', profundidade: '8', altura: '6',
  peso: '55', material: 'PLA',
  voltagem: 'N/A',
  outrasCaracteristicas: 'Acabamento liso e detalhado, design inspirado em dinossauros, ideal para exibição em prateleiras ou mesas.',
  termoBusca: 'Dinossauro de brinquedo',
  personalizacao: 'não personaliza',
  kitUnidade: 'Unidade',
  sistemaEnergia: '', itensInclusos: '', compatibilidade: '', sku: '', cuidadosEspeciais: '',
  entradasConfirmadas: '',
  comNarracao: true,
  tomNarracao: 'emocional',
  vozNarracao: 'amelia',
};

const VOLTAGENS = ['110V', '220V', 'Bivolt', 'N/A'];

const TONS = [
  { id: 'persuasiva', nome: 'Persuasiva', desc: 'Destaca benefícios e faz uma chamada clara para a compra.' },
  { id: 'emocional', nome: 'Emocional', desc: 'Cria conexão e desperta o desejo pelo produto.' },
  { id: 'demonstrativa', nome: 'Demonstrativa', desc: 'Mostra o produto em uso, com foco na funcionalidade.' },
  { id: 'premium', nome: 'Premium', desc: 'Tom sofisticado que valoriza exclusividade e qualidade.' },
];

const VOZES = [
  { id: 'amelia', nome: 'Amelia', tipo: 'Feminina internacional', desc: 'Clara, premium e natural.' },
  { id: 'sofia', nome: 'Sofia', tipo: 'Feminina internacional', desc: 'Quente, positiva e comercial.' },
  { id: 'marcus', nome: 'Marcus', tipo: 'Masculina internacional', desc: 'Confiante e direto.' },
  { id: 'valentina', nome: 'Valentina', tipo: 'Feminina latina', desc: 'Envolvente e expressiva.' },
];

interface Props {
  onVoltar: () => void;
  onContinuar: () => void;
}

export default function InformacoesStep({ onVoltar, onContinuar }: Props) {
  const [info, setInfo] = useState<InfoState>(MOCK_INICIAL);

  function set<K extends keyof InfoState>(campo: K, valor: InfoState[K]) {
    setInfo((prev) => ({ ...prev, [campo]: valor }));
  }

  function tocarAudio(nome: string) {
    alert(`Em breve: prévia de áudio da voz "${nome}".`);
  }

  return (
    <>
      <button type="button" className="ger-voltar" onClick={onVoltar}><Icon name="chevron" size={14} /> Cancelar e voltar</button>

      <div className="card ger-subcard">
        <div className="card-body">
          <h3>Idioma do anúncio</h3>
          <p className="ger-subcard-desc">Retirado da sua preferência de plataforma. Você pode alterá-lo abaixo.</p>
          <div className="toggle-cards cols-2 ger-idioma-grid">
            <button type="button" className={'toggle-card ger-idioma' + (info.idioma === 'pt' ? ' active' : '')} onClick={() => set('idioma', 'pt')}>
              <b>Português (BR){info.idioma === 'pt' && <Icon name="check" size={13} />}</b>
            </button>
            <button type="button" className={'toggle-card ger-idioma' + (info.idioma === 'en' ? ' active' : '')} onClick={() => set('idioma', 'en')}>
              <b>Inglês (EUA){info.idioma === 'en' && <Icon name="check" size={13} />}</b>
            </button>
          </div>
        </div>
      </div>

      <div className="ger-ia-banner">
        <span><Icon name="gerador" size={16} /> Sugestões da IA aplicadas. Revise os campos.</span>
        <button type="button" className="btn-outline" onClick={() => setInfo(MOCK_INICIAL)}>Reaplicar sugestões</button>
      </div>

      <div className="card ger-subcard">
        <div className="card-body">
          <h3>Informações do produto</h3>
          <p className="ger-subcard-desc">Campos marcados com * são obrigatórios.</p>

          <div className="field">
            <label>Nome do produto *</label>
            <input type="text" value={info.nome} onChange={(e) => set('nome', e.target.value)} />
          </div>

          <div className="field">
            <label>Contexto / informações do produto *</label>
            <textarea rows={4} value={info.contexto} onChange={(e) => set('contexto', e.target.value)} />
          </div>

          <div className="row3">
            <div className="field">
              <label>Largura (X) *</label>
              <div className="suffix-wrap"><input type="text" value={info.largura} onChange={(e) => set('largura', e.target.value)} /><span className="sfx">cm</span></div>
            </div>
            <div className="field">
              <label>Profund. (Y) *</label>
              <div className="suffix-wrap"><input type="text" value={info.profundidade} onChange={(e) => set('profundidade', e.target.value)} /><span className="sfx">cm</span></div>
            </div>
            <div className="field">
              <label>Altura (Z) *</label>
              <div className="suffix-wrap"><input type="text" value={info.altura} onChange={(e) => set('altura', e.target.value)} /><span className="sfx">cm</span></div>
            </div>
          </div>

          <div className="row2">
            <div className="field"><label>Peso (gramas)</label><input type="text" value={info.peso} onChange={(e) => set('peso', e.target.value)} /></div>
            <div className="field"><label>Material</label><input type="text" value={info.material} onChange={(e) => set('material', e.target.value)} /></div>
          </div>

          <div className="field">
            <label>Voltagem</label>
            <div className="toggle-cards cols-4">
              {VOLTAGENS.map((v) => (
                <button type="button" key={v} className={'toggle-card ger-voltagem' + (info.voltagem === v ? ' active' : '')} onClick={() => set('voltagem', v)}>
                  <b>{v}</b>
                </button>
              ))}
            </div>
          </div>

          <div className="field"><label>Outras características</label><input type="text" value={info.outrasCaracteristicas} onChange={(e) => set('outrasCaracteristicas', e.target.value)} /></div>
          <div className="field"><label>Termo de busca</label><input type="text" value={info.termoBusca} onChange={(e) => set('termoBusca', e.target.value)} /></div>

          <div className="row2">
            <div className="field"><label>Personalização</label><input type="text" value={info.personalizacao} onChange={(e) => set('personalizacao', e.target.value)} /></div>
            <div className="field"><label>Kit ou unidade</label><input type="text" value={info.kitUnidade} onChange={(e) => set('kitUnidade', e.target.value)} /></div>
          </div>

          <div className="row2">
            <div className="field"><label>Sistema / energia</label><input type="text" placeholder="Ex: LED USB, RGB bivolt, N/A" value={info.sistemaEnergia} onChange={(e) => set('sistemaEnergia', e.target.value)} /></div>
            <div className="field"><label>Itens inclusos</label><input type="text" placeholder="Ex: Fita dupla face, parafusos" value={info.itensInclusos} onChange={(e) => set('itensInclusos', e.target.value)} /></div>
          </div>

          <div className="row2">
            <div className="field"><label>Compatibilidade</label><input type="text" placeholder="Ex: Compatível com modelo X" value={info.compatibilidade} onChange={(e) => set('compatibilidade', e.target.value)} /></div>
            <div className="field"><label>SKU ou código (opcional)</label><input type="text" placeholder="Ex: STL-0042" value={info.sku} onChange={(e) => set('sku', e.target.value)} /></div>
          </div>

          <div className="field"><label>Cuidados especiais</label><input type="text" placeholder="Ex: Evitar sol e calor intenso." value={info.cuidadosEspeciais} onChange={(e) => set('cuidadosEspeciais', e.target.value)} /></div>
        </div>
      </div>

      <div className="card ger-subcard">
        <div className="card-body">
          <h3>Entradas confirmadas</h3>
          <div className="field"><input type="text" placeholder="Ex: Aniversário, Natal, batizado" value={info.entradasConfirmadas} onChange={(e) => set('entradasConfirmadas', e.target.value)} /></div>
        </div>
      </div>

      <div className="card ger-subcard">
        <div className="card-body">
          <div className="ger-narracao-head">
            <div>
              <h3>Narração do vídeo</h3>
              <p className="ger-subcard-desc">Escolha o tom da narração que será usada no vídeo</p>
            </div>
            <div className="switch-row ger-narracao-switch">
              <label>Com narração</label>
              <label className="switch"><input type="checkbox" checked={info.comNarracao} onChange={(e) => set('comNarracao', e.target.checked)} /><span className="track" /></label>
            </div>
          </div>

          {info.comNarracao && (
            <>
              <div className="toggle-cards cols-2 ger-tom-grid">
                {TONS.map((t) => (
                  <button type="button" key={t.id} className={'toggle-card ger-tom' + (info.tomNarracao === t.id ? ' active' : '')} onClick={() => set('tomNarracao', t.id)}>
                    <b>{t.nome}</b>
                    <span>{t.desc}</span>
                  </button>
                ))}
              </div>

              <div className="divider-label">Escolha a voz da narração</div>
              <p className="ger-subcard-desc" style={{ marginBottom: 14 }}>Use ouvir para gerar uma prévia instantânea.</p>

              <div className="ger-voz-lista">
                {VOZES.map((v) => (
                  <div
                    key={v.id}
                    className={'ger-voz-row' + (info.vozNarracao === v.id ? ' selecionado' : '')}
                    onClick={() => set('vozNarracao', v.id)}
                  >
                    <div>
                      <div className="ger-voz-nome">{v.nome}</div>
                      <div className="ger-voz-tipo">{v.tipo}</div>
                      <div className="ger-voz-desc">{v.desc}</div>
                    </div>
                    <button type="button" className="btn-outline ger-voz-audio" onClick={(e) => { e.stopPropagation(); tocarAudio(v.nome); }}>
                      <Icon name="volume" size={14} /> Ouvir áudio
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="ger-footer">
        <button type="button" className="btn-dark pill" onClick={onContinuar}>Continuar</button>
      </div>
    </>
  );
}
