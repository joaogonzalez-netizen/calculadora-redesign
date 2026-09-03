import { useState, type FormEvent, type ReactNode } from 'react';

// Proteção simples client-side — impede acesso casual, não é segurança forte
// (a senha fica no bundle JS). Pra proteção real, usar o Deployment Protection
// nativo do Vercel (plano Pro).
const SENHA_ACESSO = 'E6pYZhrvyr8C';
const STORAGE_KEY = 'calculadora-auth';

export default function PasswordGate({ children }: { children: ReactNode }) {
  // localStorage (não sessionStorage) pra continuar logado entre sessões do
  // navegador — e type="password" + autoComplete pra dar pro navegador
  // oferecer salvar/preencher a senha sozinho.
  const [autenticado, setAutenticado] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(false);

  if (autenticado) return <>{children}</>;

  function entrar(e: FormEvent) {
    e.preventDefault();
    if (senha === SENHA_ACESSO) {
      localStorage.setItem(STORAGE_KEY, '1');
      setAutenticado(true);
    } else {
      setErro(true);
    }
  }

  return (
    <div className="auth-gate">
      <form className="auth-card" onSubmit={entrar}>
        <h1>STLSELLER</h1>
        <p className="chart-sub">Digite a senha para acessar o projeto</p>
        <div className="field">
          <label htmlFor="auth-senha">Senha</label>
          <input
            id="auth-senha"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            className={erro ? 'input-error' : ''}
            value={senha}
            onChange={(e) => { setSenha(e.target.value); setErro(false); }}
            placeholder="••••••••••••"
          />
          {erro && <span className="hint" style={{ color: 'var(--red)' }}>Senha incorreta.</span>}
        </div>
        <button type="submit" className="btn-calc">Entrar</button>
      </form>
    </div>
  );
}
