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

export type Modo = 'light' | 'dark';

export function aplicarModo(modo: Modo) {
  document.documentElement.setAttribute('data-theme', modo);
}

/** Chamar antes do render, pra evitar flash do tema errado. */
export function iniciarTema() {
  const tema = lerTema();
  aplicarModo(tema);
}

export function useTema() {
  const [modo, setModoState] = useState<Modo>(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  });
  const definir = useCallback((proximo: Modo) => {
    aplicarModo(proximo);
    setModoState(proximo);
    try {
      localStorage.setItem(TEMA_KEY, proximo);
    } catch (err) {
      console.warn('tema: não foi possível salvar a preferência', err);
    }
  }, []);
  return { modo, definir };
}
