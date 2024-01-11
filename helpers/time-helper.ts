import { padStartStr } from './string-helper';

export const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${padStartStr(d.getMonth() + 1)}-${padStartStr(d.getDate())} ${padStartStr(d.getHours())}:${padStartStr(d.getMinutes())}`;
}

export const convertDateToDateTimeLocal = (date: string | Date): string => {
    const d = new Date(date);
    return `${d.getFullYear()}-${padStartStr(d.getMonth() + 1)}-${padStartStr(d.getDate())}T${padStartStr(d.getHours())}:${padStartStr(d.getMinutes())}`
}