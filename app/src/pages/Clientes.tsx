import { useState } from 'react';
import { History, Pencil, Plus, Search, Trash2, UserSearch } from 'lucide-react';
import { store, useDb } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Avatar, Badge, Button, Card, ConfirmModal, EmptyState, Field, IconButton, Input, Modal, PageHeader, Pagination, td, th, usePaginacao } from '../components/ui';
import { brl, dataHora, emailValido, maskCpf, maskTel } from '../lib/format';
import { PAGAMENTO_LABEL, type Cliente } from '../types';

type Form = { id?: string; criadoEm?: string; nome: string; cpf: string; telefone: string; email: string };
type Erros = Partial<Record<'nome' | 'cpf' | 'telefone' | 'email', string>>;

export default function Clientes() {
  const db = useDb();
  const { pode } = useAuth();
  const toast = useToast();
  const [busca, setBusca] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [erros, setErros] = useState<Erros>({});
  const [historico, setHistorico] = useState<Cliente | null>(null);
  const [excluir, setExcluir] = useState<Cliente | null>(null);

  const stats = (id: string) => {
    const vs = db.vendas.filter((v) => v.clienteId === id && v.status === 'concluida');
    return { compras: vs.length, total: vs.reduce((s, v) => s + v.total, 0), vendas: vs };
  };

  const q = busca.trim().toLowerCase();
  const qDig = q.replace(/\D/g, '');
  const filtrados = db.clientes
    .filter((c) => !q || c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (qDig && (c.cpf.replace(/\D/g, '').includes(qDig) || c.telefone.replace(/\D/g, '').includes(qDig))))
    .sort((a, b) => a.nome.localeCompare(b.nome));
  const pag = usePaginacao(filtrados, 8);

  const set = (k: keyof Erros, v: string) => {
    setForm((f) => (f ? { ...f, [k]: v } : f));
    setErros((e) => ({ ...e, [k]: undefined }));
  };

  function salvar() {
    if (!form) return;
    const e: Erros = {};
    if (form.nome.trim().length < 3) e.nome = 'Informe o nome completo.';
    if (form.cpf.replace(/\D/g, '').length !== 11) e.cpf = 'CPF deve ter 11 dígitos.';
    else if (db.clientes.some((c) => c.cpf === form.cpf && c.id !== form.id)) e.cpf = 'CPF já cadastrado.';
    if (form.telefone && form.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone incompleto.';
    if (form.email && !emailValido(form.email)) e.email = 'E-mail inválido.';
    if (Object.keys(e).length) return setErros(e);
    store.salvarCliente({ ...form, nome: form.nome.trim(), email: form.email.trim() });
    toast('success', form.id ? 'Cliente atualizado.' : 'Cliente cadastrado.');
    setForm(null);
  }

  const novo = () => {
    setErros({});
    setForm({ nome: '', cpf: '', telefone: '', email: '' });
  };
  const hist = historico ? stats(historico.id) : null;

  return (
    <>
      <PageHeader title="Clientes" subtitle={`${db.clientes.length} clientes cadastrados`} actions={<Button icon={Plus} onClick={novo}>Novo cliente</Button>} />

      <Card className="overflow-hidden">
        <div className="p-6">
          <Input icon={Search} aria-label="Buscar cliente" placeholder="Buscar por nome, CPF, telefone ou e-mail" value={busca} onChange={(e) => { setBusca(e.target.value); pag.setPage(1); }} className="max-w-md" />
        </div>
        {filtrados.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>Cliente</th>
                  <th className={th}>CPF</th>
                  <th className={th}>Telefone</th>
                  <th className={`${th} text-right`}>Compras</th>
                  <th className={`${th} text-right`}>Total gasto</th>
                  <th className={`${th} w-32 text-right`}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pag.slice.map((c) => {
                  const s = stats(c.id);
                  return (
                    <tr key={c.id} className="hover:bg-neutral-50">
                      <td className={td}>
                        <div className="flex items-center gap-3">
                          <Avatar nome={c.nome} />
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900">{c.nome}</p>
                            <p className="truncate text-caption text-neutral-500">{c.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`${td} tabular-nums text-neutral-500`}>{c.cpf}</td>
                      <td className={`${td} tabular-nums text-neutral-500`}>{c.telefone || '—'}</td>
                      <td className={`${td} text-right tabular-nums`}>{s.compras}</td>
                      <td className={`${td} text-right font-medium tabular-nums`}>{brl(s.total)}</td>
                      <td className={`${td} text-right`}>
                        <IconButton icon={History} label={`Histórico de ${c.nome}`} onClick={() => setHistorico(c)} />
                        <IconButton icon={Pencil} label={`Editar ${c.nome}`} onClick={() => { setErros({}); setForm({ ...c }); }} />
                        {pode('admin', 'gerente') && <IconButton icon={Trash2} label={`Excluir ${c.nome}`} tone="danger" onClick={() => setExcluir(c)} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={UserSearch} title="Nenhum cliente encontrado" description="Ajuste a busca ou cadastre um novo cliente." action={<Button variant="secondary" icon={Plus} onClick={novo}>Novo cliente</Button>} />
        )}
        <Pagination page={pag.page} total={pag.total} pageSize={pag.pageSize} onChange={pag.setPage} />
      </Card>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? 'Editar cliente' : 'Novo cliente'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setForm(null)}>Cancelar</Button>
            <Button onClick={salvar}>{form?.id ? 'Salvar alterações' : 'Cadastrar cliente'}</Button>
          </>
        }
      >
        {form && (
          <form onSubmit={(e) => { e.preventDefault(); salvar(); }} className="grid grid-cols-2 gap-4" noValidate>
            <Field label="Nome completo" htmlFor="c-nome" error={erros.nome} className="col-span-2">
              <Input id="c-nome" autoFocus value={form.nome} invalid={!!erros.nome} onChange={(e) => set('nome', e.target.value)} />
            </Field>
            <Field label="CPF" htmlFor="c-cpf" error={erros.cpf}>
              <Input id="c-cpf" inputMode="numeric" placeholder="000.000.000-00" value={form.cpf} invalid={!!erros.cpf} onChange={(e) => set('cpf', maskCpf(e.target.value))} />
            </Field>
            <Field label="Telefone" htmlFor="c-tel" error={erros.telefone}>
              <Input id="c-tel" inputMode="tel" placeholder="(00) 00000-0000" value={form.telefone} invalid={!!erros.telefone} onChange={(e) => set('telefone', maskTel(e.target.value))} />
            </Field>
            <Field label="E-mail" htmlFor="c-email" error={erros.email} className="col-span-2">
              <Input id="c-email" type="email" placeholder="cliente@email.com" value={form.email} invalid={!!erros.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <button type="submit" hidden />
          </form>
        )}
      </Modal>

      <Modal open={!!historico} onClose={() => setHistorico(null)} title={`Histórico · ${historico?.nome ?? ''}`} size="lg">
        {hist && (
          <>
            <div className="mb-4 flex gap-6">
              <div><p className="text-caption text-neutral-500">Compras</p><p className="text-h2 tabular-nums">{hist.compras}</p></div>
              <div><p className="text-caption text-neutral-500">Total gasto</p><p className="text-h2 tabular-nums">{brl(hist.total)}</p></div>
              <div><p className="text-caption text-neutral-500">Ticket médio</p><p className="text-h2 tabular-nums">{brl(hist.compras ? hist.total / hist.compras : 0)}</p></div>
            </div>
            {hist.vendas.length ? (
              <table className="w-full">
                <thead><tr><th className={th}>Nº</th><th className={th}>Data</th><th className={th}>Itens</th><th className={th}>Pagamento</th><th className={`${th} text-right`}>Total</th></tr></thead>
                <tbody>
                  {[...hist.vendas].reverse().map((v) => (
                    <tr key={v.id}>
                      <td className={`${td} tabular-nums`}>#{v.numero}</td>
                      <td className={`${td} tabular-nums text-neutral-500`}>{dataHora(v.data)}</td>
                      <td className={`${td} tabular-nums`}>{v.itens.reduce((s, i) => s + i.qtd, 0)}</td>
                      <td className={td}><Badge>{PAGAMENTO_LABEL[v.pagamento]}</Badge></td>
                      <td className={`${td} text-right font-medium tabular-nums`}>{brl(v.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState icon={History} title="Sem compras ainda" />
            )}
          </>
        )}
      </Modal>

      <ConfirmModal
        open={!!excluir}
        title="Excluir cliente"
        message={<>Excluir <strong className="text-neutral-900">{excluir?.nome}</strong>? As vendas continuam no histórico como "Cliente removido".</>}
        confirmLabel="Excluir"
        onClose={() => setExcluir(null)}
        onConfirm={() => {
          if (excluir) store.excluirCliente(excluir.id);
          toast('success', 'Cliente excluído.');
          setExcluir(null);
        }}
      />
    </>
  );
}
