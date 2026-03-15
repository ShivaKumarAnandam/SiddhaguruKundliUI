import { useState, useEffect } from 'react';

/**
 * Global API lockout hook using localStorage.
 * When any AI page gets a 429 error, ALL AI pages are locked for 64 seconds.
 * This prevents quota exhaustion on the free tier (15 RPM limit).
 */
export function useApiLockout() {
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Check every second if we are still locked out
    const interval = setInterval(() => {
      const unlockTime = localStorage.getItem('ai_unlock_time');
      if (unlockTime) {
        const remaining = parseInt(unlockTime) - Date.now();
        if (remaining > 0) {
          setIsLocked(true);
          setTimeLeft(Math.ceil(remaining / 1000));
        } else {
          setIsLocked(false);
          setTimeLeft(0);
          localStorage.removeItem('ai_unlock_time');
        }
      } else {
        setIsLocked(false);
        setTimeLeft(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Function to trigger the lockout (60 seconds + 4 extra seconds = 64 seconds)
  const triggerLockout = () => {
    const lockoutDuration = 64 * 1000; // 64,000 milliseconds
    localStorage.setItem('ai_unlock_time', Date.now() + lockoutDuration);
    setIsLocked(true);
    setTimeLeft(64);
  };

  return { isLocked, timeLeft, triggerLockout };
}
