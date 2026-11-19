import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck, Mail } from 'lucide-react';
import { Button, Field, Input } from '../components/ui';
import { emailValido } from '../lib/format';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!emailValido(email)) return setErro('Informe um e-mail válido.');
    setEnviado(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-8">
      <div className="w-full max-w-[420px] rounded-lg border border-neutral-200 bg-neutral-0 p-8 shadow-md">
        {enviado ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50 text-success">
              <MailCheck size={24} aria-hidden />
            </span>
            <h1 className="text-h2">Verifique seu e-mail</h1>
            <p className="text-body text-neutral-500">
              Se <strong className="text-neutral-900">{email}</strong> estiver cadastrado, você receberá um link para criar uma nova senha.
            </p>
            <Link to="/login" className="text-label text-primary-600 hover:underline">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
            <div>
              <h1 className="text-h2">Recuperar senha</h1>
              <p className="mt-1 text-body text-neutral-500">Informe o e-mail da sua conta. Enviaremos um link para redefinir a senha.</p>
            </div>
            <Field label="E-mail" htmlFor="email" error={erro}>
              <Input id="email" type="email" icon={Mail} value={email} invalid={!!erro} onChange={(e) => { setEmail(e.target.value); setErro(''); }} autoFocus />
            </Field>
            <Button type="submit" size="lg" className="w-full">
              Enviar link
            </Button>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 text-label text-neutral-500 hover:text-neutral-900">
              <ArrowLeft size={16} /> Voltar para o login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
