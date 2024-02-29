import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc)
dayjs.extend(timezone)

export const DATE_FORMAT = {
  YYYY_MM_DD_hh_ss: 'YYYY-MM-DD hh:mm',
  YYYY_MM_DD: 'YYYY_MM_DD'
}

export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

export const formatDate = (date: string | Date, format = DATE_FORMAT.YYYY_MM_DD_hh_ss) => {
  return dayjs(date).tz(DEFAULT_TIMEZONE).format(format);
}

export const convertDateToDateTimeLocal = (date: string | Date): string => {
  return dayjs(date).format('YYYY-MM-DDThh:mm');
}