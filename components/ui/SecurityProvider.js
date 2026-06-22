'use client';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function SecurityProvider({ children }) {
  const { user } = useUser();

  useEffect(() => {
    // If the user is an admin, completely bypass security restrictions
    if (user && user.publicMetadata?.role === 'admin') {
      return;
    }

    // 1. Disable Right-Click (Context Menu)
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Cmd+Option+I, Cmd+Option+C)
    const handleKeyDown = (e) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I (Windows) or Cmd+Option+I (Mac)
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) || 
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i'))
      ) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J (Windows) or Cmd+Option+J (Mac)
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) || 
        (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j'))
      ) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C (Windows) or Cmd+Option+C (Mac)
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) || 
        (e.metaKey && e.altKey && (e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (Windows) or Cmd+Option+U (Mac) - View Source
      if (
        (e.ctrlKey && (e.key === 'U' || e.key === 'u')) || 
        (e.metaKey && e.altKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Aggressive Debugger Trap
    // If DevTools is forced open, this will freeze the browser tab
    const debuggerInterval = setInterval(() => {
      const start = new Date().getTime();
      debugger; // This pauses execution if devtools is open
      const end = new Date().getTime();
      // If it took longer than 100ms, they probably had devtools open
      if (end - start > 100) {
        // Optional: you can redirect them or clear the body
        // document.body.innerHTML = 'Developer Tools Detected';
      }
    }, 1000);

    // Attach listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(debuggerInterval);
    };
  }, [user]);

  return <>{children}</>;
}
