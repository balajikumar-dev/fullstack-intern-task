import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Heart, LoaderCircle } from 'lucide-react';
import { assetUrl } from '../services/api';
import { useAuth } from '../context/authState';

export function FavoriteButton({ template, large = false }) {
  const { user, favorites, favoritesLoading, pending, toggleFavorite, authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const id = template.id || template._id;
  const saved = favorites.some((item) => (item.id || item._id) === id);
  const busy = pending.has(id) || authLoading || (Boolean(user) && favoritesLoading);
  function handleSave() {
    if (!user)
      navigate('/login', {
        state: { from: location.pathname + location.search, pendingTemplate: id },
      });
    else toggleFavorite(template);
  }
  return (
    <button
      className={`${large ? 'button favorite-large' : 'favorite-button'} ${saved ? 'is-saved' : ''}`}
      onClick={handleSave}
      disabled={busy}
      aria-pressed={saved}
      aria-label={`${saved ? 'Remove' : 'Save'} ${template.name}${saved ? ' from favorites' : ' to favorites'}`}
    >
      {busy ? (
        <LoaderCircle size={large ? 19 : 18} className="spin" />
      ) : (
        <Heart size={large ? 19 : 18} fill={saved ? 'currentColor' : 'none'} />
      )}
      {large && (saved ? 'Saved to favorites' : 'Save to favorites')}
    </button>
  );
}

export default function TemplateCard({ template }) {
  const id = template.id || template._id;
  return (
    <article className="template-card">
      <div className="card-image-wrap">
        <Link
          className="card-image-link"
          to={`/templates/${id}`}
          aria-label={`Preview ${template.name}`}
        >
          <img
            src={assetUrl(template.thumbnail_url)}
            alt={`${template.name} website design preview`}
            loading="lazy"
            width="800"
            height="520"
          />
          <span className="image-hover-label">
            Take a closer look <ArrowUpRight size={16} />
          </span>
        </Link>
        <FavoriteButton template={template} />
      </div>
      <div className="card-content">
        <div className="card-title-row">
          <h3>
            <Link to={`/templates/${id}`}>{template.name}</Link>
          </h3>
          <ArrowUpRight size={18} aria-hidden="true" />
        </div>
        <p>{template.description}</p>
        <div className="card-bottom">
          <span className="category-tag">{template.category}</span>
          <Link to={`/templates/${id}`}>
            View template <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
