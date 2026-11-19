/**
 * Camada de dados do protótipo: estado em memória + localStorage.
 * As telas só usam `useDb()` (leitura) e `store` (escrita). Para usar uma API real,
 * basta trocar a implementação deste arquivo.
 */
import { useSyncExternalStore } from 'react';
import type { Cliente, DB, ItemVenda, Pagamento, Produto, Usuario, Venda } from '../types';
import { uid } from '../lib/format';
import { criarSeed } from './seed';

const KEY = 'balcao-erp:db:v1';

function persistir(d: DB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* sem storage (aba privada): segue só em memória */
  }
}

function carregar(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DB;
  } catch {
    /* ignora e recria */
  }
  const s = criarSeed();
  persistir(s);
  return s;
}

let state = carregar();
const listeners = new Set<() => void>();

function set(next: DB) {
  state = next;
  persistir(next);
  listeners.forEach((l) => l());
}

export function useDb(): DB {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
  );
}

function upsert<T extends { id: string }>(lista: T[], item: T): T[] {
  return lista.some((i) => i.id === item.id) ? lista.map((i) => (i.id === item.id ? item : i)) : [...lista, item];
}

const arred = (n: number) => Math.round(n * 100) / 100;

export const store = {
  salvarProduto(p: Omit<Produto, 'id'> & { id?: string }) {
    const item: Produto = { ...p, id: p.id ?? uid() };
    set({ ...state, produtos: upsert(state.produtos, item) });
    return item;
  },
  excluirProduto(id: string) {
    set({ ...state, produtos: state.produtos.filter((p) => p.id !== id) });
  },

  salvarCliente(c: Omit<Cliente, 'id' | 'criadoEm'> & { id?: string; criadoEm?: string }) {
    const item: Cliente = { ...c, id: c.id ?? uid(), criadoEm: c.criadoEm ?? new Date().toISOString() };
    set({ ...state, clientes: upsert(state.clientes, item) });
    return item;
  },
  excluirCliente(id: string) {
    set({ ...state, clientes: state.clientes.filter((c) => c.id !== id) });
  },

  salvarUsuario(u: Omit<Usuario, 'id'> & { id?: string }) {
    const item: Usuario = { ...u, id: u.id ?? uid() };
    set({ ...state, usuarios: upsert(state.usuarios, item) });
    return item;
  },

  /** RF07 + RF08: registra a venda e dá baixa no estoque. */
  registrarVenda(input: { itens: ItemVenda[]; clienteId: string | null; desconto: number; pagamento: Pagamento; usuarioId: string }): Venda {
    if (!input.itens.length) throw new Error('Adicione ao menos um produto.');
    for (const i of input.itens) {
      const p = state.produtos.find((x) => x.id === i.produtoId);
      if (!p) throw new Error(`Produto não encontrado: ${i.nome}.`);
      if (i.qtd > p.estoque) throw new Error(`Estoque insuficiente de ${p.nome} (disponível: ${p.estoque}).`);
    }
    const subtotal = input.itens.reduce((s, i) => s + i.qtd * i.precoUnit, 0);
    const desconto = Math.min(Math.max(0, input.desconto), subtotal);
    const venda: Venda = {
      id: uid(),
      numero: state.vendas.reduce((m, v) => Math.max(m, v.numero), 1000) + 1,
      data: new Date().toISOString(),
      usuarioId: input.usuarioId,
      clienteId: input.clienteId,
      itens: input.itens,
      desconto: arred(desconto),
      total: arred(subtotal - desconto),
      pagamento: input.pagamento,
      status: 'concluida',
    };
    const produtos = state.produtos.map((p) => {
      const item = input.itens.find((i) => i.produtoId === p.id);
      return item ? { ...p, estoque: p.estoque - item.qtd } : p;
    });
    set({ ...state, produtos, vendas: [...state.vendas, venda] });
    return venda;
  },

  /** RF09: cancela e devolve os itens ao estoque. */
  cancelarVenda(id: string) {
    const venda = state.vendas.find((v) => v.id === id);
    if (!venda || venda.status === 'cancelada') return;
    const produtos = state.produtos.map((p) => {
      const item = venda.itens.find((i) => i.produtoId === p.id);
      return item ? { ...p, estoque: p.estoque + item.qtd } : p;
    });
    set({ ...state, produtos, vendas: state.vendas.map((v) => (v.id === id ? { ...v, status: 'cancelada' } : v)) });
  },

  resetar() {
    set(criarSeed());
  },
};
