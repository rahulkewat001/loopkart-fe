import { useState, useEffect } from 'react';
import axios from 'axios';
import './SavedSearches.css';

const SavedSearches = () => {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/saved-searches`, {
        withCredentials: true
      });
      setSearches(data);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAlert = async (id, currentStatus) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/saved-searches/${id}`, {
        alertEnabled: !currentStatus
      }, { withCredentials: true });
      setSearches(searches.map(s => 
        s._id === id ? { ...s, alertEnabled: !currentStatus } : s
      ));
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const deleteSearch = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/saved-searches/${id}`, {
        withCredentials: true
      });
      setSearches(searches.filter(s => s._id !== id));
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  if (loading) return <div className="saved-searches-loading">Loading...</div>;

  return (
    <div className="saved-searches">
      <div className="saved-searches__header">
        <h2>Saved Searches</h2>
        <span className="saved-searches__count">{searches.length} saved</span>
      </div>

      {searches.length === 0 ? (
        <div className="saved-searches__empty">
          <span className="saved-searches__empty-icon">🔍</span>
          <p>No saved searches yet</p>
          <small>Save your searches to get alerts when new items match</small>
        </div>
      ) : (
        <div className="saved-searches__list">
          {searches.map(search => (
            <div key={search._id} className="saved-search-card">
              <div className="saved-search-card__header">
                <h3 className="saved-search-card__name">{search.name}</h3>
                <div className="saved-search-card__actions">
                  <button
                    className={`saved-search-card__alert ${search.alertEnabled ? 'active' : ''}`}
                    onClick={() => toggleAlert(search._id, search.alertEnabled)}
                    title={search.alertEnabled ? 'Disable alerts' : 'Enable alerts'}
                  >
                    {search.alertEnabled ? '🔔' : '🔕'}
                  </button>
                  <button
                    className="saved-search-card__delete"
                    onClick={() => deleteSearch(search._id)}
                    title="Delete search"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="saved-search-card__filters">
                {search.filters.query && (
                  <span className="filter-tag">"{search.filters.query}"</span>
                )}
                {search.filters.category && (
                  <span className="filter-tag">📂 {search.filters.category}</span>
                )}
                {search.filters.minPrice && search.filters.maxPrice && (
                  <span className="filter-tag">
                    💰 ₹{search.filters.minPrice} - ₹{search.filters.maxPrice}
                  </span>
                )}
                {search.filters.condition && (
                  <span className="filter-tag">⭐ {search.filters.condition}</span>
                )}
                {search.filters.location && (
                  <span className="filter-tag">📍 {search.filters.location}</span>
                )}
              </div>

              {search.matchCount > 0 && (
                <div className="saved-search-card__matches">
                  {search.matchCount} new {search.matchCount === 1 ? 'match' : 'matches'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSearches;
