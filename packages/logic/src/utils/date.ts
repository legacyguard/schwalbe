/**
 * Date Utility Functions
 * Comprehensive date manipulation and formatting utilities
 *
 * Provides consistent date handling across the application with support for:
 * - Multiple format styles (relative, short, long)
 * - Date calculations and comparisons
 * - Time zone aware operations
 * - Age and duration calculations
 */

/**
 * Format a date according to specified format
 *
 * @param date - Date object or ISO date string to format
 * @param format - Format style: 'long' (January 1, 2024), 'short' (Jan 1, 2024), or 'relative' (2 days ago)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  format: 'long' | 'relative' | 'short' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    return getRelativeTime(d);
  }

  const options: Intl.DateTimeFormatOptions =
    format === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };

  return d.toLocaleDateString('en-US', options);
}

/**
 * Get human-readable relative time (e.g., "2 hours ago", "3 days ago")
 *
 * @param date - Date to calculate relative time for
 * @returns Human-readable relative time string
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Calculate days between two dates
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between dates (absolute value)
 */
export function getDaysBetween(date1: Date, date2: Date): number {
  const diffInMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date
 *
 * @param date - Starting date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if a date has expired (is in the past)
 *
 * @param date - Date to check
 * @returns true if date is in the past
 */
export function isExpired(date: Date): boolean {
  return date < new Date();
}

/**
 * Get month name from month number (0-11)
 *
 * @param month - Month number (0 = January, 11 = December)
 * @returns Month name
 */
export function getMonthName(month: number): string {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return monthNames[month] || '';
}

/**
 * Format time in 12-hour or 24-hour format
 *
 * @param date - Date to format
 * @param use24Hour - Use 24-hour format if true, 12-hour format if false
 * @returns Formatted time string
 */
export function formatTime(date: Date, use24Hour: boolean = false): string {
  const options: Intl.DateTimeFormatOptions = use24Hour
    ? { hour: '2-digit', minute: '2-digit', hour12: false }
    : { hour: 'numeric', minute: '2-digit', hour12: true };

  return date.toLocaleTimeString('en-US', options);
}

/**
 * Get start of day (00:00:00.000)
 *
 * @param date - Date to get start of
 * @returns New date set to start of day
 */
export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day (23:59:59.999)
 *
 * @param date - Date to get end of
 * @returns New date set to end of day
 */
export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Check if date is today
 *
 * @param date - Date to check
 * @returns true if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if date is in current week
 *
 * @param date - Date to check
 * @returns true if date is in current week (Sunday-Saturday)
 */
export function isThisWeek(date: Date): boolean {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));

  return date >= getStartOfDay(weekStart) && date <= getEndOfDay(weekEnd);
}

/**
 * Check if date is in current month
 *
 * @param date - Date to check
 * @returns true if date is in current month and year
 */
export function isThisMonth(date: Date): boolean {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/**
 * Calculate age from birth date
 *
 * @param birthDate - Birth date
 * @returns Age in years
 */
export function getAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
