import { Button } from '../components/ui/Button';
import { Eyebrow } from '../components/ui/SectionHeading';
import { footerNav } from '../data/nav';
import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';
import './NotFound.css';

export default function NotFound() {
  useSeo({
    title: 'Page not found | ConnectCymru',
    description: 'The page you were looking for is not here.',
    path: '/404',
  });

  return (
    <section className="section section--lg notfound">
      <div className="container">
        <Eyebrow>Error 404</Eyebrow>
        <h1 className="notfound__title">This page is not here.</h1>
        <p className="notfound__body">
          The link may be out of date, or the page may have moved while the site is being
          built. Everything on ConnectCymru is listed below.
        </p>

        <div className="btn-row notfound__actions">
          <Button to="/" variant="solid" arrow>
            Back to the home page
          </Button>
        </div>

        <nav className="notfound__nav" aria-label="All pages">
          <ul>
            {footerNav.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
