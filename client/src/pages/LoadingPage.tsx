import { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  'Crafting your event concept…',
  'Designing the schedule…',
  'Planning the menu…',
  'Calculating the budget…',
  'Writing your invitation…',
  'Preparing final details…',
  'Almost there…',
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
        <div className="spinner" style={{ width: 48, height: 48 }} />
        <p className="loading-text">{LOADING_MESSAGES[messageIndex]}</p>
        <p className="loading-subtext">
          This usually takes 15–30 seconds. We're generating a comprehensive,
          personalized plan for your event.
        </p>
      </div>
    </div>
  );
}
