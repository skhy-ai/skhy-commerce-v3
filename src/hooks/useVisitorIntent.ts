import { useState, useEffect } from 'react';
import { VisitorIntent, getVisitorIntentCookie, setVisitorIntentCookie } from '../utils/cookie';

export function useVisitorIntent() {
  const [intent, setIntentState] = useState<VisitorIntent | null>(() => getVisitorIntentCookie());

  useEffect(() => {
    const handleIntentChange = (e: Event) => {
      const customEvent = e as CustomEvent<VisitorIntent>;
      setIntentState(customEvent.detail || getVisitorIntentCookie());
    };

    window.addEventListener('skhy_intent_changed', handleIntentChange);
    return () => {
      window.removeEventListener('skhy_intent_changed', handleIntentChange);
    };
  }, []);

  const saveIntent = (newIntent: Omit<VisitorIntent, 'timestamp'>) => {
    const updated = setVisitorIntentCookie(newIntent);
    setIntentState(updated);
  };

  return { intent, saveIntent };
}
