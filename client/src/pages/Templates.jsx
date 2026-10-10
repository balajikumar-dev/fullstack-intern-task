import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUpRight,
  Search,
  X,
  Sparkles,
  LayoutGrid,
  Heart,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { getTemplates } from '../services/templateService';
import { assetUrl, errorMessage } from '../services/api';
import TemplateCard from '../components/TemplateCard';
import LoadingCards from '../components/LoadingCards';
import EmptyState from '../components/EmptyState';
import usePageTitle from '../hooks/usePageTitle';

export default function Templates() {
  usePageTitle('Thoughtful templates. Fresh possibilities.');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [sort, setSort] = useState('curated');
  const [params, setParams] = useSearchParams();
  const search = params.get('q') || '';
  const category = params.get('category') || 'All templates';

  useEffect(() => {
    const controller = new AbortController();
    getTemplates(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setTemplates(result);
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(errorMessage(failure));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [retry]);

  const categories = ['All templates', ...new Set(templates.map((item) => item.category))];
  const visible = useMemo(() => {
    const matches = templates.filter(
      (item) =>
        (category === 'All templates' || item.category === category) &&
        `${item.name} ${item.description} ${item.category}`
          .toLowerCase()
          .includes(search.toLowerCase().trim()),
    );
    return sort === 'name' ? matches.sort((a, b) => a.name.localeCompare(b.name)) : matches;
  }, [templates, category, search, sort]);
  const featured = templates.find((item) => item.name.startsWith('LaunchPad'));
  function retryLoading() {
    setLoading(true);
    setError('');
    setRetry((current) => current + 1);
  }
  function filter(key, value) {
    const next = new URLSearchParams(params);
    if (!value || value === 'All templates') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  return (
    <main id="main-content">
      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="live-dot" /> A GOOD PLACE TO START
          </span>
          <h1>
            Less setup.
            <br />
            More <em>possibility.</em>
          </h1>
          <p className="hero-description">
            Thoughtful templates for your next big thing.
            <br className="desktop-break" /> Find a starting point you love, and make it your own.
          </p>
          <a className="button button-dark hero-cta" href="#collection">
            Explore the collection <ArrowDown size={17} />
          </a>
          <div className="hero-notes">
            <span>
              <Sparkles size={15} /> Curated with care
            </span>
            <span>
              <LayoutGrid size={15} /> Made to inspire
            </span>
          </div>
        </div>
        <div className="hero-visual" aria-label="Featured template collection">
          <span className="hero-spark" aria-hidden="true">
            ✳
          </span>
          <div className="floating-label">
            <span className="label-dot" /> YOUR NEXT IDEA STARTS HERE
          </div>
          <div className="hero-back-card" />
          <Link
            to={featured ? `/templates/${featured.id || featured._id}` : '#collection'}
            className="hero-preview-card"
            tabIndex={featured ? 0 : -1}
          >
            <div className="preview-browser">
              <div className="browser-dots">
                <i />
                <i />
                <i />
              </div>
              <span>your-next-big-thing.com</span>
              <ArrowUpRight size={12} />
            </div>
            <img
              src={assetUrl('/previews/launchpad.svg')}
              alt="LaunchPad landing page with a product workspace preview"
              width="800"
              height="520"
              fetchPriority="high"
            />
            <div className="hero-preview-caption">
              <div>
                <small>THE FEATURED FIND</small>
                <strong>LaunchPad</strong>
              </div>
              <span className="round-arrow">
                <ArrowUpRight size={20} />
              </span>
            </div>
          </Link>
          <div className="hero-save-note">
            <span>
              <Heart size={17} fill="currentColor" />
            </span>
            <div>
              Find it. Love it.
              <br />
              <strong>Keep it close.</strong>
            </div>
          </div>
        </div>
      </section>
      <div className="value-strip">
        <div className="shell">
          <span>FOR THE IDEAS WORTH MAKING</span>
          <span>Landing pages</span>
          <span className="strip-star">✳</span>
          <span>Dashboards</span>
          <span className="strip-star">✳</span>
          <span>Portfolios</span>
          <span className="strip-star">✳</span>
          <span>And what’s next.</span>
        </div>
      </div>
      <section className="catalog shell" id="collection">
        <div className="section-top">
          <div>
            <span className="eyebrow">THE COLLECTION</span>
            <h2>
              Find your next starting point<span className="accent-period">.</span>
            </h2>
          </div>
          <span className="collection-count">
            {loading
              ? 'A little inspiration is on its way…'
              : `${templates.length} thoughtful templates. Endless possibilities.`}
          </span>
        </div>
        <div className="catalog-toolbar">
          <div className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search templates"
              placeholder="A dashboard? A portfolio? Find your idea…"
              value={search}
              onChange={(event) => filter('q', event.target.value)}
            />
            {search && (
              <button
                className="icon-button"
                onClick={() => filter('q', '')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <label className="sort-control">
            <SlidersHorizontal size={15} />
            <span className="sr-only">Sort templates</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="curated">Curated order</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
        </div>
        <div className="filter-row">
          <div className="category-filters" aria-label="Filter by category">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? 'active' : ''}
                aria-pressed={category === item}
                onClick={() => filter('category', item)}
              >
                {item === 'All templates' && <LayoutGrid size={14} />}
                {item}
              </button>
            ))}
          </div>
          {!loading && (
            <span className="result-count" aria-live="polite">
              {visible.length} {visible.length === 1 ? 'template' : 'templates'}
            </span>
          )}
        </div>
        {loading ? (
          <LoadingCards />
        ) : error ? (
          <div className="error-state" role="alert">
            <h3>A small pause in the inspiration.</h3>
            <p>{error}</p>
            <button className="button button-dark" onClick={retryLoading}>
              <RefreshCw size={16} /> Try again
            </button>
          </div>
        ) : visible.length ? (
          <div className="template-grid">
            {visible.map((template) => (
              <TemplateCard key={template.id || template._id} template={template} />
            ))}
          </div>
        ) : (
          <EmptyState onReset={() => setParams({})} />
        )}
        {!loading && !error && (
          <div className="collection-end">
            <span />
            <Sparkles size={17} />
            <p>Small beginnings. Great things ahead.</p>
            <span />
          </div>
        )}
      </section>
      <section className="collection-cta shell">
        <div className="cta-art" aria-hidden="true">
          <Heart size={42} strokeWidth={1.5} />
          <i />
          <i />
        </div>
        <div>
          <span className="eyebrow">KEEP THE GOOD ONES</span>
          <h2>A place for your possibilities.</h2>
          <p>Save the templates that catch your eye. Your next project will thank you.</p>
        </div>
        <Link className="button button-dark" to="/favorites">
          Build your collection <ArrowUpRight size={17} />
        </Link>
      </section>
    </main>
  );
}
