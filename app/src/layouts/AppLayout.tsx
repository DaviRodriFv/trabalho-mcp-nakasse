import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, LogOut, Moon, Package, PanelLeft, Receipt, Settings, ShoppingCart, Store, Sun, UserCog, Users, type LucideIcon } from 'lucide-react';
import { useAuth, useUsuario } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useDb } from '../services/db';
import { statusEstoque } from '../lib/format';
import { Avatar, cx } from '../components/ui';
import { PERFIL_LABEL, type Perfil } from '../types';

interface Item {
  to: string;
  label: string;
  icon: LucideIcon;
  perfis?: Perfil[];
}

const NAV: Item[] = [
  { to: '/painel', label: 'Painel', icon: LayoutDashboard },
  { to: '/pdv', label: 'Nova venda', icon: ShoppingCart },
  { to: '/vendas', label: 'Vendas', icon: Receipt },
  { to: '/produtos', label: 'Produtos', icon: Package, perfis: ['admin', 'gerente'] },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/usuarios', label: 'Usuários', icon: UserCog, perfis: ['admin'] },
];

export default function AppLayout() {
  const usuario = useUsuario();
  const { sair } = useAuth();
  const { tema, setTema } = useTheme();
  const db = useDb();
  const [recolhida, setRecolhida] = useState(() => window.innerWidth < 1280);
  const baixos = db.produtos.filter((p) => statusEstoque(p) !== 'ok').length;

  useEffect(() => {
    const h = () => window.innerWidth < 1024 && setRecolhida(true);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const itens = NAV.filter((i) => !i.perfis || i.perfis.includes(usuario.perfil));

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cx(
      'flex h-control-md items-center gap-3 rounded-md px-3 text-label transition-colors',
      recolhida && 'justify-center px-0',
      isActive ? 'bg-primary-600 text-on-primary' : 'text-white/70 hover:bg-secondary-800 hover:text-white',
    );

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={cx('flex shrink-0 flex-col bg-secondary-900 p-4 transition-[width] duration-200', recolhida ? 'w-sidebar-collapsed' : 'w-sidebar')}>
        <div className={cx('mb-8 flex h-10 items-center gap-3', recolhida ? 'justify-center' : 'px-1')}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-600 text-on-primary">
            <Store size={20} aria-hidden />
          </span>
          {!recolhida && <span className="text-h3 text-white">Balcão</span>}
        </div>

        <nav aria-label="Principal" className="flex flex-1 flex-col gap-1">
          {itens.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkCls} title={recolhida ? label : undefined}>
              <Icon size={20} aria-hidden className="shrink-0" />
              {!recolhida && <span className="flex-1">{label}</span>}
              {!recolhida && to === '/produtos' && baixos > 0 && (
                <span className="rounded-full bg-tertiary-500 px-2 text-caption font-semibold text-secondary-900" aria-label={`${baixos} com estoque baixo`}>
                  {baixos}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <NavLink to="/perfil" className={linkCls} title={recolhida ? 'Perfil' : undefined}>
          <Settings size={20} aria-hidden className="shrink-0" />
          {!recolhida && 'Perfil e ajustes'}
        </NavLink>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-topbar shrink-0 items-center justify-between gap-4 border-b border-neutral-200 bg-neutral-0 px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setRecolhida((r) => !r)} aria-label={recolhida ? 'Expandir menu' : 'Recolher menu'} className="rounded-md p-2 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900">
              <PanelLeft size={20} />
            </button>
            <span className="text-label text-neutral-500">{db.loja}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTema(tema === 'dark' ? 'light' : 'dark')}
              aria-label={tema === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
              className="rounded-md p-2 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
            >
              {tema === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="mx-2 h-8 w-px bg-neutral-200" />
            <Avatar nome={usuario.nome} />
            <div className="hidden leading-tight sm:block">
              <p className="text-label text-neutral-900">{usuario.nome}</p>
              <p className="text-caption text-neutral-500">{PERFIL_LABEL[usuario.perfil]}</p>
            </div>
            <button onClick={sair} aria-label="Sair" title="Sair" className="ml-2 rounded-md p-2 text-neutral-500 hover:bg-danger-50 hover:text-danger">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
