import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Brand from './Brand';
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <Brand />
          <p>A thoughtful start for your next idea.</p>
        </div>
        <div className="footer-links">
          <Link to="/templates">
            Explore templates <ArrowUpRight size={14} />
          </Link>
          <Link to="/favorites">
            Your collection <ArrowUpRight size={14} />
          </Link>
        </div>
        <p className="footer-note">Made for the things you’ll make.</p>
      </div>
    </footer>
  );
}
