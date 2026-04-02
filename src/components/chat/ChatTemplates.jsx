import { useState, useRef, useEffect } from 'react';
import './ChatTemplates.css';

const ChatTemplates = ({ onSelectTemplate, productPrice }) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTemplates(false);
      }
    };

    if (showTemplates) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTemplates]);

  const templates = [
    { id: 1, text: 'Is this still available?', icon: '❓' },
    { id: 2, text: 'What is your best price?', icon: '💰' },
    { id: 3, text: `Can you do ₹${Math.floor(productPrice * 0.9)}?`, icon: '🤝' },
    { id: 4, text: 'Can I see more photos?', icon: '📸' },
    { id: 5, text: 'Where is the pickup location?', icon: '📍' },
    { id: 6, text: 'Is delivery available?', icon: '🚚' },
    { id: 7, text: 'What is the condition?', icon: '⭐' },
    { id: 8, text: 'When can I come to see it?', icon: '📅' },
  ];

  const handleTemplateClick = (text) => {
    console.log('Template clicked:', text);
    onSelectTemplate(text);
    setShowTemplates(false);
  };

  return (
    <div className="chat-templates" ref={dropdownRef}>
      <button 
        type="button"
        className="chat-templates__toggle"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Toggle clicked, current state:', showTemplates);
          setShowTemplates(!showTemplates);
        }}
        title="Quick messages"
      >
        ⚡
      </button>
      
      {showTemplates && (
        <div className="chat-templates__dropdown">
          <div className="chat-templates__header">Quick Messages</div>
          <div className="chat-templates__list">
            {templates.map(template => (
              <button
                key={template.id}
                type="button"
                className="chat-templates__item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTemplateClick(template.text);
                }}
              >
                <span className="chat-templates__icon">{template.icon}</span>
                <span className="chat-templates__text">{template.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatTemplates;
