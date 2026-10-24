import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  'Crafting your perfect celebration...',
  'Designing the event schedule...',
  'Planning the menu and decorations...',
  'Calculating the budget breakdown...',
  'Writing your invitation message...',
  'Preparing risk mitigation strategies...',
  'Almost there, adding final touches...',
];

export default function LoadingPage() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-container">
      <div className="loading-container">
        <div className="spinner" style={{ width: 56, height: 56 }} />
        <p className="loading-text">{LOADING_MESSAGES[messageIndex]}</p>
        <p className="loading-subtext">
          This usually takes 15–30 seconds. The AI is generating a comprehensive,
          personalized event plan just for you.
        </p>
      </div>
    </div>
  );
}
