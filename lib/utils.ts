import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | undefined): string {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getAnimeTitle(title: string | { userPreferred?: string; english?: string; romaji?: string; native?: string }): string {
  if (typeof title === 'string') {
    return title;
  }
  
  return title?.userPreferred || title?.english || title?.romaji || title?.native || 'Unknown Title';
}