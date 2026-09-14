import { Mark } from './Mark';
import './Logo.css';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  accented?: boolean;
  className?: string;
};

const MARK_SIZE: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 20,
  md: 24,
  lg: 32,
};

/**
 * ConnectCymru wordmark: the geometric mark plus a two-weight lockup
 * ("Connect" in medium, "Cymru" in semibold) so the Welsh half carries the
 * emphasis. Inherits colour from its context.
 */
export function Logo({ size = 'md', accented = false, className }: LogoProps) {
  return (
    <span className={['logo', `logo--${size}`, className].filter(Boolean).join(' ')}>
      <Mark size={MARK_SIZE[size]} accented={accented} className="logo__mark" />
      <span className="logo__word">
        <span className="logo__word-a">Connect</span>
        <span className="logo__word-b">Cymru</span>
      </span>
    </span>
  );
}
