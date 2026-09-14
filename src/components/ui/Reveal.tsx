import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useInView } from '../../lib/useInView';
import './Reveal.css';

type RevealProps = {
  children: ReactNode;
  /** Element to render. Keeps the markup semantic at each call site. */
  as?: ElementType;
  /** Stagger position within a group. Each step adds 70ms. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
};

/**
 * Fades and lifts content into place the first time it enters the viewport.
 * Movement is small (14px) and happens once. Users who ask for reduced motion
 * get the content immediately with no transition.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className,
  style,
  id,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <Tag
      ref={ref}
      id={id}
      className={['reveal', inView ? 'is-shown' : '', className].filter(Boolean).join(' ')}
      style={{ '--reveal-delay': `${delay * 70}ms`, ...style } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
