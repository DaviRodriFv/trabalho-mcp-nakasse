import { useState } from 'react';
import { PackageSearch, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { store, useDb } from '../services/db';
import { useToast } from '../contexts/ToastContext';
import { Button, Card, ConfirmModal, EmptyState, Field, IconButton, Input, Modal, PageHeader, Pagination, Select, StatusEstoqueBadge, td, th, usePaginacao } from '../components/ui';
import { brl, statusEstoque } from '../lib/format';
import type { Produto } from '../types';

type Form = { id?: string; nome: string; sku: string; categoria: string; custo: string; preco: string; estoque: string; estoqueMin: string };
type Erros = Partial<Record<keyof Form, string>>;

const paraForm = (p: Produto): Form => ({ id: p.id, nome: p.nome, sku: p.sku, categoria: p.categoria, custo: String(p.custo), preco: String(p.preco), estoque: String(p.estoque), estoqueMin: String(p.estoqueMin) });

export default function Produtos() {
  const db = useDb();
  const toast = useToast();
  const [busca, setBusca] = useState('');
  const [cat, setCat] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState<Form | null>(null);
  const [erros, setErros] = useState<Erros>({});
  const [excluir, setExcluir] = useState<Produto | null>(null);

  const q = busca.trim().toLowerCase();
  const filtrados = db.produtos
    .filter((p) => (!q || p.nome.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) && (!cat || p.categoria === cat) && (!status || statusEstoque(p) === status))
    .sort((a, b) => a.nome.localeCompare(b.nome));
  const pag = usePaginacao(filtrados, 8);

  const abrirNovo = () => {
    setErros({});
    setForm({ nome: '', sku: '', categoria: db.categorias[0], custo: '', preco: '', estoque: '0', estoqueMin: '5' });
  };
  const campo = (k: keyof Form) => ({
    value: form?.[k] ?? '',
    invalid: !!erros[k],
    onChange: (e: { target: { value: string } }) => {
      setForm((f) => (f ? { ...f, [k]: e.target.value } : f));
      setErros((er) => ({ ...er, [k]: undefined }));
    },
  });

  function salvar() {
    if (!form) return;
    const e: Erros = {};
    const custo = Number(form.custo), preco = Number(form.preco), estoque = Number(form.estoque), estoqueMin = Number(form.estoqueMin);
    if (!form.nome.trim()) e.nome = 'Informe o nome do produto.';
    if (!form.sku.trim()) e.sku = 'Informe o SKU.';
    else if (db.produtos.some((p) => p.sku.toLowerCase() === form.sku.trim().toLowerCase() && p.id !== form.id)) e.sku = 'Este SKU já está em uso.';
    if (form.custo === '' || !(custo >= 0)) e.custo = 'Informe um valor válido.';
    if (!(preco > 0)) e.preco = 'Informe o preço de venda.';
    if (!Number.isInteger(estoque) || estoque < 0) e.estoque = 'Use um número inteiro ≥ 0.';
    if (!Number.isInteger(estoqueMin) || estoqueMin < 0) e.estoqueMin = 'Use um número inteiro ≥ 0.';
    if (Object.keys(e).length) return setErros(e);

    store.salvarProduto({ id: form.id, nome: form.nome.trim(), sku: form.sku.trim().toUpperCase(), categoria: form.categoria, custo, preco, estoque, estoqueMin });
    toast('success', form.id ? 'Produto atualizado.' : 'Produto cadastrado.');
    setForm(null);
  }

  const margem = form && Number(form.preco) > 0 && form.custo !== '' ? ((Number(form.preco) - Number(form.custo)) / Number(form.preco)) * 100 : null;

  return (
    <>
      <PageHeader title="Produtos" subtitle={`${db.produtos.length} produtos cadastrados`} actions={<Button icon={Plus} onClick={abrirNovo}>Novo produto</Button>} />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-3 p-6">
          <div className="min-w-[240px] flex-1">
            <Input icon={Search} placeholder="Buscar por nome ou SKU" aria-label="Buscar produto" value={busca} onChange={(e) => { setBusca(e.target.value); pag.setPage(1); }} />
          </div>
          <Select aria-label="Categoria" value={cat} onChange={(e) => { setCat(e.target.value); pag.setPage(1); }} className="w-48">
            <option value="">Todas as categorias</option>
            {db.categorias.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Select aria-label="Status do estoque" value={status} onChange={(e) => { setStatus(e.target.value); pag.setPage(1); }} className="w-44">
            <option value="">Todos os status</option>
            <option value="ok">Em estoque</option>
            <option value="baixo">Estoque baixo</option>
            <option value="sem">Sem estoque</option>
          </Select>
        </div>

        {filtrados.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>Produto</th>
                  <th className={th}>Categoria</th>
                  <th className={`${th} text-right`}>Custo</th>
                  <th className={`${th} text-right`}>Preço</th>
                  <th className={`${th} text-right`}>Estoque</th>
                  <th className={th}>Status</th>
                  <th className={`${th} w-24 text-right`}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {pag.slice.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className={td}>
                      <p className="font-medium text-neutral-900">{p.nome}</p>
                      <p className="text-caption text-neutral-500">{p.sku}</p>
                    </td>
                    <td className={`${td} text-neutral-500`}>{p.categoria}</td>
                    <td className={`${td} text-right tabular-nums text-neutral-500`}>{brl(p.custo)}</td>
                    <td className={`${td} text-right font-medium tabular-nums`}>{brl(p.preco)}</td>
                    <td className={`${td} text-right tabular-nums`}>
                      {p.estoque} <span className="text-caption text-neutral-500">/ mín. {p.estoqueMin}</span>
                    </td>
                    <td className={td}><StatusEstoqueBadge produto={p} /></td>
                    <td className={`${td} text-right`}>
                      <IconButton icon={Pencil} label={`Editar ${p.nome}`} onClick={() => { setErros({}); setForm(paraForm(p)); }} />
                      <IconButton icon={Trash2} label={`Excluir ${p.nome}`} tone="danger" onClick={() => setExcluir(p)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={PackageSearch} title="Nenhum produto encontrado" description="Ajuste a busca ou os filtros, ou cadastre um novo produto." action={<Button variant="secondary" icon={Plus} onClick={abrirNovo}>Novo produto</Button>} />
        )}
        <Pagination page={pag.page} total={pag.total} pageSize={pag.pageSize} onChange={pag.setPage} />
      </Card>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? 'Editar produto' : 'Novo produto'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setForm(null)}>Cancelar</Button>
            <Button onClick={salvar}>{form?.id ? 'Salvar alterações' : 'Cadastrar produto'}</Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); salvar(); }} className="grid grid-cols-2 gap-4" noValidate>
          <Field label="Nome" htmlFor="p-nome" error={erros.nome} className="col-span-2">
            <Input id="p-nome" autoFocus placeholder="Ex.: Arroz Tipo 1 5kg" {...campo('nome')} />
          </Field>
          <Field label="SKU" htmlFor="p-sku" error={erros.sku}>
            <Input id="p-sku" placeholder="ARZ-005" {...campo('sku')} />
          </Field>
          <Field label="Categoria" htmlFor="p-cat">
            <Select id="p-cat" {...campo('categoria')}>
              {db.categorias.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Preço de custo (R$)" htmlFor="p-custo" error={erros.custo}>
            <Input id="p-custo" type="number" min="0" step="0.01" {...campo('custo')} />
          </Field>
          <Field label="Preço de venda (R$)" htmlFor="p-preco" error={erros.preco} hint={margem != null ? `Margem: ${margem.toFixed(1)}%` : undefined}>
            <Input id="p-preco" type="number" min="0" step="0.01" {...campo('preco')} />
          </Field>
          <Field label="Estoque atual" htmlFor="p-est" error={erros.estoque}>
            <Input id="p-est" type="number" min="0" step="1" {...campo('estoque')} />
          </Field>
          <Field label="Estoque mínimo" htmlFor="p-min" error={erros.estoqueMin} hint="Abaixo disso, o painel avisa.">
            <Input id="p-min" type="number" min="0" step="1" {...campo('estoqueMin')} />
          </Field>
          <button type="submit" hidden />
        </form>
      </Modal>

      <ConfirmModal
        open={!!excluir}
        title="Excluir produto"
        message={<>Tem certeza que deseja excluir <strong className="text-neutral-900">{excluir?.nome}</strong>? O histórico de vendas é mantido.</>}
        confirmLabel="Excluir"
        onClose={() => setExcluir(null)}
        onConfirm={() => {
          if (excluir) store.excluirProduto(excluir.id);
          toast('success', 'Produto excluído.');
          setExcluir(null);
        }}
      />
    </>
  );
}
