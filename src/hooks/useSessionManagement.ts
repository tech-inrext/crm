"use client";

import { useEffect, useRef, useCallback } from 'react';

interface UseSessionManagementOptions {
  onSessionEnd: () => void;
  onSessionWarning?: (remainingTime: number) => void;
  inactivityTimeout?: number; // in milliseconds
  warningTime?: number; // in milliseconds before timeout to show warning
  clearOnPageLeave?: boolean;
  clearOnWindowBlur?: boolean;
}

export const useSessionManagement = (options: UseSessionManagementOptions) => {
  const {
    onSessionEnd,
    onSessionWarning,
    inactivityTimeout = 30 * 60 * 1000, // 30 minutes default
    warningTime = 2 * 60 * 1000, // 2 minutes warning default
    clearOnPageLeave = true,
    clearOnWindowBlur = true,
  } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActive = useRef(true);

  const clearSession = useCallback(() => {
    if (isActive.current) {
      isActive.current = false;
      onSessionEnd();
    }
  }, [onSessionEnd]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    if (isActive.current) {
      // Set warning timeout
      if (onSessionWarning) {
        warningTimeoutRef.current = setTimeout(() => {
          onSessionWarning(warningTime / 1000);
        }, inactivityTimeout - warningTime);
      }

      // Set session end timeout
      timeoutRef.current = setTimeout(() => {
        clearSession();
      }, inactivityTimeout);
    }
  }, [clearSession, inactivityTimeout, onSessionWarning, warningTime]);

  const handleActivity = useCallback(() => {
    if (isActive.current) {
      resetTimeout();
    }
  }, [resetTimeout]);

  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    // Page visibility and navigation handlers
    const handleVisibilityChange = () => {
      if (clearOnPageLeave && document.hidden) {
        clearSession();
      }
    };

    const handleBeforeUnload = () => {
      if (clearOnPageLeave) {
        clearSession();
      }
    };

    const handlePageHide = () => {
      if (clearOnPageLeave) {
        clearSession();
      }
    };

    const handleWindowBlur = () => {
      if (clearOnWindowBlur) {
        clearSession();
      }
    };

    // Add all event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    if (clearOnPageLeave) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', handlePageHide);
    }

    if (clearOnWindowBlur) {
      window.addEventListener('blur', handleWindowBlur);
    }

    // Start the timeout
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (clearOnPageLeave) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pagehide', handlePageHide);
      }

      if (clearOnWindowBlur) {
        window.removeEventListener('blur', handleWindowBlur);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [clearOnPageLeave, clearOnWindowBlur, clearSession, handleActivity, resetTimeout]);

  return {
    clearSession,
    resetTimeout,
  };
};
