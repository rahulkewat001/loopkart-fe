import { useEffect, useRef, useState } from 'react';

export default function RevealOnScroll({
  as: Component = 'div',
  className = '',
  delay = 0,
  threshold = 0.2,
  children,
  ...props
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;

        setVisible((current) => {
          if (current) {
            return entry.isIntersecting && ratio > 0.05;
          }

          return entry.isIntersecting && ratio >= threshold;
        });
      },
      { threshold: [0, 0.05, threshold, 0.35], rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Component
      ref={ref}
      className={`reveal-on-scroll ${visible ? 'reveal-on-scroll--visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...props}
    >
      {children}
    </Component>
  );
}
