export type Perfil = 'admin' | 'gerente' | 'vendedor';
export type Pagamento = 'dinheiro' | 'pix' | 'debito' | 'credito';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string; // protótipo: texto puro em localStorage. No produto final: hash no servidor.
  perfil: Perfil;
  ativo: boolean;
}

export interface Produto {
  id: string;
  sku: string;
  nome: string;
  categoria: string;
  custo: number;
  preco: number;
  estoque: number;
  estoqueMin: number;
}

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  criadoEm: string;
}

export interface ItemVenda {
  produtoId: string;
  nome: string;
  qtd: number;
  precoUnit: number;
}

export interface Venda {
  id: string;
  numero: number;
  data: string;
  usuarioId: string;
  clienteId: string | null;
  itens: ItemVenda[];
  desconto: number;
  total: number;
  pagamento: Pagamento;
  status: 'concluida' | 'cancelada';
}

export interface DB {
  loja: string;
  categorias: string[];
  usuarios: Usuario[];
  produtos: Produto[];
  clientes: Cliente[];
  vendas: Venda[];
}

export const PERFIL_LABEL: Record<Perfil, string> = { admin: 'Admin', gerente: 'Gerente', vendedor: 'Vendedor' };
export const PAGAMENTO_LABEL: Record<Pagamento, string> = { dinheiro: 'Dinheiro', pix: 'Pix', debito: 'Débito', credito: 'Crédito' };
