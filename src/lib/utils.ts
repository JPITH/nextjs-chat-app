import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatDate(date: Date | string | number): string {
  if (!date) return '';
  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date);
  }
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d);
}

export function truncateText(text: string, length: number = 50): string {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}