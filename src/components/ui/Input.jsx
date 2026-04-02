import { useState } from 'react';
import './Input.css';

const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hint,
  icon,          // left icon (React node)
  rightElement,  // right side element (button etc.)
  disabled = false,
  required = false,
  autoComplete,
  maxLength,
  ...props
}) => {
  const [focused, setFocused]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const isPassword = type === 'password';
  const inputType  = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div className={`input-wrap ${error ? 'input-wrap--error' : ''} ${disabled ? 'input-wrap--disabled' : ''}`}>

      {/* Label */}
      {label && (
        <label className="input-label" htmlFor={name}>
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      {/* Field row */}
      <div className={`input-field ${focused ? 'input-field--focused' : ''} ${error ? 'input-field--error' : ''}`}>

        {/* Left icon */}
        {icon && <span className="input-icon input-icon--left">{icon}</span>}

        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={`input-el ${icon ? 'input-el--has-icon' : ''} ${(isPassword || rightElement) ? 'input-el--has-right' : ''}`}
          {...props}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            className="input-icon input-icon--right input-icon--btn"
            onClick={() => setShowPass((p) => !p)}
            tabIndex={-1}
          >
            {showPass ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}

        {/* Custom right element */}
        {!isPassword && rightElement && (
          <span className="input-icon input-icon--right">{rightElement}</span>
        )}
      </div>

      {/* Error or hint */}
      {error  && <p className="input-error">{error}</p>}
      {!error && hint && <p className="input-hint">{hint}</p>}
    </div>
  );
};

export default Input;