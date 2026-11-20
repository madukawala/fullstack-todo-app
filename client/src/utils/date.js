const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const UNITS = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

// "just now", "5 minutes ago", "yesterday", ...
export function formatRelativeTime(value, now = Date.now()) {
  if (!value) return '';
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);

  if (Math.abs(seconds) < 45) return 'just now';

  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return formatter.format(Math.round(seconds / size), unit);
    }
  }
  return formatter.format(Math.round(seconds / 60), 'minute');
}
