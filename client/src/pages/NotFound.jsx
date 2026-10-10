import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <main className="shell empty-state" id="main-content">
      <span className="eyebrow">404 / A LITTLE OFF THE PATH</span>
      <h1>Let’s find a better starting point.</h1>
      <p>The page you’re looking for isn’t here, but your next idea might be.</p>
      <Link className="button button-dark" to="/templates">
        Back to templates
      </Link>
    </main>
  );
}
