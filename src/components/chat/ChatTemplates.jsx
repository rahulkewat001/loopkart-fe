import { useState } from 'react';
import './ChatTemplates.css';

const ChatTemplates = ({ onSelectTemplate, productPrice }) => {
  const [showTemplates, setShowTemplates] = useState(false);

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

  return (
    <div className="chat-templates">
      <button 
        className="chat-templates__toggle"
        onClick={() => setShowTemplates(!showTemplates)}
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
                className="chat-templates__item"
                onClick={() => {
                  onSelectTemplate(template.text);
                  setShowTemplates(false);
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
