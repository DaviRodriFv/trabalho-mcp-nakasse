import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Perfil, Usuario } from '../types';
import { useDb } from '../services/db';

const KEY = 'balcao-erp:sessao';

function lerSessao(): string | null {
  try {
    return localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

interface AuthCtx {
  usuario: Usuario | null;
  entrar: (email: string, senha: string, lembrar: boolean) => string | null;
  sair: () => void;
  pode: (...perfis: Perfil[]) => boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const db = useDb();
  const [id, setId] = useState<string | null>(lerSessao);
  // Derivado do banco: se o usuário for desativado ou editado, a sessão reflete na hora.
  const usuario = db.usuarios.find((u) => u.id === id && u.ativo) ?? null;

  const entrar = (email: string, senha: string, lembrar: boolean) => {
    const u = db.usuarios.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || u.senha !== senha) return 'E-mail ou senha incorretos.';
    if (!u.ativo) return 'Usuário desativado. Fale com o administrador da loja.';
    try {
      (lembrar ? localStorage : sessionStorage).setItem(KEY, u.id);
    } catch {
      /* sessão só em memória */
    }
    setId(u.id);
    return null;
  };

  const sair = () => {
    try {
      localStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY);
    } catch {
      /* nada */
    }
    setId(null);
  };

  const pode = (...perfis: Perfil[]) => !!usuario && perfis.includes(usuario.perfil);

  return <Ctx.Provider value={{ usuario, entrar, sair, pode }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth fora do AuthProvider');
  return c;
}

/** Para telas protegidas: garante usuário logado. */
export function useUsuario(): Usuario {
  const { usuario } = useAuth();
  if (!usuario) throw new Error('Tela protegida acessada sem sessão');
  return usuario;
}
