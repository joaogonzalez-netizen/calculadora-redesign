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

export type Variante = '1' | '2';
export type Modo = 'light' | 'dark1' | 'dark2';
export const DARK_KEY = 'stlseller_dark_variant';

/** Dark v1 é a original; v2 usa cinzas neutros. Sem preferência salva, vale a v1. */
function lerVarianteDark(): Variante {
  try {
    return localStorage.getItem(DARK_KEY) === '2' ? '2' : '1';
  } catch (err) {
    console.warn('tema: localStorage indisponível', err);
    return '1';
  }
}

export function aplicarModo(modo: Modo) {
  const raiz = document.documentElement;
  raiz.setAttribute('data-theme', modo === 'light' ? 'light' : 'dark');
  raiz.setAttribute('data-dark', modo === 'dark2' ? '2' : '1');
}

/** Chamar antes do render, pra evitar flash do tema errado. */
export function iniciarTema() {
  const tema = lerTema();
  aplicarModo(tema === 'dark' ? (lerVarianteDark() === '2' ? 'dark2' : 'dark1') : 'light');
}

export function useTema() {
  const [modo, setModoState] = useState<Modo>(() => {
    const raiz = document.documentElement;
    if (raiz.getAttribute('data-theme') !== 'dark') return 'light';
    return raiz.getAttribute('data-dark') === '2' ? 'dark2' : 'dark1';
  });
  const definir = useCallback((proximo: Modo) => {
    aplicarModo(proximo);
    setModoState(proximo);
    try {
      localStorage.setItem(TEMA_KEY, proximo === 'light' ? 'light' : 'dark');
      if (proximo !== 'light') localStorage.setItem(DARK_KEY, proximo === 'dark2' ? '2' : '1');
    } catch (err) {
      console.warn('tema: não foi possível salvar a preferência', err);
    }
  }, []);
  return { modo, definir };
}
