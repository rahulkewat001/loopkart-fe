import './VerificationBadge.css';

const VerificationBadge = ({ type, verified, size = 'sm' }) => {
  const badges = {
    email: { icon: '✉️', label: 'Email Verified', color: '#17a2b8' },
    phone: { icon: '📱', label: 'Phone Verified', color: '#28a745' },
    identity: { icon: '🆔', label: 'ID Verified', color: '#cc0000' },
    address: { icon: '📍', label: 'Address Verified', color: '#ffc107' },
  };

  const badge = badges[type];
  if (!badge || !verified) return null;

  return (
    <div className={`verification-badge verification-badge--${size}`} title={badge.label}>
      <span className="verification-badge__icon">{badge.icon}</span>
      {size === 'lg' && <span className="verification-badge__label">{badge.label}</span>}
    </div>
  );
};

export default VerificationBadge;
