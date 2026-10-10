import { Link } from 'react-router-dom';
export default function Brand({ inverse = false }) {
  return (
    <Link
      className={`brand ${inverse ? 'brand-inverse' : ''}`}
      to="/templates"
      aria-label="Forma home"
    >
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>
        forma<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
