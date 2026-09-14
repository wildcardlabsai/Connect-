import { Link } from 'react-router-dom';
import { JOIN_PATH } from '../../data/nav';
import './LaunchBar.css';

/**
 * Slim announcement rule at the very top of every page. It scrolls away with
 * the page; the header below it is the element that stays put.
 */
export function LaunchBar() {
  return (
    <aside className="launchbar" aria-label="Launch announcement">
      <div className="container launchbar__inner">
        <p className="launchbar__status">
          <span className="launchbar__mark" aria-hidden="true" />
          ConnectCymru is launching soon
        </p>
        <p className="launchbar__support">
          Join the founding network of Welsh businesses.
        </p>
        <Link className="launchbar__link" to={JOIN_PATH}>
          {/* The label shortens on narrow phones so the bar stays on one line.
              Only one span is ever rendered, so screen readers read one label. */}
          <span className="launchbar__label-long">Register interest</span>
          <span className="launchbar__label-short">Register</span>
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M1 7.5h12M8 2.5l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
          </svg>
        </Link>
      </div>
    </aside>
  );
}
