import './TrustScore.css';

const TrustScore = ({ score, size = 'md', showLabel = true }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    if (score >= 40) return '#ff9800';
    return '#dc3545';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'New';
  };

  return (
    <div className={`trust-score trust-score--${size}`}>
      <div className="trust-score__circle" style={{ borderColor: getScoreColor(score) }}>
        <span className="trust-score__value" style={{ color: getScoreColor(score) }}>
          {score}
        </span>
      </div>
      {showLabel && (
        <div className="trust-score__info">
          <div className="trust-score__label">Trust Score</div>
          <div className="trust-score__status" style={{ color: getScoreColor(score) }}>
            {getScoreLabel(score)}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustScore;
