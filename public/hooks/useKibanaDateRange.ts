import { useCallback, useEffect, useMemo, useState } from 'react';
import { StringParam, useQueryParam, useQueryParams, withDefault } from 'use-query-params';

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
  defaultTo: string = 'now'
): UseKibanaDateRangeReturnType => {
  const [queryParams, setQueryParams] = useQueryParams({
    ds: withDefault(StringParam, defaultFrom),
    de: withDefault(StringParam, defaultTo),
  });
  const shouldForceDefault = queryParams.ds !== defaultFrom || queryParams.de !== defaultTo;
  // If the default values are set, then we setup the state using them
  const [recentDateRanges, setRecentDateRanges] = useState<DateRange[]>([]);

  const setDateRange = useCallback(
    (newRange: DateRange) => {
      setQueryParams({
        ds: newRange.from,
        de: newRange.to,
      });

      const newRecentDateRanges = [newRange, ...recentDateRanges].slice(0, 10);

      setRecentDateRanges(newRecentDateRanges);
      localStorage.setItem(RECENT_DATE_RANGE_KEY, JSON.stringify(newRecentDateRanges));
    },
    [recentDateRanges, setQueryParams]
  );

  useEffect(() => {
    const recentDates = getRecentDatesFromLocalStorage();
    if (recentDates) {
      setRecentDateRanges(recentDates);
      if (!shouldForceDefault) setDateRange(recentDates[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Finally, we also return a list of the recent values.
  const currentDateRange = useMemo(
    () => ({
      from: queryParams.ds,
      to: queryParams.de,
    }),
    [queryParams.ds, queryParams.de]
  );

  return {
    setDateRange,
    currentDateRange,
    recentDateRanges,
  };
};
