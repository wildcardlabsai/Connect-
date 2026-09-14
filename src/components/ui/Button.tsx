import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

type Variant = 'accent' | 'solid' | 'outline' | 'link';
type Size = 'sm' | 'md' | 'lg';

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  /** Adds a small arrow that shifts on hover. */
  arrow?: boolean;
  fullWidth?: boolean;
  className?: string;
};

type ButtonAsLink = CommonProps & { to: string; href?: never } & Omit<
    ComponentPropsWithoutRef<'a'>,
    'href' | 'className' | 'children'
  >;

type ButtonAsAnchor = CommonProps & { href: string; to?: never } & Omit<
    ComponentPropsWithoutRef<'a'>,
    'href' | 'className' | 'children'
  >;

type ButtonAsButton = CommonProps & { to?: never; href?: never } & Omit<
    ComponentPropsWithoutRef<'button'>,
    'className' | 'children'
  >;

type ButtonProps = ButtonAsLink | ButtonAsAnchor | ButtonAsButton;

function Arrow() {
  return (
    <svg
      className="btn__arrow"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1 7.5h12M8 2.5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * The single button primitive for the site. Renders an <a>, a router <Link>
 * or a <button> depending on the props, so every call site gets the same
 * geometry, focus ring and hover behaviour.
 */
export function Button({
  children,
  variant = 'solid',
  size = 'md',
  arrow = false,
  fullWidth = false,
  className,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="btn__label">{children}</span>
      {arrow ? <Arrow /> : null}
    </>
  );

  if ('to' in rest && rest.to) {
    const { to, ...anchorRest } = rest as ButtonAsLink;
    return (
      <Link to={to} className={classes} {...anchorRest}>
        {content}
      </Link>
    );
  }

  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest as ButtonAsAnchor;
    return (
      <a href={href} className={classes} {...anchorRest}>
        {content}
      </a>
    );
  }

  const { type = 'button', ...buttonRest } = rest as ButtonAsButton;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {content}
    </button>
  );
}
