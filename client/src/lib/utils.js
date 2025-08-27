import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names safely and merges Tailwind classes correctly
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
