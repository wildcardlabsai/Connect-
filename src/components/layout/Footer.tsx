import { Link } from 'react-router-dom';
import { Logo } from '../brand/Logo';
import { footerNav } from '../../data/nav';
import { SITE_TAGLINE } from '../../lib/seo';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer is-inverted">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo" aria-label="ConnectCymru, home">
            <Logo size="lg" />
          </Link>
          <p className="footer__tagline">{SITE_TAGLINE}</p>
        </div>

        <nav className="footer__nav" aria-label="Footer">
          <h2 className="footer__nav-title">Pages</h2>
          <ul className="footer__list">
            {footerNav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="footer__link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="container footer__base">
        <p className="footer__copyright">&copy; 2026 ConnectCymru</p>
        <nav className="footer__legal" aria-label="Legal">
          <Link to="/terms" className="footer__link">
            Terms of use
          </Link>
          <Link to="/privacy" className="footer__link">
            Privacy policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
