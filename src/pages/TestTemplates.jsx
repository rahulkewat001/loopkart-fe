import { useState } from 'react';
import ChatTemplates from '../components/chat/ChatTemplates';

export default function TestTemplates() {
  const [message, setMessage] = useState('');

  return (
    <div style={{ padding: '50px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Chat Templates Test</h1>
      
      <div style={{ marginTop: '30px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <ChatTemplates 
          onSelectTemplate={(text) => {
            console.log('Template selected:', text);
            setMessage(text);
          }}
          productPrice={5999}
        />
        
        <input 
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message will appear here..."
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '6px' }}>
        <strong>Selected message:</strong>
        <p>{message || 'Click the ⚡ button to select a template'}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', borderRadius: '6px' }}>
        <strong>Instructions:</strong>
        <ol>
          <li>Click the ⚡ lightning button</li>
          <li>You should see a dropdown with 8 messages</li>
          <li>Click any message</li>
          <li>It should appear in the input box above</li>
        </ol>
      </div>
    </div>
  );
}
