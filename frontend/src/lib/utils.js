import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines conditional class names and merges Tailwind CSS classes cleanly.
 * @param {...any} inputs - Class names or expressions
 * @returns {string} Merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
