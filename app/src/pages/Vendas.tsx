import { useState } from 'react';
import { Ban, Receipt, Search } from 'lucide-react';
import { store, useDb } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Badge, Button, Card, CardHeader, ConfirmModal, EmptyState, Input, PageHeader, Pagination, Select, cx, td, th, usePaginacao } from '../components/ui';
import { brl, dataHora } from '../lib/format';
import { PAGAMENTO_LABEL, type Pagamento } from '../types';

export default function Vendas() {
  const db = useDb();
  const { pode } = useAuth();
  const toast = useToast();
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('');
  const [pagamento, setPagamento] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [cancelar, setCancelar] = useState(false);

  const nomeCliente = (id: string | null) => (id ? db.clientes.find((c) => c.id === id)?.nome ?? 'Cliente removido' : 'Consumidor final');
  const nomeUsuario = (id: string) => db.usuarios.find((u) => u.id === id)?.nome ?? '—';

  const q = busca.trim().toLowerCase().replace('#', '');
  const filtradas = [...db.vendas]
    .sort((a, b) => b.data.localeCompare(a.data))
    .filter((v) => (!q || String(v.numero).includes(q) || nomeCliente(v.clienteId).toLowerCase().includes(q)) && (!status || v.status === status) && (!pagamento || v.pagamento === pagamento));
  const pag = usePaginacao(filtradas, 10);
  const sel = db.vendas.find((v) => v.id === selId) ?? pag.slice[0] ?? null;
  const totalFiltrado = filtradas.filter((v) => v.status === 'concluida').reduce((s, v) => s + v.total, 0);
  const resetPag = () => pag.setPage(1);

  return (
    <>
      <PageHeader title="Histórico de vendas" subtitle={`${filtradas.length} vendas · ${brl(totalFiltrado)} em vendas concluídas`} />

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 overflow-hidden xl:col-span-8">
          <div className="flex flex-wrap gap-3 p-6">
            <div className="min-w-[220px] flex-1">
              <Input icon={Search} aria-label="Buscar venda" placeholder="Nº da venda ou cliente" value={busca} onChange={(e) => { setBusca(e.target.value); resetPag(); }} />
            </div>
            <Select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); resetPag(); }} className="w-40">
              <option value="">Todos os status</option>
              <option value="concluida">Concluídas</option>
              <option value="cancelada">Canceladas</option>
            </Select>
            <Select aria-label="Pagamento" value={pagamento} onChange={(e) => { setPagamento(e.target.value); resetPag(); }} className="w-40">
              <option value="">Todos os pagamentos</option>
              {(Object.keys(PAGAMENTO_LABEL) as Pagamento[]).map((p) => <option key={p} value={p}>{PAGAMENTO_LABEL[p]}</option>)}
            </Select>
          </div>

          {filtradas.length ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={th}>Nº</th>
                    <th className={th}>Data</th>
                    <th className={th}>Cliente</th>
                    <th className={th}>Vendedor</th>
                    <th className={`${th} text-right`}>Total</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pag.slice.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => setSelId(v.id)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelId(v.id)}
                      tabIndex={0}
                      aria-selected={sel?.id === v.id}
                      className={cx('cursor-pointer outline-none', sel?.id === v.id ? 'bg-primary-50' : 'hover:bg-neutral-50 focus:bg-neutral-50')}
                    >
                      <td className={`${td} font-medium tabular-nums`}>#{v.numero}</td>
                      <td className={`${td} text-neutral-500 tabular-nums`}>{dataHora(v.data)}</td>
                      <td className={td}>{nomeCliente(v.clienteId)}</td>
                      <td className={`${td} text-neutral-500`}>{nomeUsuario(v.usuarioId)}</td>
                      <td className={`${td} text-right font-medium tabular-nums`}>{brl(v.total)}</td>
                      <td className={td}>{v.status === 'concluida' ? <Badge tone="success">Concluída</Badge> : <Badge tone="danger">Cancelada</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Receipt} title="Nenhuma venda encontrada" description="Ajuste a busca ou os filtros." />
          )}
          <Pagination page={pag.page} total={pag.total} pageSize={pag.pageSize} onChange={pag.setPage} />
        </Card>

        <Card className="col-span-12 self-start xl:sticky xl:top-0 xl:col-span-4">
          {sel ? (
            <>
              <CardHeader title={`Venda #${sel.numero}`} subtitle={dataHora(sel.data)} actions={sel.status === 'concluida' ? <Badge tone="success">Concluída</Badge> : <Badge tone="danger">Cancelada</Badge>} />
              <div className="flex flex-col gap-4 px-6 pb-6">
                <dl className="grid grid-cols-2 gap-3 text-body">
                  <div><dt className="text-caption text-neutral-500">Cliente</dt><dd>{nomeCliente(sel.clienteId)}</dd></div>
                  <div><dt className="text-caption text-neutral-500">Vendedor</dt><dd>{nomeUsuario(sel.usuarioId)}</dd></div>
                  <div><dt className="text-caption text-neutral-500">Pagamento</dt><dd>{PAGAMENTO_LABEL[sel.pagamento]}</dd></div>
                  <div><dt className="text-caption text-neutral-500">Itens</dt><dd className="tabular-nums">{sel.itens.reduce((s, i) => s + i.qtd, 0)}</dd></div>
                </dl>
                <ul className="flex flex-col border-t border-neutral-200 pt-2">
                  {sel.itens.map((i) => (
                    <li key={i.produtoId} className="flex justify-between gap-3 py-2 text-body">
                      <span className="min-w-0 truncate"><span className="tabular-nums text-neutral-500">{i.qtd}×</span> {i.nome}</span>
                      <span className="shrink-0 tabular-nums">{brl(i.qtd * i.precoUnit)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="flex flex-col gap-1 border-t border-neutral-200 pt-3 text-body">
                  <div className="flex justify-between text-neutral-500"><dt>Desconto</dt><dd className="tabular-nums">− {brl(sel.desconto)}</dd></div>
                  <div className="flex justify-between"><dt className="text-h3">Total</dt><dd className="text-h2 tabular-nums">{brl(sel.total)}</dd></div>
                </dl>
                {pode('admin', 'gerente') && sel.status === 'concluida' && (
                  <Button variant="danger" icon={Ban} className="w-full" onClick={() => setCancelar(true)}>Cancelar venda</Button>
                )}
              </div>
            </>
          ) : (
            <EmptyState icon={Receipt} title="Selecione uma venda" description="Os detalhes aparecem aqui." />
          )}
        </Card>
      </div>

      <ConfirmModal
        open={cancelar}
        title="Cancelar venda"
        message={<>Cancelar a venda <strong className="text-neutral-900">#{sel?.numero}</strong>? Os itens voltam para o estoque. Essa ação não pode ser desfeita.</>}
        confirmLabel="Cancelar venda"
        onClose={() => setCancelar(false)}
        onConfirm={() => {
          if (sel) store.cancelarVenda(sel.id);
          toast('success', `Venda #${sel?.numero} cancelada e estoque devolvido.`);
          setCancelar(false);
        }}
      />
    </>
  );
}
