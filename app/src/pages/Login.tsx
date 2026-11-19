import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BarChart3, Eye, EyeOff, Lock, Mail, Package, ShoppingCart, Store } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Checkbox, Field, Input } from '../components/ui';

const DEMO = [
  { perfil: 'Admin', email: 'ana@bompreco.com', senha: 'admin123' },
  { perfil: 'Gerente', email: 'carlos@bompreco.com', senha: 'gerente123' },
  { perfil: 'Vendedor', email: 'julia@bompreco.com', senha: 'vendedor123' },
];

export default function Login() {
  const { usuario, entrar } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(true);
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState('');

  if (usuario) return <Navigate to="/painel" replace />;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !senha) return setErro('Informe e-mail e senha.');
    const err = entrar(email, senha, lembrar);
    if (err) setErro(err);
    else nav('/painel');
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-secondary-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-600 text-on-primary">
            <Store size={20} aria-hidden />
          </span>
          <span className="text-h2">Balcão ERP</span>
        </div>
        <div className="max-w-md">
          <h2 className="text-display">Seu comércio organizado, do estoque ao caixa.</h2>
          <ul className="mt-8 flex flex-col gap-4 text-body-lg text-white/80">
            {[
              [Package, 'Saiba o que está acabando antes de faltar'],
              [ShoppingCart, 'Registre vendas em poucos cliques'],
              [BarChart3, 'Acompanhe o faturamento do dia e do mês'],
            ].map(([Icon, t]) => {
              const I = Icon as typeof Package;
              return (
                <li key={t as string} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary-800 text-tertiary-500">
                    <I size={16} aria-hidden />
                  </span>
                  {t as string}
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-caption text-white/50">© 2026 Balcão ERP · protótipo acadêmico</p>
      </aside>

      <main className="flex items-center justify-center bg-neutral-0 p-8">
        <form onSubmit={submit} className="flex w-full max-w-[400px] flex-col gap-6" noValidate>
          <div>
            <h1 className="text-h1">Entrar</h1>
            <p className="mt-1 text-body-lg text-neutral-500">Acesse com seu e-mail e senha.</p>
          </div>

          {erro && (
            <p role="alert" className="rounded-md bg-danger-50 px-4 py-3 text-body text-danger">
              {erro}
            </p>
          )}

          <Field label="E-mail" htmlFor="email">
            <Input id="email" type="email" icon={Mail} autoComplete="username" placeholder="voce@loja.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </Field>

          <Field label="Senha" htmlFor="senha">
            <div className="relative">
              <Input id="senha" type={ver ? 'text' : 'password'} icon={Lock} autoComplete="current-password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} className="pr-10" />
              <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900">
                {ver ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <div className="flex items-center justify-between">
            <Checkbox label="Lembrar-me" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
            <Link to="/recuperar-senha" className="text-label text-primary-600 hover:underline">
              Esqueci a senha
            </Link>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Entrar
          </Button>

          <div className="rounded-lg border border-dashed border-neutral-200 p-4">
            <p className="mb-2 text-label text-neutral-500">Contas de demonstração (clique para preencher)</p>
            <div className="flex flex-col gap-1">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => {
                    setEmail(d.email);
                    setSenha(d.senha);
                    setErro('');
                  }}
                  className="flex justify-between rounded-md px-2 py-1.5 text-left text-caption hover:bg-neutral-50"
                >
                  <span className="font-medium text-neutral-900">{d.perfil}</span>
                  <span className="text-neutral-500">
                    {d.email} / {d.senha}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
