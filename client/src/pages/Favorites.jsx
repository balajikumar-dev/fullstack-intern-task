import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/authState';
import TemplateCard from '../components/TemplateCard';
import EmptyState from '../components/EmptyState';
import LoadingCards from '../components/LoadingCards';
import usePageTitle from '../hooks/usePageTitle';
export default function Favorites() {
  usePageTitle('My favorites');
  const { user, favorites, favoritesLoading, favoritesError, loadFavorites } = useAuth();
  return (
    <main id="main-content" className="shell favorites-page">
      <div className="favorites-heading">
        <div>
          <span className="eyebrow">
            <Heart size={15} /> YOUR PERSONAL COLLECTION
          </span>
          <h1>
            The ones you love<span className="accent-period">.</span>
          </h1>
          <p>{user?.name?.split(' ')[0]}, here’s a little inspiration for whatever comes next.</p>
        </div>
        <Link className="button button-outline" to="/templates">
          Keep exploring <ArrowUpRight size={17} />
        </Link>
      </div>
      {favoritesLoading ? (
        <LoadingCards />
      ) : favoritesError ? (
        <div className="error-state" role="alert">
          <h2>We couldn’t load your collection.</h2>
          <p>{favoritesError}</p>
          <button className="button button-dark" onClick={loadFavorites}>
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      ) : favorites.length ? (
        <>
          <div className="saved-count">
            {favorites.length} {favorites.length === 1 ? 'template' : 'templates'} saved{' '}
            <span>Good taste, by the way.</span>
          </div>
          <div className="template-grid">
            {favorites.map((item) => (
              <TemplateCard key={item.id || item._id} template={item} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState favorites />
      )}
    </main>
  );
}
