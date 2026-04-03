import { Suspense, lazy } from 'react';
import './AuthShell.css';

const EcoScene = lazy(() => import('../scene/EcoScene'));

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  asideTitle,
  asideText,
  highlights = [],
  stats = [],
  children,
  footer,
}) {
  return (
    <div className="auth-shell">
      <div className="auth-shell__animated-bg" />
      <div className="auth-shell__video-fade" />
      <div className="auth-shell__scene">
        <Suspense fallback={null}>
          <EcoScene variant="compact" />
        </Suspense>
      </div>

      <div className="auth-shell__content container">
        <section className="auth-shell__story animate-fadeUp">
          <p className="auth-shell__eyebrow">{eyebrow}</p>
          <h1 className="auth-shell__title">{title}</h1>
          <p className="auth-shell__subtitle">{subtitle}</p>

          <div className="auth-shell__story-card">
            <p className="auth-shell__story-title">{asideTitle}</p>
            <p className="auth-shell__story-copy">{asideText}</p>
          </div>

          {highlights.length > 0 && (
            <div className="auth-shell__highlights">
              {highlights.map((item) => (
                <div key={item.title} className="auth-shell__highlight">
                  <span className="auth-shell__highlight-icon">{item.icon}</span>
                  <div>
                    <p className="auth-shell__highlight-title">{item.title}</p>
                    <p className="auth-shell__highlight-copy">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {stats.length > 0 && (
            <div className="auth-shell__stats">
              {stats.map((stat) => (
                <div key={stat.label} className="auth-shell__stat">
                  <p className="auth-shell__stat-value">{stat.value}</p>
                  <p className="auth-shell__stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="auth-shell__panel card card--glass animate-fadeUp">
          {children}
          {footer}
        </section>
      </div>
    </div>
  );
}
