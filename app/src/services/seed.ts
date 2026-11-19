import type { Cliente, DB, Pagamento, Produto, Usuario, Venda } from '../types';

/** Gerador pseudoaleatório com semente: os dados de demonstração saem sempre iguais. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const P = (id: string, sku: string, nome: string, categoria: string, custo: number, preco: number, estoque: number, estoqueMin: number): Produto =>
  ({ id, sku, nome, categoria, custo, preco, estoque, estoqueMin });

const produtos: Produto[] = [
  P('p01', 'ARZ-005', 'Arroz Tipo 1 5kg', 'Mercearia', 21.5, 27.9, 34, 10),
  P('p02', 'FEI-001', 'Feijão Carioca 1kg', 'Mercearia', 6.2, 8.99, 41, 15),
  P('p03', 'CAF-500', 'Café Torrado 500g', 'Mercearia', 13.1, 18.49, 4, 12),
  P('p04', 'ACU-001', 'Açúcar Refinado 1kg', 'Mercearia', 3.4, 4.79, 52, 15),
  P('p05', 'OLE-900', 'Óleo de Soja 900ml', 'Mercearia', 5.3, 7.49, 28, 12),
  P('p06', 'MAC-500', 'Macarrão Espaguete 500g', 'Mercearia', 2.9, 4.29, 60, 20),
  P('p07', 'LEI-001', 'Leite Integral 1L', 'Bebidas', 3.8, 5.29, 9, 24),
  P('p08', 'REF-2L', 'Refrigerante Cola 2L', 'Bebidas', 6.5, 9.99, 36, 12),
  P('p09', 'AGU-500', 'Água Mineral 500ml', 'Bebidas', 0.9, 2.49, 120, 30),
  P('p10', 'SUC-1L', 'Suco de Uva 1L', 'Bebidas', 7.2, 11.9, 15, 6),
  P('p11', 'CER-350', 'Cerveja Lata 350ml', 'Bebidas', 2.6, 4.49, 96, 48),
  P('p12', 'DET-500', 'Detergente 500ml', 'Limpeza', 1.6, 2.79, 0, 18),
  P('p13', 'SBP-1KG', 'Sabão em Pó 1kg', 'Limpeza', 8.9, 13.49, 22, 8),
  P('p14', 'AGS-1L', 'Água Sanitária 1L', 'Limpeza', 2.1, 3.99, 5, 10),
  P('p15', 'ESP-003', 'Esponja Multiuso c/3', 'Limpeza', 2.2, 4.19, 31, 10),
  P('p16', 'PAP-4R', 'Papel Higiênico 4 rolos', 'Higiene', 4.8, 7.99, 3, 15),
  P('p17', 'SAB-90', 'Sabonete 90g', 'Higiene', 1.3, 2.59, 70, 20),
  P('p18', 'CRE-90', 'Creme Dental 90g', 'Higiene', 2.7, 4.99, 44, 15),
  P('p19', 'SHA-350', 'Shampoo 350ml', 'Higiene', 8.4, 14.9, 12, 6),
  P('p20', 'BAN-KG', 'Banana Prata (kg)', 'Hortifruti', 3.1, 5.99, 0, 10),
  P('p21', 'TOM-KG', 'Tomate (kg)', 'Hortifruti', 4.2, 7.49, 18, 8),
  P('p22', 'BAT-KG', 'Batata (kg)', 'Hortifruti', 2.8, 4.99, 25, 10),
  P('p23', 'PAO-UN', 'Pão Francês (un)', 'Padaria', 0.35, 0.89, 6, 50),
  P('p24', 'BOL-FUB', 'Bolo de Fubá', 'Padaria', 9, 16.9, 7, 3),
];

const usuarios: Usuario[] = [
  { id: 'u1', nome: 'Ana Souza', email: 'ana@bompreco.com', senha: 'admin123', perfil: 'admin', ativo: true },
  { id: 'u2', nome: 'Carlos Lima', email: 'carlos@bompreco.com', senha: 'gerente123', perfil: 'gerente', ativo: true },
  { id: 'u3', nome: 'Júlia Rocha', email: 'julia@bompreco.com', senha: 'vendedor123', perfil: 'vendedor', ativo: true },
  { id: 'u4', nome: 'Pedro Alves', email: 'pedro@bompreco.com', senha: 'vendedor123', perfil: 'vendedor', ativo: false },
];

const nomesClientes: [string, string, string][] = [
  ['Mariana Costa', '123.456.789-01', '(11) 98765-4321'],
  ['João Pereira', '234.567.890-12', '(11) 97654-3210'],
  ['Fernanda Oliveira', '345.678.901-23', '(11) 96543-2109'],
  ['Ricardo Santos', '456.789.012-34', '(11) 3265-4321'],
  ['Beatriz Almeida', '567.890.123-45', '(11) 95432-1098'],
  ['Lucas Ferreira', '678.901.234-56', '(11) 94321-0987'],
  ['Camila Ribeiro', '789.012.345-67', '(11) 93210-9876'],
  ['Antônio Carvalho', '890.123.456-78', '(11) 3123-8765'],
  ['Patrícia Gomes', '901.234.567-89', '(11) 92109-8765'],
  ['Rafael Martins', '012.345.678-90', '(11) 91098-7654'],
];

const semAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

export function criarSeed(): DB {
  const r = rng(42);
  const agora = new Date();

  const clientes: Cliente[] = nomesClientes.map(([nome, cpf, telefone], i) => ({
    id: `c${i + 1}`,
    nome,
    cpf,
    telefone,
    email: `${semAcento(nome.split(' ')[0]).toLowerCase()}.${semAcento(nome.split(' ')[1]).toLowerCase()}@email.com`,
    criadoEm: new Date(agora.getTime() - (60 + i * 9) * 864e5).toISOString(),
  }));

  const pagamentos: Pagamento[] = ['pix', 'pix', 'debito', 'credito', 'dinheiro'];
  const vendas: Omit<Venda, 'numero'>[] = [];

  for (let d = 29; d >= 0; d--) {
    const dia = new Date(agora);
    dia.setDate(dia.getDate() - d);
    const qtdVendas = 6 + Math.floor(r() * 9);
    for (let n = 0; n < qtdVendas; n++) {
      const data = new Date(dia);
      data.setHours(8 + Math.floor(r() * 12), Math.floor(r() * 60), 0, 0);
      if (data > agora) continue;

      const itens = new Map<string, { produtoId: string; nome: string; qtd: number; precoUnit: number }>();
      const nItens = 1 + Math.floor(r() * 4);
      for (let k = 0; k < nItens; k++) {
        const p = produtos[Math.floor(Math.pow(r(), 1.4) * produtos.length)];
        const qtd = p.id === 'p23' ? 4 + Math.floor(r() * 8) : 1 + Math.floor(r() * 3);
        const atual = itens.get(p.id);
        itens.set(p.id, { produtoId: p.id, nome: p.nome, qtd: (atual?.qtd ?? 0) + qtd, precoUnit: p.preco });
      }
      const lista = [...itens.values()];
      const subtotal = lista.reduce((s, i) => s + i.qtd * i.precoUnit, 0);
      const desconto = r() < 0.1 ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
      const usuarioId = d > 12 && r() < 0.3 ? 'u4' : r() < 0.7 ? 'u3' : 'u2';

      vendas.push({
        id: `v${vendas.length + 1}`,
        data: data.toISOString(),
        usuarioId,
        clienteId: r() < 0.45 ? `c${1 + Math.floor(r() * clientes.length)}` : null,
        itens: lista,
        desconto,
        total: Math.round((subtotal - desconto) * 100) / 100,
        pagamento: pagamentos[Math.floor(r() * pagamentos.length)],
        status: d > 0 && r() < 0.03 ? 'cancelada' : 'concluida',
      });
    }
  }

  vendas.sort((a, b) => a.data.localeCompare(b.data));

  return {
    loja: 'Mercadinho Bom Preço',
    categorias: ['Mercearia', 'Bebidas', 'Limpeza', 'Higiene', 'Hortifruti', 'Padaria'],
    usuarios,
    produtos: produtos.map((p) => ({ ...p })),
    clientes,
    vendas: vendas.map((v, i) => ({ ...v, numero: 1001 + i })),
  };
}
