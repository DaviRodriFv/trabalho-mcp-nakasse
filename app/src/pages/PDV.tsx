import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, CheckCircle2, CreditCard, Minus, Plus, QrCode, Search, ShoppingCart, Trash2, Wallet } from 'lucide-react';
import { store, useDb } from '../services/db';
import { useUsuario } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Badge, Button, Card, CardHeader, EmptyState, Field, IconButton, Input, Modal, PageHeader, Select, cx } from '../components/ui';
import { brl, statusEstoque } from '../lib/format';
import { PAGAMENTO_LABEL, type Pagamento, type Produto, type Venda } from '../types';

const PAGAMENTOS: { value: Pagamento; icon: typeof Banknote }[] = [
  { value: 'pix', icon: QrCode },
  { value: 'dinheiro', icon: Banknote },
  { value: 'debito', icon: Wallet },
  { value: 'credito', icon: CreditCard },
];

export default function PDV() {
  const db = useDb();
  const usuario = useUsuario();
  const toast = useToast();
  const nav = useNavigate();
  const buscaRef = useRef<HTMLInputElement>(null);
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState<{ produtoId: string; qtd: number }[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [desconto, setDesconto] = useState('');
  const [pagamento, setPagamento] = useState<Pagamento>('pix');
  const [concluida, setConcluida] = useState<Venda | null>(null);

  // F2 foca a busca (atalho de caixa)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        buscaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const q = busca.trim().toLowerCase();
  const resultados = db.produtos.filter((p) => !q || p.nome.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).sort((a, b) => a.nome.localeCompare(b.nome));

  const itens = carrinho.flatMap((c) => {
    const produto = db.produtos.find((p) => p.id === c.produtoId);
    return produto ? [{ ...c, produto }] : [];
  });
  const subtotal = itens.reduce((s, i) => s + i.qtd * i.produto.preco, 0);
  const descontoNum = Math.max(0, Number(desconto.replace(',', '.')) || 0);
  const descontoInvalido = descontoNum > subtotal;
  const total = Math.max(0, subtotal - descontoNum);
  const qtdNoCarrinho = (id: string) => carrinho.find((c) => c.produtoId === id)?.qtd ?? 0;

  function adicionar(p: Produto) {
    if (qtdNoCarrinho(p.id) + 1 > p.estoque) return toast('error', p.estoque <= 0 ? `${p.nome} está sem estoque.` : `Só há ${p.estoque} un. de ${p.nome}.`);
    setCarrinho((c) => (c.some((x) => x.produtoId === p.id) ? c.map((x) => (x.produtoId === p.id ? { ...x, qtd: x.qtd + 1 } : x)) : [...c, { produtoId: p.id, qtd: 1 }]));
  }

  function alterar(p: Produto, delta: number) {
    const nova = qtdNoCarrinho(p.id) + delta;
    if (nova > p.estoque) return toast('error', `Só há ${p.estoque} un. de ${p.nome}.`);
    setCarrinho((c) => (nova <= 0 ? c.filter((x) => x.produtoId !== p.id) : c.map((x) => (x.produtoId === p.id ? { ...x, qtd: nova } : x))));
  }

  function limpar() {
    setCarrinho([]);
    setClienteId('');
    setDesconto('');
    setPagamento('pix');
  }

  function finalizar() {
    if (descontoInvalido) return toast('error', 'O desconto não pode ser maior que o subtotal.');
    try {
      const v = store.registrarVenda({
        itens: itens.map((i) => ({ produtoId: i.produtoId, nome: i.produto.nome, qtd: i.qtd, precoUnit: i.produto.preco })),
        clienteId: clienteId || null,
        desconto: descontoNum,
        pagamento,
        usuarioId: usuario.id,
      });
      setConcluida(v);
      limpar();
    } catch (e) {
      toast('error', (e as Error).message);
    }
  }

  return (
    <>
      <PageHeader title="Nova venda" subtitle="Busque os produtos, monte o carrinho e finalize. Atalho: F2 para buscar." />

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 xl:col-span-8">
          <div className="p-6 pb-4">
            <Input
              ref={buscaRef}
              icon={Search}
              autoFocus
              aria-label="Buscar produto"
              placeholder="Buscar por nome ou SKU e Enter para adicionar o primeiro"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && resultados[0]) {
                  adicionar(resultados[0]);
                  setBusca('');
                }
              }}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-3">
            {resultados.map((p) => {
              const sem = statusEstoque(p) === 'sem';
              const noCarrinho = qtdNoCarrinho(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => adicionar(p)}
                  disabled={sem}
                  className={cx(
                    'flex flex-col gap-2 rounded-md border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                    noCarrinho ? 'border-primary-600 bg-primary-50' : 'border-neutral-200 hover:border-primary-600 hover:bg-neutral-50',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-label text-neutral-900">{p.nome}</span>
                    {noCarrinho > 0 && <Badge tone="primary">{noCarrinho}×</Badge>}
                  </div>
                  <span className="text-caption text-neutral-500">{p.sku}</span>
                  <div className="mt-auto flex items-end justify-between">
                    <span className="text-h3 tabular-nums text-neutral-900">{brl(p.preco)}</span>
                    {sem ? <Badge tone="danger">Sem estoque</Badge> : <span className={cx('text-caption tabular-nums', statusEstoque(p) === 'baixo' ? 'text-tertiary-700' : 'text-neutral-500')}>{p.estoque} un.</span>}
                  </div>
                </button>
              );
            })}
            {!resultados.length && <p className="col-span-full py-8 text-center text-body text-neutral-500">Nenhum produto para "{busca}".</p>}
          </div>
        </Card>

        <Card className="col-span-12 self-start xl:sticky xl:top-0 xl:col-span-4">
          <CardHeader title={`Carrinho (${itens.reduce((s, i) => s + i.qtd, 0)})`} actions={itens.length ? <Button variant="ghost" size="sm" onClick={limpar}>Limpar</Button> : undefined} />
          <div className="flex flex-col gap-4 px-6 pb-6">
            <Field label="Cliente (opcional)" htmlFor="pdv-cliente">
              <Select id="pdv-cliente" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Consumidor final</option>
                {[...db.clientes].sort((a, b) => a.nome.localeCompare(b.nome)).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </Field>

            {itens.length ? (
              <ul className="flex max-h-72 flex-col overflow-y-auto">
                {itens.map((i) => (
                  <li key={i.produtoId} className="border-b border-neutral-200 py-3 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-body text-neutral-900">{i.produto.nome}</p>
                      <IconButton icon={Trash2} label={`Remover ${i.produto.nome}`} tone="danger" onClick={() => alterar(i.produto, -i.qtd)} />
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                    <span className="flex-1 text-caption text-neutral-500 tabular-nums">{brl(i.produto.preco)} un.</span>
                    <div className="flex items-center rounded-md border border-neutral-200">
                      <button onClick={() => alterar(i.produto, -1)} aria-label={`Diminuir ${i.produto.nome}`} className="flex h-8 w-8 items-center justify-center text-neutral-500 hover:text-neutral-900"><Minus size={16} /></button>
                      <span className="w-8 text-center text-label tabular-nums">{i.qtd}</span>
                      <button onClick={() => alterar(i.produto, 1)} aria-label={`Aumentar ${i.produto.nome}`} className="flex h-8 w-8 items-center justify-center text-neutral-500 hover:text-neutral-900"><Plus size={16} /></button>
                    </div>
                    <span className="w-24 text-right text-label tabular-nums">{brl(i.qtd * i.produto.preco)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={ShoppingCart} title="Carrinho vazio" description="Clique em um produto para adicionar." />
            )}

            <Field label="Desconto (R$)" htmlFor="pdv-desc" error={descontoInvalido ? 'Maior que o subtotal.' : undefined}>
              <Input id="pdv-desc" type="number" min="0" step="0.01" placeholder="0,00" value={desconto} invalid={descontoInvalido} onChange={(e) => setDesconto(e.target.value)} disabled={!itens.length} />
            </Field>

            <div>
              <p className="mb-2 text-label text-neutral-900">Forma de pagamento</p>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Forma de pagamento">
                {PAGAMENTOS.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    role="radio"
                    aria-checked={pagamento === value}
                    onClick={() => setPagamento(value)}
                    className={cx('flex h-control-md items-center justify-center gap-2 rounded-md border text-label transition-colors', pagamento === value ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-neutral-200 text-neutral-500 hover:text-neutral-900')}
                  >
                    <Icon size={16} aria-hidden /> {PAGAMENTO_LABEL[value]}
                  </button>
                ))}
              </div>
            </div>

            <dl className="flex flex-col gap-2 border-t border-neutral-200 pt-4 text-body">
              <div className="flex justify-between text-neutral-500"><dt>Subtotal</dt><dd className="tabular-nums">{brl(subtotal)}</dd></div>
              <div className="flex justify-between text-neutral-500"><dt>Desconto</dt><dd className="tabular-nums">− {brl(Math.min(descontoNum, subtotal))}</dd></div>
              <div className="flex items-baseline justify-between"><dt className="text-h3">Total</dt><dd className="text-h1 tabular-nums">{brl(total)}</dd></div>
            </dl>

            <Button size="lg" className="w-full" disabled={!itens.length || descontoInvalido} onClick={finalizar}>
              Finalizar venda
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        open={!!concluida}
        onClose={() => setConcluida(null)}
        title="Venda concluída"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => nav('/vendas')}>Ver histórico</Button>
            <Button onClick={() => { setConcluida(null); buscaRef.current?.focus(); }}>Nova venda</Button>
          </>
        }
      >
        {concluida && (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-success"><CheckCircle2 size={24} /></span>
            <p className="text-body text-neutral-500">Venda <strong className="text-neutral-900">#{concluida.numero}</strong> registrada. O estoque foi atualizado.</p>
            <p className="text-display tabular-nums">{brl(concluida.total)}</p>
            <Badge tone="primary">{PAGAMENTO_LABEL[concluida.pagamento]}</Badge>
          </div>
        )}
      </Modal>
    </>
  );
}
