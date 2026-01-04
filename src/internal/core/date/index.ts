import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

export { dayjs }