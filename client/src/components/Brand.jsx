import { Link } from 'react-router-dom';
export default function Brand({ inverse = false }) {
  return (
    <Link
      className={`brand ${inverse ? 'brand-inverse' : ''}`}
      to="/templates"
      aria-label="Mini SaaS Template Store home"
    >
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="brand-name">
        <span>Mini SaaS</span>{' '}
        <span>Template Store</span>
      </span>
    </Link>
  );
}
