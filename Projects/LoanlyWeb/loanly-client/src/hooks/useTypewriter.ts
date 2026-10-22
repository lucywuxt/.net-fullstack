import { useEffect, useState } from 'react';

/** Types each word in `words`, pauses, deletes it, then moves to the next — looping forever. */
export function useTypewriterLoop(words: string[], typeMs = 55, deleteMs = 28, pauseMs = 1600): string {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index] ?? '';

    if (!deleting && subIndex === current.length) {
      const t = window.setTimeout(() => setDeleting(true), pauseMs);
      return () => window.clearTimeout(t);
    }

    if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }

    const t = window.setTimeout(
      () => setSubIndex((s) => s + (deleting ? -1 : 1)),
      deleting ? deleteMs : typeMs
    );
    return () => window.clearTimeout(t);
  }, [subIndex, deleting, index, words, typeMs, deleteMs, pauseMs]);

  return (words[index] ?? '').slice(0, subIndex);
}
