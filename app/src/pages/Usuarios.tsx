import { useState } from 'react';
import { Pencil, Plus, Power } from 'lucide-react';
import { store, useDb } from '../services/db';
import { useUsuario } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Avatar, Badge, Button, Card, Field, IconButton, Input, Modal, PageHeader, Select, td, th, type Tone } from '../components/ui';
import { emailValido } from '../lib/format';
import { PERFIL_LABEL, type Perfil, type Usuario } from '../types';

type Form = { id?: string; nome: string; email: string; perfil: Perfil; senha: string; ativo: boolean };
type Erros = Partial<Record<'nome' | 'email' | 'senha', string>>;
const perfilTone: Record<Perfil, Tone> = { admin: 'primary', gerente: 'info', vendedor: 'neutral' };
const PERMISSOES: Record<Perfil, string> = {
  admin: 'Acesso total, inclusive usuários.',
  gerente: 'Produtos, vendas (com cancelamento) e clientes.',
  vendedor: 'Nova venda, histórico e clientes.',
};

export default function Usuarios() {
  const db = useDb();
  const eu = useUsuario();
  const toast = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [erros, setErros] = useState<Erros>({});

  const lista = [...db.usuarios].sort((a, b) => Number(b.ativo) - Number(a.ativo) || a.nome.localeCompare(b.nome));

  function salvar() {
    if (!form) return;
    const e: Erros = {};
    if (form.nome.trim().length < 3) e.nome = 'Informe o nome.';
    if (!emailValido(form.email)) e.email = 'E-mail inválido.';
    else if (db.usuarios.some((u) => u.email.toLowerCase() === form.email.trim().toLowerCase() && u.id !== form.id)) e.email = 'E-mail já cadastrado.';
    if (!form.id && form.senha.length < 6) e.senha = 'Mínimo de 6 caracteres.';
    if (form.id && form.senha && form.senha.length < 6) e.senha = 'Mínimo de 6 caracteres.';
    if (Object.keys(e).length) return setErros(e);
    const atual = db.usuarios.find((u) => u.id === form.id);
    store.salvarUsuario({ id: form.id, nome: form.nome.trim(), email: form.email.trim().toLowerCase(), perfil: form.perfil, ativo: form.ativo, senha: form.senha || atual?.senha || '' });
    toast('success', form.id ? 'Usuário atualizado.' : 'Usuário criado.');
    setForm(null);
  }

  function alternar(u: Usuario) {
    store.salvarUsuario({ ...u, ativo: !u.ativo });
    toast('success', `${u.nome} foi ${u.ativo ? 'desativado' : 'reativado'}.`);
  }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => (f ? { ...f, [k]: v } : f));
    setErros((e) => ({ ...e, [k]: undefined }));
  };

  return (
    <>
      <PageHeader
        title="Usuários"
        subtitle="Quem acessa o sistema e o que cada um pode fazer"
        actions={<Button icon={Plus} onClick={() => { setErros({}); setForm({ nome: '', email: '', perfil: 'vendedor', senha: '', ativo: true }); }}>Novo usuário</Button>}
      />

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {(Object.keys(PERMISSOES) as Perfil[]).map((p) => (
          <Card key={p} className="p-6">
            <div className="flex items-center justify-between">
              <Badge tone={perfilTone[p]}>{PERFIL_LABEL[p]}</Badge>
              <span className="text-caption text-neutral-500 tabular-nums">{db.usuarios.filter((u) => u.perfil === p && u.ativo).length} ativos</span>
            </div>
            <p className="mt-3 text-body text-neutral-500">{PERMISSOES[p]}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>Usuário</th>
                <th className={th}>Perfil</th>
                <th className={th}>Status</th>
                <th className={`${th} w-28 text-right`}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50">
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <Avatar nome={u.nome} />
                      <div>
                        <p className="font-medium text-neutral-900">{u.nome} {u.id === eu.id && <span className="text-caption text-neutral-500">(você)</span>}</p>
                        <p className="text-caption text-neutral-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className={td}><Badge tone={perfilTone[u.perfil]}>{PERFIL_LABEL[u.perfil]}</Badge></td>
                  <td className={td}>{u.ativo ? <Badge tone="success">Ativo</Badge> : <Badge>Inativo</Badge>}</td>
                  <td className={`${td} text-right`}>
                    <IconButton icon={Pencil} label={`Editar ${u.nome}`} onClick={() => { setErros({}); setForm({ ...u, senha: '' }); }} />
                    <IconButton icon={Power} label={u.ativo ? `Desativar ${u.nome}` : `Reativar ${u.nome}`} tone={u.ativo ? 'danger' : 'neutral'} disabled={u.id === eu.id} onClick={() => alternar(u)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? 'Editar usuário' : 'Novo usuário'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setForm(null)}>Cancelar</Button>
            <Button onClick={salvar}>{form?.id ? 'Salvar alterações' : 'Criar usuário'}</Button>
          </>
        }
      >
        {form && (
          <form onSubmit={(e) => { e.preventDefault(); salvar(); }} className="flex flex-col gap-4" noValidate>
            <Field label="Nome" htmlFor="u-nome" error={erros.nome}>
              <Input id="u-nome" autoFocus value={form.nome} invalid={!!erros.nome} onChange={(e) => set('nome', e.target.value)} />
            </Field>
            <Field label="E-mail" htmlFor="u-email" error={erros.email}>
              <Input id="u-email" type="email" value={form.email} invalid={!!erros.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Perfil" htmlFor="u-perfil" hint={form.id === eu.id ? 'Você não pode alterar o próprio perfil.' : PERMISSOES[form.perfil]}>
              <Select id="u-perfil" value={form.perfil} disabled={form.id === eu.id} onChange={(e) => set('perfil', e.target.value as Perfil)}>
                {(Object.keys(PERFIL_LABEL) as Perfil[]).map((p) => <option key={p} value={p}>{PERFIL_LABEL[p]}</option>)}
              </Select>
            </Field>
            <Field label={form.id ? 'Nova senha (opcional)' : 'Senha inicial'} htmlFor="u-senha" error={erros.senha} hint={form.id ? 'Deixe em branco para manter a atual.' : undefined}>
              <Input id="u-senha" type="password" autoComplete="new-password" value={form.senha} invalid={!!erros.senha} onChange={(e) => set('senha', e.target.value)} />
            </Field>
            <button type="submit" hidden />
          </form>
        )}
      </Modal>
    </>
  );
}
