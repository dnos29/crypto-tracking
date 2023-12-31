import { format } from 'date-fns';
import { padStartStr } from './string-helper';

export const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${padStartStr(d.getMonth() + 1)}-${padStartStr(d.getDate())}`;
}