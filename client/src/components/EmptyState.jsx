import { Link } from 'react-router-dom';
import { Heart, SearchX, ArrowRight } from 'lucide-react';
export default function EmptyState({ favorites = false, onReset }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{favorites ? <Heart size={28} /> : <SearchX size={28} />}</span>
      <h2>{favorites ? 'Your next idea belongs here.' : 'No matches just yet.'}</h2>
      <p>
        {favorites
          ? 'Tap the heart on a template you love. We’ll keep it here, ready when inspiration strikes.'
          : 'Try a different search or category. Your next starting point is out there.'}
      </p>
      {favorites ? (
        <Link className="button button-dark" to="/templates">
          Find your first favorite <ArrowRight size={17} />
        </Link>
      ) : (
        <button className="button button-dark" onClick={onReset}>
          Clear filters <ArrowRight size={17} />
        </button>
      )}
    </div>
  );
}
