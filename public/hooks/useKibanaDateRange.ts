import { useCallback, useEffect, useState } from 'react';

interface UseKibanaDateRangeReturnType {
  currentDateRange: DateRange;
  recentDateRanges: DateRange[];
  setDateRange: (newRange: DateRange) => void;
}

interface DateRange {
  from: string;
  to: string;
}

const RECENT_DATE_RANGE_KEY = 'kibana.timepicker.timeHistory';

const getRecentDatesFromLocalStorage = (): DateRange[] | null => {
  const recentDatesRaw = localStorage.getItem(RECENT_DATE_RANGE_KEY);
  if (recentDatesRaw) return JSON.parse(recentDatesRaw);

  return null;
};

export const useKibanaDateRange = (
  defaultFrom: string = 'now-30d',
  defaultTo: string = 'now',
  forceDefault = false
): UseKibanaDateRangeReturnType => {
  // If the default values are set, then we setup the state using them
  const [currentDateRange, setCurrentDateRange] = useState<DateRange>({ from: defaultFrom, to: defaultTo });
  const [recentDateRanges, setRecentDateRanges] = useState<DateRange[]>([]);

  useEffect(() => {
    const recentDates = getRecentDatesFromLocalStorage();
    if (recentDates) {
      setRecentDateRanges(recentDates);
      if (!forceDefault) setCurrentDateRange(recentDates[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDateRange = useCallback(
    (newRange: DateRange) => {
      setCurrentDateRange(newRange);

      const newRecentDateRanges = [newRange, ...recentDateRanges].slice(0, 10);

      setRecentDateRanges(newRecentDateRanges);
      localStorage.setItem(RECENT_DATE_RANGE_KEY, JSON.stringify(newRecentDateRanges));
    },
    [recentDateRanges]
  );

  // Finally, we also return a list of the recent values.

  return {
    setDateRange,
    currentDateRange,
    recentDateRanges,
  };
};
