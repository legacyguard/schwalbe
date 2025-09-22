import React from 'react';

type Intrinsic = keyof JSX.IntrinsicElements;

type FadeInProps<T extends Intrinsic = 'div'> = {
  as?: T;
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
} & Omit<React.ComponentPropsWithoutRef<T>, 'children' | 'className'>;

export function FadeIn<T extends Intrinsic = 'div'>(props: FadeInProps<T>) {
  const { as, children, className, duration = 0.4, delay = 0, ...rest } = props;
  const Component = (as ?? 'div') as Intrinsic;
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const style: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(8px)',
    transition: `opacity ${duration}s ease, transform ${duration}s ease`,
    transitionDelay: delay ? `${delay}s` : undefined
  };

  return (
    <Component
      {...(rest as Record<string, unknown>)}
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
}
