import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook that wraps the IntersectionObserver API.
 * Returns [ref, isVisible].
 *
 * NOTE: options is stored in a ref so passing an inline object
 * (e.g. { threshold: 0.1 }) does NOT cause an infinite re-render loop.
 */
export const useIntersectionObserver = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  // Capture options once — avoids re-running the effect when the caller
  // passes a new object literal on every render.
  const optionsRef = useRef(options);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Once visible, stop observing (one-shot animation)
        observer.unobserve(entry.target);
      }
    }, optionsRef.current);

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []); // Empty dep array — runs only on mount

  return [ref, isVisible];
};
