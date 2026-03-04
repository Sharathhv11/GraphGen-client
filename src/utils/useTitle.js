import { useEffect } from 'react';

export default function useTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${title} | GraphGen`;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
