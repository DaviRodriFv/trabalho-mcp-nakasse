const brlFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const brl = (n: number) => brlFmt.format(n);

export const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export const dataCurta = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
export const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export function maskCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskTel(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  const p = d.replace(/(\d{2})(\d)/, '($1) $2');
  return d.length <= 10 ? p.replace(/(\d{4})(\d)/, '$1-$2') : p.replace(/(\d{5})(\d)/, '$1-$2');
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export type StatusEstoque = 'ok' | 'baixo' | 'sem';
export const statusEstoque = (p: { estoque: number; estoqueMin: number }): StatusEstoque =>
  p.estoque <= 0 ? 'sem' : p.estoque <= p.estoqueMin ? 'baixo' : 'ok';

/** Lê o valor atual de um token (usado por bibliotecas que não aceitam var(), como o Recharts). */
export const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
