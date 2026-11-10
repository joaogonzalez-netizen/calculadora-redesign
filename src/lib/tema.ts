// Tema claro/escuro. Preferência em localStorage; sem preferência salva, segue o sistema.
import { useCallback, useState } from 'react';

export type Tema = 'light' | 'dark';
export const TEMA_KEY = 'stlseller_tema';

function lerTema(): Tema {
  try {
    const salvo = localStorage.getItem(TEMA_KEY);
    if (salvo === 'light' || salvo === 'dark') return salvo;
  } catch (err) {
    console.warn('tema: localStorage indisponível', err);
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function aplicarTema(tema: Tema) {
  document.documentElement.setAttribute('data-theme', tema);
}

/** Chamar antes do render, pra evitar flash do tema errado. */
export function iniciarTema() {
  aplicarTema(lerTema());
}

export function useTema() {
  const [tema, setTemaState] = useState<Tema>(() => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'));
  const alternar = useCallback(() => {
    const proximo: Tema = tema === 'dark' ? 'light' : 'dark';
    aplicarTema(proximo);
    setTemaState(proximo);
    try {
      localStorage.setItem(TEMA_KEY, proximo);
    } catch (err) {
      console.warn('tema: não foi possível salvar a preferência', err);
    }
  }, [tema]);
  return { tema, alternar };
}
