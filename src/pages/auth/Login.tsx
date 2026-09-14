import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PageHero } from '../../components/layout/PageHero';
import { RequireSupabase } from '../../lib/guards';
import { useAuth } from '../../lib/auth';
import { TextField } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { useSeo } from '../../lib/seo';
import './auth.css';
import '../../components/forms/form.css';

function LoginForm() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from || '/app';

  if (!loading && user) return <Navigate to={from} replace />;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      setFormError(error);
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <form className="form auth-card" onSubmit={handleSubmit} noValidate>
      <h2 className="auth-card__title">Sign in</h2>

      <TextField
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={setEmail}
        required
        autoComplete="email"
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        autoComplete="current-password"
      />

      {formError ? (
        <p className="form__alert" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="form__foot">
        <Button type="submit" variant="accent" size="lg" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </Button>
        <p className="form__privacy">
          New to ConnectCymru? <Link to="/signup">Create an account</Link>.
        </p>
      </div>
    </form>
  );
}

export default function Login() {
  useSeo({
    title: 'Sign In | ConnectCymru',
    description: 'Sign in to your ConnectCymru business account.',
    path: '/login',
  });

  return (
    <>
      <PageHero eyebrow="Welcome back" title="Sign in to your account." />
      <section className="section container container--narrow">
        <RequireSupabase>
          <LoginForm />
        </RequireSupabase>
      </section>
    </>
  );
}
