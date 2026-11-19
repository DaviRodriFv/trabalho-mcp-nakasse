import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

type Tipo = 'success' | 'error';
interface Toast {
  id: number;
  tipo: Tipo;
  msg: string;
}

const Ctx = createContext<(tipo: Tipo, msg: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fechar = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));
  const push = useCallback((tipo: Tipo, msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, tipo, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="flex min-w-[300px] max-w-sm items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-3 shadow-lg">
            {t.tipo === 'success' ? <CheckCircle2 size={20} className="shrink-0 text-success" /> : <AlertCircle size={20} className="shrink-0 text-danger" />}
            <span className="flex-1 text-body">{t.msg}</span>
            <button onClick={() => fechar(t.id)} aria-label="Fechar aviso" className="text-neutral-500 hover:text-neutral-900">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
