import { useState } from 'react';
import { readJson, writeJson } from '../lib/storage';
import { MARKETPLACES_CONECTADOS_KEY, marcarOnboardingManual } from '../lib/onboarding';

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

export default function ConfiguracoesView({ onChange }: { onChange?: () => void }) {
  const [estado, setEstado] = useState<Record<string, EstadoMp>>(estadoInicial);

  function atualizar(next: Record<string, EstadoMp>) {
    setEstado(next);
    salvarConexoes(next);
    onChange?.();
  }

  function conectar(id: string) {
    const idFake = 'ML' + Math.floor(100000000 + Math.random() * 900000000);
    atualizar({ ...estado, [id]: { conectado: true, id: idFake } });
    marcarOnboardingManual('marketplace');
    onChange?.();
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
        <h1>Marketplaces</h1>
        <p>Conecte seus marketplaces para sincronizar produtos e vendas</p>
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
                {st.conectado && <span className="config-status-pill">Conectado</span>}
              </div>

              {st.conectado
                ? <div className="config-mp-id">ID: {st.id}</div>
                : <div className="config-mp-id muted">Não conectado</div>}

              <div className="config-mp-actions">
                {st.conectado ? (
                  <>
                    <button type="button" className="btn-blue" onClick={() => sincronizar(m.nome)}>Sincronizar agora</button>
                    <button type="button" className="btn-outline btn-outline-red" onClick={() => desconectar(m.id)}>Desconectar</button>
                  </>
                ) : (
                  <button type="button" className="btn-blue" onClick={() => conectar(m.id)}>Conectar {m.nome}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
