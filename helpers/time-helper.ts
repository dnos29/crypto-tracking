import { padStartStr } from './string-helper';

export const DATE_FORMAT = {
  YYYY_MM_DD_hh_ss: 'YYYY-MM-DD hh:mm',
  YYYY_MM_DD: 'YYYY_MM_DD'
}

export const formatDate = (date: string | Date, format = DATE_FORMAT.YYYY_MM_DD_hh_ss) => {
    const d = new Date(date);
    switch (format) {
      case DATE_FORMAT.YYYY_MM_DD:
        return `${d.getFullYear()}-${padStartStr(d.getMonth() + 1)}-${padStartStr(d.getDate())}`;
      default:
        return `${d.getFullYear()}-${padStartStr(d.getMonth() + 1)}-${padStartStr(d.getDate())} ${padStartStr(d.getHours())}:${padStartStr(d.getMinutes())}`;

    }
}

export const convertDateToDateTimeLocal = (date: string | Date): string => {
  const d = new Date(date);
  return `${d.getFullYear()}-${padStartStr(d.getMonth() + 1)}-${padStartStr(d.getDate())}T${padStartStr(d.getHours())}:${padStartStr(d.getMinutes())}`
}