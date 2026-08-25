import { useEffect, useRef, useCallback } from 'react';

/**
 * useIdleTimer
 * Calls `onIdle` after `idleMs` of no user activity (mouse, keyboard, touch, scroll).
 * Calls `onActive` when the user returns.
 * Calls `onWarning` at `warningMs` before idle threshold.
 */
export function useIdleTimer({ idleMs = 30 * 60 * 1000, warningMs = 5 * 60 * 1000, onIdle, onActive, onWarning }) {
  const idleTimer    = useRef(null);
  const warningTimer = useRef(null);
  const warned       = useRef(false);

  const resetTimers = useCallback(() => {
    clearTimeout(idleTimer.current);
    clearTimeout(warningTimer.current);

    if (warned.current) {
      warned.current = false;
      onActive?.();
    }

    // Warning fires `warningMs` before idle
    warningTimer.current = setTimeout(() => {
      warned.current = true;
      onWarning?.();
    }, idleMs - warningMs);

    // Idle fires after full `idleMs`
    idleTimer.current = setTimeout(() => {
      onIdle?.();
    }, idleMs);
  }, [idleMs, warningMs, onIdle, onActive, onWarning]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    const handler = () => resetTimers();

    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetTimers(); // Start timers on mount

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      clearTimeout(idleTimer.current);
      clearTimeout(warningTimer.current);
    };
  }, [resetTimers]);
}
