import { useState } from 'react';
import { readJson, writeJson } from '../lib/storage';
import { MARKETPLACES_CONECTADOS_KEY, marcarOnboardingManual } from '../lib/onboarding';
import { useI18n } from '../context/I18nContext';
import Icon from '../components/Icon';

interface MarketplaceConfig {
  id: string;
  nome: string;
  cor: string;
  formato: 'circulo' | 'quadrado';
  conectadoInicial: boolean;
  idInicial?: string;
}

// Réplica da tela real de Configurações (print de João, 02/09/2026) — estado
// inicial: Mercado Livre e Amazon conectados, Shopee não. Conectar/desconectar
// é só local (sem integração real ainda), igual ao resto do app. O passo 4 de
// Primeiros passos só marca "feito" no clique real em "Conectar" — só abrir
// essa tela (e ver ML/Amazon já conectados por padrão) não conta.
const MARKETPLACES_CONFIG: MarketplaceConfig[] = [
  { id: 'ml', nome: 'Mercado Livre', cor: '#ffd400', formato: 'circulo', conectadoInicial: true },
  { id: 'shopee', nome: 'Shopee', cor: '#ff9900', formato: 'circulo', conectadoInicial: false },
  { id: 'amazon', nome: 'Amazon', cor: '#0d6efd', formato: 'quadrado', conectadoInicial: true, idInicial: 'ATR1N390SVWFY' },
];

interface EstadoMp {
  conectado: boolean;
  id: string;
}

function estadoInicial(): Record<string, EstadoMp> {
  const conexoesSalvas = readJson<Record<string, boolean>>(MARKETPLACES_CONECTADOS_KEY, {});
  return Object.fromEntries(
    MARKETPLACES_CONFIG.map((m) => {
      const conectado = conexoesSalvas[m.id] ?? m.conectadoInicial;
      return [m.id, { conectado, id: conectado ? (m.idInicial || '') : '' }];
    }),
  );
}

function salvarConexoes(estado: Record<string, EstadoMp>) {
  const conexoes = Object.fromEntries(Object.entries(estado).map(([id, st]) => [id, st.conectado]));
  writeJson(MARKETPLACES_CONECTADOS_KEY, conexoes);
}

interface ContaModal {
  id: string;
  nome: string;
  etapa: 'perguntar' | 'cadastro';
}

interface CadastroForm {
  nomeLoja: string;
  email: string;
  documento: string;
  telefone: string;
  aceitaTermos: boolean;
}

const CADASTRO_INICIAL: CadastroForm = { nomeLoja: '', email: '', documento: '', telefone: '', aceitaTermos: false };

export default function ConfiguracoesView({ onChange }: { onChange?: () => void }) {
  const { t } = useI18n();
  const [estado, setEstado] = useState<Record<string, EstadoMp>>(estadoInicial);
  const [contaModal, setContaModal] = useState<ContaModal | null>(null);
  const [cadastro, setCadastro] = useState<CadastroForm>(CADASTRO_INICIAL);

  function atualizar(next: Record<string, EstadoMp>) {
    setEstado(next);
    salvarConexoes(next);
    onChange?.();
  }

  // Conectar de fato só acontece depois que o usuário confirma que já tem
  // conta (ou termina o cadastro mockado) — ver abrirConectar() abaixo.
  function finalizarConexao(id: string) {
    const idFake = 'ML' + Math.floor(100000000 + Math.random() * 900000000);
    atualizar({ ...estado, [id]: { conectado: true, id: idFake } });
    marcarOnboardingManual('marketplace');
    onChange?.();
  }
  function abrirConectar(id: string, nome: string) {
    setContaModal({ id, nome, etapa: 'perguntar' });
    setCadastro(CADASTRO_INICIAL);
  }
  function fecharContaModal() {
    setContaModal(null);
  }
  function jaTenhoConta() {
    if (!contaModal) return;
    finalizarConexao(contaModal.id);
    setContaModal(null);
  }
  function irParaCadastro() {
    setContaModal((prev) => (prev ? { ...prev, etapa: 'cadastro' } : prev));
  }
  function setCampoCadastro<K extends keyof CadastroForm>(campo: K, valor: CadastroForm[K]) {
    setCadastro((prev) => ({ ...prev, [campo]: valor }));
  }
  const cadastroValido = cadastro.nomeLoja.trim() && cadastro.email.trim() && cadastro.documento.trim() && cadastro.aceitaTermos;
  function concluirCadastro() {
    if (!contaModal || !cadastroValido) return;
    finalizarConexao(contaModal.id);
    setContaModal(null);
  }

  function desconectar(id: string) {
    atualizar({ ...estado, [id]: { conectado: false, id: '' } });
  }
  function sincronizar(nome: string) {
    alert(`Sincronizando produtos e pedidos de ${nome}...`);
  }

  return (
    <div>
      <div className="hero">
        <h1>{t('config.titulo')}</h1>
        <p>{t('config.subtitulo')}</p>
      </div>

      <div className="config-mp-grid">
        {MARKETPLACES_CONFIG.map((m) => {
          const st = estado[m.id];
          return (
            <div className="config-mp-card" key={m.id}>
              <div className="config-mp-head">
                <div className="config-mp-nome">
                  <span className={'config-mp-icon' + (m.formato === 'quadrado' ? ' quadrado' : '')} style={{ background: m.cor }} />
                  {m.nome}
                </div>
                {st.conectado && <span className="config-status-pill">{t('config.conectado')}</span>}
              </div>

              {st.conectado
                ? <div className="config-mp-id">{t('config.idLabel')}: {st.id}</div>
                : <div className="config-mp-id muted">{t('config.naoConectado')}</div>}

              <div className="config-mp-actions">
                {st.conectado ? (
                  <>
                    <button type="button" className="btn-blue" onClick={() => sincronizar(m.nome)}>{t('config.sincronizarAgora')}</button>
                    <button type="button" className="btn-outline btn-outline-red" onClick={() => desconectar(m.id)}>{t('config.desconectar')}</button>
                  </>
                ) : (
                  <button type="button" className="btn-blue" onClick={() => abrirConectar(m.id, m.nome)}>{t('config.conectar')} {m.nome}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {contaModal && (
        <div className="pub-overlay">
          <div className="pub-modal cfg-conta-modal">
            <div className="pub-modal-head">
              <div>
                <h2>{t('config.conectar')} {contaModal.nome}</h2>
                <p>{contaModal.etapa === 'perguntar' ? t('config.perguntaJaVende') : t('config.preencherDados')}</p>
              </div>
              <button type="button" className="pub-close" onClick={fecharContaModal}><Icon name="close" size={15} /></button>
            </div>

            {contaModal.etapa === 'perguntar' ? (
              <>
                <div className="pub-secao-titulo">{t('config.jaTemContaPergunta')} {contaModal.nome}?</div>
                <div className="cfg-conta-opcoes">
                  <button type="button" className="btn-dark" onClick={jaTenhoConta}>{t('config.simJaTenhoConta')}</button>
                  <button type="button" className="btn-outline" onClick={irParaCadastro}>{t('config.naoQueroCriarConta')}</button>
                </div>
              </>
            ) : (
              <>
                <div className="field"><label>{t('config.nomeLoja')} *</label><input type="text" value={cadastro.nomeLoja} onChange={(e) => setCampoCadastro('nomeLoja', e.target.value)} /></div>
                <div className="field"><label>{t('config.email')} *</label><input type="email" value={cadastro.email} onChange={(e) => setCampoCadastro('email', e.target.value)} /></div>
                <div className="row2">
                  <div className="field"><label>{t('config.cpfCnpj')} *</label><input type="text" value={cadastro.documento} onChange={(e) => setCampoCadastro('documento', e.target.value)} /></div>
                  <div className="field"><label>{t('config.telefone')} <span className="hint" style={{ fontWeight: 400 }}>{t('config.opcional')}</span></label><input type="text" value={cadastro.telefone} onChange={(e) => setCampoCadastro('telefone', e.target.value)} /></div>
                </div>
                <label className="pub-compliance-item">
                  <input type="checkbox" checked={cadastro.aceitaTermos} onChange={(e) => setCampoCadastro('aceitaTermos', e.target.checked)} />
                  <span>{t('config.liEAceito')} {contaModal.nome}.</span>
                </label>
                <div className="pub-footer">
                  <button type="button" className="btn-outline" onClick={() => setContaModal((prev) => (prev ? { ...prev, etapa: 'perguntar' } : prev))}>{t('config.voltar')}</button>
                  <button type="button" className="btn-calc" style={{ width: 'auto', padding: '13px 28px' }} disabled={!cadastroValido} onClick={concluirCadastro}>{t('config.criarContaEConectar')}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
