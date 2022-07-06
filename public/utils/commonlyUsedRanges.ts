const commonlyUsedRanges = [
  { start: 'now-24h', end: 'now', label: 'Last 24 hours' },
  { start: 'now-3d', end: 'now', label: 'Last 3 days' },
  { start: 'now-7d', end: 'now', label: 'Last 7 days' },
  { start: 'now-14d', end: 'now', label: 'Last 14 days' },
  { start: 'now-30d', end: 'now', label: 'Last 30 days' },
  { start: 'now-90d', end: 'now', label: 'Last 90 days' },
  { start: 'now-180d', end: 'now', label: 'Last 180 days' },
  { start: 'now-1y', end: 'now', label: 'Last 1 year' },
];

export default commonlyUsedRanges;
