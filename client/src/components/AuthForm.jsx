import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  LoaderCircle,
  Heart,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/authState';
import { errorMessage, assetUrl } from '../services/api';
import { addFavorite } from '../services/favoriteService';
import usePageTitle from '../hooks/usePageTitle';
import Brand from './Brand';

export default function AuthForm({ mode }) {
  const registering = mode === 'register';
  usePageTitle(registering ? 'Create an account' : 'Welcome back');
  const { user, authLoading, authenticate, notify, loadFavorites } = useAuth();
  const [fields, setFields] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const from =
    location.state?.from?.startsWith('/') && !location.state.from.startsWith('//')
      ? location.state.from
      : '/templates';

  function change(event) {
    const { name, value } = event.target;
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setServerError('');
  }

  async function submit(event) {
    event.preventDefault();
    const next = {};
    if (registering && (fields.name.trim().length < 2 || fields.name.trim().length > 100))
      next.name = 'Enter your name (2–100 characters).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
      next.email = 'Enter a valid email address.';
    if (
      !fields.password ||
      (registering &&
        (fields.password.length < 8 || new TextEncoder().encode(fields.password).length > 72))
    )
      next.password = registering
        ? 'Use at least 8 characters, up to 72 bytes.'
        : 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    setServerError('');
    try {
      await authenticate(
        mode,
        registering
          ? { ...fields, name: fields.name.trim(), email: fields.email.trim() }
          : { email: fields.email.trim(), password: fields.password },
      );
      if (location.state?.pendingTemplate) {
        try {
          await addFavorite(location.state.pendingTemplate);
          await loadFavorites();
          notify('Your template is saved. Make yourself at home.');
        } catch (error) {
          notify(errorMessage(error), 'error');
        }
      } else
        notify(
          registering
            ? 'You’re in. Let’s find your next idea.'
            : 'Welcome back. Your favorites are waiting.',
        );
      navigate(from, { replace: true });
    } catch (error) {
      setServerError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading)
    return (
      <main id="main-content" className="page-loading" role="status">
        <LoaderCircle className="spin" /> Restoring your session…
      </main>
    );
  if (user && !submitting) return <Navigate to={from} replace />;
  return (
    <main className="auth-layout">
      <aside className="auth-story">
        <Brand inverse />
        <div className="auth-story-main">
          <span className="eyebrow light">
            <Sparkles size={15} /> GOOD IDEAS START SOMEWHERE
          </span>
          <h1>
            A little inspiration.
            <br />
            <em>A lot of possibility.</em>
          </h1>
          <p>
            Discover considered designs. Collect your favorites. Find a starting point that feels
            like you.
          </p>
          <div className="auth-preview">
            <img
              src={assetUrl('/previews/portfolio.svg')}
              alt="Creator Portfolio template preview"
            />
            <span>
              <Heart size={17} fill="currentColor" /> A collection, uniquely yours.
            </span>
          </div>
        </div>
        <p className="auth-story-foot">Thoughtful templates. Fresh perspectives.</p>
      </aside>
      <section className="auth-panel">
        <Link className="back-link" to="/templates">
          <ArrowLeft size={16} /> Back to templates
        </Link>
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <Brand />
          </div>
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h2>{registering ? 'Make yourself at home.' : 'Good to see you again.'}</h2>
          <p className="form-intro">
            {registering
              ? 'Create an account and start a collection of possibilities.'
              : 'Log in to pick up where your inspiration left off.'}
          </p>
          {serverError && (
            <div className="form-error" role="alert">
              {serverError}
            </div>
          )}
          <form onSubmit={submit} noValidate>
            {registering && (
              <div className="form-field">
                <label htmlFor="name">Your name</label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  value={fields.name}
                  onChange={change}
                  maxLength={100}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="field-error">
                    {errors.name}
                  </p>
                )}
              </div>
            )}
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={fields.email}
                onChange={change}
                maxLength={254}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="field-error">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="password-input">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={registering ? 'new-password' : 'current-password'}
                  placeholder={registering ? 'Create a password' : 'Enter your password'}
                  value={fields.password}
                  onChange={change}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? 'password-error' : registering ? 'password-hint' : undefined
                  }
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password ? (
                <p className="field-error" id="password-error">
                  {errors.password}
                </p>
              ) : (
                registering && (
                  <p className="field-hint" id="password-hint">
                    At least 8 characters. A little longer is even better.
                  </p>
                )
              )}
            </div>
            <button className="button button-dark form-submit" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <LoaderCircle className="spin" size={18} />{' '}
                  {registering ? 'Creating your account…' : 'Logging you in…'}
                </>
              ) : (
                <>
                  {registering ? 'Create my account' : 'Log in'} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          <p className="auth-switch">
            {registering ? 'Already part of Forma?' : 'New around here?'}{' '}
            <Link to={registering ? '/login' : '/register'} state={location.state}>
              {registering ? 'Log in' : 'Create an account'}
            </Link>
          </p>
          <div className="auth-perks">
            <span>
              <Check size={14} /> Save your favorites
            </span>
            <span>
              <Check size={14} /> Find fresh inspiration
            </span>
          </div>
        </div>
        <p className="auth-panel-foot">A thoughtful start for your next idea.</p>
      </section>
    </main>
  );
}
