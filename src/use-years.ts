import { useCallback } from 'react';
import { setOffset, setYear } from './state-reducer';
import { CalendarYear, DPState, PropsGetterConfig } from './types';
import { callAll, skipAll, skipFirst } from './utils/call-all';
import { createPropGetter } from './utils/create-prop-getter';
import { createYears } from './utils/create-years';
import { getDateParts } from './utils/date';
import { maxDateAndAfter, minDateAndBefore } from './utils/predicates';

export const useYears = ({
  selectedDates,
  state: {
    offsetDate,
    offsetYear,
    config: { years, dates },
  },
}: DPState) => ({
  years: createYears(offsetYear, offsetDate, selectedDates, years, dates),
});

export const useYearsPropGetters = ({
  state: {
    offsetYear,
    offsetDate,
    config: { dates, years: yearsConfig },
  },
  dispatch,
}: DPState) => {
  const { minDate, maxDate } = dates;
  const { step, numberOfYears } = yearsConfig;
  const { D, M } = getDateParts(offsetDate);

  const callSetOffset = useCallback(
    (d: Date) => setOffset(dispatch, d),
    [dispatch],
  );

  const yearButton = useCallback(
    (
      { $date, disabled }: CalendarYear,
      { onClick, disabled: disabledProps, ...rest }: PropsGetterConfig = {},
    ) =>
      createPropGetter(
        !!disabledProps || disabled,
        (evt) => callAll(onClick, skipFirst(callSetOffset))(evt, $date),
        rest,
      ),
    [callSetOffset],
  );

  const nextYearsButton = useCallback(
    ({ onClick, disabled, ...rest }: PropsGetterConfig = {}) => {
      const isDisabled =
        !!disabled ||
        maxDateAndAfter(
          maxDate,
          new Date(offsetYear + numberOfYears - 1, M, D),
        );

      return createPropGetter(
        isDisabled,
        (evt) =>
          callAll(
            onClick,
            skipAll(() => setYear(dispatch, offsetYear + step)),
          )(evt),
        rest,
      );
    },
    [maxDate, dispatch, offsetYear, step, D, M, numberOfYears],
  );

  const previousYearsButton = useCallback(
    ({ onClick, disabled, ...rest }: PropsGetterConfig = {}) => {
      const isDisabled =
        !!disabled || minDateAndBefore(minDate, new Date(offsetYear, M, D));

      return createPropGetter(
        isDisabled,
        (evt) =>
          callAll(
            onClick,
            skipAll(() => setYear(dispatch, offsetYear - step)),
          )(evt),
        rest,
      );
    },
    [minDate, dispatch, offsetYear, step, M, D],
  );

  return {
    yearButton,
    nextYearsButton,
    previousYearsButton,
  };
};

export const useYearsActions = ({
  state: {
    offsetYear,
    config: { years },
  },
  dispatch,
}: DPState) => {
  const { step } = years;
  const setYearAction = useCallback(
    (d: Date) => setOffset(dispatch, d),
    [dispatch],
  );

  const setNextYears = useCallback(
    () => setYear(dispatch, offsetYear + step),
    [offsetYear, step, dispatch],
  );

  const setPreviousYears = useCallback(
    () => setYear(dispatch, offsetYear - step),
    [offsetYear, step, dispatch],
  );

  return {
    setYear: setYearAction,
    setNextYears,
    setPreviousYears,
  };
};
