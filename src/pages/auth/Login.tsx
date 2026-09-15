import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PageHero } from '../../components/layout/PageHero';
import { RequirePlatform } from '../../lib/guards';
import { useAuth } from '../../lib/auth';
import { claudeListBusinesses } from '../../lib/claudeDb';
import type { Profile } from '../../lib/database.types';
import { TextField } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { useSeo } from '../../lib/seo';
import './auth.css';
import '../../components/forms/form.css';

function PasswordLoginForm() {
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

/**
 * The claude-db equivalent of signing in: there is no password to check
 * (see auth.tsx / claudeDb.ts), so this is a plain list of the businesses
 * that already exist in this database, and picking one just switches which
 * one you are acting as. Says so, rather than dressing it up as real auth.
 */
function BusinessPicker() {
  const { user, loading, switchBusiness } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [businesses, setBusinesses] = useState<Profile[] | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from || '/app';

  useEffect(() => {
    claudeListBusinesses()
      .then(setBusinesses)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load businesses.'));
  }, []);

  if (!loading && user) return <Navigate to={from} replace />;

  async function handlePick(id: string) {
    setSwitching(id);
    const { error: switchError } = await switchBusiness(id);
    setSwitching(null);
    if (switchError) {
      setError(switchError);
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <div className="auth-card">
      <h2 className="auth-card__title">Choose a business</h2>
      <p className="auth-card__body" style={{ marginBottom: '1.5rem' }}>
        This demo has no password to check, so signing in just means picking which business
        you are acting as. Anyone with this link can see and change any business&rsquo;s data
        &mdash; see <Link to="/">the home page</Link> for what that does and doesn&rsquo;t mean.
      </p>

      {error ? (
        <p className="form__alert" role="alert" style={{ marginBottom: '1.5rem' }}>
          {error}
        </p>
      ) : null}

      {businesses === null ? (
        <p className="lead">Loading&hellip;</p>
      ) : businesses.length === 0 ? (
        <p className="lead">No businesses yet.</p>
      ) : (
        <ul className="app-list" style={{ marginBottom: '1.5rem' }}>
          {businesses.map((business) => (
            <li key={business.id} className="app-row">
              <div className="app-row__main">
                <p className="app-row__title">{business.company_name}</p>
                <p className="app-row__meta">
                  <span>{business.contact_name}</span>
                  {business.location ? <span>{business.location}</span> : null}
                </p>
              </div>
              <div className="app-row__actions">
                <Button variant="outline" size="sm" onClick={() => handlePick(business.id)} disabled={switching === business.id}>
                  {switching === business.id ? 'Switching...' : 'Act as this business'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="form__privacy">
        Setting one up for the first time? <Link to="/signup">Create a business</Link>.
      </p>
    </div>
  );
}

function LoginForm() {
  const { mode } = useAuth();
  return mode === 'claude-db' ? <BusinessPicker /> : <PasswordLoginForm />;
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
        <RequirePlatform>
          <LoginForm />
        </RequirePlatform>
      </section>
    </>
  );
}
