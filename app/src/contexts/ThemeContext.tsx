import { createContext, useContext, useState, type ReactNode } from 'react';

export type Tema = 'light' | 'dark';
const KEY = 'balcao-erp:tema';

function inicial(): Tema {
  try {
    const t = localStorage.getItem(KEY);
    if (t === 'light' || t === 'dark') return t;
  } catch {
    /* sem storage */
  }
  return 'light';
}

/** Aplica a classe de forma síncrona: quem lê tokens via cssVar() no render já recebe o tema novo. */
const aplicar = (t: Tema) => document.documentElement.classList.toggle('dark', t === 'dark');

const Ctx = createContext<{ tema: Tema; setTema: (t: Tema) => void }>({ tema: 'light', setTema: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setState] = useState<Tema>(() => {
    const t = inicial();
    aplicar(t);
    return t;
  });
  const setTema = (t: Tema) => {
    aplicar(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* sem storage */
    }
    setState(t);
  };
  return <Ctx.Provider value={{ tema, setTema }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
