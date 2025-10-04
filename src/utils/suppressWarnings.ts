// Suppress ResizeObserver warnings in development
// This is a known issue with React and various UI libraries
// The error is harmless but can be distracting during development

const resizeObserverErrorSuppress = () => {
  const originalError = console.error;
  
  console.error = (...args: any[]) => {
    const message = args[0];
    
    // Suppress ResizeObserver errors
    if (
      typeof message === 'string' &&
      (message.includes('ResizeObserver loop completed') ||
       message.includes('ResizeObserver loop limit exceeded'))
    ) {
      return;
    }
    
    // Suppress other common development warnings if needed
    if (
      typeof message === 'string' &&
      (message.includes('Warning: React has detected a change in the order of Hooks') &&
       message.includes('PDFViewer'))
    ) {
      return;
    }
    
    // Allow all other errors to pass through
    originalError.apply(console, args);
  };
};

// Initialize suppression
if (process.env.NODE_ENV === 'development') {
  resizeObserverErrorSuppress();
}

export default resizeObserverErrorSuppress;