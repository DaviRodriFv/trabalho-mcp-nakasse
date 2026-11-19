import { useState } from 'react';
import { Moon, RotateCcw, Sun } from 'lucide-react';
import { store } from '../services/db';
import { useUsuario } from '../contexts/AuthContext';
import { useTheme, type Tema } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Avatar, Badge, Button, Card, CardHeader, ConfirmModal, Field, Input, PageHeader, cx } from '../components/ui';
import { PERFIL_LABEL } from '../types';

export default function Perfil() {
  const usuario = useUsuario();
  const { tema, setTema } = useTheme();
  const toast = useToast();
  const [nome, setNome] = useState(usuario.nome);
  const [erroNome, setErroNome] = useState('');
  const [senha, setSenha] = useState({ atual: '', nova: '', conf: '' });
  const [erroSenha, setErroSenha] = useState<{ atual?: string; nova?: string; conf?: string }>({});
  const [resetar, setResetar] = useState(false);

  function salvarNome() {
    if (nome.trim().length < 3) return setErroNome('Informe o nome.');
    store.salvarUsuario({ ...usuario, nome: nome.trim() });
    toast('success', 'Dados atualizados.');
  }

  function trocarSenha() {
    const e: typeof erroSenha = {};
    if (senha.atual !== usuario.senha) e.atual = 'Senha atual incorreta.';
    if (senha.nova.length < 6) e.nova = 'Mínimo de 6 caracteres.';
    if (senha.conf !== senha.nova) e.conf = 'As senhas não conferem.';
    if (Object.keys(e).length) return setErroSenha(e);
    store.salvarUsuario({ ...usuario, senha: senha.nova });
    setSenha({ atual: '', nova: '', conf: '' });
    toast('success', 'Senha alterada.');
  }

  const setS = (k: keyof typeof senha, v: string) => {
    setSenha((s) => ({ ...s, [k]: v }));
    setErroSenha((e) => ({ ...e, [k]: undefined }));
  };

  const temas: { value: Tema; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
  ];

  return (
    <>
      <PageHeader title="Perfil e ajustes" subtitle="Seus dados, senha e preferências" />
      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-7">
          <CardHeader title="Meus dados" />
          <div className="flex flex-col gap-4 px-6 pb-6">
            <div className="flex items-center gap-4">
              <Avatar nome={usuario.nome} size={56} />
              <div>
                <p className="text-h3">{usuario.nome}</p>
                <Badge tone="primary">{PERFIL_LABEL[usuario.perfil]}</Badge>
              </div>
            </div>
            <Field label="Nome" htmlFor="pf-nome" error={erroNome}>
              <Input id="pf-nome" value={nome} invalid={!!erroNome} onChange={(e) => { setNome(e.target.value); setErroNome(''); }} />
            </Field>
            <Field label="E-mail" htmlFor="pf-email" hint="Para alterar o e-mail, fale com o administrador.">
              <Input id="pf-email" value={usuario.email} disabled />
            </Field>
            <div><Button onClick={salvarNome} disabled={nome.trim() === usuario.nome}>Salvar dados</Button></div>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <CardHeader title="Aparência" />
          <div className="grid grid-cols-2 gap-3 px-6 pb-6" role="radiogroup" aria-label="Tema">
            {temas.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                role="radio"
                aria-checked={tema === value}
                onClick={() => setTema(value)}
                className={cx('flex flex-col items-center gap-2 rounded-md border p-4 text-label transition-colors', tema === value ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-neutral-200 text-neutral-500 hover:text-neutral-900')}
              >
                <Icon size={20} aria-hidden /> {label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-7">
          <CardHeader title="Alterar senha" />
          <form onSubmit={(e) => { e.preventDefault(); trocarSenha(); }} className="flex flex-col gap-4 px-6 pb-6" noValidate>
            <Field label="Senha atual" htmlFor="pf-atual" error={erroSenha.atual}>
              <Input id="pf-atual" type="password" autoComplete="current-password" value={senha.atual} invalid={!!erroSenha.atual} onChange={(e) => setS('atual', e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nova senha" htmlFor="pf-nova" error={erroSenha.nova}>
                <Input id="pf-nova" type="password" autoComplete="new-password" value={senha.nova} invalid={!!erroSenha.nova} onChange={(e) => setS('nova', e.target.value)} />
              </Field>
              <Field label="Confirmar nova senha" htmlFor="pf-conf" error={erroSenha.conf}>
                <Input id="pf-conf" type="password" autoComplete="new-password" value={senha.conf} invalid={!!erroSenha.conf} onChange={(e) => setS('conf', e.target.value)} />
              </Field>
            </div>
            <div><Button type="submit">Alterar senha</Button></div>
          </form>
        </Card>

        <Card className="col-span-12 lg:col-span-5">
          <CardHeader title="Dados de demonstração" subtitle="Protótipo: os dados ficam salvos neste navegador." />
          <div className="px-6 pb-6">
            <Button variant="secondary" icon={RotateCcw} onClick={() => setResetar(true)}>Restaurar dados de exemplo</Button>
          </div>
        </Card>
      </div>

      <ConfirmModal
        open={resetar}
        title="Restaurar dados de exemplo"
        message="Todos os produtos, vendas, clientes e usuários voltarão ao estado inicial. Alterações feitas serão perdidas."
        confirmLabel="Restaurar"
        onClose={() => setResetar(false)}
        onConfirm={() => {
          store.resetar();
          setResetar(false);
          toast('success', 'Dados de exemplo restaurados.');
        }}
      />
    </>
  );
}
