import { useState } from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',  // primary | secondary | ghost | danger
  size = 'md',          // sm | md | lg
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}) => {
  const [ripples, setRipples] = useState([]);

  const handleRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  };

  const handleClick = (e) => {
    if (disabled || loading) return;
    handleRipple(e);
    onClick?.(e);
  };

  return (
    <button
      type={type}
      className={[
        'btn',
        `btn--${variant}`,
        `btn--${size}`,
        fullWidth  ? 'btn--full'     : '',
        loading    ? 'btn--loading'  : '',
        disabled   ? 'btn--disabled' : '',
      ].join(' ')}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple effect */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="btn__ripple"
          style={{ left: r.x, top: r.y }}
        />
      ))}

      {/* Spinner when loading */}
      {loading && <span className="btn__spinner" />}

      {/* Icon left */}
      {!loading && icon && iconPosition === 'left' && (
        <span className="btn__icon">{icon}</span>
      )}

      {/* Label */}
      <span className="btn__label">{children}</span>

      {/* Icon right */}
      {!loading && icon && iconPosition === 'right' && (
        <span className="btn__icon">{icon}</span>
      )}
    </button>
  );
};

export default Button;