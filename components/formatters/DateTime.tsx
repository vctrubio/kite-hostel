"use client";

import { format, isValid } from "date-fns";

interface DateTimeProps {
  dateString: string;
  formatType?: 'date' | 'time' | 'datetime';
}

export function DateTime({ dateString, formatType = 'datetime' }: DateTimeProps) {
  if (!dateString || dateString === 'No date') {
    return <span>No date</span>;
  }

  const date = new Date(dateString);
  
  if (!isValid(date)) {
    return <span>Invalid date</span>;
  }

  const formatOptions = {
    date: 'dd/MM/yyyy',
    time: 'HH:mm',
    datetime: 'dd/MM/yyyy HH:mm'
  };

  const formatString = formatOptions[formatType];
  
  try {
    return <span>{format(date, formatString)}</span>;
  } catch (error) {
    return <span>Invalid date</span>;
  }
}

export function formatTime(dateString: string): string {
  if (!dateString || dateString === 'No date') {
    return 'No time';
  }

  const date = new Date(dateString);
  
  if (!isValid(date)) {
    return 'Invalid time';
  }

  try {
    return format(date, 'HH:mm');
  } catch (error) {
    return 'Invalid time';
  }
}

export function formatDate(dateString: string): string {
  if (!dateString || dateString === 'No date') {
    return 'No date';
  }

  const date = new Date(dateString);
  
  if (!isValid(date)) {
    return 'Invalid date';
  }

  try {
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    return 'Invalid date';
  }
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getStoredDate(key: string, fallback: string = getTodayDateString()): string {
  if (typeof window === 'undefined') return fallback;
  
  try {
    return localStorage.getItem(key) || fallback;
  } catch (error) {
    return fallback;
  }
}

export function setStoredDate(key: string, date: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, date);
  } catch (error) {
    // Silently fail if localStorage is not available
  }
}

// Helper function to parse time string to minutes
export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper function to format minutes to time string
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}
