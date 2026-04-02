import { useEffect, useState } from 'react';
import './PriceHistory.css';

const PriceHistory = ({ priceHistory }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (priceHistory && priceHistory.length > 0) {
      setChartData(priceHistory);
    }
  }, [priceHistory]);

  if (!chartData || chartData.length < 2) {
    return null;
  }

  const maxPrice = Math.max(...chartData.map(p => p.price));
  const minPrice = Math.min(...chartData.map(p => p.price));
  const priceRange = maxPrice - minPrice;
  const currentPrice = chartData[chartData.length - 1].price;
  const originalPrice = chartData[0].price;
  const priceChange = ((currentPrice - originalPrice) / originalPrice * 100).toFixed(1);

  return (
    <div className="price-history">
      <div className="price-history__header">
        <h3>Price History</h3>
        <div className={`price-history__change ${priceChange < 0 ? 'down' : 'up'}`}>
          {priceChange > 0 ? '↑' : '↓'} {Math.abs(priceChange)}%
        </div>
      </div>

      <div className="price-history__chart">
        <div className="price-history__y-axis">
          <span>₹{maxPrice}</span>
          <span>₹{minPrice}</span>
        </div>
        <div className="price-history__graph">
          {chartData.map((point, index) => {
            const height = priceRange > 0 
              ? ((point.price - minPrice) / priceRange) * 100 
              : 50;
            
            return (
              <div key={index} className="price-history__point-wrapper">
                <div 
                  className="price-history__bar"
                  style={{ height: `${height}%` }}
                  title={`₹${point.price} - ${new Date(point.date).toLocaleDateString()}`}
                >
                  <div className="price-history__dot"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="price-history__legend">
        <div className="price-history__legend-item">
          <span className="price-history__legend-label">Lowest:</span>
          <span className="price-history__legend-value">₹{minPrice}</span>
        </div>
        <div className="price-history__legend-item">
          <span className="price-history__legend-label">Highest:</span>
          <span className="price-history__legend-value">₹{maxPrice}</span>
        </div>
        <div className="price-history__legend-item">
          <span className="price-history__legend-label">Current:</span>
          <span className="price-history__legend-value">₹{currentPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceHistory;
