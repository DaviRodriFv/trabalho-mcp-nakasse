import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, DollarSign, PackageCheck, Receipt, ShoppingCart, TrendingUp } from 'lucide-react';
import { useDb } from '../services/db';
import { useAuth, useUsuario } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Badge, Button, Card, CardHeader, EmptyState, KpiCard, PageHeader, Segmented, StatusEstoqueBadge, td, th } from '../components/ui';
import { brl, cssVar, dataCurta, dataHora, mesmoDia, statusEstoque } from '../lib/format';
import { PAGAMENTO_LABEL } from '../types';

export default function Painel() {
  const db = useDb();
  const usuario = useUsuario();
  const { pode } = useAuth();
  useTheme(); // re-render ao trocar o tema (cores do gráfico)
  const nav = useNavigate();
  const [periodo, setPeriodo] = useState<7 | 30>(7);

  const vendedor = usuario.perfil === 'vendedor';
  const minhas = db.vendas.filter((v) => !vendedor || v.usuarioId === usuario.id);
  const concluidas = minhas.filter((v) => v.status === 'concluida');
  const agora = new Date();

  const totalDia = (d: Date, ate?: Date) =>
    concluidas
      .filter((v) => {
        const dv = new Date(v.data);
        return mesmoDia(dv, d) && (!ate || dv <= ate);
      })
      .reduce((s, v) => s + v.total, 0);

  const hoje = totalDia(agora);
  const ontemAgora = new Date(agora.getTime() - 864e5);
  const ontem = totalDia(ontemAgora, ontemAgora);
  const delta = ontem > 0 ? ((hoje - ontem) / ontem) * 100 : null;

  const doMes = concluidas.filter((v) => {
    const d = new Date(v.data);
    return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
  });
  const fatMes = doMes.reduce((s, v) => s + v.total, 0);
  const ticket = doMes.length ? fatMes / doMes.length : 0;

  const baixos = db.produtos.filter((p) => statusEstoque(p) !== 'ok').sort((a, b) => a.estoque / a.estoqueMin - b.estoque / b.estoqueMin);

  const serie = Array.from({ length: periodo }, (_, i) => {
    const d = new Date(agora);
    d.setDate(d.getDate() - (periodo - 1 - i));
    return { dia: dataCurta(d), total: Math.round(totalDia(d) * 100) / 100 };
  });

  const desde = new Date(agora.getTime() - 30 * 864e5);
  const ranking = new Map<string, { nome: string; qtd: number; receita: number }>();
  concluidas
    .filter((v) => new Date(v.data) >= desde)
    .forEach((v) =>
      v.itens.forEach((i) => {
        const r = ranking.get(i.produtoId) ?? { nome: i.nome, qtd: 0, receita: 0 };
        r.qtd += i.qtd;
        r.receita += i.qtd * i.precoUnit;
        ranking.set(i.produtoId, r);
      }),
    );
  const top = [...ranking.values()].sort((a, b) => b.receita - a.receita).slice(0, 5);
  const maxTop = top[0]?.receita || 1;

  const ultimas = [...minhas].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 6);
  const nomeCliente = (id: string | null) => (id ? db.clientes.find((c) => c.id === id)?.nome ?? 'Cliente removido' : 'Consumidor final');

  const cor = { primaria: cssVar('--color-primary-600'), grade: cssVar('--color-neutral-200'), texto: cssVar('--color-neutral-500'), sup: cssVar('--color-neutral-0'), txt: cssVar('--color-neutral-900') };
  const saudacao = agora.getHours() < 12 ? 'Bom dia' : agora.getHours() < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <>
      <PageHeader
        title={`${saudacao}, ${usuario.nome.split(' ')[0]}`}
        subtitle={`${db.loja} · ${agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        actions={<Button icon={ShoppingCart} onClick={() => nav('/pdv')}>Nova venda</Button>}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={vendedor ? 'Minhas vendas hoje' : 'Vendas hoje'} value={brl(hoje)} icon={DollarSign} delta={delta} hint="vs. ontem no mesmo horário" />
        <KpiCard label={vendedor ? 'Minhas vendas no mês' : 'Faturamento do mês'} value={brl(fatMes)} icon={TrendingUp} hint={`${doMes.length} vendas em ${agora.toLocaleDateString('pt-BR', { month: 'long' })}`} />
        <KpiCard label="Ticket médio" value={brl(ticket)} icon={Receipt} hint="média por venda no mês" />
        <KpiCard label="Estoque baixo" value={`${baixos.length} itens`} icon={AlertTriangle} tone="warning" hint={`${baixos.filter((p) => p.estoque <= 0).length} sem estoque`} />
      </div>

      <div className="mt-6 grid grid-cols-12 gap-6">
        <Card className="col-span-12 flex flex-col xl:col-span-8">
          <CardHeader
            title={vendedor ? 'Minhas vendas' : 'Vendas'}
            subtitle={`Faturamento diário · últimos ${periodo} dias`}
            actions={<Segmented<7 | 30> label="Período" value={periodo} onChange={setPeriodo} options={[{ value: 7, label: '7 dias' }, { value: 30, label: '30 dias' }]} />}
          />
          <div className="min-h-72 flex-1 px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serie} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cor.primaria} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={cor.primaria} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={cor.grade} vertical={false} />
                <XAxis dataKey="dia" tick={{ fill: cor.texto, fontSize: 12 }} axisLine={false} tickLine={false} interval={periodo === 30 ? 4 : 0} />
                <YAxis tick={{ fill: cor.texto, fontSize: 12 }} axisLine={false} tickLine={false} width={64} tickFormatter={(v) => `R$ ${Math.round(Number(v))}`} />
                <Tooltip
                  formatter={(v) => [brl(Number(v)), 'Faturamento']}
                  contentStyle={{ background: cor.sup, border: `1px solid ${cor.grade}`, borderRadius: 8, fontSize: 13, color: cor.txt }}
                  labelStyle={{ color: cor.texto }}
                  cursor={{ stroke: cor.grade }}
                />
                <Area type="monotone" dataKey="total" stroke={cor.primaria} strokeWidth={2} fill="url(#gArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-12 xl:col-span-4">
          <CardHeader title="Top 5 produtos" subtitle="Por faturamento · últimos 30 dias" />
          <ol className="flex flex-col gap-4 px-6 pb-6">
            {top.map((p, i) => (
              <li key={p.nome}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-body text-neutral-900">
                    <span className="mr-2 text-caption text-neutral-500">{i + 1}.</span>
                    {p.nome}
                  </span>
                  <span className="shrink-0 text-label tabular-nums text-neutral-900">{brl(p.receita)}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-neutral-50">
                  <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${(p.receita / maxTop) * 100}%` }} />
                </div>
                <p className="mt-1 text-caption text-neutral-500 tabular-nums">{p.qtd} unidades</p>
              </li>
            ))}
            {!top.length && <p className="text-body text-neutral-500">Sem vendas no período.</p>}
          </ol>
        </Card>

        <Card className="col-span-12 overflow-hidden xl:col-span-8">
          <CardHeader
            title="Últimas vendas"
            actions={
              <Link to="/vendas" className="text-label text-primary-600 hover:underline">
                Ver todas
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>Nº</th>
                  <th className={th}>Data</th>
                  <th className={th}>Cliente</th>
                  <th className={th}>Pagamento</th>
                  <th className={`${th} text-right`}>Total</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {ultimas.map((v) => (
                  <tr key={v.id} className="hover:bg-neutral-50">
                    <td className={`${td} font-medium tabular-nums`}>#{v.numero}</td>
                    <td className={`${td} text-neutral-500 tabular-nums`}>{dataHora(v.data)}</td>
                    <td className={td}>{nomeCliente(v.clienteId)}</td>
                    <td className={td}>{PAGAMENTO_LABEL[v.pagamento]}</td>
                    <td className={`${td} text-right font-medium tabular-nums`}>{brl(v.total)}</td>
                    <td className={td}>{v.status === 'concluida' ? <Badge tone="success">Concluída</Badge> : <Badge tone="danger">Cancelada</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="col-span-12 xl:col-span-4">
          <CardHeader
            title="Estoque baixo"
            subtitle="Repor em breve"
            actions={
              pode('admin', 'gerente') ? (
                <Link to="/produtos" className="text-label text-primary-600 hover:underline">
                  Gerenciar
                </Link>
              ) : undefined
            }
          />
          {baixos.length ? (
            <ul className="flex flex-col px-6 pb-4">
              {baixos.slice(0, 7).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 border-b border-neutral-200 py-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-body text-neutral-900">{p.nome}</p>
                    <p className="text-caption text-neutral-500 tabular-nums">
                      {p.estoque} em estoque · mín. {p.estoqueMin}
                    </p>
                  </div>
                  <StatusEstoqueBadge produto={p} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={PackageCheck} title="Tudo em dia" description="Nenhum produto abaixo do mínimo." />
          )}
        </Card>
      </div>
    </>
  );
}
