import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import AppLayout from './layouts/AppLayout';
import { Card, EmptyState } from './components/ui';
import type { Perfil } from './types';
import Login from './pages/Login';
import RecuperarSenha from './pages/RecuperarSenha';
import Painel from './pages/Painel';
import Produtos from './pages/Produtos';
import PDV from './pages/PDV';
import Vendas from './pages/Vendas';
import Clientes from './pages/Clientes';
import Usuarios from './pages/Usuarios';
import Perfil_ from './pages/Perfil';

function Protegida() {
  const { usuario } = useAuth();
  return usuario ? <AppLayout /> : <Navigate to="/login" replace />;
}

/** RF02: controle de acesso por perfil. */
function Permissao({ perfis, children }: { perfis: Perfil[]; children: ReactNode }) {
  const { pode } = useAuth();
  if (pode(...perfis)) return <>{children}</>;
  return (
    <Card>
      <EmptyState icon={Lock} title="Acesso restrito" description="Seu perfil não tem permissão para esta tela. Fale com o administrador da loja." />
    </Card>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/recuperar-senha" element={<RecuperarSenha />} />
              <Route element={<Protegida />}>
                <Route path="/painel" element={<Painel />} />
                <Route path="/pdv" element={<PDV />} />
                <Route path="/vendas" element={<Vendas />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/produtos" element={<Permissao perfis={['admin', 'gerente']}><Produtos /></Permissao>} />
                <Route path="/usuarios" element={<Permissao perfis={['admin']}><Usuarios /></Permissao>} />
                <Route path="/perfil" element={<Perfil_ />} />
              </Route>
              <Route path="*" element={<Navigate to="/painel" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
